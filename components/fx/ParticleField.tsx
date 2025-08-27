import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withRepeat, withTiming } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const PARTICLE_COUNT = 24;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function randomParticle() {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    r: 6 + Math.random() * 10,
    drift: (Math.random() - 0.5) * 40,
    color: `rgba(0,224,255,${0.12 + Math.random() * 0.18})`,
    speed: 4000 + Math.random() * 4000,
  };
}

const particles = Array.from({ length: PARTICLE_COUNT }, randomParticle);

export default function ParticleField() {
  // Animate each particle's x/y with a gentle drift
  return (
    <Svg pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} width={width} height={height}>
      {particles.map((p, i) => {
        const x = useSharedValue(p.x);
        const y = useSharedValue(p.y);
        useEffect(() => {
          x.value = withRepeat(withTiming(p.x + p.drift, { duration: p.speed }), -1, true);
          y.value = withRepeat(withTiming(p.y + p.drift, { duration: p.speed * 1.2 }), -1, true);
        }, []);
        const animatedProps = useAnimatedProps(() => ({
          cx: x.value,
          cy: y.value,
        }));
        return (
          <AnimatedCircle
            key={i}
            animatedProps={animatedProps}
            r={p.r}
            fill={p.color}
          />
        );
      })}
    </Svg>
  );
}
