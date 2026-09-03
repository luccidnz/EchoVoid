package app.echovoid.nativev3;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.media.MediaPlayer;
import android.media.MediaRecorder;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.SeekBar;
import android.widget.Space;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.ArrayDeque;
import java.util.Date;
import java.util.List;
import java.util.Locale;

/** Ech0Void V4 physical-phone proof: the manual wordless noise gate is the instrument. */
public final class MainActivity extends Activity implements WordlessGateEngine.Listener {
    private static final int MIC_REQUEST = 604;

    private static final int BG = Color.rgb(3, 4, 8);
    private static final int PANEL = Color.rgb(10, 14, 21);
    private static final int BORDER = Color.rgb(30, 43, 58);
    private static final int TEXT = Color.rgb(244, 247, 251);
    private static final int MUTED = Color.rgb(174, 184, 199);
    private static final int CYAN = Color.rgb(71, 233, 255);
    private static final int VIOLET = Color.rgb(154, 124, 255);
    private static final int AMBER = Color.rgb(255, 184, 77);
    private static final int GREEN = Color.rgb(91, 240, 180);
    private static final int DANGER = Color.rgb(255, 89, 120);

    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final ArrayDeque<String> ledgerLines = new ArrayDeque<>();

    private SessionStore store;
    private WordlessGateEngine gateEngine;
    private MediaRecorder recorder;
    private MediaPlayer player;
    private SessionStore.Session currentSession;

    private String selectedGateBank = "middle_female_a";
    private float output = 0.74f;
    private float gateReverb = 0.28f;
    private float fineTuneSemitones = 0f;
    private boolean reverbEnabled = true;
    private String reverbProfile = "Hall";

    private TextView elapsedValue;
    private TextView bankPositionValue;
    private TextView gateExposureValue;
    private TextView statusValue;
    private TextView ledgerText;
    private TextView gatePercentValue;
    private GateScopeView gateScope;
    private SeekBar gateBar;

    private final Runnable gateUiTick = new Runnable() {
        @Override public void run() {
            if (currentSession == null || gateEngine == null) return;

            long elapsed = Math.max(0, System.currentTimeMillis() - currentSession.startedAt);
            long gateMs = gateEngine.getGateOpenDurationMs();
            double bankPos = gateEngine.getBankPositionSeconds();
            double bankDur = gateEngine.getBankDurationSeconds();
            float gate = gateEngine.getGate();

            if (elapsedValue != null) elapsedValue.setText(formatDuration(elapsed));
            if (bankPositionValue != null) {
                bankPositionValue.setText(String.format(Locale.US, "%.1f / %.0f s", bankPos, bankDur));
            }
            if (gateExposureValue != null) {
                gateExposureValue.setText(gateMs <= 0 ? "—" : String.format(Locale.US, "%.1f s", gateMs / 1000f));
            }
            if (gateScope != null) {
                gateScope.update(gate, Math.min(1f, gateEngine.getOutputRms() * 4.5f));
            }

            if (statusValue != null) {
                if (gate < .01f) {
                    statusValue.setText("BANK RUNNING SILENTLY • move the noise gate when ready");
                    statusValue.setTextColor(GREEN);
                } else if (gateMs > 3000) {
                    statusValue.setText("LONG EXPOSURE — RAW BANK BECOMING AUDIBLE");
                    statusValue.setTextColor(AMBER);
                } else {
                    statusValue.setText(String.format(Locale.US, "GATE OPEN • %.1f seconds", gateMs / 1000f));
                    statusValue.setTextColor(CYAN);
                }
            }

            mainHandler.postDelayed(this, 50);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(BG);
        getWindow().setNavigationBarColor(BG);
        store = new SessionStore(this);

        SharedPreferences prefs = getSharedPreferences("ech0void.native", MODE_PRIVATE);
        if (prefs.getBoolean("hsb.core.v4.intro", false)) showHome();
        else showWelcome();
    }

    private void showWelcome() {
        stopPlayback();
        ScrollView scroll = shell();
        LinearLayout page = page(scroll);

        addKicker(page, "ECH0VOID // MANUAL SIGNAL INSTRUMENT");
        addTitle(page, "The gate is the instrument.");
        page.addView(body(
            "Ech0Gate runs a pre-rendered wordless human-speech bank continuously beneath a closed noise gate. Nothing is selected when you open it: you simply expose whatever part of the moving bank is already underneath."
        ));

        page.addView(card(
            "TWO RECORDING PATHS",
            "INTERNAL GATE OUTPUT — the exact app audio exposed by your manual gate is saved as a clean WAV.\n\nROOM CAPTURE — the microphone separately records the physical room. Speaker audio can bleed into that recording."
        ));

        page.addView(card(
            "CLAIMS BOUNDARY",
            "This is an experimental ITC / ghost-box-inspired instrument. Hearing a meaningful word or phrase is an interpretation, not scientific proof of a paranormal source. The app keeps source provenance so sessions can be reviewed honestly."
        ), marginTop(10));

        Button enter = primaryButton("ENTER ECH0GATE");
        enter.setOnClickListener(v -> {
            getSharedPreferences("ech0void.native", MODE_PRIVATE)
                .edit().putBoolean("hsb.core.v4.intro", true).apply();
            showHome();
        });
        page.addView(enter, marginTop(18));
        setContentView(scroll);
    }

    private void showHome() {
        stopPlayback();
        ScrollView scroll = shell();
        LinearLayout page = page(scroll);

        addKicker(page, "ECH0VOID // HSB-STYLE CORE V4");
        addTitle(page, "Ask. Open. Listen.");
        TextView sub = body("Continuous hidden bank • fully manual noise gate • native Android • offline");
        sub.setTextColor(VIOLET);
        page.addView(sub);

        page.addView(modeCard(
            "ECH0GATE",
            "A long wordless human bank moves continuously while silent. Slide the noise gate open briefly, then manually slide it closed.",
            GREEN,
            this::startGateSession
        ), marginTop(18));

        page.addView(card(
            "CORE PROOF MODE",
            "EchoBox, Field Drift, Signal Scan and sensor-driven tools are deliberately disabled until this manual gate behaves correctly on the physical phone."
        ), marginTop(12));

        LinearLayout row = horizontal();
        Button vault = secondaryButton("SESSION VAULT");
        Button info = secondaryButton("INFO");
        row.addView(vault, weight());
        row.addView(space(dp(10)));
        row.addView(info, weight());
        page.addView(row, marginTop(18));
        vault.setOnClickListener(v -> showVault());
        info.setOnClickListener(v -> showInfo());

        TextView tag = small("PURE NATIVE ANDROID V4 • NO EXPO • NO REACT NATIVE", GREEN);
        tag.setGravity(Gravity.CENTER);
        page.addView(tag, marginTop(24));
        setContentView(scroll);
    }

    private void startGateSession() {
        stopPlayback();
        stopActiveSession(false);

        currentSession = new SessionStore.Session();
        currentSession.id = "gate-v4-" + System.currentTimeMillis();
        currentSession.mode = "Ech0Gate V4";
        currentSession.startedAt = System.currentTimeMillis();
        currentSession.avgActivity = 0f;
        currentSession.peakActivity = 0f;
        currentSession.avgMagneticUt = 0f;
        ledgerLines.clear();

        showGateTransmission();

        try {
            gateEngine = new WordlessGateEngine(this, this);
            if (!"middle_female_a".equals(selectedGateBank)) gateEngine.setBank(selectedGateBank);
            gateEngine.setOutput(output);
            gateEngine.setFineTuneSemitones(fineTuneSemitones);
            gateEngine.setReverbEnabled(reverbEnabled);
            gateEngine.setReverbProfile(reverbProfile);
            gateEngine.setReverbAmount(gateReverb);

            File internal = store.internalAudioFile(currentSession.id);
            currentSession.internalAudioPath = internal.getAbsolutePath();
            gateEngine.setCaptureFile(internal);
            gateEngine.start();
        } catch (Exception e) {
            gateEngine = null;
            setStatus("VOICE BANK FAILED TO LOAD", DANGER);
            Toast.makeText(this, "Gate engine error: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }

        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            startRoomRecorder();
        } else {
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, MIC_REQUEST);
        }

        mainHandler.removeCallbacks(gateUiTick);
        mainHandler.post(gateUiTick);
    }

    private void showGateTransmission() {
        ScrollView scroll = shell();
        LinearLayout page = page(scroll);

        TextView back = small("← STOP / HOME", MUTED);
        back.setPadding(0, dp(4), 0, dp(14));
        back.setOnClickListener(v -> stopAndSaveSession());
        page.addView(back);

        addKicker(page, "ECH0GATE // MANUAL NOISE GATE");
        addTitle(page, "Let the bank move underneath.");

        LinearLayout metrics = horizontal();
        elapsedValue = metric(metrics, "ELAPSED", "00:00");
        bankPositionValue = metric(metrics, "BANK POS", "0.0 s");
        gateExposureValue = metric(metrics, "EXPOSURE", "—");
        page.addView(metrics, marginTop(14));

        statusValue = text("BANK RUNNING SILENTLY • move the noise gate when ready", 12, GREEN, true);
        statusValue.setPadding(0, dp(14), 0, dp(10));
        page.addView(statusValue);

        page.addView(card(
            "CORE SIGNAL PATH",
            "The selected bank is already a finished wordless track: long speech → reverse → ~50% speed → ~2 second pieces → shuffled → rendered. During the session its playhead moves continuously even while the gate is at zero. Opening the gate does not choose or trigger a clip."
        ));

        TextView bankHead = sectionLabel("VOICE BANK");
        page.addView(bankHead, marginTop(16));
        Spinner bankSpinner = new Spinner(this);
        String[] bankLabels = new String[]{
            "Middle Female A",
            "Female Voice B",
            "Female Voice C",
            "Male Voice A",
            "Male Voice B",
            "Older Male A",
            "Voice A",
            "Mixed Human"
        };
        String[] bankIds = new String[]{
            "middle_female_a",
            "female_b",
            "female_c",
            "male_a",
            "male_b",
            "older_male_a",
            "voice_a",
            "mixed"
        };
        ArrayAdapter<String> bankAdapter = new ArrayAdapter<>(
            this, android.R.layout.simple_spinner_dropdown_item, bankLabels
        );
        bankSpinner.setAdapter(bankAdapter);
        bankSpinner.setSelection(indexOf(bankIds, selectedGateBank));
        bankSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            private boolean first = true;
            @Override public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                String wanted = bankIds[position];
                if (first) {
                    first = false;
                    selectedGateBank = wanted;
                    return;
                }
                if (gateEngine != null && gateEngine.isGateOpen()) {
                    Toast.makeText(MainActivity.this, "Close the noise gate before changing banks", Toast.LENGTH_SHORT).show();
                    bankSpinner.setSelection(indexOf(bankIds, selectedGateBank));
                    return;
                }
                try {
                    selectedGateBank = wanted;
                    if (gateEngine != null) gateEngine.setBank(wanted);
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            }
            @Override public void onNothingSelected(AdapterView<?> parent) {}
        });
        page.addView(bankSpinner);

        addFineTuneSlider(page);

        LinearLayout reverbRow = horizontal();
        Button reverbToggle = secondaryButton(reverbEnabled ? "REVERB: ON" : "REVERB: OFF");
        reverbToggle.setOnClickListener(v -> {
            reverbEnabled = !reverbEnabled;
            reverbToggle.setText(reverbEnabled ? "REVERB: ON" : "REVERB: OFF");
            if (gateEngine != null) gateEngine.setReverbEnabled(reverbEnabled);
        });
        reverbRow.addView(reverbToggle, weight());
        page.addView(reverbRow, marginTop(12));

        TextView impulseHead = sectionLabel("REVERB IMPULSE");
        page.addView(impulseHead, marginTop(10));
        Spinner impulseSpinner = new Spinner(this);
        ArrayAdapter<String> impulseAdapter = new ArrayAdapter<>(
            this, android.R.layout.simple_spinner_dropdown_item, SparseImpulseReverb.PROFILES
        );
        impulseSpinner.setAdapter(impulseAdapter);
        impulseSpinner.setSelection(indexOf(SparseImpulseReverb.PROFILES, reverbProfile));
        impulseSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                reverbProfile = SparseImpulseReverb.PROFILES[position];
                if (gateEngine != null) gateEngine.setReverbProfile(reverbProfile);
            }
            @Override public void onNothingSelected(AdapterView<?> parent) {}
        });
        page.addView(impulseSpinner);

        addPercentSlider(page, "REVERB AMOUNT", gateReverb, value -> {
            gateReverb = value;
            if (gateEngine != null) gateEngine.setReverbAmount(value);
        });
        addPercentSlider(page, "OUTPUT", output, value -> {
            output = value;
            if (gateEngine != null) gateEngine.setOutput(value);
        });

        gateScope = new GateScopeView(this);
        page.addView(gateScope, marginTop(16));

        LinearLayout gateCard = vertical();
        gateCard.setPadding(dp(16), dp(16), dp(16), dp(18));
        gateCard.setBackground(panelDrawable());

        LinearLayout gateHeader = horizontal();
        TextView gateTitle = text("NOISE GATE", 15, GREEN, true);
        gatePercentValue = text("CLOSED", 12, MUTED, true);
        gatePercentValue.setGravity(Gravity.END);
        gateHeader.addView(gateTitle, weight());
        gateHeader.addView(gatePercentValue, wrap());
        gateCard.addView(gateHeader);

        TextView help = text(
            "Ask your question, then manually slide the gate right for roughly 1–3 seconds. Slide it back left yourself to close it. Releasing your finger does NOT reset the gate.",
            12, MUTED, false
        );
        help.setPadding(0, dp(8), 0, dp(8));
        gateCard.addView(help);

        gateBar = new SeekBar(this);
        gateBar.setMax(100);
        gateBar.setProgress(0);
        gateBar.setProgressTintList(android.content.res.ColorStateList.valueOf(GREEN));
        gateBar.setThumbTintList(android.content.res.ColorStateList.valueOf(GREEN));
        gateBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                float value = progress / 100f;
                if (gateEngine != null) gateEngine.setGate(value);
                if (gatePercentValue != null) {
                    gatePercentValue.setText(progress <= 0 ? "CLOSED" : progress + "% OPEN");
                    gatePercentValue.setTextColor(progress <= 0 ? MUTED : GREEN);
                }
            }
            @Override public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override public void onStopTrackingTouch(SeekBar seekBar) {
                // Intentionally empty: the manual gate stays exactly where the user leaves it.
            }
        });
        gateCard.addView(gateBar);

        Button closeGate = secondaryButton("MANUALLY CLOSE GATE");
        closeGate.setOnClickListener(v -> gateBar.setProgress(0));
        gateCard.addView(closeGate, marginTop(8));
        page.addView(gateCard, marginTop(10));

        page.addView(card(
            "NO SENSOR INTERFERENCE",
            "The HSB-style core does not use the magnetometer, accelerometer or random events to select audio, move the bank, or open the gate. Those experiments can return later as separate tools."
        ), marginTop(10));

        TextView ledgerHead = sectionLabel("GATE EXPOSURE LEDGER");
        page.addView(ledgerHead, marginTop(18));
        ledgerText = text("No exposures yet. Move the gate above zero, then manually return it to zero.", 11, MUTED, false);
        ledgerText.setTypeface(Typeface.MONOSPACE);
        ledgerText.setPadding(dp(14), dp(14), dp(14), dp(14));
        ledgerText.setBackground(panelDrawable());
        page.addView(ledgerText);

        Button mark = secondaryButton("MARK WHAT I HEARD");
        mark.setOnClickListener(v -> markMoment());
        page.addView(mark, marginTop(14));

        Button stop = dangerButton("STOP + SAVE SESSION");
        stop.setOnClickListener(v -> stopAndSaveSession());
        page.addView(stop, marginTop(10));
        setContentView(scroll);
    }

    private void addFineTuneSlider(LinearLayout page) {
        LinearLayout wrapBox = vertical();
        wrapBox.setPadding(0, dp(12), 0, 0);
        LinearLayout head = horizontal();
        TextView label = text("FINE TUNE", 11, TEXT, true);
        TextView value = text(String.format(Locale.US, "%+.1f st", fineTuneSemitones), 11, CYAN, true);
        value.setGravity(Gravity.END);
        head.addView(label, weight());
        head.addView(value, wrap());
        SeekBar bar = new SeekBar(this);
        bar.setMax(120);
        bar.setProgress(Math.round((fineTuneSemitones + 6f) * 10f));
        bar.setProgressTintList(android.content.res.ColorStateList.valueOf(VIOLET));
        bar.setThumbTintList(android.content.res.ColorStateList.valueOf(VIOLET));
        bar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                fineTuneSemitones = progress / 10f - 6f;
                value.setText(String.format(Locale.US, "%+.1f st", fineTuneSemitones));
                if (gateEngine != null) gateEngine.setFineTuneSemitones(fineTuneSemitones);
            }
            @Override public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override public void onStopTrackingTouch(SeekBar seekBar) {}
        });
        wrapBox.addView(head);
        wrapBox.addView(bar);
        page.addView(wrapBox);
    }

    private interface FloatSetter { void set(float value); }

    private void addPercentSlider(LinearLayout page, String labelText, float initial, FloatSetter setter) {
        LinearLayout wrapBox = vertical();
        wrapBox.setPadding(0, dp(10), 0, 0);
        LinearLayout head = horizontal();
        TextView label = text(labelText, 11, TEXT, true);
        TextView value = text(Math.round(initial * 100) + "%", 11, CYAN, true);
        value.setGravity(Gravity.END);
        head.addView(label, weight());
        head.addView(value, wrap());
        SeekBar bar = new SeekBar(this);
        bar.setMax(100);
        bar.setProgress(Math.round(initial * 100));
        bar.setProgressTintList(android.content.res.ColorStateList.valueOf(CYAN));
        bar.setThumbTintList(android.content.res.ColorStateList.valueOf(CYAN));
        bar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                float v = progress / 100f;
                value.setText(progress + "%");
                setter.set(v);
            }
            @Override public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override public void onStopTrackingTouch(SeekBar seekBar) {}
        });
        wrapBox.addView(head);
        wrapBox.addView(bar);
        page.addView(wrapBox);
    }

    private void startRoomRecorder() {
        if (currentSession == null || recorder != null) return;
        File out = store.roomAudioFile(currentSession.id);
        try {
            recorder = new MediaRecorder();
            recorder.setAudioSource(MediaRecorder.AudioSource.MIC);
            recorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
            recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
            recorder.setAudioSamplingRate(44100);
            recorder.setAudioEncodingBitRate(128000);
            recorder.setOutputFile(out.getAbsolutePath());
            recorder.prepare();
            recorder.start();
            currentSession.roomAudioPath = out.getAbsolutePath();
        } catch (Exception e) {
            try { if (recorder != null) recorder.release(); } catch (Exception ignored) {}
            recorder = null;
            currentSession.roomAudioPath = null;
            out.delete();
            Toast.makeText(this, "Room microphone unavailable: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private void stopRoomRecorder() {
        if (recorder == null) return;
        try { recorder.stop(); }
        catch (Exception e) {
            if (currentSession != null && currentSession.roomAudioPath != null) {
                new File(currentSession.roomAudioPath).delete();
                currentSession.roomAudioPath = null;
            }
        }
        try { recorder.release(); } catch (Exception ignored) {}
        recorder = null;
    }

    private void markMoment() {
        if (currentSession == null) return;
        SessionStore.Marker marker = new SessionStore.Marker();
        marker.offsetMs = Math.max(0, System.currentTimeMillis() - currentSession.startedAt);
        marker.label = "Marked what I heard " + (currentSession.markers.size() + 1);
        currentSession.markers.add(marker);
        Toast.makeText(this, "Marked at " + formatDuration(marker.offsetMs), Toast.LENGTH_SHORT).show();
    }

    private void stopAndSaveSession() {
        if (currentSession == null) {
            showHome();
            return;
        }
        if (gateBar != null && gateBar.getProgress() > 0) gateBar.setProgress(0);

        SessionStore.Session finished = currentSession;
        stopActiveSession(true);

        if (finished.internalAudioPath != null && !hasFile(finished.internalAudioPath)) {
            finished.internalAudioPath = null;
        }
        if (finished.roomAudioPath != null && !hasFile(finished.roomAudioPath)) {
            finished.roomAudioPath = null;
        }

        try {
            store.save(finished);
            Toast.makeText(this, "Session saved locally", Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            Toast.makeText(this, "Session save failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
        showSessionDetail(finished);
    }

    private void stopActiveSession(boolean finalize) {
        mainHandler.removeCallbacks(gateUiTick);
        if (gateEngine != null) {
            gateEngine.stop();
            gateEngine = null;
        }
        stopRoomRecorder();
        if (currentSession != null && finalize) {
            currentSession.durationMs = Math.max(0, System.currentTimeMillis() - currentSession.startedAt);
        }
        currentSession = null;
        gateBar = null;
        gateScope = null;
    }

    @Override
    public void onGateEvent(SessionStore.SourceEvent event) {
        SessionStore.Session session = currentSession;
        if (session != null) {
            synchronized (session.events) { session.events.add(event); }
        }
        runOnUiThread(() -> {
            String line = String.format(
                Locale.US,
                "%s  %s\n     %s",
                formatDuration(event.offsetMs),
                event.label,
                event.effect
            );
            ledgerLines.addFirst(line);
            while (ledgerLines.size() > 8) ledgerLines.removeLast();
            if (ledgerText != null) ledgerText.setText(String.join("\n\n", ledgerLines));
        });
    }

    @Override
    public void onEngineError(String message) {
        runOnUiThread(() -> {
            setStatus(message, DANGER);
            Toast.makeText(this, message, Toast.LENGTH_LONG).show();
        });
    }

    private void showVault() {
        stopPlayback();
        ScrollView scroll = shell();
        LinearLayout page = page(scroll);
        TextView back = small("← HOME", MUTED);
        back.setOnClickListener(v -> showHome());
        page.addView(back);

        addKicker(page, "LOCAL SESSION VAULT");
        addTitle(page, "Review the exposure.");
        List<SessionStore.Session> sessions = store.list();
        if (sessions.isEmpty()) {
            page.addView(card("NO SESSIONS YET", "Run Ech0Gate, manually expose the bank a few times, then stop + save."));
        } else {
            for (SessionStore.Session session : sessions) {
                LinearLayout box = vertical();
                box.setPadding(dp(16), dp(15), dp(16), dp(15));
                box.setBackground(panelDrawable());
                box.addView(text(session.mode, 17, TEXT, true));
                TextView meta = text(
                    formatDate(session.startedAt) + "  •  " + formatDuration(session.durationMs)
                        + "\n" + session.events.size() + " gate exposures  •  " + session.markers.size() + " marks"
                        + "\n" + (hasFile(session.internalAudioPath) ? "internal WAV ✓" : "internal WAV —")
                        + "  •  " + (hasFile(session.roomAudioPath) ? "room mic ✓" : "room mic —"),
                    12, MUTED, false
                );
                meta.setPadding(0, dp(6), 0, 0);
                box.addView(meta);
                box.setOnClickListener(v -> showSessionDetail(session));
                page.addView(box, marginTop(10));
            }
        }
        setContentView(scroll);
    }

    private void showSessionDetail(SessionStore.Session session) {
        stopPlayback();
        ScrollView scroll = shell();
        LinearLayout page = page(scroll);
        TextView back = small("← SESSION VAULT", MUTED);
        back.setOnClickListener(v -> showVault());
        page.addView(back);

        addKicker(page, "SESSION REVIEW // MANUAL GATE");
        addTitle(page, formatDate(session.startedAt));
        page.addView(card(
            "SESSION SUMMARY",
            "Duration: " + formatDuration(session.durationMs)
                + "\nGate exposures: " + session.events.size()
                + "\nMarked moments: " + session.markers.size()
                + "\nClean internal output: " + (hasFile(session.internalAudioPath) ? "saved" : "not available")
                + "\nRoom microphone: " + (hasFile(session.roomAudioPath) ? "saved" : "not available")
        ));

        page.addView(card(
            "PROVENANCE",
            "The internal WAV is the direct Ech0Gate output. The room recording is a separate microphone path and may contain speaker bleed. The ledger records which bank/playhead window was exposed and how the manual gate/reverb were set."
        ), marginTop(10));

        if (hasFile(session.internalAudioPath)) {
            Button playInternal = primaryButton("PLAY / STOP CLEAN INTERNAL OUTPUT");
            playInternal.setOnClickListener(v -> toggleAudio(session.internalAudioPath, "clean internal output"));
            page.addView(playInternal, marginTop(12));
        }
        if (hasFile(session.roomAudioPath)) {
            Button playRoom = secondaryButton("PLAY / STOP ROOM MICROPHONE");
            playRoom.setOnClickListener(v -> toggleAudio(session.roomAudioPath, "room microphone"));
            page.addView(playRoom, marginTop(10));
        }

        if (!session.markers.isEmpty()) {
            StringBuilder markers = new StringBuilder();
            for (SessionStore.Marker marker : session.markers) {
                markers.append(formatDuration(marker.offsetMs)).append("  ").append(marker.label).append("\n");
            }
            page.addView(card("MARKED MOMENTS", markers.toString().trim()), marginTop(10));
        }

        StringBuilder events = new StringBuilder();
        int max = Math.min(100, session.events.size());
        for (int i = 0; i < max; i++) {
            SessionStore.SourceEvent event = session.events.get(i);
            events.append(formatDuration(event.offsetMs)).append("  ")
                .append(event.label).append("\n  ")
                .append(event.sourceId).append("\n  ")
                .append(event.effect).append("\n\n");
        }
        if (session.events.size() > max) {
            events.append("… +").append(session.events.size() - max).append(" more events in JSON export");
        }
        page.addView(card(
            "GATE EXPOSURE LEDGER",
            events.length() == 0 ? "No completed gate exposures were logged." : events.toString().trim()
        ), marginTop(10));

        page.addView(sectionLabel("SESSION NOTES"), marginTop(16));
        EditText notes = new EditText(this);
        notes.setText(session.notes);
        notes.setTextColor(TEXT);
        notes.setHintTextColor(MUTED);
        notes.setHint("What did you think you heard? What should be reviewed again?");
        notes.setMinLines(3);
        notes.setGravity(Gravity.TOP);
        notes.setPadding(dp(14), dp(12), dp(14), dp(12));
        notes.setBackground(panelDrawable());
        page.addView(notes);

        Button saveNotes = secondaryButton("SAVE NOTES");
        saveNotes.setOnClickListener(v -> {
            session.notes = notes.getText().toString();
            try {
                store.save(session);
                Toast.makeText(this, "Notes saved", Toast.LENGTH_SHORT).show();
            } catch (Exception e) {
                Toast.makeText(this, "Could not save notes", Toast.LENGTH_SHORT).show();
            }
        });
        page.addView(saveNotes, marginTop(10));

        Button share = secondaryButton("SHARE JSON EVIDENCE LOG");
        share.setOnClickListener(v -> shareSessionJson(session));
        page.addView(share, marginTop(10));

        Button delete = dangerButton("DELETE LOCAL SESSION");
        delete.setOnClickListener(v -> {
            stopPlayback();
            store.delete(session.id);
            Toast.makeText(this, "Session deleted", Toast.LENGTH_SHORT).show();
            showVault();
        });
        page.addView(delete, marginTop(10));
        setContentView(scroll);
    }

    private void showInfo() {
        stopPlayback();
        ScrollView scroll = shell();
        LinearLayout page = page(scroll);
        TextView back = small("← HOME", MUTED);
        back.setOnClickListener(v -> showHome());
        page.addView(back);

        addKicker(page, "ECH0VOID // CORE TRUTH");
        addTitle(page, "What V4 actually does");
        page.addView(card(
            "MANUAL CORE",
            "The bank playhead always moves. The noise gate is the only exposure control. Releasing the slider does not close it. Opening the gate does not trigger a fragment, reset the playhead or consult a sensor."
        ));
        page.addView(card(
            "VOICE BANKS",
            "Each profile is rendered from a real long-form reader source before the APK is built. Pitch/fine-tune is a separate optional control and is not used to manufacture bank identity."
        ), marginTop(10));
        page.addView(card(
            "REVERB",
            "Eight finite sparse impulse profiles provide different room/plate/hall-style tails. Reverb can be switched fully off to audit the raw gate output."
        ), marginTop(10));
        page.addView(card(
            "NO PARANORMAL AUTOMATION",
            "No AI spirit messages, random dictionary words, TTS entities, sensor-selected chunks or autonomous gate openings occur in this core mode."
        ), marginTop(10));

        Button replay = secondaryButton("REPLAY INTRO + DISCLOSURE");
        replay.setOnClickListener(v -> {
            getSharedPreferences("ech0void.native", MODE_PRIVATE).edit().remove("hsb.core.v4.intro").apply();
            showWelcome();
        });
        page.addView(replay, marginTop(14));
        setContentView(scroll);
    }

    private void shareSessionJson(SessionStore.Session session) {
        Intent intent = new Intent(Intent.ACTION_SEND);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_SUBJECT, "Ech0Void session " + session.id);
        intent.putExtra(Intent.EXTRA_TEXT, store.exportJson(session));
        startActivity(Intent.createChooser(intent, "Share Ech0Void session log"));
    }

    private void toggleAudio(String path, String label) {
        if (player != null) {
            stopPlayback();
            Toast.makeText(this, "Playback stopped", Toast.LENGTH_SHORT).show();
            return;
        }
        try {
            player = new MediaPlayer();
            player.setDataSource(path);
            player.prepare();
            player.setOnCompletionListener(mp -> stopPlayback());
            player.start();
            Toast.makeText(this, "Playing " + label, Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            stopPlayback();
            Toast.makeText(this, "Playback failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private void stopPlayback() {
        if (player == null) return;
        try { player.stop(); } catch (Exception ignored) {}
        try { player.release(); } catch (Exception ignored) {}
        player = null;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == MIC_REQUEST && currentSession != null) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startRoomRecorder();
            } else {
                Toast.makeText(this, "Room mic denied — Ech0Gate still runs and records its clean internal output", Toast.LENGTH_LONG).show();
            }
        }
    }

    @Override
    protected void onDestroy() {
        stopPlayback();
        mainHandler.removeCallbacksAndMessages(null);
        if (gateEngine != null) gateEngine.stop();
        stopRoomRecorder();
        super.onDestroy();
    }

    private View modeCard(String title, String description, int accent, Runnable onPress) {
        LinearLayout box = vertical();
        box.setPadding(dp(18), dp(17), dp(18), dp(17));
        box.setBackground(panelDrawable());
        box.addView(text(title, 18, TEXT, true));
        TextView d = text(description, 13, MUTED, false);
        d.setPadding(0, dp(7), 0, dp(11));
        box.addView(d);
        box.addView(text("OPEN INSTRUMENT  →", 11, accent, true));
        box.setOnClickListener(v -> onPress.run());
        return box;
    }

    private ScrollView shell() {
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(BG);
        return scroll;
    }

    private LinearLayout page(ScrollView scroll) {
        LinearLayout page = vertical();
        page.setPadding(dp(20), dp(28), dp(20), dp(48));
        scroll.addView(page, match());
        return page;
    }

    private LinearLayout vertical() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        return layout;
    }

    private LinearLayout horizontal() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.HORIZONTAL);
        layout.setGravity(Gravity.CENTER_VERTICAL);
        return layout;
    }

    private void addKicker(LinearLayout page, String value) {
        TextView v = text(value, 10, CYAN, true);
        v.setLetterSpacing(.16f);
        page.addView(v);
    }

    private void addTitle(LinearLayout page, String value) {
        TextView v = text(value, 32, TEXT, true);
        v.setPadding(0, dp(6), 0, dp(10));
        page.addView(v);
    }

    private TextView sectionLabel(String value) {
        TextView v = text(value, 11, CYAN, true);
        v.setLetterSpacing(.08f);
        return v;
    }

    private TextView metric(LinearLayout parent, String label, String value) {
        LinearLayout box = vertical();
        box.addView(text(label, 9, MUTED, true));
        TextView v = text(value, 14, TEXT, true);
        v.setPadding(0, dp(4), 0, 0);
        box.addView(v);
        parent.addView(box, weight());
        return v;
    }

    private LinearLayout card(String title, String content) {
        LinearLayout box = vertical();
        box.setPadding(dp(16), dp(15), dp(16), dp(15));
        box.setBackground(panelDrawable());
        TextView h = text(title, 11, TEXT, true);
        h.setLetterSpacing(.08f);
        TextView b = text(content, 12, MUTED, false);
        b.setPadding(0, dp(7), 0, 0);
        box.addView(h);
        box.addView(b);
        return box;
    }

    private TextView body(String value) {
        TextView v = text(value, 14, MUTED, false);
        v.setPadding(0, dp(4), 0, dp(8));
        return v;
    }

    private TextView small(String value, int color) {
        TextView v = text(value, 11, color, true);
        v.setLetterSpacing(.08f);
        return v;
    }

    private TextView text(String value, int sp, int color, boolean bold) {
        TextView v = new TextView(this);
        v.setText(value);
        v.setTextSize(sp);
        v.setTextColor(color);
        v.setLineSpacing(0, 1.18f);
        if (bold) v.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        return v;
    }

    private Button primaryButton(String label) { return button(label, CYAN, Color.rgb(2, 16, 20)); }
    private Button dangerButton(String label) { return button(label, DANGER, Color.WHITE); }

    private Button secondaryButton(String label) {
        Button button = button(label, PANEL, TEXT);
        button.setBackground(panelDrawable());
        return button;
    }

    private Button button(String label, int background, int foreground) {
        Button b = new Button(this);
        b.setText(label);
        b.setTextSize(11);
        b.setTextColor(foreground);
        b.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        b.setAllCaps(false);
        b.setPadding(dp(12), dp(10), dp(12), dp(10));
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(background);
        bg.setCornerRadius(dp(14));
        b.setBackground(bg);
        return b;
    }

    private GradientDrawable panelDrawable() {
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(PANEL);
        bg.setStroke(dp(1), BORDER);
        bg.setCornerRadius(dp(16));
        return bg;
    }

    private void setStatus(String value, int color) {
        if (statusValue != null) {
            statusValue.setText(value);
            statusValue.setTextColor(color);
        }
    }

    private static int indexOf(String[] values, String wanted) {
        for (int i = 0; i < values.length; i++) if (values[i].equals(wanted)) return i;
        return 0;
    }

    private static String formatDuration(long ms) {
        long total = Math.max(0, ms) / 1000;
        return String.format(Locale.US, "%02d:%02d", total / 60, total % 60);
    }

    private static String formatDate(long millis) {
        return new SimpleDateFormat("d MMM yyyy • h:mm a", Locale.getDefault()).format(new Date(millis));
    }

    private static boolean hasFile(String path) {
        return path != null && new File(path).exists() && new File(path).length() > 0;
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private LinearLayout.LayoutParams marginTop(int top) {
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT
        );
        params.topMargin = dp(top);
        return params;
    }

    private LinearLayout.LayoutParams weight() {
        return new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
    }

    private LinearLayout.LayoutParams wrap() {
        return new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
    }

    private ViewGroup.LayoutParams match() {
        return new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
    }

    private Space space(int width) {
        Space space = new Space(this);
        space.setLayoutParams(new LinearLayout.LayoutParams(width, 1));
        return space;
    }
}
