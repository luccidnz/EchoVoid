# HSB-1 Research -> Ech0Void Gate Lab Blueprint

## Purpose

This document records the product research behind Ech0Void's primary manual-gate instrument so future work does not drift back into constant procedural noise.

Ech0Void may be inspired by useful interaction/audio ideas found in the HOPE Spirit Box (HSB-1), but it must remain an independent implementation with its own code, UI, assets, naming, evidence model and additional tools.

## What makes HSB-1 effective as an instrument

Public HSB-1 instructions and interviews with Joshua Louis describe a simple interaction loop:

1. choose a wordless human-sound bank
2. record the session
3. ask a short question
4. manually open the audio/noise gate for about 1-3 seconds
5. close the gate
6. listen live and review the recording afterward

Joshua Louis describes the source as human speech that is reversed, slowed, chopped into small roughly two-second increments and randomized. He also describes the sound as continuing in the background while remaining inaudible until the user opens the gate.

The key engineering insight is **manual exposure of a continuously moving wordless source**, not an app-generated stream of random events.

References:
- https://hopeparanormal.com/app/
- https://www.iheart.com/podcast/1119-shades-of-the-afterlife-72830128/episode/episode-196-the-hope-spirit-box-197321540/
- https://play.google.com/store/apps/details?id=com.hopeparanormal.hsb1

Claims made by HSB-1 about paranormal communication are claims of its developer/users and are not treated by Ech0Void as scientifically established facts.

## Ech0Void primary instrument: Ech0Gate

### Audio architecture

- offline recorded human/radio source banks
- reverse source direction
- approximately 50% playback speed
- source cut into windows that become roughly 2 seconds at output speed
- chunks shuffled into a non-semantic wordless bank
- the bank continues moving while the output gate is closed
- default state is silence
- user manually exposes the bank with a spring-return gate
- reverb/tail is optional and user-controlled

### Manual gate

The gate is the primary control.

- drag right to open
- hold approximately 1-3 seconds
- release -> snaps closed automatically
- gate opening/closing is timestamped
- session ledger stores gate duration, bank, rate, reverb and sensor influence

This spring-return behavior intentionally reduces accidental long-open windows.

### Sensor Bias

Sensors are an Ech0Void extension, not part of the gate requirement.

- Sensor Bias defaults to optional/user-controlled
- sensors never open the gate by themselves
- at 0%, manual gate selection is independent of sensor input
- above 0%, sensor state may bias/jump the hidden bank position when the user opens the gate
- sensor values are measurements, not labelled as spirit responses or proof

## Voice banks

Initial banks:
- Mixed Human
- Male Blend
- Female Voice
- Foreign Blend
- Radio / Announcement

Future bank system:
- age/gender/style packs
- custom user-imported source
- local bank builder that automatically reverses/slows/chops/shuffles
- bank integrity hash
- bank audition screen that can demonstrate the source transformation transparently

## How Ech0Void should become better than HSB-1

### 1. Evidence-grade dual-path recording

Record two concepts separately:
- room microphone capture
- exact app-source gate output / gate provenance

Review must make contamination obvious rather than hiding it.

### 2. Unlimited local sessions

No arbitrary two- or five-minute cap. Limit only by storage/battery and Android constraints.

### 3. Reliable Session Vault

- crash-safe session metadata
- room audio playback
- exact gate timeline
- notes and markers
- JSON export
- later: WAV/M4A export and shareable evidence bundle

### 4. Forensic review tools

Post-session only:
- waveform
- loop selection
- slow playback
- reverse playback
- gain
- high-pass / low-pass
- simple EQ
- A/B room capture vs exact gate-source output
- markers and labels

Any transcription/captioning must be clearly optional analysis, never presented as what the app "heard" with certainty.

### 5. Blind Review mode

A stronger anti-bias tool:
- hide bank identity during review
- randomize A/B clips
- allow user to write what they hear before revealing provenance
- optionally compare a gate window with a control window

### 6. Control Session mode

For experimentation:
- same gate behavior with sensor bias disabled
- seeded/reproducible bank position
- export seed + settings
- useful for comparing perception across repeated trials

### 7. Custom Bank Lab

User can import their own recordings locally.

Pipeline:
- normalize
- optionally remove long silence
- reverse
- slow
- chop
- shuffle
- preview transformed bank
- save locally

Never upload private recordings unless a later cloud feature is explicitly opted into.

### 8. Radio Drift

A separate mode inspired by scanning-radio interaction, but it must be technically honest:
- do not claim hardware FM tuning when the phone has no accessible tuner
- use explicitly labelled recorded/public-domain radio/noise material or supported external input
- manual gate remains available

### 9. Better UX

- one obvious primary instrument
- tactile spring gate
- strong visual indication only while the gate is open
- one-handed use
- haptics on gate open/close
- optional 1/2/3-second gate timer markers
- no giant wall of technical sliders on the primary screen
- advanced settings tucked away

### 10. Smaller, local-first, transparent

Keep the native Android core lean:
- no Expo/React Native runtime
- no backend required for live sessions
- no ads required for core operation
- no hidden semantic word list
- no TTS pretending to be an entity
- no AI-generated live "spirit messages"

## HSB-1 pain points Ech0Void should explicitly avoid

Public store reviews mention:
- recordings that fail to save
- playback freezing/crashing
- difficulty exporting recordings
- low or inconsistent playback usability
- confusing first-use behavior
- historical recording-duration limits

Ech0Void should treat recording/review reliability as a release gate, not an optional polish task.

## Release truth test for Ech0Gate

A phone build is not accepted unless:

1. app opens reliably from cold start
2. gate closed = effectively silent
3. hidden bank continues moving while closed
4. dragging gate exposes reversed/slowed wordless human sound immediately
5. releasing the gate always returns it to closed
6. 1-3 second gate windows sound materially different across openings
7. changing bank changes source character
8. Reverb changes tail only, not source semantics
9. Sensor Bias 0% prevents sensor-position jumps
10. room recording saves and replays
11. every gate window is timestamped in the session ledger
12. session saves after repeated start/stop cycles
13. app-source provenance is never misrepresented as microphone evidence
