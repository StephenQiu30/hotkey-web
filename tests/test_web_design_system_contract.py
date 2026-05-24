import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read_text(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8")


class WebDesignSystemContractTests(unittest.TestCase):
    def test_web_uses_tailwind_shadcn_radix_stack(self) -> None:
        package_json = json.loads(read_text("package.json"))
        dependencies = {**package_json.get("dependencies", {}), **package_json.get("devDependencies", {})}

        for package_name in [
            "tailwindcss",
            "@tailwindcss/postcss",
            "@radix-ui/react-slot",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
            "lucide-react",
        ]:
            self.assertIn(package_name, dependencies)

        for relative_path in [
            "postcss.config.mjs",
            "src/lib/utils.ts",
            "src/components/ui/button.tsx",
            "src/components/ui/card.tsx",
        ]:
            self.assertTrue((ROOT / relative_path).exists(), f"{relative_path} is required")

    def test_web_uses_official_yellow_theme_tokens(self) -> None:
        globals_css = read_text("app/globals.css")

        self.assertIn('@import "tailwindcss";', globals_css)
        self.assertIn("@theme inline", globals_css)
        self.assertIn("--primary: oklch(0.795 0.184 86.047);", globals_css)
        self.assertIn("--primary-foreground: oklch(0.421 0.095 57.708);", globals_css)
        self.assertIn("--chart-1: oklch(0.795 0.184 86.047);", globals_css)
        self.assertIn("--accent: oklch(0.967 0.001 286.375);", globals_css)
        self.assertNotIn("--accent: #0f8f72", globals_css)

    def test_workbench_is_top_nav_saas_layout_not_admin_sidebar(self) -> None:
        workbench = read_text("src/components/CreatorWorkbench.tsx")

        self.assertIn('className="min-h-screen bg-background text-foreground"', workbench)
        self.assertIn("顶部导航", workbench)
        self.assertIn("SaaS", workbench)
        self.assertNotIn("Sidebar", workbench)
        self.assertNotIn("sidebar", workbench)
        self.assertNotIn("app-shell", workbench)
        self.assertIn("from-primary/20", workbench)
        self.assertNotIn("from-yellow", workbench)

    def test_workbench_composes_shadcn_components_and_icons(self) -> None:
        workbench = read_text("src/components/CreatorWorkbench.tsx")

        self.assertIn('@/components/ui/button', workbench)
        self.assertIn('@/components/ui/card', workbench)
        self.assertIn("lucide-react", workbench)
        self.assertIn("<Button", workbench)
        self.assertIn("<Card", workbench)
        self.assertIn("Search", workbench)
        self.assertIn("Bookmark", workbench)


if __name__ == "__main__":
    unittest.main()
