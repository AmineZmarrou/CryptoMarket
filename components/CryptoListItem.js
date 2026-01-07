import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CryptoListItem({ coin, onPress }) {
    const isPositive = coin.price_change_percentage_24h >= 0;
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <Pressable style={styles.container} onPress={onPress}>
            <View style={styles.left}>
                <Text style={styles.rank}>{coin.market_cap_rank}</Text>
                <Image source={{ uri: coin.image }} style={styles.image} />
                <View style={styles.titlesWrapper}>
                    <Text style={styles.name}>{coin.name}</Text>
                    <Text style={styles.symbol}>{coin.symbol.toUpperCase()}</Text>
                </View>
            </View>
            <View style={styles.right}>
                <Text style={styles.price}>
                    ${coin.current_price.toLocaleString()}
                </Text>
                <Text style={[styles.change, { color: isPositive ? colors.success : colors.danger }]}>
                    {isPositive ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                </Text>
            </View>
        </Pressable>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 6,
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rank: {
        color: colors.textMuted,
        marginRight: 8,
        fontWeight: 'bold',
        width: 20,
    },
    image: {
        height: 32,
        width: 32,
        marginRight: 8,
        borderRadius: 16,
    },
    titlesWrapper: {
        flexDirection: 'column',
    },
    name: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    symbol: {
        color: colors.textMuted,
        fontSize: 14,
        textTransform: 'uppercase',
    },
    right: {
        alignItems: 'flex-end',
    },
    price: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    change: {
        fontSize: 14,
        marginTop: 2,
    },
});
