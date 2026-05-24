from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class WebInteractionContractTests(unittest.TestCase):
    def test_workbench_client_component_handles_selection_favorites_and_topics(self) -> None:
        component_path = ROOT / "src" / "components" / "CreatorWorkbench.tsx"
        self.assertTrue(component_path.exists(), "CreatorWorkbench client component is required")
        component = component_path.read_text(encoding="utf-8")

        self.assertIn('"use client"', component)
        self.assertIn("useState", component)
        self.assertIn("setSelectedHotspotId", component)
        self.assertIn("toggleFavorite", component)
        self.assertIn("rotateTopicIdeas", component)
        self.assertIn("aria-pressed", component)

    def test_app_page_delegates_to_workbench_component(self) -> None:
        page = (ROOT / "app" / "page.tsx").read_text(encoding="utf-8")

        self.assertIn("CreatorWorkbench", page)
        self.assertIn("initialHotspots", page)


if __name__ == "__main__":
    unittest.main()
