import json
import tempfile
import unittest
from pathlib import Path

from tools.g1_vvx_deploy import (
    BuiltScript,
    DeployError,
    assert_expected_slots,
    build_scripts,
    load_manifest,
    safe_repo_path,
    split_upload_chunks,
)


class G1VvxDeployTests(unittest.TestCase):
    def test_split_upload_chunks_respects_byte_limit(self):
        self.assertEqual(["ab", "cd", "e"], split_upload_chunks("abcde", 2))
        self.assertEqual(["å", "b"], split_upload_chunks("åb", 2))
        with self.assertRaisesRegex(DeployError, "positive"):
            split_upload_chunks("abc", 0)

    def test_build_scripts_concatenates_recipe_chunks(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            (root / "a.js").write_text("a();\n", encoding="utf-8")
            (root / "b.js").write_text("b();\n", encoding="utf-8")
            (root / "recipe.json").write_text(json.dumps({"chunks": ["a.js", "b.js"]}), encoding="utf-8")
            (root / "manifest.json").write_text(
                json.dumps(
                    {
                        "device_version": 1,
                        "scripts": [
                            {
                                "role": "demo",
                                "id": 2,
                                "name": "demo_v1_0_0",
                                "recipe": "recipe.json",
                                "boot": True,
                            }
                        ],
                    }
                ),
                encoding="utf-8",
            )

            manifest = load_manifest(root, "manifest.json")
            built = build_scripts(root, manifest, None)

        self.assertEqual(
            [BuiltScript("demo", 2, "demo_v1_0_0", True, "a();\nb();\n", 10)],
            built,
        )

    def test_safe_repo_path_rejects_escaping_path(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            with self.assertRaisesRegex(DeployError, "escapes"):
                safe_repo_path(root, "../outside.js")

    def test_assert_expected_slots_rejects_unexpected_live_name(self):
        expected = [BuiltScript("master", 3, "master_v1_5_0", False, "", 0)]

        def fake_script_list(_base_url):
            return [{"id": 3, "name": "other_v1_0_0"}]

        import tools.g1_vvx_deploy as deploy

        original = deploy.script_list
        try:
            deploy.script_list = fake_script_list
            with self.assertRaisesRegex(DeployError, "unexpected script names"):
                assert_expected_slots("http://device", expected)
        finally:
            deploy.script_list = original

    def test_assert_expected_slots_accepts_old_version_name_for_same_role(self):
        expected = [BuiltScript("master", 3, "master_v1_5_0", False, "", 0)]

        def fake_script_list(_base_url):
            return [{"id": 3, "name": "master_v1_4_0"}]

        import tools.g1_vvx_deploy as deploy

        original = deploy.script_list
        try:
            deploy.script_list = fake_script_list
            assert_expected_slots("http://device", expected)
        finally:
            deploy.script_list = original


if __name__ == "__main__":
    unittest.main()
