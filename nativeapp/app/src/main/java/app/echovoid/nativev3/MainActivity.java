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
import java.util.function.Consumer;

public final class MainActivity extends Activity implements SensorFusion.Listener, Ech0Engine.Listener, WordlessGateEngine.Listener {
    private static final int MIC_REQUEST = 601;
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
    private SensorFusion sensors;
    private Ech0Engine engine;
    private WordlessGateEngine gateEngine;
    private MediaRecorder recorder;
    private MediaPlayer player;
    private SessionStore.Session currentSession;

    private long sessionStartRealtime;
    private float currentActivity;
    private float currentMagUt;
    private long currentSeed;
    private double activitySum;
    private double magneticSum;
    private long sensorSamples;
    private float peakActivity;

    private float intensity = 0.40f;
    private float variation = 0.52f;
    private float texture = 0.38f;
    private float sensorMix = 0.55f;
    private float output = 0.68f;
    private float gateReverb = 0.42f;
    private String selectedGateBank = "voidmix";

    private TextView activityValue;
    private TextView magneticValue;
    private TextView statusValue;
    private TextView ledgerText;
    private TextView elapsedValue;

    private final Runnable tick = new Runnable() {
        @Override public void run() {
            if (currentSession == null) return;
            long elapsed = System.currentTimeMillis() - currentSession.startedAt;
            if (elapsedValue != null) elapsedValue.setText(formatDuration(elapsed));
            mainHandler.postDelayed(this, 500);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(BG);
        getWindow().setNavigationBarColor(BG);

        store = new SessionStore(this);
        sensors = new SensorFusion(this, this);

        SharedPreferences prefs = getSharedPreferences("ech0void.native", MODE_PRIVATE);
        if (prefs.getBoolean("intro.accepted", false)) showHome();
        else showWelcome();
    }

    private void showWelcome() {
        stopPlayback();
        ScrollView scroll = shell();
        LinearLayout page = page(scroll);

        addKicker(page, "ECH0VOID // NATIVE CORE");
        addTitle(page, "Instrument first.\nClaims second.");

        TextView body = body("Ech0Void is an experimental ITC audio instrument. It generates clearly-labelled procedural source material while a separate microphone path can record the room.");
        page.addView(body);

        page.addView(card(
            "TWO SEPARATE PATHS",
            "GENERATED CHANNEL — every sound Ech0Void produces is logged with provenance.\n\nROOM CAPTURE — microphone audio is stored separately. If you use the phone speaker, generated sound can bleed into the mic."
        ));

        page.addView(card(
            "SENSOR HONESTY",
            "Magnetometer and accelerometer measurements can influence timing and source selection. A sensor change is a phone measurement — not proof of a paranormal cause."
        ));

        Button enter = primaryButton("ENTER THE VOID");
        enter.setOnClickListener(v -> {
            getSharedPreferences("ech0void.native", MODE_PRIVATE).edit().putBoolean("intro.accepted", true).apply();
            showHome();
        });
        page.addView(enter, marginTop(18));

        setContentView(scroll);
    }

    private void showHome() {
        stopPlayback();
        ScrollView scroll = shell();
        LinearLayout page = page(scroll);

        addKicker(page, "ECH0VOID // FREQUENCY INSTRUMENT");
        addTitle(page, "Open the signal");
        TextView sub = body("Manual wordless gate • native Android • offline • local evidence");
        sub.setTextColor(VIOLET);
        page.addView(sub);

        page.addView(modeCard(
            "ECH0GATE",
            "Primary ITC instrument. Reversed + half-speed wordless human banks stay silent until YOU open the gate.",
            GREEN,
            this::startGateSession
        ), marginTop(18));

        TextView labNote = small("SECONDARY ENGINES TEMPORARILY DISABLED WHILE THE REAL GATE BANK IS PROVEN", MUTED);
        labNote.setPadding(0, dp(20), 0, 0);
        page.addView(labNote);

        LinearLayout row = horizontal();
        Button vault = secondaryButton("SESSION VAULT");
        Button info = secondaryButton("INFO");
        row.addView(vault, weight());
        row.addView(space(dp(10)));
        row.addView(info, weight());
        page.addView(row, marginTop(18));

        vault.setOnClickListener(v -> showVault());
        info.setOnClickListener(v -> showSettings());

        TextView nativeTag = small("PURE NATIVE ANDROID V3 • NO EXPO • NO REACT NATIVE", GREEN);
        nativeTag.setGravity(Gravity.CENTER);
        page.addView(nativeTag, marginTop(24));

        setContentView(scroll);
    }

    private View modeCard(String title, String description, int accent, Runnable onPress) {
        LinearLayout box = vertical();
        box.setPadding(dp(18), dp(17), dp(18), dp(17));
        box.setBackground(panelDrawable());

        TextView t = text(title, 18, TEXT, true);
        TextView d = text(description, 13, MUTED, false);
        d.setPadding(0, dp(7), 0, dp(11));
        TextView go = text("OPEN CHANNEL  →", 11, accent, true);

        box.addView(t);
        box.addView(d);
        box.addView(go);
        box.setOnClickListener(v -> onPress.run());
        return box;
    }

    private void startGateSession() {
        stopPlayback();
        stopActiveSession(false);

        currentSession = new SessionStore.Session();
        currentSession.id = "native-" + System.currentTimeMillis();
        currentSession.mode = "Ech0Gate";
        currentSession.startedAt = System.currentTimeMillis();
        sessionStartRealtime = currentSession.startedAt;

        activitySum = 0;
        magneticSum = 0;
        sensorSamples = 0;
        peakActivity = 0;
        ledgerLines.clear();

        showGateTransmission();
        sensors.start();

        try {
            gateEngine = new WordlessGateEngine(this, this);
            gateEngine.setBank(selectedGateBank);
            gateEngine.setOutput(output);
            gateEngine.setReverb(gateReverb);
            gateEngine.setSensorMix(sensorMix);
            gateEngine.updateSensor(currentActivity, currentSeed);
            gateEngine.start();
        } catch (Exception e) {
            gateEngine = null;
            setStatus("Wordless gate bank failed to load", DANGER);
            Toast.makeText(this, "Gate engine error: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }

        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            startRoomRecorder();
        } else {
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, MIC_REQUEST);
            setStatus("Gate ready • mic permission requested", AMBER);
        }

        mainHandler.removeCallbacks(tick);
        mainHandler.post(tick);
    }

    private void showGateTransmission() {
        ScrollView scroll = shell();
        LinearLayout page = page(scroll);

        TextView back = small("← END / HOME", MUTED);
        back.setPadding(0, dp(4), 0, dp(14));
        back.setOnClickListener(v -> stopAndSaveSession());
        page.addView(back);

        addKicker(page, "ECH0GATE // WORDLESS HUMAN SIGNAL");
        addTitle(page, "Ask. Open. Listen.");

        LinearLayout metrics = horizontal();
        activityValue = metric(metrics, "ACTIVITY", "0%");
        magneticValue = metric(metrics, "MAG FIELD", "— µT");
        elapsedValue = metric(metrics, "ELAPSED", "00:00");
        page.addView(metrics, marginTop(16));

        statusValue = text("Preparing silent wordless bank…", 12, AMBER, true);
        statusValue.setPadding(0, dp(14), 0, dp(8));
        page.addView(statusValue);

        page.addView(card(
            "HOW THIS SIGNAL IS BUILT",
            "Each preset is now a long pre-rendered wordless bank built from different public-domain source recordings. Speech is reversed, slowed, chopped and shuffled BEFORE it reaches the phone. The app simply runs the long bank silently underneath the gate."
        ), marginTop(8));

        TextView bankHead = text("VOICE BANK", 11, TEXT, true);
        bankHead.setPadding(0, dp(16), 0, dp(6));
        page.addView(bankHead);

        Spinner bankSpinner = new Spinner(this);
        String[] bankLabels = new String[]{
            "VOID MIX • all source families",
            "STORY FIELD • multi-reader",
            "DARK VOICE • long narrator",
            "MULTI-VOICE • many readers",
            "RADIO VOID • announcement",
            "CROSSFEED • two source families"
        };
        String[] bankIds = new String[]{
            "voidmix",
            "story",
            "dark",
            "multivoice",
            "radio",
            "crossfeed"
        };
        ArrayAdapter<String> bankAdapter = new ArrayAdapter<>(
            this,
            android.R.layout.simple_spinner_dropdown_item,
            bankLabels
        );
        bankSpinner.setAdapter(bankAdapter);
        int selectedIndex = 0;
        for (int i = 0; i < bankIds.length; i++) {
            if (bankIds[i].equals(selectedGateBank)) selectedIndex = i;
        }
        bankSpinner.setSelection(selectedIndex);
        bankSpinner.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
            @Override public void onItemSelected(android.widget.AdapterView<?> parent, View view, int position, long id) {
                selectedGateBank = bankIds[position];
                if (gateEngine != null) gateEngine.setBank(selectedGateBank);
            }
            @Override public void onNothingSelected(android.widget.AdapterView<?> parent) {}
        });
        page.addView(bankSpinner);

        Button reshuffle = secondaryButton("RESHUFFLE HIDDEN BANK");
        reshuffle.setOnClickListener(v -> {
            if (gateEngine != null) {
                gateEngine.reshufflePosition();
                Toast.makeText(this, "Hidden bank jumped to a new position", Toast.LENGTH_SHORT).show();
            }
        });
        page.addView(reshuffle, marginTop(8));

        addSlider(page, "REVERB / TAIL", gateReverb, v -> {
            gateReverb = v;
            if (gateEngine != null) gateEngine.setReverb(v);
        });
        addSlider(page, "SENSOR BIAS", sensorMix, v -> {
            sensorMix = v;
            if (gateEngine != null) gateEngine.setSensorMix(v);
        });
        addSlider(page, "OUTPUT", output, v -> {
            output = v;
            if (gateEngine != null) gateEngine.setOutput(v);
        });

        LinearLayout gateCard = vertical();
        gateCard.setPadding(dp(16), dp(16), dp(16), dp(18));
        gateCard.setBackground(panelDrawable());

        LinearLayout gateHeader = horizontal();
        TextView gateTitle = text("PORTAL GATE", 14, GREEN, true);
        TextView gatePct = text("CLOSED", 12, MUTED, true);
        gatePct.setGravity(Gravity.END);
        gateHeader.addView(gateTitle, weight());
        gateHeader.addView(gatePct, wrap());
        gateCard.addView(gateHeader);

        TextView gateHelp = text("Drag right and HOLD for ~1–3 seconds while asking/listening. Release your finger and Ech0Void snaps the gate shut.", 12, MUTED, false);
        gateHelp.setPadding(0, dp(8), 0, dp(8));
        gateCard.addView(gateHelp);

        SeekBar gateBar = new SeekBar(this);
        gateBar.setMax(100);
        gateBar.setProgress(0);
        gateBar.setProgressTintList(android.content.res.ColorStateList.valueOf(GREEN));
        gateBar.setThumbTintList(android.content.res.ColorStateList.valueOf(GREEN));
        gateBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                float value = progress / 100f;
                gatePct.setText(progress < 5 ? "CLOSED" : progress + "% OPEN");
                gatePct.setTextColor(progress < 5 ? MUTED : GREEN);
                if (gateEngine != null) gateEngine.setGate(value);
            }

            @Override public void onStartTrackingTouch(SeekBar seekBar) {}

            @Override public void onStopTrackingTouch(SeekBar seekBar) {
                if (gateEngine != null) gateEngine.setGate(0f);
                seekBar.setProgress(0);
                gatePct.setText("CLOSED");
                gatePct.setTextColor(MUTED);
            }
        });
        gateCard.addView(gateBar);
        page.addView(gateCard, marginTop(16));

        page.addView(card(
            "SENSOR BIAS",
            "Sensor Bias never opens the gate by itself. At higher settings, phone sensor activity can jump the hidden long bank to another position when YOU open it. Set it to 0% for a purely manual control session."
        ), marginTop(10));

        TextView ledgerHead = text("GATE WINDOW LEDGER", 11, CYAN, true);
        ledgerHead.setPadding(0, dp(18), 0, dp(8));
        page.addView(ledgerHead);

        ledgerText = text("No gate windows yet. Ask a question, open the gate briefly, then close it.", 11, MUTED, false);
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

    private void startSession(Ech0Engine.Mode mode) {
        stopPlayback();
        stopActiveSession(false);

        currentSession = new SessionStore.Session();
        currentSession.id = "native-" + System.currentTimeMillis();
        currentSession.mode = modeName(mode);
        currentSession.startedAt = System.currentTimeMillis();
        sessionStartRealtime = currentSession.startedAt;

        activitySum = 0;
        magneticSum = 0;
        sensorSamples = 0;
        peakActivity = 0;
        ledgerLines.clear();

        showTransmission(mode);

        sensors.start();
        try {
            engine = new Ech0Engine(this, mode, this);
            engine.setSettings(intensity, variation, texture, sensorMix, output);
            engine.updateSensor(currentActivity, currentSeed);
            engine.start();
        } catch (Exception e) {
            engine = null;
            setStatus("Recorded source bank failed to load", DANGER);
            Toast.makeText(this, "Audio bank error: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }

        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            startRoomRecorder();
        } else {
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, MIC_REQUEST);
            setStatus("ITC output active • mic permission requested", AMBER);
        }

        mainHandler.removeCallbacks(tick);
        mainHandler.post(tick);
    }

    private void showTransmission(Ech0Engine.Mode mode) {
        ScrollView scroll = shell();
        LinearLayout page = page(scroll);

        TextView back = small("← END / HOME", MUTED);
        back.setPadding(0, dp(4), 0, dp(14));
        back.setOnClickListener(v -> stopAndSaveSession());
        page.addView(back);

        addKicker(page, modeName(mode).toUpperCase(Locale.US) + " // LIVE SESSION");
        addTitle(page, modeTitle(mode));

        LinearLayout metrics = horizontal();
        activityValue = metric(metrics, "ACTIVITY", "0%");
        magneticValue = metric(metrics, "MAG FIELD", "— µT");
        elapsedValue = metric(metrics, "ELAPSED", "00:00");
        page.addView(metrics, marginTop(16));

        statusValue = text("Starting native audio engine…", 12, AMBER, true);
        statusValue.setPadding(0, dp(14), 0, dp(8));
        page.addView(statusValue);

        page.addView(card(
            "SOURCE PROVENANCE",
            "Everything heard from the Ech0Void output is APP-SOURCED and timestamped below. Voice texture comes from chopped public-domain recordings; static is generated. The room microphone remains a separate recording path."
        ), marginTop(8));

        addSlider(page, "INTENSITY", intensity, v -> { intensity = v; pushSettings(); });
        addSlider(page, "VARIATION", variation, v -> { variation = v; pushSettings(); });
        addSlider(page, "TEXTURE", texture, v -> { texture = v; pushSettings(); });
        addSlider(page, "SENSOR MIX", sensorMix, v -> { sensorMix = v; pushSettings(); });
        addSlider(page, "OUTPUT", output, v -> { output = v; pushSettings(); });

        TextView ledgerHead = text("APP-SOURCED LEDGER", 11, CYAN, true);
        ledgerHead.setPadding(0, dp(18), 0, dp(8));
        page.addView(ledgerHead);

        ledgerText = text("Listening… silence is part of the instrument.", 11, MUTED, false);
        ledgerText.setTypeface(Typeface.MONOSPACE);
        ledgerText.setPadding(dp(14), dp(14), dp(14), dp(14));
        ledgerText.setBackground(panelDrawable());
        page.addView(ledgerText);

        Button mark = secondaryButton("MARK MOMENT");
        mark.setOnClickListener(v -> markMoment());
        page.addView(mark, marginTop(14));

        Button stop = dangerButton("STOP + SAVE SESSION");
        stop.setOnClickListener(v -> stopAndSaveSession());
        page.addView(stop, marginTop(10));

        setContentView(scroll);
    }

    private void addSlider(LinearLayout page, String label, float initial, Consumer<Float> setter) {
        LinearLayout wrap = vertical();
        wrap.setPadding(0, dp(10), 0, 0);

        LinearLayout head = horizontal();
        TextView name = text(label, 11, TEXT, true);
        TextView value = text(Math.round(initial * 100) + "%", 11, CYAN, true);
        value.setGravity(Gravity.END);
        head.addView(name, weight());
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
                setter.accept(v);
            }
            @Override public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override public void onStopTrackingTouch(SeekBar seekBar) {}
        });

        wrap.addView(head);
        wrap.addView(bar);
        page.addView(wrap);
    }

    private void pushSettings() {
        if (engine != null) engine.setSettings(intensity, variation, texture, sensorMix, output);
        if (gateEngine != null) {
            gateEngine.setOutput(output);
            gateEngine.setReverb(gateReverb);
            gateEngine.setSensorMix(sensorMix);
        }
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
            setStatus("ITC output + room capture active", GREEN);
        } catch (Exception e) {
            try { if (recorder != null) recorder.release(); } catch (Exception ignored) {}
            recorder = null;
            currentSession.roomAudioPath = null;
            out.delete();
            setStatus("ITC output active • room mic unavailable", AMBER);
        }
    }

    private void stopRoomRecorder() {
        if (recorder == null) return;
        try { recorder.stop(); } catch (Exception e) {
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
        SessionStore.Marker m = new SessionStore.Marker();
        m.offsetMs = System.currentTimeMillis() - currentSession.startedAt;
        m.label = "Marked moment " + (currentSession.markers.size() + 1);
        currentSession.markers.add(m);
        Toast.makeText(this, "Moment marked at " + formatDuration(m.offsetMs), Toast.LENGTH_SHORT).show();
    }

    private void stopAndSaveSession() {
        if (currentSession == null) {
            showHome();
            return;
        }

        SessionStore.Session finished = currentSession;
        stopActiveSession(true);

        try {
            store.save(finished);
            Toast.makeText(this, "Session saved to local vault", Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            Toast.makeText(this, "Session save failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
        showSessionDetail(finished);
    }

    private void stopActiveSession(boolean finalize) {
        mainHandler.removeCallbacks(tick);
        if (engine != null) {
            engine.stop();
            engine = null;
        }
        if (gateEngine != null) {
            gateEngine.stop();
            gateEngine = null;
        }
        if (sensors != null) sensors.stop();
        stopRoomRecorder();

        if (currentSession != null && finalize) {
            currentSession.durationMs = System.currentTimeMillis() - currentSession.startedAt;
            if (sensorSamples > 0) {
                currentSession.avgActivity = (float) (activitySum / sensorSamples);
                currentSession.avgMagneticUt = (float) (magneticSum / sensorSamples);
            }
            currentSession.peakActivity = peakActivity;
        }

        if (!finalize) currentSession = null;
        else currentSession = null;
    }

    @Override
    public void onSensorSnapshot(float activity, float magneticFieldUt, long seed, boolean available) {
        currentActivity = activity;
        currentMagUt = magneticFieldUt;
        currentSeed = seed;
        if (engine != null) engine.updateSensor(activity, seed);
        if (gateEngine != null) gateEngine.updateSensor(activity, seed);

        if (currentSession != null) {
            activitySum += activity;
            magneticSum += magneticFieldUt;
            sensorSamples++;
            peakActivity = Math.max(peakActivity, activity);
        }

        runOnUiThread(() -> {
            if (activityValue != null) activityValue.setText(Math.round(activity * 100) + "%");
            if (magneticValue != null) magneticValue.setText(available ? String.format(Locale.US, "%.1f µT", magneticFieldUt) : "N/A");
        });
    }

    @Override
    public void onSourceEvent(SessionStore.SourceEvent event) {
        SessionStore.Session session = currentSession;
        if (session != null) {
            synchronized (session.events) {
                session.events.add(event);
            }
        }

        runOnUiThread(() -> {
            String line = String.format(
                Locale.US,
                "%s  %-14s  %-12s  s:%d%%",
                formatDuration(event.offsetMs),
                event.label,
                event.effect,
                Math.round(event.sensorInfluence * 100)
            );
            ledgerLines.addFirst(line);
            while (ledgerLines.size() > 12) ledgerLines.removeLast();
            if (ledgerText != null) ledgerText.setText(String.join("\n", ledgerLines));
        });
    }

    @Override
    public void onGateEvent(SessionStore.SourceEvent event) {
        SessionStore.Session session = currentSession;
        if (session != null) {
            synchronized (session.events) {
                session.events.add(event);
            }
        }

        runOnUiThread(() -> {
            String line = String.format(
                Locale.US,
                "%s  %s\n     %s  sensor:%d%%",
                formatDuration(event.offsetMs),
                event.label,
                event.effect,
                Math.round(event.sensorInfluence * 100)
            );
            ledgerLines.addFirst(line);
            while (ledgerLines.size() > 10) ledgerLines.removeLast();
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
        addTitle(page, "Evidence stays here");

        List<SessionStore.Session> sessions = store.list();
        if (sessions.isEmpty()) {
            page.addView(card("NO SESSIONS YET", "Run one of the three channels and stop + save it. Room audio and source provenance stay on-device."));
        } else {
            for (SessionStore.Session s : sessions) {
                LinearLayout box = vertical();
                box.setPadding(dp(16), dp(15), dp(16), dp(15));
                box.setBackground(panelDrawable());

                TextView title = text(s.mode, 17, TEXT, true);
                TextView meta = text(
                    formatDate(s.startedAt) + "  •  " + formatDuration(s.durationMs)
                        + "\n" + s.events.size() + " generated events  •  "
                        + s.markers.size() + " marks  •  "
                        + (hasRoomAudio(s) ? "room audio saved" : "no room audio"),
                    12, MUTED, false
                );
                meta.setPadding(0, dp(6), 0, 0);
                box.addView(title);
                box.addView(meta);
                box.setOnClickListener(v -> showSessionDetail(s));
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

        addKicker(page, "SESSION REVIEW // " + session.mode.toUpperCase(Locale.US));
        addTitle(page, formatDate(session.startedAt));

        page.addView(card(
            "SESSION SUMMARY",
            "Duration: " + formatDuration(session.durationMs)
                + "\nGenerated events: " + session.events.size()
                + "\nMarked moments: " + session.markers.size()
                + String.format(Locale.US, "\nAvg activity: %.0f%%  •  Peak: %.0f%%", session.avgActivity * 100, session.peakActivity * 100)
                + String.format(Locale.US, "\nAvg magnetic field: %.1f µT", session.avgMagneticUt)
        ));

        page.addView(card(
            "PROVENANCE",
            "All source-ledger entries below came from Ech0Void's own recorded-source bank or short generated static gates. Room audio is a separate microphone recording and can include speaker bleed."
        ), marginTop(10));

        if (hasRoomAudio(session)) {
            Button playRoom = primaryButton("PLAY / STOP ROOM AUDIO");
            playRoom.setOnClickListener(v -> toggleRoomAudio(session.roomAudioPath));
            page.addView(playRoom, marginTop(12));
        }

        if (!session.markers.isEmpty()) {
            StringBuilder markers = new StringBuilder();
            for (SessionStore.Marker m : session.markers) {
                markers.append(formatDuration(m.offsetMs)).append("  ").append(m.label).append("\n");
            }
            page.addView(card("MARKED MOMENTS", markers.toString().trim()), marginTop(10));
        }

        StringBuilder ledger = new StringBuilder();
        int max = Math.min(80, session.events.size());
        for (int i = 0; i < max; i++) {
            SessionStore.SourceEvent e = session.events.get(i);
            ledger.append(formatDuration(e.offsetMs))
                .append("  ").append(e.label)
                .append("  [").append(e.effect).append("]")
                .append("  sensor=").append(Math.round(e.sensorInfluence * 100)).append("%")
                .append("\n");
        }
        if (session.events.size() > max) {
            ledger.append("… +").append(session.events.size() - max).append(" more events in JSON export");
        }
        page.addView(card("GENERATED SOURCE LEDGER", ledger.length() == 0 ? "No source events were logged." : ledger.toString().trim()), marginTop(10));

        TextView notesLabel = text("SESSION NOTES", 11, CYAN, true);
        notesLabel.setPadding(0, dp(16), 0, dp(8));
        page.addView(notesLabel);

        EditText notes = new EditText(this);
        notes.setText(session.notes);
        notes.setTextColor(TEXT);
        notes.setHintTextColor(MUTED);
        notes.setHint("Add what you heard, noticed or want to review later…");
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

    private void shareSessionJson(SessionStore.Session session) {
        Intent intent = new Intent(Intent.ACTION_SEND);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_SUBJECT, "Ech0Void session " + session.id);
        intent.putExtra(Intent.EXTRA_TEXT, store.exportJson(session));
        startActivity(Intent.createChooser(intent, "Share Ech0Void evidence log"));
    }

    private void toggleRoomAudio(String path) {
        if (player != null) {
            stopPlayback();
            Toast.makeText(this, "Room playback stopped", Toast.LENGTH_SHORT).show();
            return;
        }
        try {
            player = new MediaPlayer();
            player.setDataSource(path);
            player.prepare();
            player.setOnCompletionListener(mp -> stopPlayback());
            player.start();
            Toast.makeText(this, "Playing separate room capture", Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            stopPlayback();
            Toast.makeText(this, "Room playback failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private void stopPlayback() {
        if (player == null) return;
        try { player.stop(); } catch (Exception ignored) {}
        try { player.release(); } catch (Exception ignored) {}
        player = null;
    }

    private void showSettings() {
        stopPlayback();
        ScrollView scroll = shell();
        LinearLayout page = page(scroll);

        TextView back = small("← HOME", MUTED);
        back.setOnClickListener(v -> showHome());
        page.addView(back);

        addKicker(page, "ABOUT THE INSTRUMENT");
        addTitle(page, "Ech0Void Native V3");

        page.addView(card(
            "PRIMARY: ECH0GATE",
            "Ech0Gate is now the primary instrument: reversed, half-speed, shuffled wordless human banks run silently underneath a manual gate. You decide when audio is exposed. EchoBox, Field Drift and Signal Scan remain experimental secondary engines."
        ));
        page.addView(card(
            "NO AI SPIRIT WORDS",
            "The live capture path deliberately avoids random dictionary words, TTS-as-entity and AI-generated spirit messages. The generated source itself stays reviewable."
        ), marginTop(10));
        page.addView(card(
            "ROOM MIC",
            "Microphone audio is local. Headphones reduce speaker bleed. No cloud transcription or backend is required."
        ), marginTop(10));
        page.addView(card(
            "NATIVE RUNTIME",
            "This V3 test core is pure Android. It does not depend on Expo, React Native, Hermes or a development server."
        ), marginTop(10));

        Button replay = secondaryButton("REPLAY INTRO + DISCLOSURE");
        replay.setOnClickListener(v -> {
            getSharedPreferences("ech0void.native", MODE_PRIVATE).edit().remove("intro.accepted").apply();
            showWelcome();
        });
        page.addView(replay, marginTop(14));

        setContentView(scroll);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == MIC_REQUEST && currentSession != null) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startRoomRecorder();
            } else {
                setStatus("ITC output active • room mic denied", AMBER);
            }
        }
    }

    @Override
    protected void onDestroy() {
        stopPlayback();
        mainHandler.removeCallbacksAndMessages(null);
        if (engine != null) engine.stop();
        if (gateEngine != null) gateEngine.stop();
        if (sensors != null) sensors.stop();
        stopRoomRecorder();
        super.onDestroy();
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
        LinearLayout l = new LinearLayout(this);
        l.setOrientation(LinearLayout.VERTICAL);
        return l;
    }

    private LinearLayout horizontal() {
        LinearLayout l = new LinearLayout(this);
        l.setOrientation(LinearLayout.HORIZONTAL);
        l.setGravity(Gravity.CENTER_VERTICAL);
        return l;
    }

    private void addKicker(LinearLayout page, String value) {
        TextView v = text(value, 10, CYAN, true);
        v.setLetterSpacing(0.16f);
        page.addView(v);
    }

    private void addTitle(LinearLayout page, String value) {
        TextView v = text(value, 34, TEXT, true);
        v.setPadding(0, dp(6), 0, dp(10));
        page.addView(v);
    }

    private TextView metric(LinearLayout parent, String label, String value) {
        LinearLayout box = vertical();
        TextView l = text(label, 9, MUTED, true);
        TextView v = text(value, 15, TEXT, true);
        v.setPadding(0, dp(4), 0, 0);
        box.addView(l);
        box.addView(v);
        parent.addView(box, weight());
        return v;
    }

    private LinearLayout card(String title, String content) {
        LinearLayout box = vertical();
        box.setPadding(dp(16), dp(15), dp(16), dp(15));
        box.setBackground(panelDrawable());

        TextView h = text(title, 11, TEXT, true);
        h.setLetterSpacing(0.08f);
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
        v.setLetterSpacing(0.08f);
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

    private Button primaryButton(String label) {
        Button b = button(label, CYAN, Color.rgb(2, 16, 20));
        return b;
    }

    private Button secondaryButton(String label) {
        Button b = button(label, PANEL, TEXT);
        GradientDrawable bg = panelDrawable();
        b.setBackground(bg);
        return b;
    }

    private Button dangerButton(String label) {
        return button(label, DANGER, Color.WHITE);
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

    private static String modeName(Ech0Engine.Mode mode) {
        if (mode == Ech0Engine.Mode.ECHO_BOX) return "EchoBox";
        if (mode == Ech0Engine.Mode.FIELD_DRIFT) return "Field Drift";
        return "Signal Scan";
    }

    private static String modeTitle(Ech0Engine.Mode mode) {
        if (mode == Ech0Engine.Mode.ECHO_BOX) return "Layer the echo";
        if (mode == Ech0Engine.Mode.FIELD_DRIFT) return "Let the field move";
        return "Sweep the noise";
    }

    private static String formatDuration(long ms) {
        long total = Math.max(0, ms) / 1000;
        return String.format(Locale.US, "%02d:%02d", total / 60, total % 60);
    }

    private static String formatDate(long millis) {
        return new SimpleDateFormat("d MMM yyyy • h:mm a", Locale.getDefault()).format(new Date(millis));
    }

    private static boolean hasRoomAudio(SessionStore.Session s) {
        return s.roomAudioPath != null && new File(s.roomAudioPath).exists() && new File(s.roomAudioPath).length() > 0;
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private LinearLayout.LayoutParams marginTop(int top) {
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        p.topMargin = dp(top);
        return p;
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
        Space s = new Space(this);
        s.setLayoutParams(new LinearLayout.LayoutParams(width, 1));
        return s;
    }
}
