import importlib.util
from pathlib import Path
import unittest

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
        self.assertIn('≈8,0', html)
        with self.assertRaises(ValueError):
            stats.parse_number('Unavailable')

    def test_behance_uses_only_the_owners_profile_counters(self):
        document = '<a href="/other/analytics" aria-label="Project Views - 999,999"></a><a href="/khamzin/analytics" aria-label="Project Views - 50539 views"></a><a href="/khamzin/analytics" aria-label="Appreciations - 4524 appreciations"></a>'
        self.assertEqual(stats.parse_behance(document)['views'], 50539)
        self.assertEqual(stats.parse_behance(document)['likes'], 4524)
        with self.assertRaises(ValueError):
            stats.parse_behance(document.replace('Appreciations - 4524 appreciations', 'Unavailable'))

    def test_outage_preserves_last_successful_values_and_timestamp(self):
        previous = {'dribbble': {'views': 100, 'likes': 10, 'updated_at': 'original'}}
        def unavailable(url):
            raise OSError('source unavailable')
        value, errors = stats.refresh(previous, unavailable)
        self.assertEqual(value, previous)
        self.assertEqual(len(errors), 2)


if __name__ == '__main__':
    unittest.main()
