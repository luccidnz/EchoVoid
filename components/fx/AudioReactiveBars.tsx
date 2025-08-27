import React from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const BAR_COUNT = 16;

export default function AudioReactiveBars({ spectrum = [] }: { spectrum?: number[] }) {
  // Use incoming spectrum data (0..1) to drive bar heights
  const bars = React.useMemo(() => {
    const copy = spectrum.slice(0, BAR_COUNT);
    if (copy.length < BAR_COUNT) {
      return copy.concat(Array(BAR_COUNT - copy.length).fill(0));
    }
    return copy;
  }, [spectrum]);

  return (
    <View style={{ height: 40, width: '100%', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
      {bars.map((value, i) => {
        const heightVal = useSharedValue(10);
        React.useEffect(() => {
          heightVal.value = withTiming(10 + value * 60, { duration: 120 });
        }, [value]);
        const style = useAnimatedStyle(() => ({
          height: heightVal.value,
          backgroundColor: `rgba(0,224,255,${0.18 + (i / BAR_COUNT) * 0.5})`,
          marginHorizontal: 2,
          borderRadius: 4,
          width: 8,
        }));
        return <Animated.View key={i} style={style} />;
      })}
    </View>
  );
}
