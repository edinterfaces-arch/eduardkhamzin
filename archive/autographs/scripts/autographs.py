#!/usr/bin/env python3
"""Visitor autographs drawn on the site background.

Serves a tiny JSON API on 127.0.0.1 behind nginx (no dependencies):
  GET  /api/autographs  -> {"autographs": [{"id", "created", "strokes"}]}
  POST /api/autographs  <- {"strokes": [[x0, y0, x1, y1, ...], ...]}

Coordinates are integer CSS pixels relative to the viewport centre, so drawings
stay in place around the centred profile on any screen size. Autographs are
published instantly; the owner removes unwanted ones with the CLI:
  autographs.py list | delete ID... | clear
"""
import argparse
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import secrets
import sys
import tempfile
import threading

DEFAULT_DATA = Path('/var/lib/eduard-autographs/autographs.json')
ALLOWED_ORIGINS = {'https://eduardkhamzin.ru', 'https://www.eduardkhamzin.ru'}
MAX_BODY = 64 * 1024
MAX_STROKES = 60
MAX_POINTS = 1200          # per autograph, across all strokes
MAX_COORD = 3000           # |x|, |y| from the viewport centre
KEEP = 150                 # newest autographs kept; older ones drop off
# There is no per-visitor IP behind the TLS SNI router, so limits are global.
RATE_LIMITS = [(timedelta(minutes=10), 20), (timedelta(days=1), 200)]


def validate(payload):
    if not isinstance(payload, dict) or set(payload) != {'strokes'}:
        raise ValueError('Expected {"strokes": [...]}')
    strokes = payload['strokes']
    if not isinstance(strokes, list) or not 1 <= len(strokes) <= MAX_STROKES:
        raise ValueError('Too few or too many strokes')
    total = 0
    clean = []
    for stroke in strokes:
        if not isinstance(stroke, list) or len(stroke) < 2 or len(stroke) % 2:
            raise ValueError('Each stroke is a flat list of x, y pairs')
        for value in stroke:
            if type(value) is not int or abs(value) > MAX_COORD:
                raise ValueError('Coordinates must be integers near the page')
        total += len(stroke) // 2
        clean.append(list(stroke))
    if total > MAX_POINTS:
        raise ValueError('Autograph is too detailed')
    return clean


class Store:
    def __init__(self, path):
        self.path = Path(path)
        self.lock = threading.Lock()

    def load(self):
        if not self.path.exists():
            return {'autographs': [], 'posts': []}
        data = json.loads(self.path.read_text())
        data.setdefault('posts', [])
        return data

    def save(self, data):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile('w', encoding='utf-8', dir=self.path.parent, delete=False) as file:
            json.dump(data, file, separators=(',', ':'))
            temporary = Path(file.name)
        temporary.chmod(0o644)
        temporary.replace(self.path)

    def public(self):
        with self.lock:
            return [{key: item[key] for key in ('id', 'created', 'strokes')} for item in self.load()['autographs']]

    def add(self, strokes, now=None):
        now = now or datetime.now(timezone.utc)
        with self.lock:
            data = self.load()
            posts = [p for p in data['posts'] if now - datetime.fromisoformat(p) < RATE_LIMITS[-1][0]]
            for window, limit in RATE_LIMITS:
                if sum(1 for p in posts if now - datetime.fromisoformat(p) < window) >= limit:
                    raise PermissionError('Too many autographs right now, try again later')
            item = {'id': secrets.token_hex(4), 'created': now.isoformat(timespec='seconds'), 'strokes': strokes}
            data['autographs'] = (data['autographs'] + [item])[-KEEP:]
            data['posts'] = posts + [item['created']]
            self.save(data)
            return item

    def delete(self, ids):
        with self.lock:
            data = self.load()
            before = len(data['autographs'])
            data['autographs'] = [a for a in data['autographs'] if a['id'] not in ids]
            self.save(data)
            return before - len(data['autographs'])


def make_handler(store):
    class Handler(BaseHTTPRequestHandler):
        server_version = 'autographs'
        sys_version = ''

        def send_json(self, status, body):
            raw = json.dumps(body, separators=(',', ':')).encode()
            self.send_response(status)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(raw)))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(raw)

        def do_GET(self):
            if self.path != '/api/autographs':
                return self.send_json(404, {'error': 'Not found'})
            self.send_json(200, {'autographs': store.public()})

        def do_POST(self):
            if self.path != '/api/autographs':
                return self.send_json(404, {'error': 'Not found'})
            if self.headers.get('Origin') not in ALLOWED_ORIGINS:
                return self.send_json(403, {'error': 'Forbidden'})
            if not self.headers.get('Content-Type', '').startswith('application/json'):
                return self.send_json(415, {'error': 'Expected JSON'})
            try:
                length = int(self.headers.get('Content-Length', ''))
            except ValueError:
                return self.send_json(411, {'error': 'Length required'})
            if not 0 < length <= MAX_BODY:
                return self.send_json(413, {'error': 'Too large'})
            try:
                strokes = validate(json.loads(self.rfile.read(length)))
            except (ValueError, UnicodeDecodeError) as error:
                return self.send_json(400, {'error': str(error)})
            try:
                item = store.add(strokes)
            except PermissionError as error:
                return self.send_json(429, {'error': str(error)})
            self.send_json(201, {'autograph': item})

        def log_message(self, format, *args):  # no visitor logging
            pass

    return Handler


def main():
    cli = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    cli.add_argument('--data', type=Path, default=DEFAULT_DATA)
    commands = cli.add_subparsers(dest='command', required=True)
    serve = commands.add_parser('serve')
    serve.add_argument('--port', type=int, default=8091)
    commands.add_parser('list')
    delete = commands.add_parser('delete')
    delete.add_argument('ids', nargs='+')
    commands.add_parser('clear')
    arguments = cli.parse_args()
    store = Store(arguments.data)

    if arguments.command == 'serve':
        ThreadingHTTPServer(('127.0.0.1', arguments.port), make_handler(store)).serve_forever()
    elif arguments.command == 'list':
        for item in store.load()['autographs']:
            points = sum(len(s) // 2 for s in item['strokes'])
            print(f"{item['id']}  {item['created']}  {len(item['strokes'])} strokes, {points} points")
    elif arguments.command == 'delete':
        print(f'Deleted {store.delete(set(arguments.ids))}')
    elif arguments.command == 'clear':
        print(f"Deleted {store.delete({a['id'] for a in store.load()['autographs']})}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
