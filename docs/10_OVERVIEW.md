<a id="top"></a>

# Overview

← [Back to Index](00_INDEX.md)

---

## Project Summary

Cat ’Em Up is a retro 80s-inspired beat ’em up built around a strictly separated, deterministic game core.

The project is designed as both a playable arcade experience and a showcase of clean, engine-agnostic architecture.

---

## Core Idea

The system is structured around a single authoritative simulation layer:

- The Core owns the world state.
- The Core runs at a fixed 30Hz tick.
- The Core produces Snapshot + Events.
- All clients are projections of that state.

Rendering and audio are fully decoupled from gameplay logic.

---

## Scope

This project intentionally focuses on a controlled feature set:

- Side-scrolling beat ’em up format
- Deterministic simulation
- Minimal input surface (movement + 4 actions)
- Expandable combat system via combinations
- Semantic level definition independent of rendering

No feature creep.
No engine coupling inside Core.

---

## Architectural Goals

- Deterministic behavior
- Clear separation of concerns
- Replay-friendly design
- Multiple client support (2D / 3D / CLI)
- Clean documentation structure

---

## Target Outcome

The final result should demonstrate:

- Strong system thinking
- Practical game architecture
- Scalable design foundations
- Professional documentation discipline

↑ [Back to top](#top)
