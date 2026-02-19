<a id="top"></a>

# Workflow

← [Back to Index](00_INDEX.md)

---

## Goals

Define development rules that protect:

- Deterministic core
- Architectural separation
- Scope discipline
- Long-term maintainability

This project prioritizes discipline over speed.

---

## Core Development Rules

### 1. Core is sacred

Core:
- Contains only simulation logic
- Has no engine dependencies
- Has no rendering code
- Has no audio references
- Has no device input code
- Uses only deterministic PRNG

Any violation of this rule must be rejected.

---

### 2. No logic in clients

View and Audio:
- Must not contain gameplay rules
- Must not change world state
- Must not compute damage or collision

Clients render and react only.

---

### 3. Input pipeline is separate

Input/Control runtime:
- Reads devices
- Normalizes input
- Maps to actions
- Detects patterns (double tap, etc.)
- Produces deterministic InputFrame

Core consumes InputFrame only.

---

### 4. Add features only through documents

Before implementing:
- Write or update relevant document
- Lock decisions
- Define invariants
- Define tuning knobs

Code follows document.

Not the other way around.

---

### 5. Determinism First

Every system must answer:

- Is it deterministic?
- Is randomness seeded?
- Is iteration order stable?
- Is floating-point usage controlled?

If unsure — simplify.

---

### 6. Scope Discipline

Vertical slice priority:

- 1 level
- 2 enemy archetypes
- 1 hero
- Light/Heavy attacks
- Block + Parry
- Arena lock
- Freeze-frame ending

No feature creep.

---

### 7. Refactoring Rule

If a system grows:

- Extract into new document
- Update index
- Do not silently mutate architecture

---

## Branching / Iteration Strategy (Optional)

Suggested approach:

- Small commits
- Feature branch per system
- Never mix rendering refactor with core logic change

---

## Debug First Philosophy

Before polishing:

- Enable hitbox visualization
- Log state transitions
- Log reasons for stun/recovery
- Log arena lock triggers

Visibility > Guesswork

---

## Locked Development Principles

- Separation over convenience
- Clarity over cleverness
- Data-driven over hard-coded
- Deterministic over flashy

---

↑ [Back to top](#top)
