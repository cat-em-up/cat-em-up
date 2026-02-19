<a id="top"></a>

# Level Format

← [Back to Index](00_INDEX.md)

---

## Goals

Define a simple, deterministic, data-driven level format for the
vertical slice.

Requirements: - Side-scrolling progression (left → right) - X/Z plane
gameplay with bounded lane depth on Z - Enemy spawns controlled by
triggers - Arena lock segments (must defeat enemies to unlock) - Minimal
authoring complexity (hand-editable) - Engine-agnostic (core reads level
data, client renders visuals)

---

## Non-Goals

Out of scope for now: - Full tile/geometry authoring tools - Complex
collision meshes - Dynamic navigation/pathfinding - Procedural
generation - Branching paths - Checkpoints / save states

---

## Core Concepts

### World space

Core uses X/Z plane: - X: forward progression - Z: lane depth

### Level structure

A level is authored as ordered segments along X. Each segment defines
bounds and optional arena lock rules.

### Determinism

All spawns using randomness must derive from core PRNG seed. Same seed +
same inputs =\> same enemy spawns.

---

## LevelData Schema

### Required fields

-   `id: string`
-   `title: string`
-   `bounds: { zMin: number, zMax: number }`
-   `start: { playerX: number, playerZ: number }`
-   `segments: Segment[]`

### Optional fields

-   `seedPolicy: "fixed" | "runtime"`
-   `musicTrackId: string`

---

## Segment

### Fields

-   `id: string`
-   `xFrom: number`
-   `xTo: number`
-   `zMin?: number`
-   `zMax?: number`
-   `arenaLock?: ArenaLock`
-   `triggers?: Trigger[]`

If z bounds omitted, use level global bounds.

---

## ArenaLock

### Fields

-   `enabled: boolean`
-   `gateX: number`
-   `unlockCondition: UnlockCondition`

### UnlockCondition (current)

-   `{ kind: "defeatAllInSegment" }`

Unlocks when all enemies spawned by this segment are defeated.

---

## Triggers

### Supported types

1)  On player crossing X:

-   `{ kind: "onPlayerX", x: number }`

2)  On segment enter:

-   `{ kind: "onSegmentEnter", segmentId: string }`

Each trigger fires once unless extended later.

---

## Spawns

### SpawnSpec

-   `archetypeId: string`
-   `count: number`
-   `positions: SpawnPositionSpec`
-   `spawnIntervalMs?: number`

### SpawnPositionSpec

-   `{ kind: "nearPlayer", xOffsetMin, xOffsetMax, z }`
-   `{ kind: "fixedPoints", points: [{ x, z }] }`

All spawn positions are clamped to active bounds.

---

## Minimal Example

``` json
{
  "id": "level_001_alley",
  "title": "Neon Alley",
  "bounds": { "zMin": -2.5, "zMax": 2.5 },
  "start": { "playerX": 0, "playerZ": 0 },
  "segments": [
    {
      "id": "intro",
      "xFrom": 0,
      "xTo": 20,
      "arenaLock": {
        "enabled": false,
        "gateX": 20,
        "unlockCondition": { "kind": "defeatAllInSegment" }
      }
    }
  ]
}
```

---

## Runtime Rules

-   Triggers fire once and are tracked by id.
-   Spawned enemies are tagged with segment id.
-   Arena unlock checks only enemies spawned in that segment.
-   All invalid positions are clamped, never rejected.

---

## Extension Points

Future extensions may include: - Multi-wave dependencies - Boss
segments - Environmental hazards - Complex geometry volumes

---

↑ [Back to top](#top)
