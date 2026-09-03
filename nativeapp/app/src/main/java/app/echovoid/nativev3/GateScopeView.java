package app.echovoid.nativev3;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.view.View;

/**
 * Honest visualiser for the manual gate and actual output level.
 * It deliberately does not invent anomaly values or paranormal indicators.
 */
public final class GateScopeView extends View {
    private final Paint ringPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint innerPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint wavePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint linePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final float[] history = new float[96];
    private int historyIndex;
    private float gate;
    private float level;

    public GateScopeView(Context context) {
        super(context);
        setMinimumHeight(dp(210));
        ringPaint.setStyle(Paint.Style.STROKE);
        innerPaint.setStyle(Paint.Style.FILL);
        wavePaint.setStyle(Paint.Style.STROKE);
        wavePaint.setStrokeWidth(dp(1.6f));
        wavePaint.setColor(Color.rgb(71, 233, 255));
        linePaint.setStyle(Paint.Style.STROKE);
        linePaint.setStrokeWidth(dp(1f));
        linePaint.setColor(Color.rgb(30, 43, 58));
    }

    public void update(float gate, float level) {
        this.gate = clamp01(gate);
        this.level = clamp01(level);
        history[historyIndex] = this.level;
        historyIndex = (historyIndex + 1) % history.length;
        postInvalidateOnAnimation();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        canvas.drawColor(Color.rgb(3, 4, 8));

        float w = getWidth();
        float h = getHeight();
        float cx = w * .5f;
        float cy = h * .42f;
        float baseRadius = Math.min(w, h) * .19f;
        float active = Math.max(gate, level * .7f);

        ringPaint.setStrokeWidth(dp(1.4f + gate * 4f));
        ringPaint.setColor(Color.argb(
            Math.round(65 + gate * 190),
            71,
            233,
            255
        ));
        canvas.drawCircle(cx, cy, baseRadius + gate * dp(18), ringPaint);

        ringPaint.setStrokeWidth(dp(1f));
        ringPaint.setColor(Color.argb(Math.round(25 + gate * 120), 154, 124, 255));
        canvas.drawCircle(cx, cy, baseRadius * 1.42f + active * dp(24), ringPaint);

        innerPaint.setColor(Color.argb(
            Math.round(8 + active * 46),
            71,
            233,
            255
        ));
        canvas.drawCircle(cx, cy, baseRadius * (.56f + level * .28f), innerPaint);

        float waveTop = h * .74f;
        canvas.drawLine(dp(12), waveTop, w - dp(12), waveTop, linePaint);
        Path path = new Path();
        int count = history.length;
        float usable = Math.max(1, w - dp(24));
        for (int i = 0; i < count; i++) {
            int index = (historyIndex + i) % count;
            float x = dp(12) + usable * i / (count - 1f);
            float centred = history[index] * (i % 2 == 0 ? 1f : -1f);
            float y = waveTop - centred * dp(38) * Math.max(.15f, gate);
            if (i == 0) path.moveTo(x, y);
            else path.lineTo(x, y);
        }
        canvas.drawPath(path, wavePaint);
    }

    private float dp(float value) {
        return value * getResources().getDisplayMetrics().density;
    }

    private static float clamp01(float value) {
        return Math.max(0f, Math.min(1f, value));
    }
}
