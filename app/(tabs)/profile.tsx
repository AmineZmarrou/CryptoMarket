import { useContext, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemeContext } from '@/src/context/ThemeContext';
import { UserContext } from '@/src/context/UserContext';
import { ParticlesBackground } from '@/components/particles-background';

export default function ProfileScreen() {
  const { user, logout } = useContext(UserContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const router = useRouter();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Member';
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Logout Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ParticlesBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Profile</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Account, preferences, and security</ThemedText>
        </ThemedView>

        {user ? (
          <>
            <ThemedView style={styles.heroCard}>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>{initials}</ThemedText>
              </View>
              <View style={styles.heroInfo}>
                <ThemedText style={styles.displayName}>{displayName}</ThemedText>
                <ThemedText style={styles.email}>{user.email}</ThemedText>
                <ThemedText style={styles.badge}>Premium insights</ThemedText>
              </View>
            </ThemedView>

            <ThemedView style={styles.sectionCard}>
              <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
              <View style={styles.settingRow}>
                <ThemedText>Notifications</ThemedText>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.border, true: colors.tint }}
                  thumbColor={notificationsEnabled ? '#fff' : '#e2e8f0'}
                />
              </View>
              <View style={styles.settingRow}>
                <ThemedText>Theme ({theme === 'dark' ? 'Dark' : 'Light'})</ThemedText>
                <Switch
                  value={theme === 'dark'}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.border, true: colors.tint }}
                  thumbColor={theme === 'dark' ? '#fff' : '#e2e8f0'}
                />
              </View>
            </ThemedView>

            <ThemedView style={styles.sectionCard}>
              <ThemedText style={styles.sectionTitle}>Security</ThemedText>
              <Link href="/auth/security" asChild>
                <Pressable style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}>
                  <View style={styles.linkLeft}>
                    <IconSymbol name="shield.fill" size={18} color={colors.tint} />
                    <ThemedText>Account Security</ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
                </Pressable>
              </Link>
            </ThemedView>

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <IconSymbol name="arrow.right.square" size={18} color={colors.danger} />
              <ThemedText style={styles.logoutText}>Log Out</ThemedText>
            </Pressable>
          </>
        ) : (
          <ThemedView style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <IconSymbol name="person.circle.fill" size={56} color={colors.tint} />
            </View>
            <ThemedText style={styles.emptyTitle}>Welcome back</ThemedText>
            <ThemedText style={styles.emptyText}>
              Sign in to personalize alerts, sync preferences, and secure your wallet.
            </ThemedText>
            <Link href="/auth/login" asChild>
              <Pressable style={styles.primaryButton}>
                <ThemedText style={styles.primaryButtonText}>Sign In</ThemedText>
              </Pressable>
            </Link>
            <Link href="/auth/register" asChild>
              <Pressable style={styles.secondaryButton}>
                <ThemedText style={styles.secondaryButtonText}>Create Account</ThemedText>
              </Pressable>
            </Link>
          </ThemedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      position: 'relative',
      overflow: 'hidden',
    },
    content: {
      padding: 20,
      paddingBottom: 96,
      gap: 16,
    },
    header: {
      gap: 6,
    },
    headerSubtitle: {
      color: colors.textMuted,
    },
    heroCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatarText: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    heroInfo: {
      flex: 1,
      gap: 4,
    },
    displayName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    email: {
      color: colors.textMuted,
      fontSize: 13,
    },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: colors.surfaceAlt,
      color: colors.textMuted,
      fontSize: 12,
    },
    sectionCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 4,
    },
    sectionTitle: {
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: colors.textMuted,
      marginTop: 6,
    },
    settingRow: {
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    linkRow: {
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    linkLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    pressed: {
      opacity: 0.7,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingVertical: 14,
    },
    logoutText: {
      color: colors.danger,
      fontWeight: '600',
    },
    emptyCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      alignItems: 'center',
      gap: 12,
    },
    emptyIcon: {
      width: 84,
      height: 84,
      borderRadius: 42,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
    },
    emptyText: {
      color: colors.textMuted,
      textAlign: 'center',
    },
    primaryButton: {
      backgroundColor: colors.tint,
      borderRadius: 14,
      paddingHorizontal: 24,
      paddingVertical: 12,
      width: '100%',
      alignItems: 'center',
    },
    primaryButtonText: {
      color: '#fff',
      fontWeight: '600',
    },
    secondaryButton: {
      borderRadius: 14,
      paddingHorizontal: 24,
      paddingVertical: 12,
      width: '100%',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    secondaryButtonText: {
      color: colors.text,
      fontWeight: '600',
    },
  });
