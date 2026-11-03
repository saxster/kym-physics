# KymPhysics — Domain Context & Ubiquitous Language

## Purpose
**KymPhysics** (`com.kymaia.physics` / `com.kymaia.physics.ipad`) is a bespoke Grade 8 Physics iPadOS 27 & macOS learning companion built for a single learner (Kym, 12, in Mumbai). It unifies:
1. **Her School Science 8 Spine (`group.com.kymaia.science`):** *Cambridge Lower Secondary Science 8* (*Learner's Book 8* pp. 8–326 & *Workbook 8* pp. 2–202 by Mary Jones, Diane Fellowes-Freeman & Michael Smyth, Cambridge University Press, curriculum code `0893`), shared with sibling apps **KymBio** and **KymChem**.
2. **First-Principles Physics Spine (*The Moving World*):** 16 narrative chapters across 4 volumes, 95 historical/everyday stories, 45+ interactive 2D/3D/WebGL simulations, 4 Front-Matter Explorers (`Powers of Ten`, `The Sky`, `The Ladder of Light`, `Adventure Map`), 109 structured investigations, and 507 Grade 8 exam-prep questions.
3. **Cross-Disciplinary First-Principles Bridges:** Targeted interactive bridges from **KymChem** (*The Invisible World*) and **KymBio** (*The Living World*) wherever physical laws (forces, moments, gas pressure, optics, thermodynamics, electricity) govern chemical reactions or living systems.

## Distinct Learner Signals (Never Conflated)
Per the Kymaia pedagogical honesty contract:
- **Unit Readiness (`UnitReadinessSnapshot`):** Three-stage readiness for a school unit (*Material In* → *Checked Learning* → *Independent Proof*).
- **Concept Mastery (`BKTSkillRecord`):** Bayesian Knowledge Tracing posterior $P(L)$ per sub-topic. **Honesty rule:** Opening a worked example, faded completion blank, or Socratic hint records `assistedEvidenceCount` and caps $P(L)$ below mastery until proven independently.
- **Card Progress (`FSRSCardRecord`):** FSRS v5 spaced-repetition stability $S$, difficulty $D$, and due interval for flashcard retrieval.
- **Question Proof (`QuestionProofRecord` / `QuestionProofLevel`):** Five-state progression (`unseen`, `assisted`, `shaky`, `proven`, `secure`). A question reaches `.proven` only when answered independently on the current day, and `.secure` only when proven independently across $2+$ separate calendar days.
- **Lab Challenge Stamp (`WidgetChallengeStampRecord`):** Earned by reaching a quantitative target state inside an interactive simulation or sensor lab.
