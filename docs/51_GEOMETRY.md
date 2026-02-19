<a id="top"></a>

# Geometry (Bounds, Volumes, Collision Model)

← [Back to Index](00_INDEX.md)

---

## Goals

Define the minimal geometry and collision model required for the first vertical slice:
- X/Z plane gameplay geometry
- Simple world bounds (clamp / slide)
- Simple collision volumes for entities (pushback circles)
- Attack hit volumes vs hurt volumes in X/Z
- Deterministic, stable collision resolution

This document is intentionally minimal and data-friendly.

---

## Non-Goals

Out of scope for now:
- Complex static collision meshes
- Sloped terrain, stairs, ramps
- Platforms, pits
- Per-pixel collisions
- Pathfinding/navmesh
- “Stripes” / layered depth volumes (reserved for later)

---

## World Space

Core uses 3D coordinates:
- X+ East (forward progression)
- Y+ Up (semantic height only in v0.0.1)
- Z+ South (lane depth)

Gameplay geometry is evaluated in X/Z plane.

---

## World Bounds

Bounds restrict movement and spawns.

### Level bounds
From `040_LEVEL_FORMAT.md`:
- `zMin`, `zMax` define lane depth corridor
- segment bounds may override Z range

### X bounds
For v0.0.1, we assume:
- Level segments define valid X ranges
- Arena lock gates prevent progression beyond certain X

### Clamp policy
When an entity moves outside bounds:
- Clamp position back into bounds.
- Optionally preserve tangential movement (slide) if we later add wall normals.

For now:
- `posZ = clamp(posZ, zMin, zMax)`
- X is clamped only when explicitly needed (e.g. cannot pass arena gate)

---

## Entity Collision Volumes

Entities use simple circles on the X/Z plane.

### Circle collider
- `radius: number`
- `pos: (x, z)`

Recommended:
- player radius and enemy radius are archetype-defined knobs.

This is used for:
- pushback collisions (body vs body)
- simple overlap tests for proximity

---

## Pushback Collision Resolution

Pushback prevents entities stacking.

### Eligibility
Pushback is applied if:
- `collision.pushbackEnabled = true`
- both entities are not in ghost mode
- both entities have active body colliders
- entity states allow collisions (dead entities may disable)

### Ghost overlap
Entities may ignore pushback collisions:
- globally via config
- per state (roll/dash flags)
- per entity (e.g. flying enemies later)

### Resolution algorithm
For each overlapping pair:
- Compute `delta = posB - posA`
- Compute `dist = length(delta)`
- `minDist = rA + rB`
- If `dist < minDist`, compute separation vector:
  - `n = normalize(delta)` (if `dist==0`, use deterministic fallback axis, e.g. (1,0))
  - `push = (minDist - dist)`
- Move entities apart:
  - by default, split equally (0.5/0.5)
  - if one is immovable (optional flag), push the other 100%

### Determinism constraints
- Pair iteration order must be stable (sort by entity id).
- Use a fixed maximum number of solver passes per frame:
  - `collision.maxResolveIterations`
- Avoid non-deterministic floating comparisons; use consistent eps.

---

## Attack Hit Volumes and Hurt Volumes

Attacks must test hit volume vs hurt volume deterministically.

### Hurt volume
Use a circle in X/Z:
- `hurtRadius` (can be same as body radius or separate)

### Hit volume
Use simple primitives:
- `Circle`
- `Box` (axis-aligned in attacker-local space, then rotated by facing)

Recommended starting point:
- use `Circle` hit volumes for simplest implementation.

### Facing transform
Hit volumes are defined in attacker-local coordinates and transformed into world X/Z using attacker facing.

---

## Height (Y) and Airborne

In v0.0.1, Y is semantic:
- Jump curve changes Y but does not affect world bounds
- Airborne affects:
  - eligibility (cannot block in air)
  - which attacks can hit (reserved for later)

Collision in v0.0.1 remains mostly 2D in X/Z.
We reserve "height tiers" for later.

---

## Static Geometry (Walls, Obstacles)

We keep static geometry minimal:
- Only bounds clamping is required.

Optional early obstacle support (if needed):
- axis-aligned rectangles in X/Z:
  - `AABB { xMin, xMax, zMin, zMax }`
- Entities cannot enter AABB.
- Resolution: clamp to closest edge.

Not required unless the first level needs it.

---

## Spawn Position Validity

Spawns must be valid and deterministic.

Rules:
- Clamp spawn Z to active bounds.
- Clamp spawn X to active segment X range (or near player offsets produce valid X).
- If a fixed spawn point is outside bounds, clamp; do not fail.

---

## Debug Visualization (Recommended)

Client may render debug overlays:
- entity body circles
- hurt circles
- hit volumes
- bounds corridor
- arena gates

Core can emit debug geometry events if needed, but not required.

---

## Extension Points (Future)

When we move beyond v0.0.1, we can add:
- Stripes: depth layers with different collision/priority
- Volumes: regions that restrict movement or change friction
- Height tiers: attacks that only hit grounded or airborne
- True wall sliding with normals
- Dynamic obstacles and hazards

No breaking changes needed if we treat v0.0.1 as the base.

---

↑ [Back to top](#top)
