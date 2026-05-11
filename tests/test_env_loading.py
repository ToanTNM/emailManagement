import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from outlook_web import runtime


class LoadLocalEnvTests(unittest.TestCase):
    def test_load_local_env_reads_dotenv_values(self):
        with tempfile.TemporaryDirectory(prefix="outlookEmail-env-") as temp_dir:
            env_path = Path(temp_dir) / ".env"
            env_path.write_text(
                "\n".join(
                    [
                        "# comment",
                        "SECRET_KEY=from-dotenv",
                        "LOGIN_PASSWORD='quoted-password'",
                        "export PORT=5100",
                    ]
                ),
                encoding="utf-8",
            )

            with patch.dict(os.environ, {}, clear=True):
                loaded_path = runtime.load_local_env(env_path)
                self.assertEqual(os.environ["SECRET_KEY"], "from-dotenv")
                self.assertEqual(os.environ["LOGIN_PASSWORD"], "quoted-password")
                self.assertEqual(os.environ["PORT"], "5100")

            self.assertEqual(loaded_path, env_path)

    def test_load_local_env_does_not_override_existing_environment(self):
        with tempfile.TemporaryDirectory(prefix="outlookEmail-env-") as temp_dir:
            env_path = Path(temp_dir) / ".env"
            env_path.write_text("SECRET_KEY=from-dotenv\n", encoding="utf-8")

            with patch.dict(os.environ, {"SECRET_KEY": "from-shell"}, clear=True):
                runtime.load_local_env(env_path)
                self.assertEqual(os.environ["SECRET_KEY"], "from-shell")
