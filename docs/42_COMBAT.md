<a id="top"></a>

# Combat (Attacks, Damage, Block, Parry)

← [Back to Index](00_INDEX.md)

---

## Goals

Define deterministic combat rules for an arcade beat ’em up:

- Minimal control set (X/Y/A/B)
- Clear, tunable, data-driven rules
- Deterministic outcomes for the same input stream
- Readability first: front/back matters, air is always risk
- Core emits reasons for reactions; view decides animations

Movement integration is defined in `031_MOVEMENT.md`.

---

## Controls (Default Arcade Mapping)

- Stick: Move (X/Z plane)
- X: Light attack
- Y: Heavy attack
- A: Jump
- B (hold): Block
- Start: Pause (client-side)

No additional buttons.

---

## Combat Model Overview

Combat resolution loop:

1. Choose attack (Light/Heavy)
2. Attack defines timing windows (startup/active/recovery)
3. During active: test hit volume vs hurt volume
4. If hit: resolve defense (parry/block/normal)
5. Apply damage + reactions (stun/recovery/knockback/launch)
6. Emit events (for view/debug)

Core consumes only canonical actions and current state.

---

## Entities and Volumes

### Hurt Volume

- Where the entity can be hit (capsule/box on X/Z, optional height tiers later)
- Active when alive and not in invulnerable states

### Hit Volume

- Exists only during attack active windows
- Authored per attack (arc/box/capsule/sweep)
- Hit volume direction is based on facing

Volumes are data, not hard-coded.

---

## Facing and Back/Front

### Facing

Facing is a unit direction on X/Z plane.

Facing updates from:

- movement intent (stick) when meaningful, or
- last facing, or
- optional enemy targeting later (not required now)

### Front vs Back

For a hit, determine whether defender was hit from behind:

- Compute direction from defender to attacker: `dirDA`
- If `dot(defenderFacing, dirDA) < backDotThreshold`, treat as **back hit**

Config:

- `backDotThreshold` (e.g. 0 means strict behind half-plane)

Back hits can apply a damage multiplier.

---

## Attacks

Primary attacks:

- Light (X)
- Heavy (Y)

### Attack Data (tunable)

Each attack defines:

- `startupMs`
- `activeMs` (or multiple windows later)
- `recoveryMs`
- `hitVolumeSpec`
- `baseDamage`
- `hitstunMs`
- `impulse` (knockback/launch)
- `onHit` flags (optional, e.g. knockdown later)

### Chaining (old school default)

- Light may chain into Light within a combo window (tunable)
- Heavy is slower; may be a finisher by default (tunable)
- No advanced cancels by default

---

## Defense

### Block (B hold) — “High Guard”

Block is a defensive state while B is held and blocking is allowed.

#### Eligibility (locked)

- Ground only
- Air block: **never**
- If in hitstun / knocked down: cannot block

#### Direction (locked)

- Block works **front only**.
- No 360° block.

A hit is blockable only if it comes from the defender’s front hemisphere:

- `dot(defenderFacing, dirDA) >= blockFrontDotThreshold`

Config:

- `blockFrontDotThreshold` (e.g. 0)

#### Block effect

When a hit connects and is blockable:

- Defender takes reduced damage:

`blockedDamage = baseDamage * blockDamageMultiplier`

Config:

- `blockDamageMultiplier` in `[0..1]`

Additionally (tunable):

- Apply `blockstunMs` to defender
- Reduce or convert impulse to small pushback

---

## Parry (Perfect Block) — timing window before impact

Parry is a perfect block that requires a fresh press of B shortly before impact.

### Parry trigger (locked)

Parry triggers if:

- the hit is coming from the front (same front check as block)
- defender is blocking at impact time
- and block was initiated within `parryWindowMs` before impact time

Holding B from earlier does **not** qualify.

### Parry damage

Parry applies its own damage multiplier:
`parryDamage = baseDamage * parryDamageMultiplier`

Config:

- `parryDamageMultiplier` (usually <= `blockDamageMultiplier`)

### Parry breaks attacks (locked)

A successful parry:

- immediately aborts the attacker’s current attack instance
- remaining hit windows of that attack are not evaluated
- aborted attacks cannot chain into combo links

This guarantees: one parry stops a combo cycle.

---

## Attacker Penalty on Parry (Profile-driven)

Parry effects are configured per enemy archetype profile.
Core applies configured effects to the attacker when parried.

Supported effects (any subset, tunable):

- `Stun(ms)`
- `ForcedRecovery(ms)`
- `VulnerabilityDebuff(ms, damageTakenMul)`

Bosses or elite enemies can set effects to zero (immunity / unshakable profiles).

Implementation note:

- `Stun` and `ForcedRecovery` may share the same internal timer, but remain distinct via `reason`.

---

## Reaction Timers and Reason

Core may model incapacitation with a single timer (e.g. `incapacitatedMs`) plus a **reason** tag.

### Why reason exists

- View/animation selection without gameplay branching
- Debug clarity and telemetry
- Per-enemy behavior and authored reactions

### Reason examples

Examples of reasons (not exhaustive):

- `HitStun` (took a hit)
- `BlockStun` (blocked)
- `ParryStun` (was parried)
- `Recovery` (attack recovery)
- `Knockdown` (fell)
- `Launch` (sent airborne by hit)

Core emits reason with events or state changes, e.g.:

- `StateApplied(entityId, state='Incapacitated', reason='ParryStun', ms=350)`

View decides:

- which animation plays for a given enemy archetype + reason
- whether enemy holds a limb, slips, falls, etc.

Core does not care; core only enforces timers and constraints.

---

## Damage Resolution

On hit, compute:

1. `baseDamage`
2. apply defense modifier (parry/block/none)
3. apply direction modifier (back hit multiplier, if enabled)
4. apply any global scaling (difficulty etc., optional)

### Back hit multiplier (locked)

If hit is from behind:

- multiply final damage by `backDamageMultiplier`

Config:

- `backDamageMultiplier` (e.g. 1.25..2.0)
- Can be 1.0 to disable

---

## Hit Reactions and Movement Integration

Combat requests movement outcomes but movement integrates position.

Combat may issue:

- `ApplyImpulse(vec)`
- `ForceState(Knockback/Knockdown/Launch)`
- `LockMovement(ms, reason=...)`

Movement remains the authority of position evolution (see `031_MOVEMENT.md`).

---

## Multi-hit and Repeated Parry

Parry should apply once per attack instance per defender.

Locked rule:

- Parry breaks the current attack instance, so further hits from the same attack cannot occur anyway.

If we later add unusual multi-source attacks, we still keep:

- one parry outcome per attack instance per defender

---

## Events (Optional but Recommended)

Core may emit:

- `AttackStarted(attackerId, attackId, attackInstanceId)`
- `HitLanded(attackerId, defenderId, attackInstanceId, result)`
- `Blocked(attackerId, defenderId, attackInstanceId)`
- `ParryTriggered(attackerId, defenderId, attackInstanceId)`
- `AttackAborted(attackerId, attackInstanceId, reason='Parried')`
- `StateApplied(entityId, state, reason, ms)`
- `DamageApplied(attackerId, defenderId, amount, tags)`

---

## Config Knobs (Tuning Surface)

Global or per archetype:

- `blockDamageMultiplier`
- `blockstunMs`
- `blockFrontDotThreshold`
- `parryWindowMs`
- `parryDamageMultiplier`
- `backDotThreshold`
- `backDamageMultiplier`

Per attack:

- startup/active/recovery
- baseDamage
- hitstunMs
- impulse parameters

Per enemy archetype (parry effects):

- `effects: [Stun, ForcedRecovery, VulnerabilityDebuff]`
- optional immunities via zero durations/multipliers

---

## Locked Decisions Summary

- Block is ground-only and front-only.
- Air block is never allowed.
- Parry requires a fresh B press within `parryWindowMs` before impact.
- Parry aborts the attacker’s current attack instance and breaks combo flow.
- Parry attacker penalties are profile-driven and can differ per enemy archetype.
- Back hits can apply a damage multiplier (tunable).
- Core carries `reason` for incapacitation; view uses it to choose animations.

---

↑ [Back to top](#top)
