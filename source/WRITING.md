# Brief for chapter writers

You are writing chapters of *The Moving World*, a story-first physics book for one reader: Kym, 12, Mumbai, IB/IGCSE
track. The book is published at https://saxster.github.io/kym-physics/. Repo root: /Users/amarsukhi/src/MyCode/kym_physics.
All paths below are under `source/`.

## Read before writing (in this order)
1. `BOOKPLAN.md` §2 (teaching like Feynman: the simplest **true** explanation, the movability test, the four guards) and
   your chapters in §5 (big question, sections, misconception → demo, live figures, case).
2. `NARRATIVE.md` (the shape of every section, threads, home-experiment rules, voice, history rules).
3. `FORMAT.md` (chapter file format, every block, figure helpers, the ledger format) and skim `LIVE.md`.
4. `grounding/chNN.md` for each of your chapters. **This is your factual spine.** Read its fidelity traps and gaps twice.
5. `research/misconceptions.md` (your topics), `research/history.md` (your scenes; obey TRUE / HEDGE / LEGEND),
   `research/school-wording.md` (for `:::school` bridges).
6. One chemistry chapter for tone and density:
   /private/tmp/claude-501/-Users-amarsukhi-src-MyCode-kym-physics/2e9ca51c-255a-4f79-bc5e-551d74c06be7/scratchpad/kym-chem/source/src/ch01.md
   (match its voice and structure; it uses `:::try Investigation N.M`, `:::careful`, `:::check`, `:::home`, `:::case`, `:::next`).

## The fact rule
Every physics fact, number, date and quote you write must trace to one of: a line in a grounding note; a computation
you run yourself with `python3 -I -c '…'` (keep a list of these in your ledger entries under `took:` or in a
`computed:` note); or a cited line in research/. If you want to say something that is in none of them, either compute
it, or leave it out, or mark it in your final report as UNSOURCED for the fact gate. Never invent a quote. When the
grounding note says a source sentence is itself misleading (e.g. "force is the cause of motion"), do not reuse it.
Research suggestions can be wrong: think, don't obey (the sugar-in-a-brim-full-glass demo is already rejected; see
PLAYBOOK §6's rejected list).

## Each section
- 250–550 words of explanation (chapters can run 4,000–7,500 words in total), a scene or a puzzle she can feel, her
  wrong idea taken seriously, `:::predict` before the decisive evidence, the better model explained the simplest true
  way (phenomenon first, then the name in `==term==` with a `:::note`), `:::careful` in her voice, one `:::check`.
  Add `:::home` (one or two per chapter, Mumbai-real, safe), `:::try Investigation N.M` (number = section), `:::school`
  (only where IB/IGCSE words it differently) and `:::story id` (ids from STORIES.md; one or two per chapter) where they
  earn their place. From Chapter 2 on, add one or two `:::recall N` blocks that bring back a misconception from an
  earlier chapter in a new setting.
- Each chapter opens with intro prose (bridge from the previous chapter, then the big question's puzzle), and ends with an
  unnumbered heading holding the `:::case` (clues, a direct question, `???`, solution) and `:::next`.
- Front matter keys: `chapter`, `title`, `short`, `question` (the big question from BOOKPLAN, polished).

## Figures
- Write still figures in `figs_chNN.py` (names `c<N>_…`, helpers in figs_core.py: force, vector, axis, ray, wave,
  spring, ground, mass_block, arrow, text…). One figure per section that does real work; 640 wide (1000 for
  `:::figwide`); labels ≥ 12 px, theme classes only, no raw colours; colour never the only cue.
- **Do NOT add `:::live` lines.** Widgets are built later. Instead, for every figure that should come alive (BOOKPLAN
  marks them **Live**), write a spec in `live/specs/chNN.md`: figure name, widget name (`w_<name>`), what the reader
  controls (≤ 3 controls), what the readout says, the physics it must honour (real ratios, conservation), what is
  slowed or exaggerated, and any sensor or audio use.
- After writing, render your figures and look at them: `cd source && ../.venv/bin/python build.py --only N --out
  build/chN.html --allow-missing-provenance` then `../.venv/bin/python shoot.py build/chN.html <scratch dir> fig-N-1 …
  --w 1280` (and `--w 390`). Use the scratchpad
  /private/tmp/claude-501/-Users-amarsukhi-src-MyCode-kym-physics/2e9ca51c-255a-4f79-bc5e-551d74c06be7/scratchpad/
  for output. Fix overlaps and illegible labels.

## Ledger
Write `provenance/chNN.yml` for each chapter: an entry for every numbered section (the build fails without it), every
figure (`fig:` keys) and every story you reference that your chapter introduces. Copy the "Proposed provenance entries"
from the grounding note and correct them to what you actually used. Use the exact `course:` and `book:` names in
`provenance/sources.yml`. History sources go under `history:`, misconception papers under `research:`.

## Voice
Warm, plain, vivid, precise. "You". Short sentences, varied rhythm. British spelling. No exclamation-mark gush (at most
one genuine surprise per chapter), no "let's dive in", no "imagine a world", no rhetorical filler, no "not X but Y"
tics. Never "the ball wants", "nature hates", "electricity is used up". Forces, energy, fields, motion, counting.
Mumbai examples where they fit naturally (one or two per chapter): local trains, the Sea Link, monsoon, matka, Marine
Drive, Haji Ali, Colaba, chai, cricket. The reader's father, Amar, wrote the letter at the front; don't speak as him.

## File ownership
You own only: `src/chNN.md`, `figs_chNN.py`, `provenance/chNN.yml` and `live/specs/chNN.md` for your chapters. Don't
edit anything else (other writers are working in parallel). Don't commit; the coordinator commits.

## Done means
Your chapters build with `build.py --only N --out … --allow-missing-provenance` and also without
`--allow-missing-provenance` (every section has a ledger entry); your figures are screenshot-checked; and your final
message (under 400 words) lists: files written, word count per chapter, every UNSOURCED claim, research suggestions you
rejected and why, home experiments that need the safety gate's attention, and widget specs written.
