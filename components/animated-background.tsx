import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PARTICLES = [
  { size: 260, top: -80, left: -120, duration: 12000, delay: 0 },
  { size: 220, top: 200, right: -110, duration: 14000, delay: 1200 },
  { size: 180, bottom: 120, left: 60, duration: 11000, delay: 800 },
];

export function AnimatedBackground() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const animValues = useRef(PARTICLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = animValues.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(PARTICLES[index].delay),
          Animated.timing(value, {
            toValue: 1,
            duration: PARTICLES[index].duration,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: PARTICLES[index].duration,
            useNativeDriver: true,
          }),
        ])
      )
    );

    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [animValues]);

  return (
    <View pointerEvents="none" style={styles.container}>
      {PARTICLES.map((particle, index) => {
        const value = animValues[index];
        return (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                width: particle.size,
                height: particle.size,
                borderRadius: particle.size / 2,
                top: particle.top,
                left: particle.left,
                right: particle.right,
                bottom: particle.bottom,
                transform: [
                  {
                    scale: value.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1.1],
                    }),
                  },
                  {
                    translateY: value.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -18],
                    }),
                  },
                ],
                opacity: value.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.6],
                }),
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      bottom: 72,
      zIndex: 1,
      opacity: 0.85,
    },
    particle: {
      position: 'absolute',
      backgroundColor: colors.tint,
      shadowColor: colors.tint,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 30,
    },
  });
