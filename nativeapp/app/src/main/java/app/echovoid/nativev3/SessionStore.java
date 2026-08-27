package app.echovoid.nativev3;

import android.content.Context;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public final class SessionStore {
    public static final class SourceEvent {
        public long offsetMs;
        public String sourceId;
        public String family;
        public String label;
        public String effect;
        public float rate;
        public float volume;
        public float sensorInfluence;

        JSONObject toJson() throws Exception {
            JSONObject o = new JSONObject();
            o.put("offsetMs", offsetMs);
            o.put("sourceId", sourceId);
            o.put("family", family);
            o.put("label", label);
            o.put("effect", effect);
            o.put("rate", rate);
            o.put("volume", volume);
            o.put("sensorInfluence", sensorInfluence);
            String provenance = "wordless-human-bank".equals(family)
                ? "ech0void-app-sourced-recorded-bank"
                : ("static".equals(family) ? "ech0void-generated-static" : "ech0void-app-sourced");
            o.put("provenance", provenance);
            return o;
        }

        static SourceEvent fromJson(JSONObject o) {
            SourceEvent e = new SourceEvent();
            e.offsetMs = o.optLong("offsetMs");
            e.sourceId = o.optString("sourceId");
            e.family = o.optString("family");
            e.label = o.optString("label");
            e.effect = o.optString("effect");
            e.rate = (float) o.optDouble("rate", 1.0);
            e.volume = (float) o.optDouble("volume", 1.0);
            e.sensorInfluence = (float) o.optDouble("sensorInfluence", 0.0);
            return e;
        }
    }

    public static final class Marker {
        public long offsetMs;
        public String label;

        JSONObject toJson() throws Exception {
            JSONObject o = new JSONObject();
            o.put("offsetMs", offsetMs);
            o.put("label", label);
            return o;
        }

        static Marker fromJson(JSONObject o) {
            Marker m = new Marker();
            m.offsetMs = o.optLong("offsetMs");
            m.label = o.optString("label", "Moment");
            return m;
        }
    }

    public static final class Session {
        public String id;
        public String mode;
        public long startedAt;
        public long durationMs;
        public float avgActivity;
        public float peakActivity;
        public float avgMagneticUt;
        public String roomAudioPath;
        public String notes = "";
        public final List<SourceEvent> events = new ArrayList<>();
        public final List<Marker> markers = new ArrayList<>();

        JSONObject toJson() throws Exception {
            JSONObject o = new JSONObject();
            o.put("schema", "ech0void.native.session.v1");
            o.put("id", id);
            o.put("mode", mode);
            o.put("startedAt", startedAt);
            o.put("durationMs", durationMs);
            o.put("avgActivity", avgActivity);
            o.put("peakActivity", peakActivity);
            o.put("avgMagneticUt", avgMagneticUt);
            o.put("roomAudioPath", roomAudioPath == null ? JSONObject.NULL : roomAudioPath);
            o.put("notes", notes == null ? "" : notes);
            o.put("generatedSourceDisclosure", "All sourceEvents identify Ech0Void app-sourced audio. Wordless gate events use reversed/half-speed/shuffled recorded human banks; generated static is separately labelled. Room audio is a separate microphone capture and may contain speaker bleed.");

            JSONArray ev = new JSONArray();
            for (SourceEvent e : events) ev.put(e.toJson());
            o.put("sourceEvents", ev);

            JSONArray mk = new JSONArray();
            for (Marker m : markers) mk.put(m.toJson());
            o.put("markers", mk);
            return o;
        }

        static Session fromJson(JSONObject o) {
            Session s = new Session();
            s.id = o.optString("id");
            s.mode = o.optString("mode");
            s.startedAt = o.optLong("startedAt");
            s.durationMs = o.optLong("durationMs");
            s.avgActivity = (float) o.optDouble("avgActivity", 0);
            s.peakActivity = (float) o.optDouble("peakActivity", 0);
            s.avgMagneticUt = (float) o.optDouble("avgMagneticUt", 0);
            if (!o.isNull("roomAudioPath")) s.roomAudioPath = o.optString("roomAudioPath", null);
            s.notes = o.optString("notes", "");

            JSONArray ev = o.optJSONArray("sourceEvents");
            if (ev != null) {
                for (int i = 0; i < ev.length(); i++) {
                    JSONObject x = ev.optJSONObject(i);
                    if (x != null) s.events.add(SourceEvent.fromJson(x));
                }
            }

            JSONArray mk = o.optJSONArray("markers");
            if (mk != null) {
                for (int i = 0; i < mk.length(); i++) {
                    JSONObject x = mk.optJSONObject(i);
                    if (x != null) s.markers.add(Marker.fromJson(x));
                }
            }
            return s;
        }
    }

    private final File root;

    public SessionStore(Context context) {
        root = new File(context.getFilesDir(), "ech0void/sessions");
        if (!root.exists()) root.mkdirs();
    }

    public File sessionDir(String id) {
        File dir = new File(root, id);
        if (!dir.exists()) dir.mkdirs();
        return dir;
    }

    public File roomAudioFile(String id) {
        return new File(sessionDir(id), "room.m4a");
    }

    public void save(Session session) throws Exception {
        File dir = sessionDir(session.id);
        File file = new File(dir, "session.json");
        byte[] data = session.toJson().toString(2).getBytes(StandardCharsets.UTF_8);
        try (FileOutputStream out = new FileOutputStream(file)) {
            out.write(data);
        }
    }

    public Session load(String id) throws Exception {
        File file = new File(new File(root, id), "session.json");
        byte[] data = readAll(file);
        return Session.fromJson(new JSONObject(new String(data, StandardCharsets.UTF_8)));
    }

    public List<Session> list() {
        List<Session> result = new ArrayList<>();
        File[] dirs = root.listFiles();
        if (dirs == null) return result;
        for (File dir : dirs) {
            if (!dir.isDirectory()) continue;
            try {
                result.add(load(dir.getName()));
            } catch (Exception ignored) {}
        }
        Collections.sort(result, Comparator.comparingLong((Session s) -> s.startedAt).reversed());
        return result;
    }

    public void delete(String id) {
        deleteRecursive(new File(root, id));
    }

    public String exportJson(Session session) {
        try {
            return session.toJson().toString(2);
        } catch (Exception e) {
            return "{}";
        }
    }

    private static byte[] readAll(File file) throws Exception {
        try (FileInputStream in = new FileInputStream(file)) {
            byte[] buffer = new byte[(int) file.length()];
            int offset = 0;
            while (offset < buffer.length) {
                int n = in.read(buffer, offset, buffer.length - offset);
                if (n < 0) break;
                offset += n;
            }
            return buffer;
        }
    }

    private static void deleteRecursive(File file) {
        if (file == null || !file.exists()) return;
        if (file.isDirectory()) {
            File[] children = file.listFiles();
            if (children != null) for (File child : children) deleteRecursive(child);
        }
        file.delete();
    }
}
