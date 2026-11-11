import importlib.util
from datetime import datetime, timedelta, timezone
from http.server import ThreadingHTTPServer
import json
from pathlib import Path
import tempfile
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen

spec = importlib.util.spec_from_file_location('autographs', Path(__file__).parents[1] / 'scripts/autographs.py')
autographs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(autographs)

SIGNATURE = {'strokes': [[0, 0, 10, 5, 20, -3], [30, 0]]}


class ValidationTests(unittest.TestCase):
    def test_accepts_integer_strokes_and_dots(self):
        self.assertEqual(autographs.validate(SIGNATURE), SIGNATURE['strokes'])

    def test_rejects_malformed_or_oversized_drawings(self):
        bad = [
            {}, [], {'strokes': []}, {'strokes': [[1, 2]], 'extra': 1},
            {'strokes': [[1, 2, 3]]}, {'strokes': [[1.5, 2]]}, {'strokes': [[True, 2]]},
            {'strokes': [['1', 2]]}, {'strokes': [[5000, 0]]},
            {'strokes': [[0, 0]] * (autographs.MAX_STROKES + 1)},
            {'strokes': [[0, 0] * (autographs.MAX_POINTS + 1)]},
        ]
        for payload in bad:
            with self.assertRaises(ValueError, msg=payload):
                autographs.validate(payload)


class StoreTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.store = autographs.Store(Path(self.folder.name) / 'autographs.json')

    def tearDown(self):
        self.folder.cleanup()

    def test_keeps_only_the_newest_autographs(self):
        start = datetime(2026, 11, 1, tzinfo=timezone.utc)
        for i in range(autographs.KEEP + 5):
            self.store.add([[i, 0]], now=start + timedelta(hours=i))
        items = self.store.public()
        self.assertEqual(len(items), autographs.KEEP)
        self.assertEqual(items[-1]['strokes'], [[autographs.KEEP + 4, 0]])
        self.assertEqual(set(items[0]), {'id', 'created', 'strokes'})

    def test_global_rate_limit_then_recovers(self):
        now = datetime(2026, 11, 1, tzinfo=timezone.utc)
        window, limit = autographs.RATE_LIMITS[0]
        for _ in range(limit):
            self.store.add([[0, 0]], now=now)
        with self.assertRaises(PermissionError):
            self.store.add([[0, 0]], now=now)
        self.store.add([[0, 0]], now=now + window)

    def test_delete_removes_by_id(self):
        item = self.store.add([[0, 0]])
        self.store.add([[1, 1]])
        self.assertEqual(self.store.delete({item['id']}), 1)
        self.assertNotIn(item['id'], [a['id'] for a in self.store.public()])


class HTTPTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        store = autographs.Store(Path(self.folder.name) / 'autographs.json')
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), autographs.make_handler(store))
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        self.url = f'http://127.0.0.1:{self.server.server_port}/api/autographs'

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.folder.cleanup()

    def post(self, body, origin='https://eduardkhamzin.ru', content_type='application/json'):
        raw = body if isinstance(body, bytes) else json.dumps(body).encode()
        request = Request(self.url, data=raw, method='POST',
                          headers={'Content-Type': content_type, 'Origin': origin})
        try:
            with urlopen(request) as response:
                return response.status, json.loads(response.read())
        except HTTPError as error:
            return error.code, json.loads(error.read())

    def test_round_trip(self):
        status, body = self.post(SIGNATURE)
        self.assertEqual(status, 201)
        with urlopen(self.url) as response:
            self.assertEqual(response.headers['Cache-Control'], 'no-store')
            items = json.loads(response.read())['autographs']
        self.assertEqual(items[0]['strokes'], SIGNATURE['strokes'])
        self.assertEqual(items[0]['id'], body['autograph']['id'])

    def test_rejects_other_sites_bad_types_and_bad_json(self):
        self.assertEqual(self.post(SIGNATURE, origin='https://evil.example')[0], 403)
        self.assertEqual(self.post(SIGNATURE, content_type='text/plain')[0], 415)
        self.assertEqual(self.post(b'{not json')[0], 400)
        self.assertEqual(self.post(b'x' * (autographs.MAX_BODY + 1))[0], 413)
        with urlopen(self.url) as response:
            self.assertEqual(json.loads(response.read())['autographs'], [])


if __name__ == '__main__':
    unittest.main()
