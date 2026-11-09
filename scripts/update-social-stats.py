#!/usr/bin/env python3
"""Refresh public portfolio statistics and render a static HTML fragment.

No tokens, visitor tracking, browser-side fetches or additional dependencies.
Dribbble's public feed is explicitly scoped, never described as all-time totals.
"""
import argparse
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from decimal import Decimal
from html import escape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
import tempfile
from urllib.request import Request, urlopen

SOURCES = {
    'dribbble': 'https://dribbble.com/adooarde',
    'behance': 'https://www.behance.net/khamzin/info',
}
START = '<!-- social-stats:start -->'
END = '<!-- social-stats:end -->'


def parse_number(value):
    text = str(value).lower().strip().replace(',', '').replace(' ', '').replace('\u00a0', '')
    match = re.fullmatch(r'(\d+(?:\.\d+)?)([km]?)', text)
    if not match:
        raise ValueError(f'Unrecognized counter: {value!r}')
    number = Decimal(match[1]) * {'': 1, 'k': 1000, 'm': 1000000}[match[2]]
    if number < 0 or number > 10**12:
        raise ValueError('Counter outside expected range')
    return int(number), bool(match[2])


def parse_dribbble(document):
    match = re.search(r'var\s+newestShots\s*=\s*', document)
    if not match:
        raise ValueError('Dribbble public feed missing')
    shots, _ = json.JSONDecoder().raw_decode(document[match.end():])
    if not isinstance(shots, list) or not shots:
        raise ValueError('Dribbble public feed empty')
    unique = {}
    for shot in shots:
        identifier = int(shot['id'])
        if identifier in unique:
            raise ValueError('Duplicate shot in public feed')
        unique[identifier] = shot
    views, likes, approximate_views, approximate_likes = 0, 0, False, False
    for shot in unique.values():
        v, av = parse_number(shot['view_count'])
        l, al = parse_number(shot['likes_count'])
        views += v
        likes += l
        approximate_views |= av
        approximate_likes |= al
    return dict(views=views, likes=likes, approximate_views=approximate_views,
                approximate_likes=approximate_likes, scope='public_feed',
                posts=len(unique), url=SOURCES['dribbble'])


class BehanceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.values = {'views': set(), 'likes': set()}

    def handle_starttag(self, tag, attrs):
        if tag != 'a':
            return
        attrs = dict(attrs)
        # Only profile analytics links, never team/project/other-owner stats.
        if attrs.get('href') != '/khamzin/analytics':
            return
        label = attrs.get('aria-label', '')
        for prefix, key in [('Project Views - ', 'views'), ('Appreciations - ', 'likes')]:
            if label.startswith(prefix):
                counter = re.sub(r'\s+(?:views|appreciations)$', '', label[len(prefix):])
                value, rounded = parse_number(counter)
                if rounded:
                    raise ValueError('Expected exact Behance profile counters')
                self.values[key].add(value)


def parse_behance(document):
    parser = BehanceParser()
    parser.feed(document)
    if any(len(values) != 1 for values in parser.values.values()):
        raise ValueError('Behance profile counters missing or inconsistent')
    return dict(views=next(iter(parser.values['views'])), likes=next(iter(parser.values['likes'])),
                approximate_views=False, approximate_likes=False, scope='profile',
                url='https://www.behance.net/khamzin')


def fetch(url):
    request = Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html'})
    with urlopen(request, timeout=25) as response:
        if response.status != 200:
            raise ValueError(f'Source returned HTTP {response.status}')
        document = response.read(4_000_001)
        if len(document) > 4_000_000:
            raise ValueError('Source document too large')
        return document.decode('utf-8')



class GitHubCalendarParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.days = {}
        self.counts = {}
        self.tooltip = None
        self.text = ''

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'td' and 'data-date' in attrs:
            self.days[attrs['id']] = date.fromisoformat(attrs['data-date'])
        if tag == 'tool-tip':
            self.tooltip = attrs.get('for')
            self.text = ''

    def handle_data(self, data):
        if self.tooltip:
            self.text += data

    def handle_endtag(self, tag):
        if tag == 'tool-tip' and self.tooltip:
            match = re.match(r'(No|[0-9,]+) contributions? on ', self.text.strip())
            if match:
                self.counts[self.tooltip] = 0 if match[1] == 'No' else int(match[1].replace(',', ''))
            self.tooltip = None


def parse_github(document, start, end):
    parser = GitHubCalendarParser()
    parser.feed(document)
    days = {}
    for identifier, day in parser.days.items():
        if start <= day <= end:
            if identifier not in parser.counts or day in days:
                raise ValueError('Incomplete or duplicate GitHub contribution day')
            days[day] = parser.counts[identifier]
    if len(days) != (end - start).days + 1:
        raise ValueError('GitHub calendar does not cover requested dates')
    return sum(days.values())


def fetch_github(fetcher, today=None):
    today = today or datetime.now(ZoneInfo('Asia/Yekaterinburg')).date()
    start = date(2026, 9, 1)
    if today < start:
        raise ValueError('Contribution start date is in the future')
    total = 0
    for year in range(start.year, today.year + 1):
        first, last = max(start, date(year, 1, 1)), min(today, date(year, 12, 31))
        url = f'https://github.com/users/edinterfaces-arch/contributions?from={first}&to={last}'
        total += parse_github(fetcher(url), first, last)
    return dict(contributions=total, since=start.isoformat(), through=today.isoformat(),
                scope='public_profile', url='https://github.com/edinterfaces-arch')


def refresh(previous, fetcher=fetch):
    result = dict(previous)
    errors = []
    for source, parser in [('dribbble', parse_dribbble), ('behance', parse_behance)]:
        try:
            value = parser(fetcher(SOURCES[source]))
            value['updated_at'] = datetime.now(timezone.utc).isoformat(timespec='seconds')
            result[source] = value
        except Exception as error:
            # Keep the last successfully verified counters AND their timestamp.
            errors.append(f'{source}: {type(error).__name__}: {error}')
    try:
        value = fetch_github(fetcher)
        value['updated_at'] = datetime.now(timezone.utc).isoformat(timespec='seconds')
        result['github'] = value
    except Exception as error:
        errors.append(f'github: {type(error).__name__}: {error}')
    return result, errors


def format_count(value, approximate):
    if approximate and value >= 1000:
        value = ((value + 50) // 100) * 100
    return f'{value:,}'.replace(',', '\u00a0')


def plural(value, one, few, many):
    if 11 <= value % 100 <= 14:
        return many
    return one if value % 10 == 1 else few if 2 <= value % 10 <= 4 else many


def render(data):
    rows = []
    for source, name in [('behance', 'Behance'), ('dribbble', 'Dribbble')]:
        item = data.get(source)
        if not item:
            continue
        updated = escape(item['updated_at'])
        scope = ' data-scope="public_feed" data-post-count="' + str(item['posts']) + '"' if source == 'dribbble' else ' data-scope="profile"'
        views = format_count(item['views'], item['approximate_views'])
        award = '<svg class="award-badge" viewBox="0 0 24 40" role="img" aria-label="Награда Behance"><title>Награда Behance</title><path d="M0 0H24V39L12 32L0 39Z" fill="#ae945b"/><text x="12" y="24" fill="#fff" font-family="Helvetica, Arial, sans-serif" font-size="14" text-anchor="middle">Gr</text></svg>' if source == 'behance' else ''
        hidden = ' hidden' if source == 'dribbble' else ''
        rows.append(f'''<div class="stats-platform"{scope}{hidden} title="Обновлено: {updated}">
        <div class="stats-row"><span class="stats-profile"><a href="{escape(item['url'], quote=True)}" target="_blank" rel="noopener noreferrer">{name}</a>{award}</span><span class="stat-number">{views} <span class="streak-label">views</span></span></div>
      </div>''')
    return '<section class="social-stats" lang="en" aria-label="Project views">\n      ' + '\n      '.join(rows) + '\n    </section>' if rows else ''


def atomic_write(path, text):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile('w', encoding='utf-8', dir=path.parent, delete=False) as file:
        file.write(text)
        temporary = Path(file.name)
    temporary.chmod(0o644)
    temporary.replace(path)


def update(html_path, cache_path, render_only=False):
    previous = json.loads(cache_path.read_text()) if cache_path.exists() else {}
    data, errors = (previous, []) if render_only else refresh(previous)
    # Validate the template before writing cache or touching the published page.
    html = html_path.read_text()
    if html.count(START) != 1 or html.count(END) != 1:
        raise ValueError('Expected exactly one statistics slot in HTML')
    if data:
        fragment = START + '\n    ' + render(data) + '\n    ' + END
        rendered = re.sub(re.escape(START) + r'.*?' + re.escape(END), lambda _: fragment, html, flags=re.S)
        if 'github' in data:
            value = data['github']
            count = format_count(value['contributions'], False)
            github_fragment = f'<!-- github-stats:start -->{count}<!-- github-stats:end -->'
            if rendered.count('<!-- github-stats:start -->') != 1 or rendered.count('<!-- github-stats:end -->') != 1:
                raise ValueError('Expected exactly one GitHub statistics slot')
            rendered = re.sub(r'<!-- github-stats:start -->.*?<!-- github-stats:end -->',
                              lambda _: github_fragment, rendered, flags=re.S)
        atomic_write(cache_path, json.dumps(data, ensure_ascii=False, indent=2) + '\n')
        atomic_write(html_path, rendered)
    for error in errors:
        print(error, file=sys.stderr)
    return 1 if errors else 0


if __name__ == '__main__':
    cli = argparse.ArgumentParser()
    cli.add_argument('--html', type=Path, required=True)
    cli.add_argument('--cache', type=Path, required=True)
    cli.add_argument('--render-only', action='store_true')
    arguments = cli.parse_args()
    sys.exit(update(arguments.html, arguments.cache, arguments.render_only))
