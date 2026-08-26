# Ech0Void V2 — Product Truth / Anti-Drift Specification

This document is the canonical build target. Future agents should read it before changing the product.

## What Ech0Void is

Ech0Void is a dark, tactile ITC / ghost-box-inspired **audio instrument**. The experience should feel like operating strange physical signal hardware: immediate, atmospheric, reactive and useful during real sessions.

It is not a screen full of paranormal-themed buttons. If a control is visible, it must change the instrument or the recorded session in a testable way.

## Core capture model

There are two different signal paths and they must remain conceptually separate:

1. **Ech0Void-generated output** — procedural fragments/static/scan material played by one of the three engines.
2. **Room capture** — microphone audio recorded during the investigation/session.

The app must never hide path 1 and later imply that the same generated content originated mysteriously in path 2. Every generated event is timestamped in a provenance ledger.

When the phone speaker is used, acoustic bleed into the room microphone is expected. Headphones reduce this. Provenance timestamps exist so the user can review the overlap.

## The three engines

### EchoBox

Character: dense, dimensional, echoing, voice-like without using semantic sentences.

Required behaviour:
- non-semantic locally generated vocal/formant fragments
- overlapping layers
- repeat/echo events with decaying level
- intensity changes density
- variation changes timing/rate spread
- texture changes tonal/noise character

### Field Drift

Character: unstable, broken, discontinuous, reverse-leaning.

Required behaviour:
- reversed local fragments
- forward/reverse family switching
- variable playback rate
- jumpy timing
- deliberate mute/dropout windows
- sensor input may bias selection/timing but is never called an entity response

### Signal Scan

Character: scanning-radio/static instrument.

Required behaviour:
- procedural noise beds
- sweep/chirp fragments
- gated events
- occasional non-semantic vocal/reverse fragments
- fast, sparse scan timing distinct from EchoBox and Field Drift

## Controls

The core control set is deliberately small:
- Intensity
- Variation
- Texture
- Sensor Mix
- Output

Each mode interprets the same controls differently through its scheduler. Avoid adding knobs that do nothing.

## Sensors

Use phone sensors honestly:
- magnetometer magnitude can be displayed in µT
- accelerometer + magnetometer deltas can form a normalized activity/entropy value
- Sensor Mix determines how strongly that input biases engine timing/selection

Do not label sensor spikes as spirits, entities, messages or proof.

## Session workflow

Home → choose one of the three engines → configure → Start Session → listen / mark moments → End + Save → Session Detail / Vault.

A saved session should contain:
- exact start/end/duration
- selected mode
- control settings
- all generated source events
- manual markers
- room recording when granted/available
- notes
- sensor summary
- JSON export

## Visual direction

- black / near-black base
- metallic/digital instrument feel
- cyan signal colour
- violet secondary energy
- amber for evidence/export/markers
- restrained animation/reactivity rather than decorative clutter
- readable outdoors at night and usable one-handed on a phone

Māori/digital-spiritual influence may inform atmosphere and naming, but avoid turning living cultural concepts into random paranormal decoration.

## Explicit non-goals for the V2 core

Do not put these back into the primary capture path until the core is proven on-device:
- random dictionary words presented as communications
- TTS voice speaking selected words as if they were external responses
- AI-generated “spirit messages” during capture
- cloud sync
- public/shared live sessions
- voice cloning
- AR overlays
- fake spectral/anomaly values
- zero-filled synthetic detector inputs

These can only return later as clearly separated optional analysis/experience layers with provenance preserved.

## Technical target

- React Native + Expo
- physical Android phone is first-class
- Expo Go-compatible V2 core
- local/offline operation
- Expo SDK 54 + `expo-audio`
- procedural audio generated on-device and cached locally
- AsyncStorage + app document storage for session metadata/media
- no backend required

## Definition of “working”

A build is not working just because navigation opens or a button prints “recording started.”

A working build must pass this manual truth test on a physical phone:
1. All three modes audibly behave differently.
2. Moving Intensity/Variation/Texture changes the output.
3. Sensor Mix 0% removes sensor influence from ledger values; raising it permits sensor influence.
4. Starting a session records the room when mic permission is granted.
5. Mark Moment produces timestamped markers.
6. End + Save creates a Vault entry.
7. Session Detail can replay saved room audio.
8. Every generated sound heard during a session is represented by a generated source event in the ledger.
9. JSON export includes settings, marks, sensor summary and generated provenance.
10. The app makes no unsupported claim that an output proves spirit communication.
