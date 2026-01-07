import { useState, useEffect, useContext, useMemo } from 'react';
import { StyleSheet, Pressable, View, ActivityIndicator, Alert, ScrollView, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserContext } from '@/src/context/UserContext';
import { db } from '@/src/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { fetchMarketData } from '@/src/services/cryptoApi';
import { Link } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ParticlesBackground } from '@/components/particles-background';

export default function WalletScreen() {
    const { user, loading: authLoading } = useContext(UserContext);
    const [holdings, setHoldings] = useState<Record<string, number>>({});
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [coins, setCoins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const styles = useMemo(() => createStyles(colors), [colors]);

    const loadData = async () => {
        try {
            // 1. Fetch Market Prices
            const marketData = await fetchMarketData();
            const newPrices: Record<string, number> = {};
            marketData.forEach((coin: any) => {
                newPrices[coin.id] = coin.current_price;
            });
            setCoins(marketData);
            setPrices(newPrices);

            // 2. Fetch User Holdings if logged in
            if (user) {
                console.log("Fetching portfolio for user:", user.uid);
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    console.log("Found portfolio data:", docSnap.data().portfolio);
                    setHoldings(docSnap.data().portfolio || {});
                } else {
                    console.log("No portfolio document found.");
                    setHoldings({});
                }
            } else {
                setHoldings({});
            }
        } catch (error) {
            console.error("Error loading wallet data:", error);
            Alert.alert("Error", "Failed to load portfolio data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            loadData();
        }
    }, [user, authLoading]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const calculateTotal = () => {
        return Object.keys(holdings).reduce((total, coinId) => {
            const qty = Number(holdings[coinId] || 0);
            const price = prices[coinId] || 0;
            return total + qty * price;
        }, 0);
    };

    const totalValue = calculateTotal();
    const totalValueText = `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const balanceFontSize = totalValueText.length > 12 ? 28 : totalValueText.length > 9 ? 32 : 38;
    const balanceLineHeight = balanceFontSize + 8;

    if (authLoading || loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ParticlesBackground />
                <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 50 }} />
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <ParticlesBackground />
                <ThemedView style={styles.centerContent} lightColor="transparent" darkColor="transparent">
                    <ThemedText type="title" style={{ marginBottom: 16 }}>My Portfolio</ThemedText>
                    <ThemedText style={styles.subtitle}>Track your assets</ThemedText>
                    <ThemedText style={styles.description}>
                        Log in to manage your crypto portfolio and track your total wealth in real-time.
                    </ThemedText>
                    <Link href="/auth/login" asChild>
                        <Pressable style={styles.button}>
                            <ThemedText style={styles.buttonText}>Log In to Start</ThemedText>
                        </Pressable>
                    </Link>
                </ThemedView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ParticlesBackground />
            <ThemedView style={styles.header} lightColor="transparent" darkColor="transparent">
                <ThemedText type="title">Wallet</ThemedText>
                <ThemedText style={styles.headerSubtitle}>Track your holdings</ThemedText>
            </ThemedView>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />}
            >
                <ThemedView style={styles.balanceCard} lightColor="transparent" darkColor="transparent">
                    <ThemedText style={styles.balanceLabel}>Total Balance</ThemedText>
                    <ThemedText
                        style={[styles.balanceValue, { fontSize: balanceFontSize, lineHeight: balanceLineHeight }]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.45}
                    >
                        {totalValueText}
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.assetsList} lightColor="transparent" darkColor="transparent">
                    <ThemedText type="subtitle" style={styles.assetsTitle}>Your Assets</ThemedText>

                    {Object.keys(holdings).length === 0 ? (
                        <ThemedView style={styles.emptyState}>
                            <ThemedText style={styles.emptyText}>No assets yet.</ThemedText>
                            <ThemedText style={styles.emptyHint}>Add holdings from Market.</ThemedText>
                        </ThemedView>
                    ) : (
                        Object.entries(holdings).map(([coinId, qty]) => {
                            const coin = coins.find((item) => item.id === coinId);
                            const price = prices[coinId] || 0;
                            const value = Number(qty || 0) * price;

                            return (
                                <ThemedView key={coinId} style={styles.assetRow}>
                                    <View style={styles.assetInfo}>
                                        <ThemedText style={styles.assetSymbol}>
                                            {coin?.symbol?.toUpperCase() || coinId}
                                        </ThemedText>
                                        <ThemedText style={styles.assetName}>{coin?.name || 'Unknown'}</ThemedText>
                                    </View>

                                    <View style={styles.assetMeta}>
                                        <ThemedText style={styles.assetQty}>
                                            {Number(qty).toLocaleString()} {coin?.symbol?.toUpperCase() || ''}
                                        </ThemedText>
                                        <ThemedText style={styles.assetValue}>
                                            ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </ThemedText>
                                    </View>
                                </ThemedView>
                            );
                        })
                    )}
                </ThemedView>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        position: 'relative',
        overflow: 'hidden',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerSubtitle: {
        color: colors.textMuted,
        marginTop: 6,
    },
    scrollContent: {
        padding: 20,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    balanceCard: {
        padding: 24,
        backgroundColor: colors.card,
        borderRadius: 22,
        marginBottom: 24,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    balanceLabel: {
        color: colors.textMuted,
        fontSize: 14,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    balanceValue: {
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        width: '100%',
        paddingHorizontal: 6,
    },
    assetsList: {
        gap: 16,
    },
    assetsTitle: {
        marginBottom: 12,
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    emptyState: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    emptyText: {
        color: colors.text,
        fontWeight: '600',
    },
    emptyHint: {
        color: colors.textMuted,
        marginTop: 6,
    },
    assetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
    },
    assetInfo: {
        flex: 1,
    },
    assetSymbol: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    assetName: {
        color: colors.textMuted,
        fontSize: 13,
        marginTop: 4,
    },
    assetMeta: {
        alignItems: 'flex-end',
    },
    assetQty: {
        color: colors.textMuted,
        fontSize: 13,
    },
    assetValue: {
        color: colors.tint,
        fontSize: 15,
        fontWeight: '700',
        marginTop: 4,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: colors.text,
    },
    description: {
        textAlign: 'center',
        color: colors.textMuted,
        marginBottom: 32,
        lineHeight: 22,
    },
    button: {
        backgroundColor: colors.tint,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 24,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
