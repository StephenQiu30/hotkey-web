from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class WebAuthFlowContractTests(unittest.TestCase):
    def test_workbench_starts_with_email_password_login(self) -> None:
        workbench = (ROOT / "src" / "components" / "CreatorWorkbench.tsx").read_text(encoding="utf-8")

        self.assertIn("setIsAuthenticated", workbench)
        self.assertIn("handleEmailLogin", workbench)
        self.assertIn("HotKeyAPI.EmailLoginRequest", workbench)
        self.assertIn("邮箱登录", workbench)
        self.assertIn("密码", workbench)
        self.assertIn("进入工作台", workbench)

    def test_login_flow_keeps_topic_generation_acceptance_path(self) -> None:
        workbench = (ROOT / "src" / "components" / "CreatorWorkbench.tsx").read_text(encoding="utf-8")

        self.assertIn("内容创作者热点 SaaS 台", workbench)
        self.assertIn("快速理解", workbench)
        self.assertIn("内容选题", workbench)
        self.assertIn("生成选题", workbench)
        self.assertIn("rotateTopicIdeas", workbench)


if __name__ == "__main__":
    unittest.main()
