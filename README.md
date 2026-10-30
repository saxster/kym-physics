# The Moving World

A physics book told as a historical adventure: how things move, push, shine and spin, and how we know. It was written for Kym, a 12-year-old in Mumbai, and anyone else is welcome to read it.

**Read it here:** https://saxster.github.io/kym-physics/

The book is one web page, with:
- Live figures you can play, turn in 3D or listen to.
- Experiments with your own phone's sensors and your own slow-motion videos (nothing leaves your device).
- Life stories of the people who worked it all out.
- Explorers: Powers of Ten, the Sun, Earth and Moon, the ladder of light, and a map of where it all happened.
- Questions to predict before you look, and kitchen-safe experiments.
- Exam preparation for all sixteen chapters: progressive questions, model answers, suggested marking guidance, revision cards, spaced review and two original papers per chapter, plus mixed review.

It works offline once it has been opened, and it can be installed on a phone or tablet. Notes and progress are saved only in the reader's own browser.

Choose **Prepare for my exam** on the cover or reading toolbar. Choose a chapter and match its objectives to the school's Grade 8 topic list. Marks are self-assessed practice records. Exam answers and review dates are included in notebook backups; separate question sheets, marking sheets and a revision sheet can be printed.

The [implementation plan](docs/exam-preparation-plan.md) records the implementation and chapter coverage. The original Chapter 1 story remains unchanged.

Facts were checked against sources, and the page "Where this book comes from" lists what each section drew on. Where a story is a legend or an anecdote, the book says so. If you find an error, please open an issue.

Licensed CC BY-NC-SA 4.0 (see LICENSE.md). See NOTICES.md for the typefaces, software and map data, which keep their own licences.

The book's source, and the playbook used to make it, are in the `source/` folder.

To repeat the reader release checks locally, run `./source/check-reader.sh` from the repository root. It builds the book and checks its models, reading journey, read-aloud, notebook, experiments and offline access. It requires Node dependencies from `source/package-lock.json` and the existing Python environment with Markdown, fontTools and Playwright. Checks run locally; publishing the verified static files is a separate source push. This repository has no GitHub Actions CI workflows.

The full preparation path uses the website/offline folder edition (`--site`); the self-contained single-file edition retains motion practice.
