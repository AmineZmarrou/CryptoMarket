import { useState, useContext, useMemo } from 'react';
import { StyleSheet, TextInput, Pressable, Alert, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, useRouter } from 'expo-router';
import { UserContext } from '@/src/context/UserContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ParticlesBackground } from '@/components/particles-background';

export default function SecurityScreen() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { changePassword, changeEmail, reauthenticate, user } = useContext(UserContext);
    const router = useRouter();
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const styles = useMemo(() => createStyles(colors), [colors]);

    const handleUpdateEmail = async () => {
        const trimmedEmail = newEmail.trim();
        if (!trimmedEmail) {
            Alert.alert('Error', 'Please enter your new email');
            return;
        }
        if (trimmedEmail === user?.email) {
            Alert.alert('Error', 'New email must be different');
            return;
        }

        setIsLoading(true);
        try {
            await changeEmail(trimmedEmail);
            Alert.alert(
                'Verify New Email',
                'We sent a verification link to your new email. Please confirm it to finish the change.'
            );
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login' || error.message.includes('auth/requires-recent-login')) {
                Alert.alert(
                    'Security Check Required',
                    'To change your email, you need to have logged in recently. Please log out and log back in to verify your identity.',
                    [
                        {
                            text: 'Log Out Now',
                            onPress: async () => {
                                router.dismissAll();
                                router.replace('/auth/login');
                            }
                        },
                        { text: 'Cancel', style: 'cancel' }
                    ]
                );
            } else {
                Alert.alert('Update Failed', error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!currentPassword) {
            Alert.alert('Error', 'Please enter your current password');
            return;
        }
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all password fields');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await reauthenticate(currentPassword);
            await changePassword(newPassword);
            Alert.alert('Success', 'Password updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login' || error.message.includes('auth/requires-recent-login')) {
                Alert.alert(
                    'Security Check Required',
                    'To change your password, you need to have logged in recently. Please log out and log back in to verify your identity.',
                    [
                        {
                            text: 'Log Out Now',
                            onPress: async () => {
                                router.dismissAll();
                                router.replace('/auth/login');
                            }
                        },
                        { text: 'Cancel', style: 'cancel' }
                    ]
                );
            } else {
                Alert.alert('Update Failed', error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ParticlesBackground />
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={24} color={colors.tint} />
                    <ThemedText style={{ color: colors.tint, marginLeft: 4 }}>Back</ThemedText>
                </Pressable>
                <ThemedText type="subtitle">Change Password</ThemedText>
                <View style={{ width: 60 }} />
            </View>

            <View style={styles.form}>
                <ThemedText style={styles.label}>New Email</ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="Enter new email"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={newEmail}
                    onChangeText={setNewEmail}
                />
                <Pressable
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleUpdateEmail}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <ThemedText style={styles.buttonText}>Update Email</ThemedText>
                    )}
                </Pressable>

                <ThemedText style={styles.label}>Current Password</ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="Enter current password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                />
                <Link href="/auth/login" asChild>
                    <Pressable style={({ pressed }) => [styles.forgotLink, pressed && styles.pressed]}>
                        <ThemedText style={styles.forgotText}>Forgot password?</ThemedText>
                    </Pressable>
                </Link>

                <ThemedText style={styles.label}>New Password</ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                />

                <ThemedText style={styles.label}>Confirm Password</ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                <Pressable
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleUpdatePassword}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <ThemedText style={styles.buttonText}>Update Password</ThemedText>
                    )}
                </Pressable>

                <ThemedText style={styles.helperText}>
                    Note: Your current password is required to change your password.
                </ThemedText>
            </View>
        </ThemedView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.background,
        position: 'relative',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
        marginTop: 12,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 70,
    },
    form: {
        gap: 16,
    },
    label: {
        marginBottom: 8,
        fontWeight: 'bold',
        color: colors.text,
    },
    input: {
        backgroundColor: colors.surfaceAlt,
        color: colors.text,
        padding: 16,
        borderRadius: 14,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    button: {
        backgroundColor: colors.tint,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 16,
        shadowColor: colors.tint,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    helperText: {
        color: colors.textMuted,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 16,
    },
    forgotLink: {
        alignSelf: 'flex-end',
        marginTop: -4,
    },
    forgotText: {
        color: colors.tint,
        fontSize: 12,
        fontWeight: '600',
    },
});
