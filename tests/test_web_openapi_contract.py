from __future__ import annotations

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class WebOpenApiContractTests(unittest.TestCase):
    def test_package_declares_umijs_openapi_generation(self) -> None:
        package_path = ROOT / "package.json"
        self.assertTrue(package_path.exists(), "package.json is required for the Next.js Web workspace")
        package_json = json.loads(package_path.read_text(encoding="utf-8"))

        self.assertIn("@umijs/openapi", package_json["devDependencies"])
        self.assertEqual(package_json["scripts"]["openapi:generate"], "openapi2ts")

    def test_openapi_config_uses_hotkey_server_schema_and_services_output(self) -> None:
        config_path = ROOT / "openapi2ts.config.ts"
        self.assertTrue(config_path.exists(), "openapi2ts.config.ts is required for @umijs/openapi generation")
        config = config_path.read_text(encoding="utf-8")

        self.assertIn("../hotkey-server/docs/openapi.json", config)
        self.assertIn("src/services/hotkey", config)
        self.assertIn("hotkey-server", config)

    def test_generated_client_contains_m1_server_contract_fields(self) -> None:
        service_root = ROOT / "src" / "services" / "hotkey"
        self.assertTrue(service_root.exists(), "generated HotKey API client must live under src/services/hotkey")
        generated_files = [path for path in service_root.rglob("*") if path.is_file()]
        generated_text = "\n".join(path.read_text(encoding="utf-8") for path in generated_files)

        for expected in [
            "EmailRegisterRequest",
            "EmailLoginRequest",
            "MiniappLoginRequest",
            "quick_understanding",
            "topic_ideas",
            "rank_score",
            "trend_score",
            "cluster_id",
        ]:
            self.assertIn(expected, generated_text)


if __name__ == "__main__":
    unittest.main()
