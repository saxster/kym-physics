# Discovery textbook publication

Authorised 15 November 2026: push the updated textbook and publish it, with verification performed locally.

The release copies the previously verified build from `source/build/site` into the repository's Pages root on `main`. The [publication manifest](discovery-publication.json) records all 129 files and their SHA-256 hashes. Each destination was compared byte-for-byte with that build. Older hashed assets are retained for readers using an earlier cached page.

The main index hash is `cadc88a8cb5852d4d078043e75e91649adae58a85540fea6f0b6eb590b347563`; its service-worker cache is `mw-5a61f77c92a1`. The [local verification report](discovery-verification.md) records the full reader gate, final build checks and 345 activity/width/theme cases. The source/build fingerprints still match those receipts, so those checks were reused. The required shared-engine `--check` also passed for all 60 files before publication.

Pre-publication downloads of the live index and service worker matched `origin/main` at `754a47ee1fb0f8def1acb1a8e7a36575cfb24da4`; there were no live-only edits to port. A first uncompressed index download timed out; the compressed transfer completed successfully and was compared locally.

The source push preserves two earlier local commits, `b810740` and `be36d6e`, containing LearnHarness and SmartyMe/Brilliant work. They include native iOS source changes as well as website changes. Their website portions are part of the verified build. This publication does not build or distribute the native app and makes no new native verification claim.

GitHub Pages is already configured to publish the root of `main`. Its existing managed deployment job publishes the prebuilt files. No hosted build/test verification workflow is added, enabled or dispatched. Post-publication checks run from the local machine: deployment revision, HTTP delivery and byte equality of the index, service worker and lazy discovery bundle.

Rollback is ready through Git history: revert the static-publication commit, then push `main` to republish the preceding root artifacts. The previous public revision is recorded above; no history rewrite or reader-data migration is involved. Actual deployment/status and delivery receipts are retained locally under `source/build/discovery-release/`.
