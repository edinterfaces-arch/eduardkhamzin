#!/usr/bin/env python3
"""Accept AI token totals uploaded from the owner's laptop.

Runs as the forced command of the `tokenpush` SSH key, so the key can do nothing
else. Reads one small JSON object from stdin, {"codex": int, "claude": int},
validates it and atomically replaces the totals file that the site updater renders.
"""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import sys
import tempfile

MAX_INPUT = 4096
MAX_TOKENS = 10**13


def parse(raw):
    if len(raw) > MAX_INPUT:
        raise ValueError('Upload too large')
    value = json.loads(raw)
    if not isinstance(value, dict) or set(value) != {'codex', 'claude'}:
        raise ValueError('Expected exactly {"codex": ..., "claude": ...}')
    for key, number in value.items():
        if type(number) is not int or not 0 <= number <= MAX_TOKENS:
            raise ValueError(f'Invalid {key} token total')
    return {'codex': value['codex'], 'claude': value['claude'],
            'updated_at': datetime.now(timezone.utc).isoformat(timespec='seconds')}


def save(path, value):
    path = Path(path)
    with tempfile.NamedTemporaryFile('w', encoding='utf-8', dir=path.parent, delete=False) as file:
        json.dump(value, file)
        file.write('\n')
        temporary = Path(file.name)
    temporary.chmod(0o644)
    temporary.replace(path)


def main():
    cli = argparse.ArgumentParser()
    cli.add_argument('--out', type=Path, required=True)
    arguments = cli.parse_args()
    try:
        value = parse(sys.stdin.read(MAX_INPUT + 1))
    except Exception as error:
        print(f'rejected: {error}', file=sys.stderr)
        return 1
    save(arguments.out, value)
    print(f"saved: codex={value['codex']} claude={value['claude']}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
