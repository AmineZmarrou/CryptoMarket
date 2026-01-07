import { useLocalSearchParams, Stack } from 'expo-router';
import { StyleSheet, ScrollView, Image, TouchableOpacity, Share } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMemo } from 'react';
import { ParticlesBackground } from '@/components/particles-background';

export default function ArticleDetailScreen() {
    const params = useLocalSearchParams();
    const { title, source, image, content, published_at } = params;
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const styles = useMemo(() => createStyles(colors), [colors]);

    const onShare = async () => {
        try {
            await Share.share({
                message: `${title} - Read more on CryptoNews`,
            });
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ParticlesBackground />
            <Stack.Screen options={{
                headerShown: true,
                title: '',
                headerTintColor: colors.text,
                headerStyle: { backgroundColor: colors.surface },
                headerRight: () => (
                    <TouchableOpacity onPress={onShare}>
                        <IconSymbol name="square.and.arrow.up" size={24} color={colors.text} />
                    </TouchableOpacity>
                )
            }} />

            <ScrollView contentContainerStyle={styles.content}>
                {image && <Image source={{ uri: image }} style={styles.image} />}

                <ThemedView style={styles.body}>
                    <ThemedText type="title" style={styles.title}>{title}</ThemedText>

                    <ThemedView style={styles.meta}>
                        <ThemedText style={styles.source}>{source}</ThemedText>
                        <ThemedText style={styles.date}>{new Date(published_at).toLocaleDateString()}</ThemedText>
                    </ThemedView>

                    <ThemedText style={styles.text}>
                        {content || "No content available for this article."}
                    </ThemedText>
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
    content: {
        paddingBottom: 40,
    },
    image: {
        width: '100%',
        height: 250,
        backgroundColor: colors.surfaceAlt,
    },
    body: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
        lineHeight: 32,
    },
    meta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    source: {
        color: colors.tint,
        fontWeight: 'bold',
    },
    date: {
        color: colors.textMuted,
    },
    text: {
        fontSize: 18,
        lineHeight: 28,
        color: colors.text,
    },
});
