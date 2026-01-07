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

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login, loginWithGoogle, resetPassword } = useContext(UserContext);
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const styles = useMemo(() => createStyles(colors), [colors]);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
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

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert('Reset Password', 'Please enter your email first.');
            return;
        }

        setIsLoading(true);
        try {
            await resetPassword(email);
            Alert.alert('Reset Password', 'Password reset email sent.');
        } catch (error: any) {
            Alert.alert('Reset Password Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ParticlesBackground />
            <ThemedView style={styles.content} lightColor="transparent" darkColor="transparent">
                <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>

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

                <Pressable style={styles.forgotButton} onPress={handleForgotPassword} disabled={isLoading}>
                    <ThemedText style={styles.forgotText}>Forgot password?</ThemedText>
                </Pressable>

                <Pressable style={styles.button} onPress={handleLogin} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <ThemedText style={styles.buttonText}>Log In</ThemedText>
                    )}
                </Pressable>

                <Pressable style={styles.googleButton} onPress={handleGoogleLogin} disabled={isLoading}>
                    <ThemedText style={styles.googleButtonText}>Continue with Google</ThemedText>
                </Pressable>

                <Link href="/auth/register" asChild>
                    <Pressable style={styles.linkButton}>
                        <ThemedText style={styles.linkText}>Don't have an account? Sign Up</ThemedText>
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
    linkButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: colors.tint,
    },
    forgotButton: {
        alignSelf: 'flex-end',
        marginBottom: 8,
    },
    forgotText: {
        color: colors.tint,
        fontSize: 14,
    },
});
