import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, useWindowDimensions, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useProblems } from '@/contexts/ProblemsContext';
import { PerformanceAreaChart, DonutChart } from '@/components/charts/AdminCharts';

// --- Theme Colors ---
const SIDEBAR_BG = '#0f172a'; // Darker for Super Admin
const SIDEBAR_ACTIVE = '#2563eb';
const BG_COLOR = '#F8FAFC';

const StatCard = ({ title, value, icon, color, bgColor, borderColor }: any) => (
  <View style={[styles.statCard, { backgroundColor: bgColor, borderColor: borderColor }]}>
    <View style={[styles.statIcon, { backgroundColor: color }]}>
      <Ionicons name={icon} size={20} color="#fff" />
    </View>
    <View>
      <Text style={[styles.statTitle, { color: color }]}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  </View>
);

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  const { problems } = useProblems();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1000;

  const [activeTab, setActiveTab] = useState('dashboard');

  // Derived Data
  const pendingCount = problems.filter(p => p.status === 'Pending').length;
  const fixedCount = problems.filter(p => p.status === 'Fixed').length;
  const totalReports = problems.length;

  // Chart Data
  const chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const chartData = useMemo(() => {
    const year = new Date().getFullYear();
    const counts = chartLabels.map(m => {
      return problems.filter(p => {
        const d = new Date(p.submittedAt);
        return d.toLocaleDateString('en-US', { month: 'short' }) === m && d.getFullYear() === year;
      }).length;
    });
    return { labels: chartLabels, data: counts };
  }, [problems]);

  const statusBreakdown = useMemo(() => ([
    { label: 'Fixed', value: fixedCount, color: '#10b981' },
    { label: 'Pending', value: pendingCount, color: '#ef4444' },
    { label: 'In Review', value: 0, color: '#f59e0b' }
  ]), [fixedCount, pendingCount]);

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
          <SidebarItem icon="grid" label="Dashboard" id="dashboard" />
          <SidebarItem icon="document-text" label="Manage Reports" id="reports" target="/(superadmin)/reports" />
          <SidebarItem icon="people" label="Manage Admins" id="admins" target="/(superadmin)/admins" />
          <SidebarItem icon="person" label="Profile" id="profile" />
          <SidebarItem icon="settings" label="System Settings" id="settings" />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="rgba(255,255,255,0.6)" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard Overview</Text>
          <View style={styles.headerRight}>
            <Ionicons name="sunny-outline" size={20} color="#64748b" style={{ marginRight: 20 }} />
            <Ionicons name="notifications-outline" size={20} color="#64748b" style={{ marginRight: 24 }} />
            <View style={styles.userProfile}>
              <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                <Text style={styles.userName}>Super Admin</Text>
                <Text style={styles.userRole}>Principal</Text>
              </View>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>SA</Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.contentArea}>
          <View style={styles.statsRow}>
            <StatCard title="TOTAL REPORTS" value={totalReports} icon="document-text" color="#3b82f6" bgColor="#eff6ff" borderColor="#dbeafe" />
            <StatCard title="TOTAL PENDING" value={pendingCount} icon="time" color="#f59e0b" bgColor="#fffbeb" borderColor="#fef3c7" />
            <StatCard title="TOTAL FIXED" value={fixedCount} icon="checkmark" color="#10b981" bgColor="#ecfdf5" borderColor="#d1fae5" />
          </View>

          <View style={styles.gridRow}>
            <View style={[styles.card, { flex: 2.2 }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Financial Overview</Text>
                <TouchableOpacity><Ionicons name="ellipsis-horizontal" size={18} color="#64748b" /></TouchableOpacity>
              </View>
              <View style={styles.chartContainer}>
                <PerformanceAreaChart data={chartData.data} labels={chartData.labels} height={320} />
              </View>
            </View>

            <View style={[styles.card, { flex: 1.2 }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Attendance Today</Text>
              </View>
              <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <DonutChart data={statusBreakdown} size={300} />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
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
  statsRow: { flexDirection: 'row', gap: 24 },
  statCard: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 24, borderRadius: 16, borderWidth: 1, gap: 16 },
  statIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statTitle: { fontSize: 11, fontWeight: '800', marginBottom: 4, letterSpacing: 0.5 },
  statValue: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  gridRow: { flexDirection: 'row', gap: 24 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  chartContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});
