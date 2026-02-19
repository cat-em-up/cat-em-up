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

## Movement Decisions

### Movement State Priority (Locked)

Movement resolution follows strict priority order (highest → lowest):

1. Dead
2. ForcedMovement (Knockback / Knockdown / Launch / Grabbed etc.)
3. Incapacitated (HitStun / ParryStun / BlockStun)
4. Roll / Dash
5. Air (Jump curve + optional air control)
6. Ground (Walk / Idle)

Higher-priority states fully override lower-priority movement.

---

### MovementLocked Rule (Locked)

`MovementLocked` is a control filter, not a top-priority movement state.

When active:

- Player-driven ground movement is disabled.
- Air control is disabled.
- Roll/Dash cannot start.

It does NOT override:

- ForcedMovement states.
- Active knockback/launch.
- Active Roll/Dash if the lock reason is soft (e.g. Recovery/Cinematic).

If Roll/Dash is active and a new state is applied:

- ForcedMovement → Roll/Dash is cancelled immediately.
- Incapacitated (HitStun/ParryStun) → Roll/Dash is cancelled immediately.
- Soft lock (Recovery/Cinematic) → Roll/Dash continues until completion.

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
