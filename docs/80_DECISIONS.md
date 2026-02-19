<a id="top"></a>

# Decisions

← [Back to Index](00_INDEX.md)

---

## Architecture Decisions

### Deterministic Core

Core:
- Engine-agnostic
- Fixed-step simulation (recommended 30 Hz)
- Uses seeded PRNG
- Exposes snapshot + events only

---

### Layer Separation

Input Layer
Control Layer
Core Simulation
Clients (View + Audio)

Clients are output-only.

---

## Combat Decisions

- Light (X)
- Heavy (Y)
- Jump (A)
- Block (B hold)

---

### Block

- Ground-only
- Front-only
- No air block
- Reduced damage via multiplier

---

### Parry

- Requires fresh press of B before impact
- Within parryWindowMs
- Breaks attacker’s current attack instance
- Aborted attacks cannot chain

---

### Back Hit

- Back hits use damage multiplier
- Determined by dot product threshold

---

### Reaction System

- Single incapacitation timer allowed
- Reason tag required
- View chooses animation based on reason
- Core does not branch on visuals

---

### Enemy v0.0.1

- Simple approach AI
- Single attack
- Deterministic attack chance
- No advanced tactics

---

### Geometry v0.0.1

- X/Z plane only
- Circular body colliders
- Simple pushback resolution
- No static obstacles required

---

### Level v0.0.1

- Segment-based
- Arena lock by defeatAllInSegment
- Trigger-based spawn
- Deterministic spawn positions

---

## Locked Principles

- Core never depends on client
- Clients never contain gameplay logic
- Input runtime is separate from view
- All randomness is seeded
- Every major mechanic must be tunable

---

## Future Revisit Points

These may change in later versions:

- Advanced combo system
- Height tiers for attacks
- Multiple hit volumes per attack
- Boss special mechanics
- Group AI

Only change via explicit decision update.

---

↑ [Back to top](#top)
