from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class WebNotificationContractTests(unittest.TestCase):
    def read_text(self, relative_path: str) -> str:
        return (ROOT / relative_path).read_text(encoding="utf-8")

    def test_generated_client_contains_notification_list_response(self) -> None:
        typings = self.read_text("src/services/hotkey/hotkey-server/typings.d.ts")

        self.assertIn("NotificationRead", typings)
        self.assertIn("NotificationListResponse", typings)
        self.assertIn("listNotificationsApiNotificationsGet", self.read_text("src/services/hotkey/hotkey-server/notifications.ts"))

    def test_workbench_contains_notification_list_and_config_entry(self) -> None:
        workbench = self.read_text("src/components/CreatorWorkbench.tsx")

        self.assertIn("通知列表", workbench)
        self.assertIn("通知配置", workbench)
        self.assertIn("提醒入口", workbench)
        self.assertIn("notificationItems", workbench)
        self.assertIn("NotificationListResponse", workbench)


if __name__ == "__main__":
    unittest.main()
