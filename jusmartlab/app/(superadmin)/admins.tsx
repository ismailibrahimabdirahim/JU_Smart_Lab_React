import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, useWindowDimensions, Modal, ActivityIndicator,
    Alert, Platform, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { FadeInUp, FadeInDown, SlideInUp } from 'react-native-reanimated';
import { ConfirmModal } from '@/components/Modals';

// --- Theme Colors ---
const SIDEBAR_BG = '#0f172a';
const SIDEBAR_ACTIVE = '#2563eb';
const BG_COLOR = '#F8FAFC';
const MODAL_BODY = '#1e293b';
const LOGO_BLUE = '#2563eb';

const StatCard = ({ title, value, color, icon }: { title: string, value: string, color: string, icon: any }) => (
    <View style={styles.statCard}>
        <View style={[styles.statIconWrapper, { backgroundColor: `${color}10` }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <View>
            <Text style={styles.statTitle}>{title}</Text>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
        </View>
    </View>
);

const CreateAdminModal = ({ visible, onClose, onCreate }: { visible: boolean, onClose: () => void, onCreate: (email: string, pass: string, name: string) => Promise<void> }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        // Validation
        if (!name.trim()) {
            Alert.alert("Validation Error", "Please provide a name for the admin.");
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            Alert.alert("Validation Error", "Please provide a valid email address.");
            return;
        }
        if (!password || password.length < 6) {
            Alert.alert("Validation Error", "Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        await onCreate(email.trim(), password, name.trim());
        setLoading(false);
    };

    const handleClear = () => {
        setEmail('');
        setPassword('');
        setName('');
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <Animated.View entering={SlideInUp} style={styles.modalContent}>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalHeaderTitle}>Create Admin Account</Text>
                    </View>

                    {/* Modal Body */}
                    <View style={styles.modalBody}>
                        {/* Avatar illustration (placeholder for the one in image) */}
                        <View style={styles.avatarMain}>
                            <View style={styles.illustrationCircle}>
                                <Ionicons name="person" size={50} color="#fff" />
                                <View style={styles.gearOverlay}>
                                    <Ionicons name="settings" size={24} color="#fff" />
                                </View>
                            </View>
                        </View>

                        <View style={styles.formGroupModal}>
                            <Text style={styles.modalLabel}>Enter Name :</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Admin Full Name"
                                placeholderTextColor="#94a3b8"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.formGroupModal}>
                            <Text style={styles.modalLabel}>Enter Email :</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="example@ju.edu"
                                placeholderTextColor="#94a3b8"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.formGroupModal}>
                            <Text style={styles.modalLabel}>Enter Password :</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="••••••••"
                                placeholderTextColor="#94a3b8"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        {/* Modal Actions */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#3b82f6' }]} onPress={handleCreate}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Create</Text>}
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#3b82f6' }]} onPress={handleClear}>
                                <Text style={styles.modalBtnText}>Clear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#3b82f6' }]} onPress={onClose}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Ionicons name="close" size={18} color="#fff" />
                                    <Text style={styles.modalBtnText}>Close</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default function ManageAdminsScreen() {
    const router = useRouter();
    const { logout, admins, createAdmin, deleteAdmin, toggleAdminStatus, user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('admins');
    const [modalVisible, setModalVisible] = useState(false);

    // Confirmation & Success Modal states
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);
    const [modalInfo, setModalInfo] = useState<{
        id?: string,
        name?: string,
        title: string,
        message: string,
        variant: 'warning' | 'success' | 'info',
        action?: 'delete' | 'toggle',
        primaryLabel?: string
    } | null>(null);

    const filteredAdmins = useMemo(() => {
        return admins.filter(a =>
            a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, admins]);

    const handleLogout = () => {
        logout();
        router.replace('/login');
    };

    const handleCreateAdmin = async (email: string, pass: string, name: string) => {
        const res = await createAdmin(email, pass, name);
        if (res.success) {
            setModalInfo({
                title: "Registration Success",
                message: "The new admin account has been created successfully!",
                variant: 'success'
            });
            setSuccessVisible(true);
            setModalVisible(false);
        } else {
            setModalInfo({
                title: "Registration Failed",
                message: res.message,
                variant: 'warning'
            });
            setSuccessVisible(true);
        }
    };

    const handleDeleteAdmin = (id: string, name: string) => {
        if (id === user?.id) {
            setModalInfo({
                title: "Security Restriction",
                message: "As the Super Admin, you cannot delete your own account from this panel.",
                variant: 'info'
            });
            setSuccessVisible(true);
            return;
        }
        setModalInfo({
            id,
            name,
            title: "Delete Account?",
            message: `Are you sure you want to permanently remove ${name}? This action cannot be undone.`,
            variant: 'warning',
            action: 'delete',
            primaryLabel: "Delete Now"
        });
        setConfirmVisible(true);
    };

    const confirmDelete = async () => {
        if (!modalInfo?.id) return;
        const res = await deleteAdmin(modalInfo.id);
        if (res.success) {
            setModalInfo({
                title: "Deleted!",
                message: "Administrator account removed successfully.",
                variant: 'success'
            });
            setSuccessVisible(true);
        } else {
            setModalInfo({
                title: "Error",
                message: res.message,
                variant: 'warning'
            });
            setSuccessVisible(true);
        }
    };

    const handleToggleStatus = async (id: string, name: string, currentStatus: string) => {
        if (id === user?.id) {
            setModalInfo({
                title: "Security Restriction",
                message: "As the Super Admin, you cannot deactivate your own account.",
                variant: 'info'
            });
            setSuccessVisible(true);
            return;
        }

        const actionText = currentStatus === 'active' ? 'deactivate' : 'activate';
        setModalInfo({
            id,
            name,
            title: "Change Status?",
            message: `Are you sure you want to ${actionText} ${name}'s account?`,
            variant: 'info',
            action: 'toggle',
            primaryLabel: `Yes, ${actionText}`
        });
        setConfirmVisible(true);
    };

    const confirmToggle = async () => {
        if (!modalInfo?.id) return;
        const res = await toggleAdminStatus(modalInfo.id);
        if (res.success) {
            setModalInfo({
                title: "Status Updated",
                message: "The user status has been modified successfully.",
                variant: 'success'
            });
            setSuccessVisible(true);
        } else {
            setModalInfo({
                title: "Error",
                message: res.message,
                variant: 'warning'
            });
            setSuccessVisible(true);
        }
    };

    const handlePrimaryAction = () => {
        if (modalInfo?.action === 'delete') confirmDelete();
        else if (modalInfo?.action === 'toggle') confirmToggle();
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
                    <SidebarItem icon="people" label="Manage Admins" id="admins" />
                    <SidebarItem icon="person" label="Profile" id="profile" target="/(superadmin)/profile" />
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
                    <Text style={styles.headerTitle}>Manage Administrators</Text>
                    <View style={styles.headerRight}>
                        <Ionicons name="sunny-outline" size={20} color="#64748b" style={{ marginRight: 24 }} />
                        <View style={styles.userProfile}>
                            <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                                <Text style={styles.userName}>Super Admin</Text>
                                <Text style={styles.userRole}>Master Control</Text>
                            </View>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>SA</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.contentArea}>
                    {/* Search & Actions Bar */}
                    <View style={styles.actionsBar}>
                        <View style={styles.searchContainer}>
                            <Ionicons name="search-outline" size={20} color="#94a3b8" />
                            <TextInput
                                placeholder="Search administrators by name or email..."
                                style={styles.searchInput}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.createBtn}
                            activeOpacity={0.8}
                            onPress={() => setModalVisible(true)}
                        >
                            <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.createBtnText}>Create New Admin</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <StatCard title="Total Administrators" value={admins.length.toString()} color="#0f172a" icon="people" />
                        <StatCard title="Active Systems" value="12" color="#10b981" icon="pulse" />
                        <StatCard title="System Engineers" value="4" color="#2563eb" icon="shield" />
                    </View>

                    {/* Data Table */}
                    <View style={styles.tableCard}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.columnHeader, { flex: 2 }]}>ADMIN DETAILS</Text>
                            <Text style={[styles.columnHeader, { flex: 1 }]}>ROLE & STATUS</Text>
                            <Text style={[styles.columnHeader, { flex: 0.8, textAlign: 'right' }]}>ACTIONS</Text>
                        </View>

                        {filteredAdmins.map((admin, index) => (
                            <Animated.View
                                key={admin.id}
                                entering={FadeInUp.delay(index * 50).duration(400)}
                                style={styles.tableRow}
                            >
                                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={styles.userAvatar}>
                                        <Text style={styles.userAvatarText}>{admin.name.split(' ').map(n => n[0]).join('')}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.rowUserName}>{admin.name}</Text>
                                        <Text style={styles.rowUserEmail}>{admin.email}</Text>
                                    </View>
                                </View>
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Text style={[styles.rowText, { textTransform: 'capitalize' }]}>{admin.role}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: admin.status === 'active' ? '#dcfce7' : '#fee2e2' }]}>
                                        <Text style={[styles.statusBadgeText, { color: admin.status === 'active' ? '#166534' : '#991b1b' }]}>
                                            {admin.status}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.rowActions}>
                                    {admin.id !== user?.id && (
                                        <>
                                            <TouchableOpacity
                                                style={styles.actionIcon}
                                                onPress={() => handleToggleStatus(admin.id, admin.name, admin.status)}
                                            >
                                                <Ionicons
                                                    name={admin.status === 'active' ? "toggle" : "toggle-outline"}
                                                    size={22}
                                                    color={admin.status === 'active' ? "#22c55e" : "#94a3b8"}
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.actionIcon}
                                                onPress={() => handleDeleteAdmin(admin.id, admin.name)}
                                            >
                                                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </Animated.View>
                        ))}

                        {filteredAdmins.length === 0 && (
                            <View style={styles.emptyState}>
                                <Ionicons name="people-outline" size={60} color="#e2e8f0" />
                                <Text style={styles.emptyStateText}>No administrators found.</Text>
                            </View>
                        )}

                        <View style={styles.tableFooter}>
                            <Text style={styles.footerText}>Showing {filteredAdmins.length} of {admins.length} administrators</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>

            {/* Modal */}
            <CreateAdminModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onCreate={handleCreateAdmin}
            />

            {/* Beautiful Confirmation Modal */}
            <ConfirmModal
                visible={confirmVisible}
                onClose={() => setConfirmVisible(false)}
                variant={modalInfo?.variant || 'info'}
                title={modalInfo?.title || ''}
                message={modalInfo?.message || ''}
                primaryLabel={modalInfo?.primaryLabel || 'Confirm Action'}
                onPrimary={handlePrimaryAction}
            />

            {/* Beautiful Success/Info Modal */}
            <ConfirmModal
                visible={successVisible}
                onClose={() => setSuccessVisible(false)}
                variant={modalInfo?.variant || 'success'}
                title={modalInfo?.title || ''}
                message={modalInfo?.message || ''}
                primaryLabel="Continue"
                onPrimary={() => setSuccessVisible(false)}
                secondaryLabel=""
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
    userProfile: { flexDirection: 'row', alignItems: 'center' },
    userName: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
    userRole: { fontSize: 12, color: '#64748b' },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: SIDEBAR_ACTIVE, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
    avatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    contentArea: { padding: 32, gap: 24 },
    actionsBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 16, marginRight: 24, height: 48 },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 14, color: '#0f172a' },
    createBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: SIDEBAR_ACTIVE, paddingHorizontal: 20, height: 48, borderRadius: 10, elevation: 2, shadowColor: SIDEBAR_ACTIVE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    createBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    statsRow: { flexDirection: 'row', gap: 24 },
    statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', gap: 16 },
    statIconWrapper: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    statTitle: { fontSize: 13, color: '#64748b', fontWeight: '600', marginBottom: 2 },
    statValue: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
    tableCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden' },
    tableHeader: { flexDirection: 'row', padding: 20, backgroundColor: '#fdfdfd', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    columnHeader: { fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5 },
    tableRow: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    userAvatar: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    userAvatarText: { fontSize: 12, fontWeight: '800', color: '#64748b' },
    rowUserName: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
    rowUserEmail: { fontSize: 12, color: '#64748b' },
    rowText: { fontSize: 13, color: '#475569', fontWeight: '500' },
    rowActions: { flex: 0.8, flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
    actionIcon: { padding: 4 },
    tableFooter: { padding: 24, alignItems: 'center' },
    footerText: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
    emptyState: { padding: 60, alignItems: 'center', justifyContent: 'center' },
    emptyStateText: { marginTop: 12, fontSize: 15, color: '#94a3b8', fontWeight: '500' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: 600, backgroundColor: MODAL_BODY, borderRadius: 12, overflow: 'hidden' },
    modalHeader: { backgroundColor: '#3b82f6', padding: 20, alignItems: 'center' },
    modalHeaderTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
    modalBody: { padding: 40, alignItems: 'center' },
    avatarMain: { marginBottom: 30 },
    illustrationCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    gearOverlay: { position: 'absolute', bottom: 10, left: -20, width: 44, height: 44, borderRadius: 22, backgroundColor: '#475569', alignItems: 'center', justifyContent: 'center' },
    formGroupModal: { width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    modalLabel: { width: 140, color: '#fff', fontSize: 16, fontWeight: '700' },
    modalInput: { flex: 1, height: 44, backgroundColor: '#fff', borderRadius: 22, paddingHorizontal: 20, fontSize: 15, color: '#0f172a' },
    modalActions: { flexDirection: 'row', gap: 20, marginTop: 40 },
    modalBtn: { height: 48, paddingHorizontal: 30, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    modalBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },

    // Status Badge
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }
});
