import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, RefreshControl, Dimensions, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchMarketData } from '@/src/services/cryptoApi';
import CryptoListItem from '@/components/CryptoListItem';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { ParticlesBackground } from '@/components/particles-background';

export default function MarketScreen() {
    const [coins, setCoins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const styles = useMemo(() => createStyles(colors), [colors]);

    const toRgba = (hex: string, opacity = 1) => {
        const value = hex.replace('#', '');
        const bigint = parseInt(value, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const loadMarket = async () => {
        const data = await fetchMarketData();
        setCoins(data);
        setLoading(false);
    };

    useEffect(() => {
        loadMarket();
        // Auto-refresh every 60 seconds
        const interval = setInterval(loadMarket, 60000);
        return () => clearInterval(interval);
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMarket();
        setRefreshing(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ParticlesBackground />
            <ThemedView style={styles.header}>
                <ThemedText type="title" style={styles.headerTitle}>Market</ThemedText>
                <ThemedText style={styles.headerSubtitle}>Live prices across top coins</ThemedText>
            </ThemedView>

            <View style={styles.chartContainer}>
                <ThemedText type="subtitle" style={styles.chartTitle}>Global Trend (7d)</ThemedText>
                <LineChart
                    data={{
                        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                        datasets: [
                            {
                                data: [
                                    Math.random() * 100,
                                    Math.random() * 100,
                                    Math.random() * 100,
                                    Math.random() * 100,
                                    Math.random() * 100,
                                    Math.random() * 100,
                                    Math.random() * 100
                                ]
                            }
                        ]
                    }}
                    width={Dimensions.get("window").width - 32} // from react-native
                    height={180}
                    yAxisLabel="$"
                    yAxisSuffix="k"
                    yAxisInterval={1} // optional, defaults to 1
                    chartConfig={{
                        backgroundColor: colors.card,
                        backgroundGradientFrom: colors.card,
                        backgroundGradientTo: colors.surfaceAlt,
                        decimalPlaces: 0,
                        color: (opacity = 1) => toRgba(colors.tint, opacity),
                        labelColor: (opacity = 1) => toRgba(colors.textMuted, opacity),
                        style: {
                            borderRadius: 18
                        },
                        propsForDots: {
                            r: "4",
                            strokeWidth: "2",
                            stroke: colors.tint
                        }
                    }}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 18
                    }}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={coins}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                    <CryptoListItem
                        coin={item}
                        onPress={() =>
                            router.push({
                                pathname: "/market/[id]",
                                params: { id: item.id }
                            })
                        }
                    />
                )}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
                    }
                    contentContainerStyle={styles.listContent}
                />
            )}
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
    headerTitle: {
        letterSpacing: 0.2,
    },
    headerSubtitle: {
        color: colors.textMuted,
        marginTop: 6,
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: 10,
        paddingTop: 14,
        backgroundColor: colors.background,
    },
    chartTitle: {
        alignSelf: 'flex-start',
        paddingHorizontal: 20,
        marginBottom: 8,
        color: colors.textMuted,
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    listContent: {
        paddingBottom: 24,
    },
});
