#!/usr/bin/env bash
# All verification runs on this machine. Publishing is a separate git push.
set -euo pipefail
source_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(dirname -- "$source_root")"
reader_python="$project_root/.venv/bin/python"
if [[ ! -x "$reader_python" ]]; then reader_python=python3; fi
cd "$source_root"
node --test tests/test_*.mjs
"$reader_python" -m unittest discover -s tests -p 'test_lesson_catalog.py'
"$reader_python" tests/test_figs_core.py
"$reader_python" tests/test_graphics_physics.py
"$reader_python" build.py --site build/site
"$reader_python" tests/test_reader_build.py
"$reader_python" tests/test_reader_journey.py
"$reader_python" tests/test_readaloud_optional.py
"$reader_python" tests/test_investigations_browser.py
"$reader_python" tests/test_labs_integration.py --out build/reader-labs-integration
"$reader_python" tests/test_labs_browser.py --smoke --widths 390,1440 --themes light,sepia,dark --out build/reader-lessons
"$reader_python" livetest.py build/site/index.html build/reader-live-figures --wait 300 --offline
git -C "$project_root" diff --check
printf '%s\n' 'PASS local reader release checks. No source was pushed or published.'
