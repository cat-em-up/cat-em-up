<a id="top"></a>

# Task Tracking System (Trello)

← [Back to Index](00_INDEX.md)

---

## Purpose

The tracker exists to provide:

- Visibility of progress
- Execution control
- A scalable studio workflow

The project uses **two separate boards**:

1. DEVELOPMENT — production & build systems
2. CREATIVE — art, audio, and worldbuilding laboratory

Separation is intentional.  
Engineering and creativity operate at different tempos and require different flows.

---

## BOARD 1 — DEVELOPMENT

### Purpose

Build a deterministic, playable game.

Everything on this board must directly contribute to a working build.

---

### Lists (State-Based Workflow)

- `BACKLOG` — raw technical tasks
- `READY` — clearly defined and ready to implement
- `IN PROGRESS` — currently being worked on (WIP-limited)
- `TESTING` — verification (manual / replay / edge cases)
- `LOCKED` — completed and fixed
- `PARKED` — postponed, not relevant now

---

### WIP Rules

- Maximum 2 cards in `IN PROGRESS`
- At least 1 active card must belong to SYSTEM / INPUT / GAMEPLAY / LEVEL
- If a card stays in `IN PROGRESS` longer than 2–3 days → split it

---

### DEVELOPMENT Labels (Work Domains)

- 🔴 **SYSTEM** — deterministic core, tick, state, replay, RNG
- 🔵 **INPUT** — input frames, buffering, priority, mapping
- 🟣 **GAMEPLAY** — combat, mechanics, player feel
- 🟢 **LEVEL** — geometry, spawns, pacing
- 🟡 **CLIENT** — rendering layer, camera, snapshot integration

Combat is part of the Core in code,  
but tracked under GAMEPLAY because it represents player-facing mechanics.

---

### Definition of Done (Development)

A card is considered complete when:

- The feature works in a playable build
- Edge cases are tested
- No debug logs remain
- No TODO markers remain
- Documentation is updated (if applicable)
- The card is moved to `LOCKED`

No “almost done”.

---

## BOARD 2 — CREATIVE

**Board name:** `CAT 'EM UP — CREATIVE`

### Purpose

Creative laboratory for visual identity, music, and worldbuilding.

This board does not follow engineering rigidity.  
It supports exploration and artistic direction.

---

### Lists (Creative Flow)

- `IDEAS` — raw concepts, references, inspirations
- `EXPLORING` — active experimentation and variations
- `APPROVED` — chosen direction (canon established)
- `DONE` — finalized asset or text

Creative is intentionally lighter.

No TESTING state.  
No LOCKED rigidity.

---

### CREATIVE Labels (Domains)

- 🔴 **VISUAL** — characters, lighting, key art, UI style, branding
- 🟣 **AUDIO** — music, themes, SFX direction, voice concepts
- 🟢 **LORE** — story, factions, city writing, character background

---

## Interaction Between Boards

DEVELOPMENT drives playable builds.

CREATIVE defines identity.

Approved creative assets may generate DEVELOPMENT tasks,  
but the boards remain operationally separate.

Different tempos.  
Different deadlines.  
One unified project.

---

## Milestones

Milestones represent vertical playable states, not feature lists.

A milestone is achieved when:

- The game is playable end-to-end
- Core systems involved in that slice are stable
- No temporary placeholders remain in critical paths
- The build reflects intended direction, not experiments

Milestones measure progress in playable reality,  
not in completed task counts.

We ship slices.  
Not checklists.

---

## Principle

> DEVELOPMENT builds the machine.  
> CREATIVE builds the soul.

Claws Out.

---

↑ [Back to top](#top)
