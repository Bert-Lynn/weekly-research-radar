import importlib.util
from datetime import datetime
import json
from pathlib import Path
import tempfile
import unittest

MODULE = Path(__file__).resolve().parents[1] / "scripts/check_weekly_publication.py"
spec = importlib.util.spec_from_file_location("guard", MODULE)
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)


class WeeklyPublicationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "weekly").mkdir()
        (self.root / "data").mkdir()
        self.archive = []
        self.publish("2026-09-25")

    def write(self, path, value):
        (self.root / path).write_text(json.dumps(value), encoding="utf-8")

    def publish(self, week):
        data = {"week": week, "papers": [{"title": "Test paper", "priority": "P0"}]}
        self.write(f"weekly/{week}.json", data)
        (self.root / f"weekly/{week}.md").write_text(f"# {week}\nTest paper\n", encoding="utf-8")
        self.write("data/current.json", data)
        self.archive.insert(0, {"week": week, "file": f"weekly/view.html?week={week}", "source_file": f"weekly/{week}.md", "data_file": f"weekly/{week}.json", "total": 1})
        self.write("data/archive.json", self.archive)

    def decision(self, week="2026-10-02"):
        return guard.inspect(self.root, week)["decision"]

    def test_new_week_can_publish(self):
        self.assertEqual(self.decision(), "publish")

    def test_completed_week_skips_repeated_runs_without_mutation(self):
        self.publish("2026-10-02")
        before = {p: p.read_bytes() for p in self.root.rglob("*") if p.is_file()}
        for _ in range(3):
            self.assertEqual(self.decision(), "skip")
        self.assertEqual(before, {p: p.read_bytes() for p in before})

    def test_old_completed_week_skips_without_rolling_back(self):
        self.publish("2026-10-02")
        self.assertEqual(self.decision("2026-09-25"), "skip")

    def test_second_publisher_skips_after_first_finishes(self):
        self.assertEqual(self.decision(), "publish")
        self.publish("2026-10-02")
        self.assertEqual(self.decision(), "skip")

    def test_partial_markdown_blocks(self):
        (self.root / "weekly/2026-10-02.md").write_text("Draft")
        self.assertEqual(self.decision(), "blocked")

    def test_current_and_weekly_mismatch_blocks(self):
        self.publish("2026-10-02")
        self.write("data/current.json", {"week": "2026-10-02", "papers": []})
        self.assertEqual(self.decision(), "blocked")

    def test_duplicate_archive_entry_blocks(self):
        self.publish("2026-10-02")
        self.write("data/archive.json", self.archive + [self.archive[0]])
        self.assertEqual(self.decision(), "blocked")

    def test_broken_archive_link_blocks(self):
        self.publish("2026-10-02")
        self.archive[0]["source_file"] = "weekly/wrong.md"
        self.write("data/archive.json", self.archive)
        self.assertEqual(self.decision(), "blocked")

    def test_empty_report_blocks(self):
        self.publish("2026-10-02")
        (self.root / "weekly/2026-10-02.md").write_text("")
        self.assertEqual(self.decision(), "blocked")

    def test_archive_only_blocks(self):
        self.publish("2026-10-02")
        (self.root / "weekly/2026-10-02.json").unlink()
        self.assertEqual(self.decision(), "blocked")

    def test_invalid_json_blocks(self):
        (self.root / "data/current.json").write_text("{broken")
        self.assertEqual(self.decision(), "blocked")

    def test_unknown_past_issue_blocks(self):
        self.assertEqual(self.decision("2026-09-18"), "blocked")

    def test_wrong_issue_day_blocks(self):
        self.assertEqual(self.decision("2026-10-03"), "blocked")

    def test_tokyo_schedule_boundary(self):
        for instant, week in [
            ("2026-10-01T22:59:59+00:00", "2026-09-25"),
            ("2026-10-01T23:00:00+00:00", "2026-10-02"),
            ("2026-10-02T00:00:00+00:00", "2026-10-02"),
            ("2026-10-08T23:00:00+00:00", "2026-10-09"),
        ]:
            with self.subTest(instant=instant):
                self.assertEqual(guard.scheduled_week(datetime.fromisoformat(instant)).isoformat(), week)


if __name__ == "__main__":
    unittest.main()
