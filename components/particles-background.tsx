import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PARTICLES = [
  { size: 10, top: 40, left: 30, duration: 6000, delay: 0 },
  { size: 12, top: 120, right: 50, duration: 7000, delay: 400 },
  { size: 8, top: 200, left: 80, duration: 6500, delay: 800 },
  { size: 9, top: 260, right: 90, duration: 7200, delay: 200 },
  { size: 12, top: 320, left: 140, duration: 8000, delay: 900 },
  { size: 10, top: 420, right: 60, duration: 7600, delay: 500 },
  { size: 8, bottom: 160, left: 50, duration: 6800, delay: 300 },
  { size: 12, bottom: 120, right: 80, duration: 8400, delay: 700 },
  { size: 9, bottom: 60, left: 120, duration: 7600, delay: 1000 },
  { size: 140, top: 140, left: -40, duration: 14000, delay: 200 },
  { size: 180, bottom: 40, right: -60, duration: 16000, delay: 600 },
];

export function ParticlesBackground() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

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
                    translateY: value.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -10],
                    }),
                  },
                ],
                opacity: value.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.35, 0.75],
                }),
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const createStyles = (colors: typeof Colors.light, theme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 1,
      opacity: theme === 'dark' ? 0.9 : 0.8,
    },
    particle: {
      position: 'absolute',
      backgroundColor: colors.tint,
      shadowColor: colors.tint,
      shadowOpacity: 0.45,
      shadowRadius: 14,
    },
  });
