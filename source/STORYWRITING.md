# Brief for story writers

You are writing the stories behind the ideas for *The Moving World*, a story-first physics book for Kym, 12, Mumbai.
Stories open in a side panel from linked words in the chapters, and from the stories index, the timeline and the cast.
Repo root: /Users/amarsukhi/src/MyCode/kym_physics. Paths below are under `source/`.

## Read first
1. `STORIES.md`: the voice and rules, and your stories' ids, titles, groups, sort years, **terms** and beats. Use the
   terms exactly as listed; never add a term that belongs to another story.
2. `WRITING.md`: the **fact rule** (every fact traces to a grounding note, a Python computation you run, or a cited
   line in research/), voice, figure helpers and screenshot commands. It applies to stories too.
3. `BOOKPLAN.md` §2 (the simplest true explanation, after Feynman) and `NARRATIVE.md` (history rules: TRUE / HEDGE /
   LEGEND from research/history.md).
4. `research/history.md` (scenes, statuses, URLs, cast table), the relevant `grounding/chNN.md` notes, and
   `research/misconceptions.md` where the story explains an idea.
5. Two chemistry stories as models of tone, structure and length:
   /private/tmp/claude-501/-Users-amarsukhi-src-MyCode-kym-physics/2e9ca51c-255a-4f79-bc5e-551d74c06be7/scratchpad/kym-chem/source/src/stories/mole.md (a topic story)
   and …/bohr.md (a life story).

## Format
`src/stories/<id>.md` with front matter: `id`, `title`, `year` (shown above the title, e.g. "1586" or "1643 to 1654"),
`sort` (timeline year; 9999 for thinking tools), `people`, `group`, `terms` (comma-separated, from STORIES.md),
`blurb` (one sentence). Life stories (group `people`) add `name`, `born`, `died`, `role` (one line). Body: Markdown
with `:::scene Place, year` first, then the same blocks as chapters except `:::note`, `:::check`, `:::case`, `:::next`,
`:::try`, `:::predict`, `:::recall`. Use `#### Step 1: …` headings for the step-by-step explanation in topic stories.
Figures: reuse a chapter figure by name if one exists, or add `s_`-prefixed figures to your own
`figs_stories_<yourgroup>.py`. No `:::live` lines (widgets come later; note any you'd want in your final message).

## Ledger
Write `provenance/stories_<yourgroup>.yml` with one entry per story, key `"story:<id>"`, same schema as chapter
entries (ocw / openstax / research / history lists with url and took, plus licence). Use the exact course/book names
from `provenance/sources.yml`.

## Lengths
Topic stories 800–1,500 words; thinking tools 500–900; tales 500–900; life stories 500–900. P1 stories first; write
P2 stories only after all your P1 stories are done.

## Rules that matter most
- True history only; never invent a quote, a date, or an emotion you can't source ("she must have felt…" is out).
  Tell legends as legends with what really happened beside them.
- Explain the idea the simplest **true** way: the thing before its name, mechanism not label, nothing she must unlearn.
- Close with one or two sentences tying back to the main book (by chapter number, e.g. "In Chapter 5 you'll see…").
- Initials medallions only; never describe or link photographs of real people.
- British spelling. No exclamation-mark gush. No "imagine a world", no "little did they know".

## File ownership
Only your `src/stories/<id>.md` files, your `figs_stories_<yourgroup>.py`, and your `provenance/stories_<yourgroup>.yml`.
Chapter writers are editing chapters at the same time; don't touch them. Don't commit.

## Check and report
Build once with `cd source && ../.venv/bin/python build.py --only 0 --out build/stories_<group>.html
--allow-missing-provenance` (stories are built into every build) and confirm no errors mention your files; screenshot
any new figures. Final message (under 300 words): stories written with word counts, UNSOURCED claims, legends you
corrected, and anything a chapter writer must know (e.g. a term you couldn't use).
