# Cat ’Em Up — Project Context

**Doc ID:** CATEMUP-CONTEXT  
**Version:** 0.0.4

---

## Project Identity

Title: Cat ’Em Up  
Tagline: Insert Coin. Break Bones. Claws Out.

Genre: Retro 80s Beat ’Em Up  
Platform: Browser-based (initial target)  
Core: Engine-agnostic TypeScript simulation layer

Cat ’Em Up is a high-energy neon arcade beat ’em up inspired by classic late 80s cabinet games and action movie posters.

This is not parody.  
This is not a meme project.  
This is pure arcade intensity with stylistic confidence.

---

## Creative Direction (Locked)

### Tone

- Serious arcade action
- Stylish, controlled humor
- No irony overload
- No meme spam
- Confident, bold, slightly exaggerated 80s energy

Visual references:

- Arcade cabinet art
- VHS action movie covers
- Neon urban nights
- Leather jackets and impact frames

---

## Visual Identity

- Neon purple / magenta / cyan palette
- Urban alley environments
- Strong silhouettes
- High-contrast lighting
- Dramatic freeze-frames
- Optional subtle CRT flavor

Hero aesthetic:

- Anthropomorphic cat
- Leather jacket
- Worn denim
- Fingerless gloves
- Aggressive stance
- 80s action movie framing

---

## Music Direction

Style:

- 80s rock
- Disco-rock groove
- Synthwave accents

Tempo:

128–135 BPM

Rules:

- Instrumental only
- Seamless gameplay loop
- High-energy
- Gameplay-focused (not cinematic ambient)

Energy level: relentless arcade drive.

---

## Gameplay Philosophy

Arcade mindset.

- Immediate action
- Clear feedback
- Heavy hit impact
- Minimal fluff
- Tight combat loop

Scope discipline is critical.

---

## Gameplay Scope (Strict)

- 1 polished level (initial goal)
- Side-scrolling progression (left → right)
- Arena lock segments
- 2–3 enemy types
- 1 boss (max 2 phases)
- Freeze-frame ending:
  "To Be Continued..."

No feature creep.

---

## Technical Architecture (Locked)

Core = deterministic game state + rules  
Client = rendering + input mapping

Core must:

- Be engine-agnostic
- Contain zero Phaser or Three.js dependencies
- Simulate gameplay in X/Z plane
- Use 3D coordinate system:
  - X+ East
  - Y+ Up
  - Z+ South

Public API:

createGame(config, seed?)  
step(game, inputFrame, dt) → { snapshot, events }

Rendering layer must never contain gameplay logic.

---

## Documentation Structure

Production documentation lives in the `docs/` directory.

Numbering scheme:

- Two-digit grouped blocks (00, 10, 30, 40, 50, 60, 70, 80)
- Character files use 11–19 range
- Systems grouped by functional blocks
- Clean decade spacing for future expansion

---

### Core

- 00_INDEX.md — Documentation index
- 10_OVERVIEW.md — Project overview
- 30_ARCHITECTURE.md — Core architecture

---

### Gameplay Systems

- 40_INPUT.md — Input model
- 41_MOVEMENT.md — Movement system
- 42_COMBAT.md — Combat rules
- 43_ENEMIES.md — Enemy design

---

### Level System

- 50_LEVEL_FORMAT.md — Semantic level definition
- 51_GEOMETRY.md — Geometry & collision model

---

### Rendering & Audio

- 60_CLIENTS.md — Rendering clients
- 61_AUDIO.md — Audio system

---

### Process

- 70_WORKFLOW.md — Development rules
- 80_DECISIONS.md — Architectural decision log

---

### Characters

- 15_CHARACTERS.md — Roster overview
- 11_MEOWAMI.md — (reserved / optional slot)
- 16_LEADER.md — Leader
- 17_BRUISER.md — Bruiser
- 18_FAST_CAT.md — Fast Cat
- 19_ROGUE.md — Rogue

---

## Brand Positioning

Cat ’Em Up sounds like:

- A real 1989 arcade cabinet
- A cult VHS action movie
- A game made with love for the era

It must never feel like:

- A joke project
- A meme generator
- A cynical parody

---

## Long-Term Possibilities (Not Immediate)

- Multiple episodes
- Kickstarter campaign
- Steam release
- Expanded roster
- Co-op mode

These are future considerations.  
Current focus is one strong vertical slice.

---

## Core Principle

Style + Impact + Discipline.

Claws out. Game on.
