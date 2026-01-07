import { useState, useContext, useMemo } from 'react';
import { StyleSheet, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { UserContext } from '@/src/context/UserContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ParticlesBackground } from '@/components/particles-background';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { register, loginWithGoogle } = useContext(UserContext);
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const styles = useMemo(() => createStyles(colors), [colors]);

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await register(email, password);
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await loginWithGoogle();
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Google Sign-In Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ParticlesBackground />
            <ThemedView style={styles.content} lightColor="transparent" darkColor="transparent">
                <ThemedText type="title" style={styles.title}>Create Account</ThemedText>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor={colors.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />

                <Pressable style={styles.button} onPress={handleRegister} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
                    )}
                </Pressable>

                <Pressable style={styles.googleButton} onPress={handleGoogleLogin} disabled={isLoading}>
                    <ThemedText style={styles.googleButtonText}>Continue with Google</ThemedText>
                </Pressable>

                <Link href="/auth/login" asChild>
                    <Pressable style={styles.linkButton}>
                        <ThemedText style={styles.linkText}>Already have an account? Log In</ThemedText>
                    </Pressable>
                </Link>
            </ThemedView>
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
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 32,
        fontSize: 32,
    },
    input: {
        backgroundColor: colors.surfaceAlt,
        color: colors.text,
        padding: 16,
        borderRadius: 14,
        marginBottom: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    button: {
        backgroundColor: colors.tint,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: colors.tint,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: colors.tint,
    },
    googleButton: {
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    googleButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
