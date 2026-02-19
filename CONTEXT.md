# Cat ’Em Up — Project Context

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

Think:

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
- Subtle CRT flavor (optional)

Hero aesthetic:

- Anthropomorphic cat
- Leather jacket
- Worn denim
- Fingerless gloves
- Aggressive stance
- 80s action movie hero framing

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
step(game, inputFrame, dt) => { snapshot, events }

Rendering layer must never contain gameplay logic.

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
Current focus is a strong vertical slice.

---

## Core Principle

Style + Impact + Discipline.

Claws out. Game on.
