# Brief for gate agents (independent checks)

You are an independent checker for *The Moving World*, a story-first physics book for Kym, 12, Mumbai. You have NOT
seen the writing process; that is the point. Repo: /Users/amarsukhi/src/MyCode/kym_physics; paths below are under
`source/`. Read `BOOKPLAN.md` §2 (the simplest true explanation, after Feynman), `NARRATIVE.md` and `FORMAT.md` first.

## Gate A: facts and fidelity (you may edit)
For every chapter and story assigned to you:
1. **Facts.** Check every number, date, place, name and quote. Recompute every number with `python3 -I -c '…'`.
   Check claims against `grounding/chNN.md`, `research/*.md` and the ledger's URLs; fetch the URL when in doubt
   (ToolSearch "select:WebFetch,WebSearch"). History must obey research/history.md's TRUE / HEDGE / LEGEND labels.
   Writers listed UNSOURCED claims; treat those as top priority.
2. **Fidelity.** Compare each explanation with the grounding note and its MIT OCW / OpenStax sources: where has
   simplifying for a 12-year-old made it false or misleading? Use the grounding note's "fidelity traps" list.
3. **Fix** clear-cut errors directly in the chapter, story, figure or ledger files (wrong number, wrong date, a legend
   told as fact, a false simplification with an obvious true replacement). Keep the voice; change as little as needed.
   For anything that needs judgement or rewriting, don't edit; report it.

## Gate B: the Feynman read and safety (report only; don't edit)
1. **Feynman read**, section by section, reading as Kym would: flag (a) a name given before the thing is shown;
   (b) a label used as an explanation (movability test: swap the term for a made-up word; if the sentence still
   "explains", it explains nothing); (c) a skipped step; (d) a convenient falsehood; (e) anything a bright 12-year-old
   would find confusing or dull. For each section write a three-sentence explain-back in a 12-year-old's words; if it
   contains the misconception the section is fighting, flag the section as REWRITE.
2. **Safety and will-it-work** for every `:::home` and `:::try`, in an ordinary Mumbai flat: materials really
   available, safe (no flames, no mains, no hot liquids beyond warm tap water, adult present for sharp/electrical/
   outdoor), and does it actually work at the stated size (estimate the effect with Python; say what can go wrong).
3. Also flag voice problems: exclamation marks beyond one per chapter, "wants/tries" language for objects, filler.

## Output
Write your report to `gates/<volume>-<A|B>.md` (e.g. `gates/vol1-A.md`): one section per chapter/story, each finding
with location (section number or heading), severity (BLOCKER / FIX / CONSIDER), what's wrong, evidence (URL or
computation), and for Gate A whether you fixed it (FIXED) or left it (REPORT). End with a summary count.
Build check after Gate A edits: `cd source && ../.venv/bin/python build.py --only <your chapters> --out
build/gate.html` must still exit 0 (if it fails on someone else's file, build from a scratch copy and say so).
Final message (under 300 words): counts by severity, the five most important findings, and the report path.
Don't commit.
