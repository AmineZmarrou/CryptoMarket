import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchNews } from '@/src/services/newsApi';
import NewsCard from '@/components/NewsCard';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ParticlesBackground } from '@/components/particles-background';

export default function HomeScreen() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const loadNews = async () => {
    const data = await fetchNews();
    setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadNews, 60000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const handlePress = (article: any) => {
    router.push({
      pathname: "/news/[id]",
      params: {
        id: article.id,
        title: article.title,
        source: article.source,
        image: article.image,
        published_at: article.published_at,
        content: article.content
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ParticlesBackground />
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Crypto News</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Latest moves and market pulse</ThemedText>
      </ThemedView>

      {loading ? (
        <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <NewsCard article={item} onPress={() => handlePress(item)} />
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
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: colors.textMuted,
    marginTop: 6,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 8,
  },
});
