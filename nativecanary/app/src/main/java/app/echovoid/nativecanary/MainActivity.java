package app.echovoid.nativecanary;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setPadding(48, 48, 48, 48);
        root.setBackgroundColor(Color.rgb(20, 0, 28));
        root.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));

        TextView kicker = text("VOID NATIVE TEST", 16, Color.rgb(255, 80, 245));
        TextView title = text("BOOT SUCCESS", 34, Color.WHITE);
        TextView body = text("Pure native Android is alive. No Expo. No React Native. No Hermes.", 18, Color.rgb(225, 210, 230));
        TextView code = text("NATIVE CANARY 001", 14, Color.rgb(90, 245, 255));

        root.addView(kicker);
        root.addView(title);
        root.addView(body);
        root.addView(code);
        setContentView(root);
    }

    private TextView text(String value, float size, int color) {
        TextView v = new TextView(this);
        v.setText(value);
        v.setTextSize(size);
        v.setTextColor(color);
        v.setGravity(Gravity.CENTER);
        v.setPadding(12, 18, 12, 18);
        return v;
    }
}
