# VOLT-MAN — Production Game Design & Technical Blueprint (v1.0)

## 0) What this document is
This is an implementation-minded blueprint for building **VOLT-MAN** as a production-ready 2D arcade maze-action game with high replayability, scalable content pipelines, and strong brand consistency from day one.

It is intentionally concrete: systems, numbers, data schemas, UX behavior, content cadence, balancing targets, and technical architecture are all specified so engineering/design/art can execute without ambiguity.

---

## 1) Canonical visual references and usage rules

### 1.1 Assets currently present in repository
Because only two files are available in this repo right now, they are treated as immediately canonical:

- `icon.png` (1024x1024): emblem-style circular sigil with lightning + paw motifs.
- `splash.png` (4000x4000): high-detail branded sigil + aura suitable for cinematic splash/title backgrounds.

### 1.2 Explicit role mapping for available files
- **`icon.png`**
  - App icon source.
  - Main HUD emblem (small monochrome and glow variants).
  - Score-streak badge and pause-menu crest.
  - Button-highlight shape language reference (circular sigil silhouette).
- **`splash.png`**
  - Boot splash background.
  - Story intro loading backdrop.
  - Title screen hero plate with animated parallax particles.
  - Arcade mode chapter transition screen.

### 1.3 Image-intelligence interpretation (how visual language informs game identity)
Using only these assets, we lock a brand grammar:
- **Primary motif**: lightning bolt inside paw = Volt-Man’s dual identity (dog instinct + arc energy).
- **Shape language**: concentric circles + runes = mystical-tech lore (relic/portal systems).
- **Palette anchor**: electric cyan on deep navy/black = readable in fast arcade play and coherent across UI, FX, and narrative.
- **Motion language**: outer aura flames imply pulsing overcharge state loops.

### 1.4 Color tokens (production constants)
- `--volt-cyan-100: #D9FBFF` (highlights)
- `--volt-cyan-300: #8EEBFF` (FX core)
- `--volt-cyan-500: #4FD5FF` (primary action)
- `--volt-cyan-700: #1DA7E8` (UI active)
- `--void-navy-900: #031023` (background)
- `--void-black-1000: #000000` (contrast)

Use cyan for interactions, white-cyan for overcharge events, navy-black for negative space.

---

## 2) Product pillars (must-pass quality bars)
1. **Tight movement first**: 60 FPS feel, immediate input, predictable corners.
2. **Layered scoring depth**: multiple simultaneous optimization vectors.
3. **Readable danger**: enemies/hazards telegraph behavior cleanly.
4. **Identity-rich presentation**: every screen looks unmistakably VOLT-MAN.
5. **Data-driven extensibility**: content added by config, not code rewrites.

---

## 3) High concept and differentiator
VOLT-MAN is not “just a maze clone.” Its novelty comes from:
- Short-run arcade intensity + modern meta progression.
- **Route-expression gameplay**: portals, timed hazards, combo windows, relic detours.
- **Stateful hero fantasy**: normal mode vs overcharged power mode with tactical timing.
- **Brand-forward comic framing** with emblem-centric mythos.

---

## 4) Narrative system: comic intro and lore spine

## 4.1 Intro cinematic sequence (implementation script)
Duration target: **55–70 seconds**, skippable after first watch.

1. **Panel A — “Volt Before the Surge”**
   - Show normal Volt silhouette and playful motion.
   - Caption: “Too curious for ordinary nights.”
2. **Panel B — “Event Trigger”**
   - Storm + rune circle ignition motif from splash language.
   - Caption: “Then the sky split along forgotten symbols.”
3. **Panel C — “Contact”**
   - Arc strikes paw-mark center; high bloom frame.
4. **Panel D — “Transformation”**
   - Bolt overlays body silhouette; HUD glyphs flicker.
5. **Panel E — “Identity Reveal”**
   - Full title card: VOLT-MAN + emblem lockup.
6. **Panel F — “World Threat Tease”**
   - Fast cuts of enemy eyes, traps, portals, relic vault.
7. **Panel G — “Call to Play”**
   - “RUN THE MAZES. BEND THE STORM.”

### 4.2 Lore architecture (expandable)
- **Core arc**: The Surge fragmented across worlds as relic shards.
- **Relics**: each world contains one narrative shard.
- **Masks/Collars**: optional lore unlock tracks (challenge + prestige).
- **Codex**: enemies and hazards become readable lore entries upon first encounter.

---

## 5) Core gameplay loop and session design

## 5.1 Moment-to-moment loop (20–90 sec micro-loop)
1. Route through maze and collect base pickups.
2. Evaluate enemy pressure and hazard cycles.
3. Grab strategic power-up.
4. Trigger combo chain and optionally overcharge state.
5. Decide between safe clear path vs risky bonus/relic detour.
6. Exit level and convert performance into score + progression.

### 5.2 Session pacing
- **Quick Play run**: 6–12 minutes.
- **Story chapter run**: 15–25 minutes.
- **Endless attempt**: skill dependent.

Target “one more run” compulsion via near-miss scoring and visible unlock progress.

---

## 6) Movement, controls, and feel spec

## 6.1 Movement model
- Grid-aware with buffered turning.
- Base speed: **5.2 tiles/sec**.
- Turn buffer window: **120 ms**.
- Input queue size: 1 direction override.
- Corner assist: allow pre-turn at 0.18 tile before intersection.

### 6.2 Control schemes
- **Mobile default**: swipe direction with optional virtual d-pad toggle.
- **Desktop**: arrow keys/WASD.
- **Controller (future)**: left stick + d-pad, deadzone 0.22.

### 6.3 Feel safeguards
- No input drop under FX load.
- Movement and hit checks fixed timestep 120 Hz simulation.
- Visual interpolation at render FPS.

---

## 7) Player states and combat interaction

## 7.1 Normal Mode
- Vulnerable to enemies and lethal hazards.
- Can collect all items and activate power-ups.
- Emphasis: pathing, timing, baiting enemy lines.

## 7.2 Power-Up Mode (Overcharge)
- Duration baseline: **8.0s**.
- Speed bonus: +18%.
- Enemy-clear contact enabled vs Tier 1–3, stagger vs Tier 4.
- Chain defeat bonus scales by timing interval (<1.5s between clears).
- UI state: cyan aura + pulse ring + ticking SFX.

### 7.3 Meter model
- `VoltCharge` meter 0–100.
- Volt-Carrot gives +35 meter.
- Natural decay not applied; meter consumed on trigger.
- Auto-trigger optional accessibility setting (default OFF).

---

## 8) Power-up definitions (production values)

| Power-up | Spawn Class | Base Duration | Mechanical Effect | Score Interaction | Counterplay |
|---|---:|---:|---|---|---|
| Volt-Carrot | Uncommon | 5.0s burst + meter | +30% speed burst, +35 charge, +1 pickup magnet radius | Enables faster combo routing | Can overcommit player into hazard lanes |
| Bone | Common | Instant / passive | +1 armor pip (max 2) OR +1 continue token in Endless | Adds 5% run-end survival bonus | Armor does not block elite execution attacks |
| Glove | Rare | 7.0s | Shock-punch cone every 1.2s cooldown, can break soft barriers | Barrier break grants route bonus | Poor timing can leave player exposed |
| Stopwatch | Rare | 4.5s | Enemies -35% speed, hazard timers paused except portals | Extends combo windows by +0.8s | Does not freeze Tier 4 dash attacks |

Balancing principle: each power-up solves different decision problems (speed, survivability, route manipulation, temporal control).

---

## 9) Bonus and secret economy

| Item | Rarity | Primary Function | Secondary Function |
|---|---:|---|---|
| Coins | Common | Base score and clear threshold | Feeds chain meter for combo sustain |
| Relics | Rare/hidden | Unlock lore panel + high score bonus | Required for World Master completion |
| Collars | Very rare | Cosmetic unlock currency | Player profile prestige badges |
| Masks | Very rare + challenge gated | Unlock modifier rulesets | Opens secret realm variants |

### 9.1 Non-point meaning
- Relics gate narrative and codex depth.
- Collars unlock non-stat cosmetics to preserve fair competition.
- Masks unlock high-skill alternate rule presets.

---

## 10) Enemy roster (4-tier behavioral design)

## 10.1 Tier behaviors
1. **Tier 1 — Tracker**
   - State machine: Patrol -> Chase on LOS/proximity.
   - Speed: 4.8 tiles/sec.
2. **Tier 2 — Flanker**
   - Predictive target 2 intersections ahead of player heading.
   - Speed: 5.0 tiles/sec.
3. **Tier 3 — Ravager**
   - Aggro spikes after player streak > x10.
   - Speed: 5.6 tiles/sec, burst 6.2 for 0.8s.
4. **Tier 4 — Warden (Elite)**
   - Activates on danger phase or relic pickup.
   - Partial immunity in overcharge (requires 2 contacts or Glove hit).
   - Speed: 5.4 base, phase dash ignores slime slow.

### 10.2 Spawn budget by world
- W1: T1x2
- W2: T1x2 + T2x1
- W3: T1x2 + T2x2 + T3x1
- W4: T1x1 + T2x2 + T3x2 + conditional T4x1
- W5+: dynamic director based on score delta and survival consistency.

---

## 11) Hazard system implementation

| Hazard | Behavior | Telegraph | Design Purpose |
|---|---|---|---|
| Slime Tiles | Move speed multiplier 0.72 while on tile | Animated ooze pulse | Route friction and spacing disruption |
| Carrot Missile Turret | Fires directional projectile every N sec | 0.6s reticle blink + beep | Rhythm pressure and lane denial |
| Trap Panels | Timed active/inactive states | Floor rune glows before activation | Punish autopilot pathing |
| Portals | Paired warp nodes, optional one-way variants | Ring spin + sparkle particles | Skill expression and secret routing |

Rules: only 1 new hazard type introduced per world to avoid cognitive overload.

---

## 12) Level/world progression plan

## 12.1 World structure (launch)
- **World 1: Neon Kennel Ruins** — tutorialized fundamentals.
- **World 2: Sludge Metro** — slime + missile intro.
- **World 3: Rune Transit** — portal mastery + flankers.
- **World 4: Vault of Masks** — trap chains + relic guard elites.
- **World 5: Storm Core** — remix pressure and final score gauntlet.

### 12.2 Level composition template
Each level config includes:
- Maze topology ID
- Coin/relic placement
- Power-up spawn table
- Enemy roster and behavior modifiers
- Hazard choreography timeline
- Secret route toggles
- Rank thresholds (Bronze/Silver/Gold/Volt)

---

## 13) Scoring model (exact formulas)

## 13.1 Base values
- Coin: 10
- Bone pickup: 80
- Volt-Carrot pickup: 120
- Glove/Stopwatch pickup: 150
- Tier 1 clear in overcharge: 200
- Tier 2 clear: 350
- Tier 3 clear: 600
- Tier 4 stagger/clear: 1200
- Relic: 2500
- Collar: 1400
- Mask: 2000

### 13.2 Multipliers
- Combo multiplier `M_combo = 1 + 0.1*(chainCount-1)` capped at 3.0.
- No-hit level bonus: +25% level subtotal.
- Full-collection bonus: +15% level subtotal.
- Speed-clear bonus: `max(0, (TargetTime - ClearTime) * 20)`.
- Hazard-survival bonus: +300 per avoided lethal cycle window.

### 13.3 Anti-cheese controls
- Repeating portal loop farming reduced by diminishing returns after 3 loops.
- Enemy spawn exploitation guarded by dynamic respawn relocation.

---

## 14) Game modes and unlock gates

| Mode | Availability | Rule Summary | Primary Reward |
|---|---|---|---|
| Story/Arcade | Default | Sequential worlds + comic beats | Lore + progression unlocks |
| Classic Quick Play | Default | Single run score attack | Leaderboard score |
| Endless | Unlock after W2 clear | Infinite escalating hazards | Prestige emblems |
| Challenge | Unlock after W3 clear | Modifier-based handcrafted stages | Masks + codex variants |
| Relic Hunt | Future (post-launch) | Hidden-object + route puzzles | Lore chapter completion |

---

## 15) Meta progression and retention

## 15.1 Persistent tracks
- Player level from score XP (cosmetic only).
- Relic Archive completion.
- Collar Collection track.
- Mask Challenge tree.
- Codex completion (% discovered entries).

### 15.2 Unlock philosophy
- Keep gameplay fairness: permanent upgrades are utility/cosmetic, not raw damage.
- Mastery is from execution, routing, and timing.

---

## 16) UI/UX production spec

## 16.1 Front-end IA
1. Start Game
2. Continue
3. Game Modes
4. How to Play
5. Collection (Relics / Masks / Collars / Codex)
6. Settings
7. Credits

### 16.2 HUD layout
- Top-left: score + combo.
- Top-center: world/level + timer.
- Top-right: lives/armor + relic count.
- Bottom-center: VoltCharge meter and active buff icons.
- Pause overlay: objectives + rank target + control reminder.

### 16.3 UX specifics
- Button press latency < 100ms audio/visual feedback.
- Min text size equivalent 14px mobile baseline.
- Colorblind-safe alternate palette preset.

---

## 17) Audio direction (implementation-ready)

## 17.1 SFX buckets
- Pickup pips (coin, bonus, relic distinct timbres).
- Overcharge activation swell + ticking tail.
- Enemy alert chirps tier-coded by pitch.
- Portal warp whoosh with reversed pre-tail.
- Trap warning click/beep.

### 17.2 Music layers
- Base groove loop.
- Danger layer (enemy proximity).
- Overcharge percussion layer.
- Victory sting and game-over sting.

Wwise/FMODOps future-ready via event IDs, but launch can ship with engine-native mixer groups.

---

## 18) Animation and juice checklist
- Pickup pop: 6-frame scale + sparkle.
- Enemy defeat: hit-flash + arc dissolve.
- Portal transit: radial smear + chroma flick.
- Hazard telegraph: 0.4–0.8s pre-cue.
- Combo popups: upward float 0.6s, additive glow.
- Menu transitions: comic panel slide + snap SFX.

---

## 19) Technical architecture (expandable)

## 19.1 Runtime systems
- `GameStateManager` (menus, gameplay, transitions)
- `EntitySystem` (player/enemy/item/hazard components)
- `GridNavigationSystem`
- `CombatResolutionSystem`
- `ScoringSystem`
- `ProgressionSystem`
- `ContentRegistry` (loads JSON definitions)
- `SaveSystem` (profile, unlocks, settings)

### 19.2 Data-driven assets
- `config/items.json`
- `config/enemies.json`
- `config/hazards.json`
- `config/worlds.json`
- `config/scoring.json`
- `config/unlocks.json`

No gameplay constants hardcoded in scene scripts except emergency defaults.

### 19.3 Suggested engine-neutral folder layout
- `/src/core`
- `/src/systems`
- `/src/ui`
- `/src/content`
- `/assets/sprites`
- `/assets/audio`
- `/assets/comic`
- `/config`

---

## 20) Data schema examples (shippable starter)
See repository JSON files:
- `config/enemies.json`
- `config/items.json`
- `config/hazards.json`
- `config/worlds.json`
- `config/scoring.json`
- `config/unlocks.json`

These are intended as immediate baseline content files for implementation.

---

## 21) Production roadmap

## 21.1 Milestone M0 (1 week) — Foundations
- Input/movement prototype with fixed timestep.
- One maze, one enemy tier, coin loop, score.
- Placeholder UI with icon-based branding.

## 21.2 Milestone M1 (2 weeks) — Core vertical slice
- Normal/power states.
- All four power-ups functioning.
- 3 enemy tiers + 2 hazards.
- Intro comic implemented with static panel sequencing.

## 21.3 Milestone M2 (2 weeks) — Content expansion
- 5 worlds with escalating rules.
- Full scoring/rank system.
- Collection and codex menus.

## 21.4 Milestone M3 (2 weeks) — Polish + launch prep
- Performance optimization.
- Accessibility options.
- QA pass with telemetry balancing.
- App icon/splash/store package completion.

---

## 22) QA and balancing protocol
- Track heatmaps of deaths by tile coordinate.
- Track average chain length by world.
- Monitor power-up pick rates and win correlation.
- Fail criteria:
  - Any world with >45% unavoidable death reports.
  - Any single power-up with >70% mandatory pick rate.
  - FPS <58 on target mid-tier mobile devices.

---

## 23) Brand bible summary (non-negotiables)
- Every major screen must show lightning+paw language either directly or via motif.
- Cyan energy should signify player agency, not enemy threat (enemy threat uses magenta/red accents for contrast).
- Volt-Man is cheeky-but-heroic: animation should include confident idle/twitch beats.

---

## 24) First build acceptance checklist
- [ ] Movement responsiveness within target windows.
- [ ] Distinct behavior readability across 4 enemy tiers.
- [ ] All 4 power-ups materially different.
- [ ] Scoring supports route expression and replayability.
- [ ] Story intro communicates origin clearly in under 70s.
- [ ] UI is legible and touch-ready.
- [ ] Content can be expanded through JSON edits.
- [ ] Visual identity consistently reflects icon/splash motif.

