import React from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const BAR_COUNT = 16;

export default function AudioReactiveBars({ rms = 0.2 }: { rms?: number }) {
  // Animate bar heights based on rms
  const [barHeights, setBarHeights] = React.useState<number[]>(Array(BAR_COUNT).fill(0));

  React.useEffect(() => {
    const interval = setInterval(() => {
      setBarHeights(generateBarHeights());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const generateBarHeights = () => {
    return Array.from({ length: BAR_COUNT }, () => Math.random());
  };

  return (
    <View style={{ height: 40, width: '100%', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
      {barHeights.map((barRms, i) => {
        const heightVal = useSharedValue(10 + barRms * 60);
        React.useEffect(() => {
          heightVal.value = withTiming(10 + barRms * 60, { duration: 120 });
        }, [rms]);
        const style = useAnimatedStyle(() => ({
          height: heightVal.value,
          backgroundColor: `rgba(0,224,255,${0.18 + i / BAR_COUNT * 0.5})`,
          marginHorizontal: 2,
          borderRadius: 4,
          width: 8,
        }));
        return <Animated.View key={i} style={style} />;
      })}
    </View>
  );
}
