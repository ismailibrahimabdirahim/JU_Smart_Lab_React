import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Alert, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { ConfirmModal } from '@/components/Modals';

// --- Theme Colors ---
const SIDEBAR_BG = '#0f172a';
const SIDEBAR_ACTIVE = '#2563eb';
const BG_COLOR = '#F8FAFC';

const SettingsItem = ({ icon, title, desc, active, onToggle, danger, actionIcon, onAction }: any) => (
    <View style={styles.settingsItem}>
        <View style={[styles.settingsIconWrapper, { backgroundColor: danger ? '#fef2f2' : '#eff6ff' }]}>
            <Ionicons name={icon} size={20} color={danger ? '#ef4444' : '#2563eb'} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={[styles.settingsItemTitle, danger && { color: '#ef4444' }]}>{title}</Text>
            <Text style={styles.settingsItemDesc}>{desc}</Text>
        </View>
        {onToggle && (
            <TouchableOpacity
                style={[styles.toggle, active && styles.toggleActive]}
                onPress={onToggle}
                activeOpacity={0.8}
            >
                <View style={[styles.toggleThumb, active && styles.toggleThumbActive]} />
            </TouchableOpacity>
        )}
        {actionIcon && (
            <TouchableOpacity style={styles.settingsActionBtn} onPress={onAction}>
                <Ionicons name={actionIcon} size={18} color="#2563eb" />
                <Text style={styles.settingsActionBtnText}>Execute</Text>
            </TouchableOpacity>
        )}
    </View>
);

export default function SuperAdminSettings() {
    const router = useRouter();
    const { logout, user } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1000;

    const [activeTab, setActiveTab] = useState('settings');

    // Settings States
    const [twoFactor, setTwoFactor] = useState(false);
    const [autoLock, setAutoLock] = useState(true);
    const [auditLogging, setAuditLogging] = useState(true);
    const [criticalAlerts, setCriticalAlerts] = useState(true);
    const [adminRequests, setAdminRequests] = useState(true);

    // Modal States
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);
    const [modalInfo, setModalInfo] = useState<{
        title: string,
        message: string,
        variant: 'warning' | 'success' | 'info',
        onConfirm?: () => void,
        primaryLabel?: string
    } | null>(null);

    const handleLogout = () => {
        logout();
        router.replace('/login');
    };

    const handleFactoryReset = () => {
        setModalInfo({
            title: "Factory Reset?",
            message: "This will wipe all problem reports and system logs. This action is irreversible.",
            variant: 'warning',
            primaryLabel: "Reset Everything",
            onConfirm: () => {
                setModalInfo({
                    title: "System Reset",
                    message: "All records have been cleared. System is now back to factory state.",
                    variant: 'success'
                });
                setSuccessVisible(true);
            }
        });
        setConfirmVisible(true);
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
                    <SidebarItem icon="grid-outline" label="Dashboard" id="dashboard" target="/(superadmin)/dashboard" />
                    <SidebarItem icon="document-text-outline" label="Manage Reports" id="reports" target="/(superadmin)/reports" />
                    <SidebarItem icon="people-outline" label="Manage Admins" id="admins" target="/(superadmin)/admins" />
                    <SidebarItem icon="person-outline" label="Profile" id="profile" target="/(superadmin)/profile" />
                    <SidebarItem icon="settings-outline" label="System Settings" id="settings" />
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.main}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>System Settings</Text>
                    <View style={styles.headerRight}>
                        <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 24 }}>
                            <Ionicons name={isDark ? "sunny" : "moon"} size={20} color="#64748b" />
                        </TouchableOpacity>
                        <View style={styles.userProfile}>
                            <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                                <Text style={styles.userName}>{user?.name || 'Super Admin'}</Text>
                                <Text style={styles.userRole}>Security Level: Root</Text>
                            </View>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>SA</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.contentArea}>
                    <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.settingsContainer}>

                        {/* Appearance & UI */}
                        <View style={styles.settingsSection}>
                            <View style={styles.settingsSectionHeader}>
                                <View style={styles.settingsIconWrapper}>
                                    <Ionicons name="color-palette" size={18} color="#2563eb" />
                                </View>
                                <Text style={styles.settingsSectionTitle}>Appearance</Text>
                            </View>
                            <View style={styles.settingsCard}>
                                <SettingsItem
                                    icon="moon-outline"
                                    title="Dark Mode"
                                    desc="Adjust the system visual theme to dark for reduced eye strain."
                                    active={isDark}
                                    onToggle={toggleTheme}
                                />
                            </View>
                        </View>

                        {/* Security Section */}
                        <View style={styles.settingsSection}>
                            <View style={styles.settingsSectionHeader}>
                                <View style={styles.settingsIconWrapper}>
                                    <Ionicons name="shield-checkmark" size={18} color="#10b981" />
                                </View>
                                <Text style={styles.settingsSectionTitle}>Security & Access</Text>
                            </View>
                            <View style={styles.settingsCard}>
                                <SettingsItem
                                    icon="finger-print-outline"
                                    title="Two-Factor Authentication"
                                    desc="Require an extra verification step for root-level changes."
                                    active={twoFactor}
                                    onToggle={() => setTwoFactor(!twoFactor)}
                                />
                                <View style={styles.separator} />
                                <SettingsItem
                                    icon="timer-outline"
                                    title="Auto-Lock Session"
                                    desc="Automatically terminate sessions after 30 minutes of inactivity."
                                    active={autoLock}
                                    onToggle={() => setAutoLock(!autoLock)}
                                />
                                <View style={styles.separator} />
                                <SettingsItem
                                    icon="journal-outline"
                                    title="Detailed Audit Logging"
                                    desc="Track every administrative change for security compliance."
                                    active={auditLogging}
                                    onToggle={() => setAuditLogging(!auditLogging)}
                                />
                            </View>
                        </View>

                        {/* Notifications Section */}
                        <View style={styles.settingsSection}>
                            <View style={styles.settingsSectionHeader}>
                                <View style={styles.settingsIconWrapper}>
                                    <Ionicons name="notifications-outline" size={18} color="#f59e0b" />
                                </View>
                                <Text style={styles.settingsSectionTitle}>System Alerts</Text>
                            </View>
                            <View style={styles.settingsCard}>
                                <SettingsItem
                                    icon="mail-outline"
                                    title="Critical Error Alerts"
                                    desc="Get notified via email when labs experience total downtime."
                                    active={criticalAlerts}
                                    onToggle={() => setCriticalAlerts(!criticalAlerts)}
                                />
                                <View style={styles.separator} />
                                <SettingsItem
                                    icon="people-outline"
                                    title="New Admin Registration"
                                    desc="Get notified when a new junior administrator joins the system."
                                    active={adminRequests}
                                    onToggle={() => setAdminRequests(!adminRequests)}
                                />
                            </View>
                        </View>

                        {/* Maintenance Operations */}
                        <View style={styles.settingsSection}>
                            <View style={styles.settingsSectionHeader}>
                                <View style={styles.settingsIconWrapper}>
                                    <Ionicons name="construct-outline" size={18} color="#6366f1" />
                                </View>
                                <Text style={styles.settingsSectionTitle}>Maintenance Operations</Text>
                            </View>
                            <View style={styles.settingsCard}>
                                <SettingsItem
                                    icon="server-outline"
                                    title="Database Optimization"
                                    desc="Clean up orphan records and re-index the problems database."
                                    actionIcon="flash-outline"
                                    onAction={() => {
                                        setModalInfo({
                                            title: "Optimization Running",
                                            message: "Database re-indexing started. This may take a few seconds.",
                                            variant: 'info'
                                        });
                                        setSuccessVisible(true);
                                    }}
                                />
                                <View style={styles.separator} />
                                <SettingsItem
                                    icon="hardware-chip-outline"
                                    title="Clear System Cache"
                                    desc="Wipe temporary assets and styles for a fresh application load."
                                    actionIcon="trash-outline"
                                    onAction={() => {
                                        setModalInfo({
                                            title: "Cache Cleared",
                                            message: "Local application storage has been purged successfully.",
                                            variant: 'success'
                                        });
                                        setSuccessVisible(true);
                                    }}
                                />
                            </View>
                        </View>

                        {/* Danger Zone */}
                        <View style={styles.settingsSection}>
                            <View style={styles.settingsSectionHeader}>
                                <View style={[styles.settingsIconWrapper, { backgroundColor: '#fef2f2' }]}>
                                    <Ionicons name="alert-circle" size={18} color="#ef4444" />
                                </View>
                                <Text style={[styles.settingsSectionTitle, { color: '#ef4444' }]}>Danger Zone</Text>
                            </View>
                            <View style={[styles.settingsCard, { borderColor: '#fee2e2' }]}>
                                <TouchableOpacity style={styles.dangerActionRow} onPress={handleFactoryReset}>
                                    <View style={styles.dangerIconBox}>
                                        <Ionicons name="nuclear-outline" size={20} color="#ef4444" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.dangerTitle}>Factory Reset System</Text>
                                        <Text style={styles.dangerDesc}>Permanently wipe all data records. This action cannot be undone.</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color="#fecaca" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Footer Info */}
                        <View style={styles.footerInfo}>
                            <Text style={styles.footerText}>JU Smart Lab Management System</Text>
                            <Text style={styles.versionText}>Version 2.4.0 • Enterprise Edition</Text>
                        </View>

                    </Animated.View>
                </ScrollView>
            </View>

            {/* Beautiful Confirmation Modal */}
            <ConfirmModal
                visible={confirmVisible}
                onClose={() => setConfirmVisible(false)}
                variant={modalInfo?.variant || 'info'}
                title={modalInfo?.title || ''}
                message={modalInfo?.message || ''}
                primaryLabel={modalInfo?.primaryLabel || 'Confirm Action'}
                onPrimary={() => {
                    setConfirmVisible(false);
                    if (modalInfo?.onConfirm) modalInfo.onConfirm();
                }}
            />

            {/* Beautiful Success/Info Modal */}
            <ConfirmModal
                visible={successVisible}
                onClose={() => setSuccessVisible(false)}
                variant={modalInfo?.variant || 'success'}
                title={modalInfo?.title || ''}
                message={modalInfo?.message || ''}
                primaryLabel="Done"
                onPrimary={() => setSuccessVisible(false)}
                secondaryLabel=""
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: 'row', backgroundColor: BG_COLOR },

    // Sidebar
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

    // Header
    main: { flex: 1 },
    header: { height: 80, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    userProfile: { flexDirection: 'row', alignItems: 'center' },
    userName: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
    userRole: { fontSize: 12, color: '#64748b' },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: SIDEBAR_ACTIVE, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
    avatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },

    // Content Area
    contentArea: { padding: 32 },
    settingsContainer: { width: '100%', gap: 32 },

    // Settings Sections
    settingsSection: { gap: 16 },
    settingsSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    settingsIconWrapper: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
    settingsSectionTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },

    // Settings Cards
    settingsCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', ...Platform.select({ web: { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } }) },
    settingsItem: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
    settingsItemTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
    settingsItemDesc: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },
    separator: { height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 20 },

    // Toggle
    toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: '#cbd5e1', padding: 2 },
    toggleActive: { backgroundColor: SIDEBAR_ACTIVE },
    toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
    toggleThumbActive: { transform: [{ translateX: 20 }] },

    // Action Buttons
    settingsActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#eff6ff' },
    settingsActionBtnText: { fontSize: 13, fontWeight: '600', color: '#2563eb' },

    // Danger Zone
    dangerActionRow: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
    dangerIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },
    dangerTitle: { fontSize: 15, fontWeight: '700', color: '#ef4444' },
    dangerDesc: { fontSize: 13, color: '#94a3b8', marginTop: 2 },

    // Footer
    footerInfo: { alignItems: 'center', paddingVertical: 40, gap: 4 },
    footerText: { fontSize: 13, color: '#94a3b8', fontWeight: '600' },
    versionText: { fontSize: 11, color: '#cbd5e1' }
});
