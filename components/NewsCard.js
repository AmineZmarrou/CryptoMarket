import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NewsCard({ article, onPress }) {
    // Parsing date roughly for display
    const date = new Date(article.published_at).toLocaleDateString();
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <Pressable style={styles.card} onPress={onPress}>
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>{article.title}</Text>
                <Text style={styles.summary} numberOfLines={2}>{article.content}</Text>
                <View style={styles.footer}>
                    <Text style={styles.source}>{article.source}</Text>
                    <Text style={styles.date}>{date}</Text>
                </View>
            </View>
            {article.image ? (
                <Image source={{ uri: article.image }} style={styles.image} resizeMode="cover" />
            ) : (
                <View style={styles.imageFallback}>
                    <Text style={styles.fallbackText}>News</Text>
                </View>
            )}
        </Pressable>
    );
}

const createStyles = (colors) => StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    content: {
        flex: 1,
        marginRight: 16,
        justifyContent: 'center', // Changed from space-between to center or flex-start
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
        lineHeight: 22,
    },
    summary: {
        fontSize: 14,
        color: colors.textMuted,
        marginBottom: 12,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    source: {
        color: colors.tint,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    date: {
        color: colors.icon,
        fontSize: 12,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: colors.surfaceAlt,
    },
    imageFallback: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    fallbackText: {
        color: colors.textMuted,
        fontSize: 12,
        fontWeight: '600',
    },
});
