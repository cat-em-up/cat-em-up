<a id="top"></a>

# Audio

← [Back to Index](00_INDEX.md)

---

## Goals

Define an output-only audio client.

Audio client:
- consumes only `{ snapshot, events }` from Core
- never reads device input
- never changes simulation
- never contains gameplay rules

It translates core events into:
- sound effects (SFX)
- music playback and transitions
- optional UI sounds

---

## Data Contract

Core provides per step:
- `snapshot` (optional context)
- `events` (primary driver)

Audio client:
- processes events once (frame-scoped)
- keeps its own playback state (what is currently playing)

No backchannel to core.

---

## Music Direction (Locked)

Style:
- 80s rock
- disco-rock groove
- synthwave accents

Rules:
- instrumental only
- seamless gameplay loop
- high-energy, gameplay-focused (not cinematic ambient)

Tempo target:
- 128–135 BPM

---

## Audio Layers

### 1) Music
Continuous loop per level/segment/arena state.

### 2) SFX
Event-driven one-shots:
- hits, parries, block, deaths
- footsteps (optional)
- UI confirmations (optional)

### 3) Stingers (optional)
Short one-shots that punctuate moments:
- arena lock
- arena unlock
- boss spawn
- level end freeze-frame

---

## Event-Driven SFX Mapping

Audio client defines a mapping table:
`EventType -> SoundId (+ params)`

Examples:
- `HitLanded` -> `sfx_hit_light` or `sfx_hit_heavy`
- `Blocked` -> `sfx_block_thud`
- `ParryTriggered` -> `sfx_parry_clang`
- `AttackAborted(reason='Parried')` -> `sfx_parry_break` (optional)
- `EnemyDied` -> `sfx_enemy_death`
- `ArenaLocked` -> `sfx_gate_close` (optional)
- `ArenaUnlocked` -> `sfx_gate_open` + `stinger_win` (optional)

---

## Using Reason Tags (Same Principle as View)

Core emits `reason` for reactions (e.g. ParryStun, Knockdown).

Audio client may use reason as a selector:
- `StateApplied(reason='Knockdown')` -> `sfx_body_fall`
- `StateApplied(reason='ParryStun')` -> `sfx_parry_impact` (optional)

Gameplay does not branch on audio.
Audio chooses sound variants only.

---

## Voice / Grunts (Optional)

If we add character grunts later:
- driven by the same events
- per archetype voice bank:
  - `hero_grunt_hit_01..N`
  - `enemy_thug_hit_01..N`

Random selection must not affect gameplay.
Audio randomness is allowed, but should be consistent per client if desired.

---

## Mixing Rules (Simple Defaults)

### SFX priorities
- Parry > Heavy hit > Light hit > Footsteps

### Ducking (optional)
When a high-impact event happens:
- temporarily reduce music volume for a short window
Examples:
- `ParryTriggered`
- `HeavyHit`
- `BossStinger`

---

## Music State Machine (Minimal)

Audio client maintains a simple music mode:

- `Explore` (walking segments)
- `Arena` (arena lock active)
- `Boss` (reserved)

Transitions are triggered by events:
- `ArenaLocked` => switch to Arena loop
- `ArenaUnlocked` => back to Explore loop (or play stinger then return)
- `BossSpawned` (future) => Boss loop

---

## Timing and Sync

Audio client must not drive simulation time.

- Core runs at fixed sim rate (e.g. 30 Hz)
- Audio reacts to events emitted per step
- Any scheduling (delays) is internal to audio playback only

If an event arrives late due to frame hiccup:
- play immediately
- do not attempt to "rewind" simulation

---

## Asset Naming (Suggested)

- `music_level01_explore_loop`
- `music_level01_arena_loop`
- `stinger_arena_unlock`
- `sfx_hit_light_01..N`
- `sfx_hit_heavy_01..N`
- `sfx_block_01..N`
- `sfx_parry_01..N`

---

## Debug Mode (Recommended)

Audio client can expose debug info:
- currently playing music track
- last N SFX events processed
- active ducking state

This helps tune feel fast.

---

## Locked Principle

Audio client is output-only.
It consumes core events and snapshot context, and produces sound.

Core never depends on audio.

---

↑ [Back to top](#top)
