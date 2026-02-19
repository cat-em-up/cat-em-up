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
- character voice reactions

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

- hits
- parries
- blocks
- deaths
- footsteps (optional)
- UI confirmations (optional)

### 3) Stingers (Optional)

Short one-shots that punctuate moments:

- arena lock
- arena unlock
- boss spawn
- level end freeze-frame

### 4) Voice (Character Reactions)

Character voice lines are presentation-only reactions to core events.

Voice system is fully implemented inside audio clients.

Core must not be aware of:

- specific phrases
- probabilities
- cooldown rules
- personality logic
- character flavor decisions

Voice is never allowed to influence gameplay timing, state, or outcomes.

---

## Event-Driven SFX Mapping

Audio client defines a mapping table:

`EventType -> Sound Category`

Examples:

- `HitLanded` -> light or heavy hit SFX
- `Blocked` -> block impact SFX
- `ParryTriggered` -> parry impact SFX
- `EnemyDied` -> enemy death SFX
- `ArenaLocked` -> gate close SFX
- `ArenaUnlocked` -> gate open + optional stinger

Mapping must not influence gameplay.

---

## Using Reason Tags

Core emits `reason` tags for reactions (e.g. `ParryStun`, `Knockdown`).

Audio clients may use reason as a selector for SFX variants.

Gameplay never branches on audio.
Audio selects presentation variants only.

---

# Character Voice System (Locked)

Voice reactions are driven by core events.

Each relevant event may trigger a voice pool.

Example event categories:

- Hero KO (enemy defeated)
- Hero Perfect Parry
- Hero Hurt
- Arena Unlock
- Boss Defeat

Audio client decides:

- whether to play a line
- which pool to use
- which line to select

Core remains unaware of all voice logic.

---

## Weighted Voice Selection

Each voice pool contains multiple lines with different drop rates.

Every line has an associated probability weight.

Higher weight -> more common.
Lower weight -> rarer.

This allows:

- common lines (baseline personality)
- uncommon lines (variation)
- rare lines (flavor depth)
- ultra-rare easter eggs

Weighted randomness exists purely at audio level.
It must never affect simulation determinism.

---

## Rare Easter Egg Policy

Audio clients may include ultra-low probability lines.

These:

- must not break tone
- must not rely on player understanding the reference
- must not feel like parody
- must not become frequent

Rare lines should feel like a reward for attentive players.

---

## Voice Cooldown / Anti-Spam Policy (Recommended)

To preserve tone and impact:

Audio clients may implement:

- per-event cooldowns
- per-character cooldowns
- global speech cooldown
- recently-played suppression

Characters must never sound chatty.
Silence is often more powerful than repetition.

---

## Determinism Policy

Voice randomness:

- does not need to be deterministic
- does not need to match across clients
- must not alter event timing
- must not feed back into core

Replay systems may optionally mute or standardize voice output.

---

## Tone Preservation Rule

Voice lines must respect project tone:

- serious 80s arcade energy
- minimal dialogue
- no meme humor
- no parody
- no modern sarcasm tone

Character personality is expressed through brevity and impact.

---

## Locked Principle

Audio clients are output-only adapters.

They consume core events and snapshot context,
and produce sound.

Core never depends on audio.
Voice never affects gameplay.

---

↑ [Back to top](#top)
