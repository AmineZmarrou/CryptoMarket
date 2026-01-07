import { useState, useEffect, useContext, useMemo } from 'react';
import { StyleSheet, FlatList, TextInput, Pressable, View, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserContext } from '@/src/context/UserContext';
import { db } from '@/src/config/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Link } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ParticlesBackground } from '@/components/particles-background';

interface Message {
    id: string;
    text: string;
    userId: string;
    userEmail: string;
    createdAt: Timestamp | null;
}

export default function CommunityScreen() {
    const { user, loading: authLoading } = useContext(UserContext);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [messagesLoading, setMessagesLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const styles = useMemo(() => createStyles(colors), [colors]);

    useEffect(() => {
        // Real-time listener
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));
            setMessages(msgs);
            setMessagesLoading(false);
        }, (error) => {
            console.error("Firestore Error:", error);
            setMessagesLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSend = async () => {
        if (!user) {
            Alert.alert("Authentication Required", "You must be logged in to post.");
            return;
        }
        if (newMessage.trim() === '') return;

        setSending(true);
        try {
            await addDoc(collection(db, 'messages'), {
                text: newMessage.trim(),
                userId: user.uid,
                userEmail: user.email,
                createdAt: serverTimestamp(),
            });
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            Alert.alert("Error", "Failed to send message.");
        } finally {
            setSending(false);
        }
    };

    if (authLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <ThemedView style={styles.centerContent}>
                    <ActivityIndicator size="large" color={colors.tint} />
                </ThemedView>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <ParticlesBackground />
                <ThemedView style={styles.centerContent} lightColor="transparent" darkColor="transparent">
                    <ThemedText type="title" style={{ marginBottom: 16 }}>Community</ThemedText>
                    <ThemedText style={styles.subtitle}>Join the conversation!</ThemedText>
                    <ThemedText style={styles.description}>
                        Log in to see what others are saying and share your own crypto tips.
                    </ThemedText>
                    <Link href="/auth/login" asChild>
                        <Pressable style={styles.button}>
                            <ThemedText style={styles.buttonText}>Sign Over / Log In</ThemedText>
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
                <ThemedText type="title">Community</ThemedText>
                <ThemedText style={styles.headerSubtitle}>Share tips, track sentiment</ThemedText>
            </ThemedView>

            {messagesLoading ? (
                <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={messages}
                    keyExtractor={item => item.id}
                    inverted // Show newest at bottom if we want chat style, but standard feed usually newest at top. Let's keep newest at top.
                    renderItem={({ item }) => (
                        <View style={styles.messageCard}>
                            <View style={styles.messageHeader}>
                                <ThemedText style={styles.username}>
                                    {item.userEmail?.split('@')[0] || 'Anonymous'}
                                </ThemedText>
                                <ThemedText style={styles.time}>
                                    {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                </ThemedText>
                            </View>
                            <ThemedText style={styles.messageText}>{item.text}</ThemedText>
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
                <ThemedView style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Share your thought... (e.g. Buy BTC!)"
                        placeholderTextColor={colors.textMuted}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                    />
                    <Pressable
                        style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!newMessage.trim() || sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <IconSymbol name="paperplane.fill" size={20} color="#fff" />
                        )}
                    </Pressable>
                </ThemedView>
            </KeyboardAvoidingView>
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
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
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
        shadowColor: colors.tint,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 20,
        paddingBottom: 80,
    },
    messageCard: {
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
        borderLeftWidth: 3,
        borderLeftColor: colors.tint,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    username: {
        fontWeight: 'bold',
        color: colors.tint,
        fontSize: 14,
    },
    time: {
        color: colors.textMuted,
        fontSize: 12,
    },
    messageText: {
        color: colors.text,
        fontSize: 15,
        lineHeight: 22,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        paddingBottom: Platform.OS === 'ios' ? 24 : 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: colors.surfaceAlt,
        color: colors.text,
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 12,
        fontSize: 16,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sendButton: {
        backgroundColor: colors.tint,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: colors.surfaceAlt,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
