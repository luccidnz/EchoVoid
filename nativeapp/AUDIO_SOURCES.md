# Ech0Void Native V3 — Wordless Source Bank

## Why the bank changed

The first Ech0Gate prototype used a handful of tiny public-domain voice samples. That proved the manual gate model, but the banks were too short and too similar: they repeated quickly and collapsed into the same crunchy/warped timbre.

V3.2 fixes the bank architecture itself.

## HSB research model

Joshua Louis publicly describes the HSB source method as human speech that is:

1. reversed,
2. slowed by roughly 50%,
3. chopped into small approximately two-second increments,
4. randomly rearranged into wordless/gibberish human sound.

The Ech0Gate engine follows that broad, non-proprietary signal principle while adding transparent source provenance and separate room capture.

## V3.2 bank design

- 12 genuinely different long-form human readers
- approximately 40 seconds of source material per Vox bank before runtime reversal/half-speed processing
- one independent source pool per Vox preset
- a VOID MIX bank combining all 12 readers
- a separate radio/announcement texture bank
- 16 kHz / 16-bit mono PCM instead of the earlier 11.025 kHz / 8-bit PCM
- ~1 second source chunks become ~2 second output chunks at half speed
- shuffled without immediate recycling; a single Vox bank must traverse its full chunk list before reshuffling
- the hidden bank keeps advancing while the manual gate is closed

That means a user opening the gate intermittently should not keep landing on the same tiny warped syllable.

## Public-domain source collection

The 12 human-reader sources come from the LibriVox **Sonnet 130** multi-reader collection hosted by Internet Archive. The Internet Archive item explicitly marks the collection as **Public Domain** and contains seventeen different readings by different volunteers.

Item:
https://archive.org/details/sonnet_130_librivox

The separate radio texture remains a public-domain Wikimedia Commons recording:
https://commons.wikimedia.org/wiki/File:Ekb_Metro_voice_messages_sample_05-2019.ogg

## Runtime provenance

The live gate path never presents these recordings as external audio. Every gate window is logged as app-sourced material. The microphone recording is a different path and can contain acoustic speaker bleed.
