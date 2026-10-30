# The Moving World

A physics book told as a historical adventure: how things move, push, shine and spin, and how we know. It was written for Kym, a 12-year-old in Mumbai, and anyone else is welcome to read it.

**Read it here:** https://saxster.github.io/kym-physics/

The book is one web page, with:
- Live figures you can play, turn in 3D or listen to.
- Experiments with your own phone's sensors and your own slow-motion videos (nothing leaves your device).
- Life stories of the people who worked it all out.
- Explorers: Powers of Ten, the Sun, Earth and Moon, the ladder of light, and a map of where it all happened.
- Questions to predict before you look, and kitchen-safe experiments.

It works offline once it has been opened, and it can be installed on a phone or tablet. Notes and progress are saved only in the reader's own browser.

Facts were checked against sources, and the page "Where this book comes from" lists what each section drew on. Where a story is a legend or an anecdote, the book says so. If you find an error, please open an issue.

Licensed CC BY-NC-SA 4.0 (see LICENSE.md). See NOTICES.md for the typefaces, software and map data, which keep their own licences.

The book's source, and the playbook used to make it, are in the `source/` folder.

To repeat the reader release checks locally, run `./source/check-reader.sh` from the repository root. It builds the book and checks its models, reading journey, read-aloud, notebook, experiments and offline access. It requires Node dependencies from `source/package-lock.json` and the existing Python environment with Markdown, fontTools and Playwright. Checks run locally; publishing the verified static files is a separate source push. This repository has no GitHub Actions CI workflows.
