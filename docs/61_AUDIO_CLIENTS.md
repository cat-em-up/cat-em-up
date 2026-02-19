<a id="top"></a>

# Audio Clients

← [Back to Index](00_INDEX.md)

---

## Goals

Define output-only audio clients that consume core results.

Multiple audio client implementations may exist, all consuming the same
`{ snapshot, events }` API contract.

Examples:

- WebAudio client (browser)
- Native audio client (desktop/mobile)
- CLI debug audio client
- Headless test audio client

Audio clients:

- consume only `{ snapshot, events }`
- never read device input
- never change simulation
- never contain gameplay rules

They translate core output into:

- sound effects (SFX)
- music playback and transitions
- optional UI sounds

---

## Data Contract

Core provides per step:

- `snapshot` (optional contextual info)
- `events` (primary driver)

Audio clients:

- process events once (frame-scoped)
- maintain their own playback state
- never send data back to core

No backchannel to simulation.

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

Continuous loop per level / segment / arena state.

### 2) SFX

Event-driven one-shots:

- hits, parries, block, deaths
- footsteps (optional)
- UI confirmations (optional)

### 3) Stingers (Optional)

Short one-shots that punctuate moments:

- arena lock
- arena unlock
- boss spawn
- level end freeze-frame

---

## Event-Driven SFX Mapping

Audio client defines a deterministic mapping table:

`EventType -> SoundId (+ parameters)`

Examples:

- `HitLanded` -> `sfx_hit_light` / `sfx_hit_heavy`
- `Blocked` -> `sfx_block_thud`
- `ParryTriggered` -> `sfx_parry_clang`
- `AttackAborted(reason='Parried')` -> `sfx_parry_break` (optional)
- `EnemyDied` -> `sfx_enemy_death`
- `ArenaLocked` -> `sfx_gate_close` (optional)
- `ArenaUnlocked` -> `sfx_gate_open` + `stinger_win` (optional)

Mapping must not influence gameplay.

---

## Using Reason Tags

Core emits `reason` tags for reactions (e.g. `ParryStun`, `Knockdown`).

Audio clients may use reason as a selector:

- `StateApplied(reason='Knockdown')` -> `sfx_body_fall`
- `StateApplied(reason='ParryStun')` -> `sfx_parry_impact` (optional)

Gameplay never branches on audio.
Audio selects variants only.

---

## Voice / Grunts (Optional Future)

If character voice is added:

- triggered by the same core events
- per archetype voice banks:
  - `hero_grunt_hit_01..N`
  - `enemy_thug_hit_01..N`

Audio-level randomness is allowed but must not affect simulation.

---

## Mixing Rules (Default Policy)

### SFX Priority

- Parry > Heavy hit > Light hit > Footsteps

### Ducking (Optional)

On high-impact events:

- temporarily reduce music volume

Examples:

- `ParryTriggered`
- `HeavyHit`
- `BossStinger`

Ducking duration and gain are client-configurable.

---

## Music State Machine (Minimal)

Audio client maintains simple music mode:

- `Explore`
- `Arena`
- `Boss` (future)

Transitions triggered by events:

- `ArenaLocked` → switch to Arena loop
- `ArenaUnlocked` → return to Explore (optionally via stinger)
- `BossSpawned` (future) → Boss loop

Music state is presentation-only and never affects gameplay.

---

## Timing and Sync

Audio clients must not drive gameplay time.

- Core runs at fixed simulation rate (e.g. 30 Hz)
- Audio reacts to events emitted per step
- Any scheduling (delays) is internal to playback only

If an event arrives late due to frame hiccup:

- play immediately
- never attempt to rewind or resimulate

---

## Asset Naming (Suggested Convention)

- `music_level01_explore_loop`
- `music_level01_arena_loop`
- `stinger_arena_unlock`
- `sfx_hit_light_01..N`
- `sfx_hit_heavy_01..N`
- `sfx_block_01..N`
- `sfx_parry_01..N`

---

## Debug Mode (Recommended)

Audio clients may expose debug information:

- currently playing music track
- last N SFX events processed
- active ducking state

Useful for tuning feel and verifying event correctness.

---

## Locked Principle

Audio clients are output-only adapters.

They consume core events and snapshot context,
and produce sound.

Core never depends on audio.

---

↑ [Back to top](#top)
