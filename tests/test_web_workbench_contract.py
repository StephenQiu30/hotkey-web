from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class WebWorkbenchContractTests(unittest.TestCase):
    def test_next_app_router_shell_exists_for_creator_workbench(self) -> None:
        for path in [
            ROOT / "app" / "layout.tsx",
            ROOT / "app" / "page.tsx",
            ROOT / "app" / "globals.css",
            ROOT / "next.config.ts",
            ROOT / "tsconfig.json",
            ROOT / "src" / "lib" / "request.ts",
        ]:
            self.assertTrue(path.exists(), f"{path.relative_to(ROOT)} is required")

    def test_workbench_page_contains_p0_creator_workflow_sections(self) -> None:
        page_path = ROOT / "app" / "page.tsx"
        self.assertTrue(page_path.exists(), "app/page.tsx is required")
        page = page_path.read_text(encoding="utf-8")

        for expected in [
            "热点榜单",
            "快速理解",
            "内容选题",
            "收藏关注",
            "趋势分析",
            "来源分布",
            "HotKey",
        ]:
            self.assertIn(expected, page)

    def test_workbench_uses_generated_hotkey_openapi_types(self) -> None:
        page_path = ROOT / "app" / "page.tsx"
        self.assertTrue(page_path.exists(), "app/page.tsx is required")
        page = page_path.read_text(encoding="utf-8")

        self.assertIn("HotKeyAPI.HotspotRead", page)
        self.assertIn("HotKeyAPI.TopicIdeaRead", page)
        self.assertIn("src/services/hotkey/hotkey-server", page)


if __name__ == "__main__":
    unittest.main()
