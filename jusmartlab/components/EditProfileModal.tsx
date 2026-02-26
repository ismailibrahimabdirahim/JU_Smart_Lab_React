import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Pressable,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
}

export function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
    const { user, updateProfile } = useAuth();
    const [fullName, setFullName] = useState(user?.name || '');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        setFullName(user?.name || '');
        setError('');
        setSuccess('');
        setLoading(false);
        onClose();
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        // Validation
        if (!fullName.trim()) {
            setError('Full name cannot be empty');
            return;
        }

        if (fullName.trim().length < 3) {
            setError('Full name must be at least 3 characters long');
            return;
        }

        if (fullName.trim().length > 50) {
            setError('Full name is too long. Maximum 50 characters allowed');
            return;
        }

        // Check if name contains only letters and spaces
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(fullName.trim())) {
            setError('Full name should contain only letters and spaces');
            return;
        }

        if (fullName.trim() === user?.name) {
            setError('Please enter a different name to update');
            return;
        }

        setLoading(true);

        try {
            const result = await updateProfile(fullName.trim());

            if (result.success) {
                setSuccess('Profile updated successfully!');
                setTimeout(() => {
                    handleClose();
                }, 2000);
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
                        <View style={styles.headerIconWrapper}>
                            <Ionicons name="person-circle" size={28} color="#2563eb" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>Edit Profile</Text>
                            <Text style={styles.subtitle}>Update your personal information</Text>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        {/* Full Name Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="Enter your full name"
                                    placeholderTextColor="#94a3b8"
                                    autoCapitalize="words"
                                    editable={!loading}
                                />
                            </View>
                            <Text style={styles.hint}>This name will be displayed across the admin dashboard</Text>
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
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={handleClose}
                            disabled={loading}
                        >
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
                                    <Text style={styles.submitBtnText}>Save Changes</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxWidth: 500,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        gap: 12,
    },
    headerIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0f172a',
    },
    subtitle: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 24,
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0f172a',
        letterSpacing: 0.3,
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
        fontSize: 15,
        color: '#0f172a',
        fontWeight: '500',
    },
    hint: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fef2f2',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#dc2626',
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
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748b',
    },
    submitBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#2563eb',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    submitBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
});
