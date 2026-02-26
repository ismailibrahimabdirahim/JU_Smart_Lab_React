import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { EditProfileModal } from '@/components/EditProfileModal';

// --- Theme Colors ---
const SIDEBAR_BG = '#0f172a';
const SIDEBAR_ACTIVE = '#2563eb';
const BG_COLOR = '#F8FAFC';

export default function SuperAdminProfile() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1000;

    const [activeTab, setActiveTab] = useState('profile');
    const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);

    const handleLogout = () => {
        logout();
        router.replace('/');
    };

    const SidebarItem = ({ icon, label, id, target }: any) => {
        const active = activeTab === id;
        return (
            <TouchableOpacity
                style={[styles.sidebarItem, active && styles.sidebarItemActive]}
                onPress={() => {
                    setActiveTab(id);
                    if (target) router.push(target);
                }}
            >
                <Ionicons name={icon} size={22} color={active ? "#fff" : "rgba(255,255,255,0.6)"} />
                <Text style={[styles.sidebarItemText, active && styles.sidebarItemTextActive]}>{label}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Sidebar */}
            <View style={styles.sidebar}>
                <View style={styles.sidebarBrand}>
                    <View style={styles.brandLogo}>
                        <Image
                            source={require('@/assets/images/ju-logo.png')}
                            style={{ width: 32, height: 32 }}
                            resizeMode="contain"
                        />
                    </View>
                    <View>
                        <Text style={styles.brandTitle}>JU Smart Lab</Text>
                        <Text style={styles.brandSubtitle}>SUPER ADMIN PANEL</Text>
                    </View>
                </View>

                <View style={styles.sidebarContent}>
                    <SidebarItem icon="grid" label="Dashboard" id="dashboard" target="/(superadmin)/dashboard" />
                    <SidebarItem icon="document-text" label="Manage Reports" id="reports" target="/(superadmin)/reports" />
                    <SidebarItem icon="people" label="Manage Admins" id="admins" target="/(superadmin)/admins" />
                    <SidebarItem icon="person" label="Profile" id="profile" />
                    <SidebarItem icon="settings" label="System Settings" id="settings" target="/(superadmin)/settings" />
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.main}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>System Super Admin Profile</Text>
                    <View style={styles.headerRight}>
                        <Ionicons name="sunny-outline" size={20} color="#64748b" style={{ marginRight: 16 }} />
                        <View style={styles.uniTag}><Text style={styles.uniText}>Jazeera University</Text></View>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.contentArea}>
                    <View style={styles.profileMainContent}>
                        {/* Welcome Banner */}
                        <View style={styles.profileBanner}>
                            <View style={styles.profileBannerIcon}>
                                <Ionicons name="shield-checkmark" size={32} color="#fff" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.profileWelcome}>Master Access Portal</Text>
                                <Text style={styles.profileWelcomeSub}>
                                    You are currently logged in with System Super Admin privileges. You have full control over university labs, administrator accounts, and system-wide settings.
                                </Text>
                            </View>
                            <View style={styles.profileAvatarLarge}>
                                <Text style={styles.profileAvatarText}>SA</Text>
                            </View>
                        </View>

                        {/* Info Card */}
                        <View style={styles.profileCard}>
                            <View style={styles.profileCardHeader}>
                                <View style={styles.profileCardIconWrapper}>
                                    <Ionicons name="information-circle" size={20} color="#2563eb" />
                                </View>
                                <Text style={styles.profileCardTitle}>Account Information</Text>
                                <TouchableOpacity style={styles.editBtn} onPress={() => setEditProfileModalVisible(true)}>
                                    <Ionicons name="create-outline" size={18} color="#2563eb" />
                                    <Text style={styles.editBtnText}>Edit Name</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.profileInfoGrid}>
                                <View style={styles.profileInfoItem}>
                                    <Text style={styles.profileInfoLabel}>ACCOUNT HOLDER</Text>
                                    <Text style={styles.profileInfoValue}>{user?.name || 'Super Admin'}</Text>
                                </View>

                                <View style={styles.profileInfoItem}>
                                    <Text style={styles.profileInfoLabel}>SYSTEM EMAIL</Text>
                                    <Text style={styles.profileInfoValue}>{user?.email || 'super@ju.edu'}</Text>
                                </View>

                                <View style={styles.profileInfoItem}>
                                    <Text style={styles.profileInfoLabel}>AUTHORIZATION LEVEL</Text>
                                    <View style={styles.roleBadge}>
                                        <Text style={styles.roleBadgeText}>ROOT ACCESS / SUPER ADMIN</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Security Card */}
                        <View style={styles.profileCard}>
                            <View style={styles.profileCardHeader}>
                                <View style={styles.profileCardIconWrapper}>
                                    <Ionicons name="lock-closed" size={20} color="#10b981" />
                                </View>
                                <Text style={styles.profileCardTitle}>System Security</Text>
                            </View>

                            <View style={styles.securityItem}>
                                <View style={styles.securityIcon}>
                                    <Ionicons name="key" size={20} color="#f59e0b" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.securityTitle}>Master Password</Text>
                                    <Text style={styles.securitySubtitle}>Maintain strong encryption for your root account.</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.updatePasswordBtn}
                                    onPress={() => setPasswordModalVisible(true)}
                                >
                                    <Text style={styles.updatePasswordBtnText}>Change Password</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>

            <ChangePasswordModal
                visible={passwordModalVisible}
                onClose={() => setPasswordModalVisible(false)}
            />
            <EditProfileModal
                visible={editProfileModalVisible}
                onClose={() => setEditProfileModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: 'row', backgroundColor: BG_COLOR },
    sidebar: { width: 260, backgroundColor: SIDEBAR_BG, padding: 24 },
    sidebarBrand: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 48 },
    brandLogo: { width: 40, height: 40, borderRadius: 10, backgroundColor: SIDEBAR_ACTIVE, alignItems: 'center', justifyContent: 'center' },
    brandTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
    brandSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    sidebarContent: { flex: 1, gap: 8 },
    sidebarItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, gap: 12 },
    sidebarItemActive: { backgroundColor: SIDEBAR_ACTIVE },
    sidebarItemText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
    sidebarItemTextActive: { color: '#fff' },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, marginTop: 'auto' },
    logoutText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
    main: { flex: 1 },
    header: { height: 80, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    uniTag: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#f1f5f9', borderRadius: 6 },
    uniText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    contentArea: { flex: 1, padding: 32 },
    profileMainContent: { width: '100%', gap: 24 },
    profileBanner: { backgroundColor: SIDEBAR_ACTIVE, borderRadius: 16, padding: 32, flexDirection: 'row', alignItems: 'center', gap: 24 },
    profileBannerIcon: { width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
    profileWelcome: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 8 },
    profileWelcomeSub: { fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 22 },
    profileAvatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    profileAvatarText: { fontSize: 28, fontWeight: '800', color: SIDEBAR_ACTIVE },
    profileCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#e2e8f0' },
    profileCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
    profileCardIconWrapper: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
    profileCardTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', flex: 1 },
    editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#eff6ff' },
    editBtnText: { fontSize: 13, fontWeight: '600', color: SIDEBAR_ACTIVE },
    profileInfoGrid: { gap: 20 },
    profileInfoItem: { gap: 6 },
    profileInfoLabel: { fontSize: 11, fontWeight: '800', color: '#64748b', letterSpacing: 0.5 },
    profileInfoValue: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
    roleBadge: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#dbeafe' },
    roleBadgeText: { fontSize: 12, fontWeight: '800', color: SIDEBAR_ACTIVE },
    securityItem: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fffbeb', borderRadius: 12, gap: 16, borderWidth: 1, borderColor: '#fef3c7' },
    securityIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    securityTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
    securitySubtitle: { fontSize: 13, color: '#64748b' },
    updatePasswordBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, backgroundColor: '#fff', borderWidth: 2, borderColor: SIDEBAR_ACTIVE },
    updatePasswordBtnText: { fontSize: 13, fontWeight: '700', color: SIDEBAR_ACTIVE }
});
