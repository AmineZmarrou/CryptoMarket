import { useContext } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { ThemeContext } from '@/src/context/ThemeContext';

export function useColorScheme() {
  const systemScheme = useSystemColorScheme();
  const themeContext = useContext(ThemeContext);

  return themeContext?.theme || systemScheme || 'light';
}
