import importlib.util
from pathlib import Path
import unittest
from datetime import date

spec = importlib.util.spec_from_file_location('stats', Path(__file__).parents[1] / 'scripts/update-social-stats.py')
stats = importlib.util.module_from_spec(spec)
spec.loader.exec_module(stats)


class PublicCounterTests(unittest.TestCase):
    def test_dribbble_does_not_present_rounded_or_partial_counts_as_precise_totals(self):
        document = 'var newestShots = [{"id":1,"view_count":"7.3k","likes_count":"15"},{"id":2,"view_count":"680","likes_count":"8"}]\n'
        value = stats.parse_dribbble(document)
        self.assertEqual((value['views'], value['likes'], value['posts']), (7980, 23, 2))
        self.assertTrue(value['approximate_views'])
        self.assertEqual(value['scope'], 'public_feed')
        value['updated_at'] = '2026-11-09T00:00:00+00:00'
        html = stats.render({'dribbble': value})
        self.assertIn('data-post-count="2"', html)
        self.assertIn('8\u00a0000', html)
        with self.assertRaises(ValueError):
            stats.parse_number('Unavailable')

    def test_behance_uses_only_the_owners_profile_counters(self):
        document = '<a href="/other/analytics" aria-label="Project Views - 999,999"></a><a href="/khamzin/analytics" aria-label="Project Views - 50539 views"></a><a href="/khamzin/analytics" aria-label="Appreciations - 4524 appreciations"></a>'
        self.assertEqual(stats.parse_behance(document)['views'], 50539)
        self.assertEqual(stats.parse_behance(document)['likes'], 4524)
        with self.assertRaises(ValueError):
            stats.parse_behance(document.replace('Appreciations - 4524 appreciations', 'Unavailable'))

    def test_github_counts_only_requested_dates_and_rejects_missing_days(self):
        document = '<td id="old" data-date="2026-08-31"></td><tool-tip for="old">99 contributions on August 31st.</tool-tip><td id="one" data-date="2026-09-01"></td><tool-tip for="one">3 contributions on September 1st.</tool-tip><td id="two" data-date="2026-09-02"></td><tool-tip for="two">No contributions on September 2nd.</tool-tip>'
        self.assertEqual(stats.parse_github(document, date(2026, 9, 1), date(2026, 9, 2)), 3)
        with self.assertRaises(ValueError):
            stats.parse_github(document, date(2026, 9, 1), date(2026, 9, 3))
        with self.assertRaises(ValueError):
            stats.parse_github(document.replace('3 contributions', 'Unavailable'), date(2026, 9, 1), date(2026, 9, 2))

    def test_github_spans_year_boundaries(self):
        urls = []
        def calendar(url):
            urls.append(url)
            import urllib.parse
            query = urllib.parse.parse_qs(urllib.parse.urlparse(url).query)
            start, end = date.fromisoformat(query['from'][0]), date.fromisoformat(query['to'][0])
            return ''.join(f'<td id="d{i}" data-date="{start + stats.timedelta(days=i)}"></td><tool-tip for="d{i}">1 contribution on date.</tool-tip>' for i in range((end - start).days + 1))
        value = stats.fetch_github(calendar, date(2027, 1, 2))
        self.assertEqual(value['contributions'], 124)
        self.assertEqual(len(urls), 2)

    def test_outage_preserves_last_successful_values_and_timestamp(self):
        previous = {'dribbble': {'views': 100, 'likes': 10, 'updated_at': 'original'}}
        def unavailable(url):
            raise OSError('source unavailable')
        value, errors = stats.refresh(previous, unavailable)
        self.assertEqual(value, previous)
        self.assertEqual(len(errors), 3)


if __name__ == '__main__':
    unittest.main()
