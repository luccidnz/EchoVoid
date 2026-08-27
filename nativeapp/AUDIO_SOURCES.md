# Ech0Void Native V3 — Recorded Source Bank

The V3 ITC engine does **not** synthesize fake voice-like oscillator tones.

Its vocal texture is built from public-domain human recordings that are converted to mono PCM during the Android CI build, then chopped at runtime into short non-semantic windows. Ech0Void never plays the source recordings as intact phrases in the live ITC path.

## Sources

All five sources below are public-domain releases on Wikimedia Commons:

1. **US male voice**
   - File: En-us-phoneme.ogg
   - Author: DroEsperanto
   - Public domain / own work released into the public domain
   - https://commons.wikimedia.org/wiki/File:En-us-phoneme.ogg

2. **UK male voice**
   - File: En-uk-hear.ogg
   - Author: Chris Melville
   - Public domain
   - https://commons.wikimedia.org/wiki/File:En-uk-hear.ogg

3. **Female Korean voice**
   - File: Ko-Daehan Minguk-female.ogg
   - Author: Yuyudevil
   - Public domain
   - https://commons.wikimedia.org/wiki/File:Ko-Daehan_Minguk-female.ogg

4. **Polish voice**
   - File: Pl-prawie się udało.ogg
   - Author: Maciej Katafiasz / Mathrick
   - Public domain
   - https://commons.wikimedia.org/wiki/File:Pl-prawie_si%C4%99_uda%C5%82o.ogg

5. **Russian + English metro announcement texture**
   - File: Ekb Metro voice messages sample 05-2019.ogg
   - Author: A.Savin
   - Public domain
   - https://commons.wikimedia.org/wiki/File:Ekb_Metro_voice_messages_sample_05-2019.ogg

## Runtime rules

- Voice windows are normally only **35–210 ms** long.
- EchoBox repeats/overlaps the same recorded micro-fragment with silence between clusters.
- Field Drift uses short recorded fragments with reverse/rate changes and deliberate dropout windows.
- Signal Scan uses tiny recorded windows and short static gates inside brief sweep bursts, followed by real silence.
- Sensor input biases **timing and selection**, not semantic content.
- The room microphone is a separate recording path.
- Source events retain provenance in the session ledger.
