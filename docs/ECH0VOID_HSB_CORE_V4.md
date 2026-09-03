# Ech0Void — HSB-style Manual Core V4 Truth

## Why V4 exists

Earlier native prototypes proved that Ech0Void could run reliably on the physical Galaxy S25, but they repeatedly drifted away from the interaction that makes the Hope Spirit Box approach interesting. Some versions became procedural synths; later versions used runtime micro-fragment logic or generic mixed banks that still felt like sample loopers.

V4 treats the **manual noise gate itself as the instrument**.

## Publicly described HSB principles used as research input

Joshua Louis has publicly described the HSB source preparation as human speech that is reversed, slowed to roughly half speed, split into small roughly two-second increments and randomly rearranged into a wordless/gibberish audio source. He has also described the source continuing to run while the app remains quiet, with the operator manually opening and closing the noise gate for short exposures.

Research references used while defining this behaviour:

- Joshua Louis interview / HSB explanation: https://www.iheart.com/podcast/1119-shades-of-the-afterlife-72830128/episode/episode-196-the-hope-spirit-box-197321540/
- Curious Realm transcript/interview material: https://curiousrealm.com/episodes/CRep060.pdf
- Current HSB Android listing: https://play.google.com/store/apps/details?id=com.hopeparanormal.hsb1
- Current HSB iOS listing: https://apps.apple.com/app/hope-spirit-box/id1575801221

Ech0Void does not use HSB proprietary code, audio assets or branding. V4 is an independent native Android implementation based on publicly described signal principles plus Ech0Void's own provenance/review features.

## V4 hard behavioural rules

1. A voice bank is a **finished long audio stream**, not a runtime bucket of tiny clips.
2. For each single-speaker bank, long raw speech from one actual reader is concatenated first.
3. The concatenated source is then reversed as a whole.
4. The reversed source is slowed to approximately 50% speed.
5. The processed stream is then split into approximately two-second pieces.
6. Energetic pieces are shuffled into a finished approximately three-minute wordless WAV bank.
7. When a session starts, the selected bank begins moving immediately beneath a gate at zero gain.
8. The bank playhead advances continuously while the gate is closed.
9. Opening the gate does **not** select a clip, reset the playhead, jump to a random point or consult a sensor.
10. The operator manually moves the Noise Gate slider right and manually returns it left.
11. Releasing the finger from the slider does **not** automatically close the gate.
12. The UI warns after approximately three seconds of continuous exposure because long openings increasingly reveal the raw wordless bank.
13. Pitch/fine tune is a small optional post-bank adjustment. Pitch is not used to manufacture the identity of different banks.
14. Reverb is optional and can be turned fully off for raw-bank auditing.
15. Core V4 uses finite sparse impulse responses rather than the old feedback-delay reverb.
16. Sensors have no authority in the manual core. No magnetometer/accelerometer value may select audio, move the bank or open the gate.

## Voice-bank proof set

The proof build renders separate banks from distinct long-form LibriVox readers/sources, with a mixed bank kept separate. Labels are deliberately conservative where reader age metadata has not been independently established.

Current proof profiles:

- Middle Female A — Kara Shallenberg; Railway Children Version 3
- Female Voice B — Elizabeth Klett; A Little Princess Version 3
- Female Voice C — Karen Savage; A Little Princess Version 2
- Male Voice A — Mark F. Smith; How to Live on Twenty-Four Hours a Day
- Male Voice B — Roger Melin; History of Billy the Kid
- Older Male A — Andy Minter; The Princess and the Goblin Version 2
- Voice A — Owlivia; The Astral Plane
- Mixed Human — chunks from the independently processed single-reader pools

LibriVox states that its recordings are public domain in the USA. These sources are being used for engineering proof builds; final store distribution must re-check rights in target jurisdictions or replace them with recordings Ech0Void owns/controls.

## Recording and provenance

Every V4 session can retain two separate audio paths:

- **internal_gate.wav** — direct app output after manual gate, fine tune and selected reverb processing
- **room.m4a** — separate physical microphone recording

The event ledger records completed manual exposure windows including:

- bank ID / label
- bank playhead start/end positions
- exposure duration
- average / maximum manual gate opening
- fine-tune setting
- reverb state/profile/amount

Sensor influence is always zero in V4 core events.

## Reverb profiles

The V4 proof contains eight original finite sparse impulse profiles:

- Room
- Chamber
- Plate
- Hall
- Dark Hall
- Long Space
- Metallic
- Void

They are deterministic Ech0Void DSP profiles, not HSB impulse files.

## Scientific / claims boundary

Ech0Void is an experimental ITC / ghost-box-inspired signal instrument. The existence of a meaningful-sounding word or phrase in a gate exposure does not establish that the source is paranormal. App-sourced audio remains explicitly identified so users can review results without hiding the underlying signal path.

## Physical-phone acceptance gate

V4 is not accepted until a physical Android test confirms:

- the selected bank remains completely inaudible with Noise Gate at zero
- bank position continues changing while inaudible
- moving the slider gradually opens/closes the audio
- taking a finger off the slider leaves it where it was
- returning the slider to zero closes the audio
- no automatic/random exposure occurs
- changing banks while gate is closed produces a genuinely different human source profile
- several minutes of use do not collapse into an obvious tiny loop
- reverb OFF exposes the raw wordless bank clearly
- reverb profiles sound materially different
- fine tune works without becoming the identity of the bank
- clean internal WAV is saved and replayable
- room microphone audio is separately saved/replayable
- gate ledger accurately matches physical interactions
