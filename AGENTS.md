# Weekly publication safety

## One issue per scheduled week

- The canonical issue date is the most recent Friday at 08:00 in `Asia/Tokyo`. A delayed or retried run keeps that issue date; it must not create another date for the same scheduled week.
- Read this file and run `python3 scripts/check_weekly_publication.py` against a fresh snapshot of `main` **before researching or changing publication files**, and again immediately before committing. An explicit `--week YYYY-MM-DD` is available for a retry of the original issue date.
- Exit `10` / `skip`: that issue is already fully published. Do not rewrite its Markdown/JSON, `data/current.json`, `data/archive.json`, cache versions, or timestamps. A duplicate run must make no content commit and must not redeploy just to mark the run complete.
- Exit `20` / `blocked`: publication is partial, inconsistent, future-dated, or otherwise unsafe. Stop and report the discrepancy. Do not regenerate or overwrite an existing issue automatically.
- Exit `0` / `publish`: the issue is absent and the previous publication is consistent. Create one issue, preserving all prior weekly files and archive entries. A read-only preflight is permission to proceed with the authorized publication process, not a lock.
- Editing a published issue is an exception only when the user explicitly requests a correction. Keep the same issue date, record the correction in the commit message, and do not treat it as a new weekly issue.

## Atomic publication and concurrent runs

1. Read `main`'s commit SHA and fetch all source files at that exact SHA. Never combine snapshots from different heads.
2. Prepare the complete issue off the published branch. Update the Markdown, matching weekly JSON, `data/current.json`, one archive entry, and any needed homepage/cache references in **one commit** based on the observed head. `data/current.json` must equal the new weekly JSON.
3. Re-read `main` immediately before publishing and repeat the preflight against that fresh head. If the issue is now complete, discard the candidate and skip. If `main` changed for another reason, rebuild against the new head and validate again.
4. Advance `main` only with a normal fast-forward / non-force update. Do not force-push. If the update is rejected because another writer won, re-read and repeat the preflight; never blindly rebase or retry the write. Use the Git Data API (blobs, one tree, one commit, non-force ref update) or an equivalent atomic Git push, not separate per-file writes.
5. Verify the expected commit is on `main`, the exact commit's Pages deployment succeeded, and the live current issue and archive agree. Deployment retries must reuse the same committed content and must not create a second weekly content commit.

## Scope and limitations

The GitHub workflow deploys committed static files; it is not a research scheduler. This guard is for all cooperating publishers and does not add another schedule, credentials, or permissions. It cannot prevent a writer that bypasses these instructions from directly modifying an unprotected branch. Never claim that an inaccessible legacy scheduler has been disabled without verifying its actual status.

Run guard tests with `python3 -m unittest discover -s tests -v`.
