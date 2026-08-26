package app.echovoid.nativev3;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;

public final class SensorFusion implements SensorEventListener {
    public interface Listener {
        void onSensorSnapshot(float activity, float magneticFieldUt, long seed, boolean available);
    }

    private final SensorManager manager;
    private final Sensor magnetometer;
    private final Sensor accelerometer;
    private final Listener listener;

    private final float[] mag = new float[3];
    private final float[] accel = new float[3];
    private final float[] lastMag = new float[3];
    private final float[] lastAccel = new float[3];
    private boolean haveMag;
    private boolean haveAccel;
    private float smoothActivity;
    private float magneticUt;

    public SensorFusion(Context context, Listener listener) {
        this.manager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
        this.magnetometer = manager != null ? manager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD) : null;
        this.accelerometer = manager != null ? manager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) : null;
        this.listener = listener;
    }

    public void start() {
        if (manager == null) {
            emit();
            return;
        }
        if (magnetometer != null) {
            manager.registerListener(this, magnetometer, SensorManager.SENSOR_DELAY_GAME);
        }
        if (accelerometer != null) {
            manager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_GAME);
        }
        emit();
    }

    public void stop() {
        if (manager != null) manager.unregisterListener(this);
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) {
            if (haveMag) {
                System.arraycopy(mag, 0, lastMag, 0, 3);
            } else {
                System.arraycopy(event.values, 0, lastMag, 0, 3);
                haveMag = true;
            }
            System.arraycopy(event.values, 0, mag, 0, 3);
            magneticUt = magnitude(mag);
        } else if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            if (haveAccel) {
                System.arraycopy(accel, 0, lastAccel, 0, 3);
            } else {
                System.arraycopy(event.values, 0, lastAccel, 0, 3);
                haveAccel = true;
            }
            System.arraycopy(event.values, 0, accel, 0, 3);
        }

        float magDelta = haveMag ? distance(mag, lastMag) / 18f : 0f;
        float accelDelta = haveAccel ? distance(accel, lastAccel) / 4.5f : 0f;
        float raw = clamp01((magDelta * 0.55f) + (accelDelta * 0.45f));
        smoothActivity = smoothActivity * 0.82f + raw * 0.18f;
        emit();
    }

    private void emit() {
        if (listener == null) return;
        long seed = 1469598103934665603L;
        seed = mix(seed, Float.floatToIntBits(mag[0]));
        seed = mix(seed, Float.floatToIntBits(mag[1]));
        seed = mix(seed, Float.floatToIntBits(mag[2]));
        seed = mix(seed, Float.floatToIntBits(accel[0]));
        seed = mix(seed, Float.floatToIntBits(accel[1]));
        seed = mix(seed, Float.floatToIntBits(accel[2]));
        listener.onSensorSnapshot(smoothActivity, magneticUt, seed, haveMag || haveAccel);
    }

    private static long mix(long seed, int value) {
        long x = seed ^ (value & 0xffffffffL);
        x *= 1099511628211L;
        x ^= (x >>> 32);
        return x;
    }

    private static float magnitude(float[] v) {
        return (float) Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    }

    private static float distance(float[] a, float[] b) {
        float x = a[0] - b[0];
        float y = a[1] - b[1];
        float z = a[2] - b[2];
        return (float) Math.sqrt(x * x + y * y + z * z);
    }

    private static float clamp01(float x) {
        return Math.max(0f, Math.min(1f, x));
    }

    @Override public void onAccuracyChanged(Sensor sensor, int accuracy) {}
}
