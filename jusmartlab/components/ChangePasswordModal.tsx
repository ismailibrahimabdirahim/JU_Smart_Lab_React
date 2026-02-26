import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

interface ChangePasswordModalProps {
    visible: boolean;
    onClose: () => void;
}

export function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
    const { changePassword } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        // Enhanced validation with specific messages
        if (!currentPassword.trim()) {
            setError('Please enter your current password');
            return;
        }

        if (!newPassword.trim()) {
            setError('Please enter a new password');
            return;
        }

        if (!confirmPassword.trim()) {
            setError('Please confirm your new password');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            return;
        }

        if (newPassword.length > 50) {
            setError('Password is too long. Maximum 50 characters allowed');
            return;
        }

        if (newPassword === currentPassword) {
            setError('New password must be different from current password');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New password and confirmation do not match');
            return;
        }

        // Check for password strength
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword); // Corrected regex for lowercase
        const hasNumber = /[0-9]/.test(newPassword);

        if (newPassword.length >= 8 && (!hasUpperCase || !hasLowerCase || !hasNumber)) {
            setError('For strong security, use uppercase, lowercase, and numbers');
            return;
        }

        setLoading(true);

        try {
            const result = await changePassword(currentPassword, newPassword);

            if (result.success) {
                setSuccess('Password updated successfully! You can now login with your new password.');
                setTimeout(() => {
                    handleClose();
                }, 2500);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <Pressable style={styles.overlay} onPress={handleClose}>
                <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="key" size={24} color="#fff" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={styles.title}>Change Password</Text>
                            <Text style={styles.subtitle}>Update your account security</Text>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {/* Body */}
                    <View style={styles.body}>
                        {/* Current Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Current Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholder="Enter current password"
                                    placeholderTextColor="#94a3b8"
                                    secureTextEntry={!showCurrent}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeBtn}>
                                    <Ionicons
                                        name={showCurrent ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* New Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>New Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="shield-checkmark-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Enter new password"
                                    placeholderTextColor="#94a3b8"
                                    secureTextEntry={!showNew}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                                    <Ionicons
                                        name={showNew ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.hint}>Must be at least 6 characters</Text>
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm New Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm new password"
                                    placeholderTextColor="#94a3b8"
                                    secureTextEntry={!showConfirm}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                                    <Ionicons
                                        name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Error Message */}
                        {error ? (
                            <View style={styles.errorContainer}>
                                <View style={styles.errorIconWrapper}>
                                    <Ionicons name="warning" size={20} color="#dc2626" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.errorTitle}>Error</Text>
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            </View>
                        ) : null}

                        {/* Success Message */}
                        {success ? (
                            <View style={styles.successContainer}>
                                <View style={styles.successIconWrapper}>
                                    <Ionicons name="checkmark-circle" size={20} color="#059669" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.successTitle}>Success!</Text>
                                    <Text style={styles.successText}>{success}</Text>
                                </View>
                            </View>
                        ) : null}
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark" size={20} color="#fff" />
                                    <Text style={styles.submitBtnText}>Update Password</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxWidth: 500,
        backgroundColor: '#fff',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 40,
        elevation: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#2563eb',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    body: {
        padding: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 15,
        color: '#0f172a',
    },
    eyeBtn: {
        padding: 8,
    },
    hint: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 6,
        marginLeft: 4,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fef2f2',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#dc2626',
        marginTop: 8,
        gap: 12,
    },
    errorIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#991b1b',
        marginBottom: 4,
    },
    errorText: {
        fontSize: 13,
        color: '#dc2626',
        lineHeight: 18,
    },
    successContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f0fdf4',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#059669',
        marginTop: 8,
        gap: 12,
    },
    successIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#d1fae5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#065f46',
        marginBottom: 4,
    },
    successText: {
        fontSize: 13,
        color: '#059669',
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        padding: 24,
        paddingTop: 0,
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    cancelBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
    },
    submitBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#2563eb',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    submitBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
});
