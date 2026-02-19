<a id="top"></a>

# 033 — Enemies (v0.0.1 Dumb Archetypes)

← [Back to Index](00_INDEX.md)

---

## Goals

Provide the simplest possible enemy system for the first vertical slice:
- Enemies are "dumb": walk toward player and occasionally attack
- No advanced tactics, no groups, no combos, no navigation complexity
- Data-driven archetypes with minimal tuning knobs
- Combat integration supports block/parry reasons for view-driven animations

This document defines:
- Enemy archetype data
- Minimal behavior loop
- Minimal state machine
- Events and tuning surface

---

## Non-Goals

Explicitly out of scope for this version:
- Advanced AI (flanking, spacing, feints, adaptive behavior)
- Coordinated group behavior
- Combo attacks, special moves
- Ranged enemies, projectiles
- Grapples, throws
- Complex navigation / pathfinding
- Boss logic

---

## Enemy Archetype Data

Each enemy instance references an archetype profile.
Archetypes are pure data; behavior code is shared.

### Core fields (minimum)
- `id: string`
- `displayName: string` (optional, for tools)
- `maxHp: number`

### Movement fields (minimum)
- `walkSpeed: number`
- `preferredRange: number` (distance to player to start attack attempts)
- `stopRange: number` (distance to stop moving forward)
- `turnSpeed: number` (optional; may be ignored in v0.0.1)

### Combat fields (minimum)
- `attackLightId: string` (reference to attack definition)
- `attackChancePerSecond: number` (lazy attacker behavior)
- `attackCooldownMs: number`

### Defense reaction on parry (profile-driven)
- `parryEffects: ParryEffect[]` (see `032_COMBAT.md`)
- `parryImmunity` is modeled by choosing empty effects or zero durations

### View-facing reaction mapping (reason tags)
Enemies may include a mapping table for view hints:
- `reactionStyleByReason: Record<Reason, ReactionStyleId>`

Core does not use this table for gameplay.
It is an optional hint for the rendering client.

---

## Minimal Enemy Behavior Loop

Enemies follow a simple deterministic loop:

1) Acquire target (player)
2) Move toward player until within `stopRange`
3) If within `preferredRange` and off cooldown:
   - roll a deterministic chance and maybe attack
4) If hit / stunned / in recovery:
   - do nothing until timer expires
5) Repeat

No strafing, no lane logic, no flanking in v0.0.1.

---

## Deterministic Randomness (for "chance to attack")

Any randomness must be deterministic:
- Use core PRNG seeded from `createGame(config, seed?)`
- Per enemy, derive a stable stream (e.g. seed + enemyId)

Example use:
- Each step, compute `p = attackChancePerSecond * dt`
- Draw `r` from PRNG; if `r < p` then attack

---

## Enemy State Machine

Minimal set of states:

- `Idle` (not moving, not attacking)
- `Approach` (moving toward player)
- `Attack` (playing attack timing: startup/active/recovery)
- `Incapacitated` (hitstun, parry stun, recovery stun, etc.)
- `Dead`

State transitions:
- `Idle/Approach` → `Attack` when conditions satisfied
- Any state → `Incapacitated` when hit/block/parry imposes timer
- `Incapacitated` → `Idle/Approach` when timer ends
- Any state → `Dead` when hp <= 0

---

## Approach Logic

- Compute distance to player on X/Z plane
- If distance > `stopRange`: move toward player at `walkSpeed`
- Else: stop

Optional (later):
- add small "jitter" or patience timers (not in v0.0.1)

---

## Attack Attempt Logic

Enemy attempts attacks only if:
- distance <= `preferredRange`
- off `attackCooldownMs`
- not incapacitated
- facing player within a threshold (optional; can be ignored initially)

When attempting:
- use deterministic chance roll
- if success: start `Attack` state with `attackLightId`

Notes:
- v0.0.1 enemies have one lazy attack only.

---

## Parry and Reasons (View-driven)

Combat system applies parry effects per enemy archetype.

Core provides:
- state change to `Incapacitated`
- `reason` tag (e.g. `ParryStun`, `Recovery`, `Knockdown`)
- duration ms

View decides how the enemy looks:
- limp arm on `ParryStun` for EnemyTypeA
- slip and fall on `ParryStun` for EnemyTypeB
- KO animation on `Knockdown` regardless of cause
- etc.

Gameplay does not branch on these visuals.

---

## Tuning Surface

Minimum knobs we expect to tune immediately:
- `maxHp`
- `walkSpeed`
- `stopRange`
- `preferredRange`
- `attackChancePerSecond`
- `attackCooldownMs`
- `parryEffects` (type + duration + multipliers)

We intentionally keep knobs small.

---

## Events (Optional but Useful)

- `EnemySpawned(enemyId, archetypeId)`
- `EnemyStateChanged(enemyId, prev, next)`
- `EnemyAttackAttempt(enemyId, result)` (success/fail)
- `EnemyAttackStarted(enemyId, attackId, attackInstanceId)`
- `EnemyDamaged(enemyId, amount, tags)`
- `EnemyDied(enemyId)`

---

## Example Archetypes

### THUG_A (limb reaction)
- walks slowly
- lazy punch
- on parry: holds limb (view style)

### THUG_B (slip/fall reaction)
- similar stats
- on parry: forced recovery / knockdown style

These are examples only; exact values are tuned in data.

---

## Future Expansion (not now)

Planned later documents / extensions may include:
- lane behavior and spacing
- group coordination
- elites and bosses
- ranged enemies
- grabs and throws
- decision trees / behavior trees

Not in v0.0.1.

---

↑ [Back to top](#top)
