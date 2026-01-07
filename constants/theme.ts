/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#2563EB';
const tintColorDark = '#3B82F6';

export const Colors = {
  light: {
    text: '#0B1220',
    textMuted: '#6B7280',
    background: '#F5F7FA',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F4F8',
    tint: tintColorLight,
    icon: '#667085',
    tabIconDefault: '#A0AEC0',
    tabIconSelected: tintColorLight,
    card: '#FFFFFF',
    border: '#E2E8F0',
    success: '#16A34A',
    danger: '#DC2626',
  },
  dark: {
    text: '#E6EDF3',
    textMuted: '#9AA6B2',
    background: '#0B0F14',
    surface: '#131A22',
    surfaceAlt: '#0F141B',
    tint: tintColorDark,
    icon: '#9AA6B2',
    tabIconDefault: '#6B7785',
    tabIconSelected: tintColorDark,
    card: '#121923',
    border: '#232B36',
    success: '#22C55E',
    danger: '#F43F5E',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
