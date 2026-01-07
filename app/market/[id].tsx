import { useEffect, useMemo, useState, useContext } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchCoinDetails } from '@/src/services/cryptoApi';
import { UserContext } from '@/src/context/UserContext';
import { db } from '@/src/config/firebase';
import { ParticlesBackground } from '@/components/particles-background';

export default function MarketDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useContext(UserContext);
  const [coin, setCoin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [quantity, setQuantity] = useState('');
  const [saving, setSaving] = useState(false);

  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    const loadCoin = async () => {
      if (!id || typeof id !== 'string') {
        return;
      }
      setLoading(true);
      setLoadError('');
      const data = await fetchCoinDetails(id);
      setCoin(data);
      if (!data) {
        setLoadError('Unable to load this asset right now. Please try again.');
      }
      setLoading(false);
    };
    loadCoin();
  }, [id]);

  const handleAddToWallet = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to add holdings.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => router.push('/auth/login') },
      ]);
      return;
    }

    const qty = parseFloat(quantity.replace(',', '.'));
    if (!qty || qty <= 0) {
      Alert.alert('Invalid Quantity', 'Enter a valid amount.');
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      const snap = await getDoc(docRef);
      const existing = snap.exists() ? snap.data().portfolio || {} : {};
      const currentQty = parseFloat(existing[id] || 0);
      const nextQty = currentQty + qty;

      await setDoc(
        docRef,
        {
          portfolio: {
            ...existing,
            [id]: nextQty,
          },
        },
        { merge: true }
      );

      setQuantity('');
      Alert.alert('Added', 'Holding added to wallet.');
      router.push('/(tabs)/wallet');
    } catch (error) {
      Alert.alert('Error', 'Failed to add holding.');
    } finally {
      setSaving(false);
    }
  };

  const price = coin?.market_data?.current_price?.usd ?? null;
  const change = coin?.market_data?.price_change_percentage_24h ?? null;
  const marketCap = coin?.market_data?.market_cap?.usd ?? null;
  const volume = coin?.market_data?.total_volume?.usd ?? null;
  const isPositive = typeof change === 'number' ? change >= 0 : true;

  return (
    <SafeAreaView style={styles.container}>
      <ParticlesBackground />
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.surface },
        }}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : loadError ? (
        <View style={styles.center}>
          <ThemedText style={styles.errorText}>{loadError}</ThemedText>
          <Pressable style={styles.retryButton} onPress={() => router.replace(`/market/${id}`)}>
            <ThemedText style={styles.retryText}>Retry</ThemedText>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedView style={styles.heroCard}>
            <View style={styles.heroRow}>
              {coin?.image?.small ? (
                <Image source={{ uri: coin.image.small }} style={styles.coinImage} />
              ) : null}
              <View style={styles.heroText}>
                <ThemedText type="title" style={styles.coinName}>{coin?.name}</ThemedText>
                <ThemedText style={styles.coinSymbol}>{coin?.symbol?.toUpperCase()}</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.priceText}>
              {price ? `$${price.toLocaleString()}` : '--'}
            </ThemedText>
            <ThemedText style={[styles.changeText, { color: isPositive ? colors.success : colors.danger }]}>
              {typeof change === 'number' ? `${change.toFixed(2)}% (24h)` : '--'}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.statsCard}>
            <View style={styles.statRow}>
              <ThemedText style={styles.statLabel}>Market Cap</ThemedText>
              <ThemedText style={styles.statValue}>
                {marketCap ? `$${marketCap.toLocaleString()}` : '--'}
              </ThemedText>
            </View>
            <View style={styles.statRow}>
              <ThemedText style={styles.statLabel}>24h Volume</ThemedText>
              <ThemedText style={styles.statValue}>
                {volume ? `$${volume.toLocaleString()}` : '--'}
              </ThemedText>
            </View>
          </ThemedView>

          <ThemedView style={styles.buyCard}>
            <ThemedText style={styles.sectionTitle}>Add to Wallet</ThemedText>
            <ThemedText style={styles.sectionHint}>Enter quantity to track.</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
            <Pressable style={styles.actionButton} onPress={handleAddToWallet} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.actionButtonText}>Add Holding</ThemedText>
              )}
            </Pressable>
          </ThemedView>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      position: 'relative',
      overflow: 'hidden',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    errorText: {
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: 12,
    },
    retryButton: {
      backgroundColor: colors.tint,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 12,
    },
    retryText: {
      color: '#fff',
      fontWeight: '600',
    },
    content: {
      padding: 20,
      gap: 16,
    },
    heroCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },
    heroRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    heroText: {
      flex: 1,
    },
    coinImage: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surfaceAlt,
    },
    coinName: {
      fontSize: 26,
    },
    coinSymbol: {
      color: colors.textMuted,
      marginTop: 2,
    },
    priceText: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    changeText: {
      fontSize: 14,
      fontWeight: '600',
    },
    statsCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statLabel: {
      color: colors.textMuted,
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    statValue: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    buyCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    sectionHint: {
      color: colors.textMuted,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
    },
    actionButton: {
      backgroundColor: colors.tint,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 4,
    },
    actionButtonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
  });
