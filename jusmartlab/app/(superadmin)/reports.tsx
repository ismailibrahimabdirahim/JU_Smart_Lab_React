import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, useWindowDimensions, Pressable, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useProblems } from '@/contexts/ProblemsContext';
import { FACULTY_LABELS } from '@/types';
import { MOCK_BATCHES, MOCK_CLASSES } from '@/data/mockData';
import { ConfirmModal } from '@/components/Modals';

// --- Theme Colors ---
const SIDEBAR_BG = '#0f172a';
const SIDEBAR_ACTIVE = '#2563eb';
const BG_COLOR = '#F8FAFC';
const TABLE_BLUE = '#1e3a8a';
const ACTION_BAR_DARK = '#0f172a';

type FilterStatus = 'All' | 'Pending' | 'Fixed';

const ActionBtn = ({ icon, label, onPress, backgroundColor }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.actionBtn, { backgroundColor }]}
  >
    <Ionicons name={icon} size={18} color="#fff" />
    <Text style={styles.actionBtnText}>{label}</Text>
  </TouchableOpacity>
);

const StatCard = ({ title, value, icon, color, bgColor, borderColor }: any) => (
  <View style={[styles.reportStatCard, { backgroundColor: bgColor, borderColor: borderColor }]}>
    <View style={[styles.reportStatIcon, { backgroundColor: color }]}>
      <Ionicons name={icon} size={20} color="#fff" />
    </View>
    <View>
      <Text style={[styles.reportStatTitle, { color: color }]}>{title}</Text>
      <Text style={styles.reportStatValue}>{value}</Text>
    </View>
  </View>
);

function formatReportDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return '—'; }
}

function getBatchLabel(batchId: string) {
  return MOCK_BATCHES.find((b) => b.id === batchId)?.label ?? batchId;
}

function getClassLabel(classId: string) {
  return MOCK_CLASSES.find((c) => c.id === classId)?.label ?? classId;
}

export default function SuperAdminReports() {
  const router = useRouter();
  const { logout } = useAuth();
  const { problems, updateStatus, deleteProblem, deleteAllProblems, refreshFromStorage } = useProblems();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1000;

  const [activeTab, setActiveTab] = useState('reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<'deleteSelected' | 'deleteAll' | 'noSelection' | null>(null);

  // Derived Data
  const pendingCount = problems.filter(p => p.status === 'Pending').length;
  const fixedCount = problems.filter(p => p.status === 'Fixed').length;
  const totalReports = problems.length;

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  // Filtered List
  const filteredProblems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return problems.filter(p => {
      const matchSearch = !q ||
        p.studentName.toLowerCase().includes(q) ||
        p.computerNumber.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        FACULTY_LABELS[p.facultyId]?.toLowerCase().includes(q) ||
        getBatchLabel(p.batchId).toLowerCase().includes(q) ||
        getClassLabel(p.classId).toLowerCase().includes(q);
      const matchStatus = filterStatus === 'All' || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [problems, searchQuery, filterStatus]);

  // Handlers
  const handleSelectAll = () => {
    if (selectedProblems.length === filteredProblems.length) setSelectedProblems([]);
    else setSelectedProblems(filteredProblems.map(p => p.id));
  };

  const toggleSelection = (id: string) => {
    if (selectedProblems.includes(id)) setSelectedProblems(selectedProblems.filter(pid => pid !== id));
    else setSelectedProblems([...selectedProblems, id]);
  };

  const handleFixSelected = () => {
    selectedProblems.forEach(id => updateStatus(id, 'Fixed'));
    setSelectedProblems([]);
  };

  const runDeleteSelected = () => {
    selectedProblems.forEach(id => deleteProblem(id));
    setSelectedProblems([]);
    setConfirmModal(null);
  };

  const handleDeleteSelected = () => {
    if (selectedProblems.length === 0) { setConfirmModal('noSelection'); return; }
    setConfirmModal('deleteSelected');
  };

  const handleDeleteAll = () => setConfirmModal('deleteAll');

  const runDeleteAll = () => {
    deleteAllProblems();
    setSelectedProblems([]);
    setConfirmModal(null);
  };

  const handlePrint = () => {
    if (Platform.OS === 'web') {
      window.print();
    } else {
      Alert.alert("Print", "Printing is available on web platform.");
    }
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
          <SidebarItem icon="document-text" label="Manage Reports" id="reports" />
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage Problem Reports</Text>
          <View style={styles.headerRight}>
            <Ionicons name="sunny-outline" size={20} color="#64748b" style={{ marginRight: 16 }} />
            <Ionicons name="notifications-outline" size={20} color="#64748b" style={{ marginRight: 24 }} />
            <View style={styles.uniTag}><Text style={styles.uniText}>Jazeera University</Text></View>
          </View>
        </View>

        <View style={styles.contentArea}>
          {/* Filters Bar */}
          <View style={styles.filterBar}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color="#94a3b8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search reports..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.filterDropdownWrapper}>
              <Text style={styles.filterLabel}>Filter:</Text>
              <TouchableOpacity
                style={styles.filterDropdownBtn}
                onPress={() => setFilterDropdownOpen(!filterDropdownOpen)}
              >
                <Ionicons name="list-outline" size={18} color="#0f172a" />
                <Text style={styles.filterDropdownText}>{filterStatus}</Text>
                <Ionicons name={filterDropdownOpen ? "chevron-up" : "chevron-down"} size={16} color="#64748b" />
              </TouchableOpacity>
              {filterDropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {(['All', 'Pending', 'Fixed'] as const).map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.dropdownItem, filterStatus === s && styles.dropdownItemActive]}
                      onPress={() => { setFilterStatus(s); setFilterDropdownOpen(false); }}
                    >
                      <Text style={[styles.dropdownItemText, filterStatus === s && styles.dropdownItemTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={{ flex: 1 }} />
            <Text style={styles.totalCount}>TOTAL REPORTS: <Text style={{ color: '#2563eb' }}>{totalReports}</Text></Text>
          </View>

          {/* Table Container */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={styles.colCheckbox}>
                <TouchableOpacity onPress={handleSelectAll}>
                  <View style={[styles.checkbox, selectedProblems.length === filteredProblems.length && selectedProblems.length > 0 && styles.checkboxActive]} />
                </TouchableOpacity>
              </View>
              <View style={styles.colId}><Text style={styles.colHeaderText}>ID</Text></View>
              <View style={styles.colComputer}><Text style={styles.colHeaderText}>COMPUTER #</Text></View>
              <View style={styles.colStudent}><Text style={styles.colHeaderText}>STUDENT NAME</Text></View>
              <View style={styles.colFaculty}><Text style={styles.colHeaderText}>FACULTY</Text></View>
              <View style={styles.colBatch}><Text style={styles.colHeaderText}>BATCH</Text></View>
              <View style={styles.colClass}><Text style={styles.colHeaderText}>CLASS</Text></View>
              <View style={styles.colServer}><Text style={styles.colHeaderText}>SERVER #</Text></View>
              <View style={styles.colDate}><Text style={styles.colHeaderText}>DATE</Text></View>
              <View style={styles.colType}><Text style={styles.colHeaderText}>PROBLEM TYPE</Text></View>
              <View style={styles.colDesc}><Text style={styles.colHeaderText}>DESCRIPTION</Text></View>
              <View style={styles.colStatus}><Text style={styles.colHeaderText}>STATUS</Text></View>
            </View>

            <ScrollView style={{ flex: 1 }}>
              {filteredProblems.map((p) => (
                <View key={p.id} style={styles.tableRow}>
                  <View style={styles.colCheckbox}>
                    <TouchableOpacity onPress={() => toggleSelection(p.id)}>
                      <View style={[styles.checkbox, selectedProblems.includes(p.id) && styles.checkboxActive]}>
                        {selectedProblems.includes(p.id) && <Ionicons name="checkmark" size={12} color="#fff" />}
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.colId}><Text style={[styles.cellText, { fontWeight: '700' }]}>#{p.id}</Text></View>
                  <View style={styles.colComputer}><Text style={styles.cellText}>{p.computerNumber}</Text></View>
                  <View style={styles.colStudent}><Text style={styles.cellText}>{p.studentName}</Text></View>
                  <View style={styles.colFaculty}><Text style={styles.cellText}>{FACULTY_LABELS[p.facultyId]}</Text></View>
                  <View style={styles.colBatch}><Text style={styles.cellText}>{getBatchLabel(p.batchId)}</Text></View>
                  <View style={styles.colClass}><Text style={styles.cellText}>{getClassLabel(p.classId)}</Text></View>
                  <View style={styles.colServer}><Text style={styles.cellText}>{p.serverNumber || '—'}</Text></View>
                  <View style={styles.colDate}><Text style={styles.cellText}>{formatReportDate(p.submittedAt)}</Text></View>
                  <View style={styles.colType}>
                    <View style={[styles.typeBadge, { backgroundColor: p.problemType === 'Software' ? '#eff6ff' : '#fff7ed' }]}>
                      <Text style={[styles.typeBadgeText, { color: p.problemType === 'Software' ? '#3b82f6' : '#f59e0b' }]}>{p.problemType}</Text>
                    </View>
                  </View>
                  <View style={styles.colDesc}><Text style={[styles.cellText, { color: '#64748b' }]} numberOfLines={1}>{p.description}</Text></View>
                  <View style={styles.colStatus}>
                    <View style={styles.statusDotRow}>
                      <View style={[styles.statusDot, { backgroundColor: p.status === 'Fixed' ? '#10b981' : '#f59e0b' }]} />
                      <Text style={[styles.cellText, { fontWeight: '600', color: p.status === 'Fixed' ? '#10b981' : '#f59e0b' }]}>{p.status}</Text>
                    </View>
                  </View>
                </View>
              ))}
              {filteredProblems.length === 0 && (
                <View style={styles.emptyTable}>
                  <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
                  <Text style={styles.emptyText}>No reports match your filters.</Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Action Bar */}
          <View style={styles.actionBar}>
            <ActionBtn icon="checkmark-circle" label="FIX" onPress={handleFixSelected} backgroundColor="#10b981" />
            <ActionBtn icon="trash-outline" label="DELETE" onPress={handleDeleteSelected} backgroundColor="#ef4444" />

            <View style={styles.filterDrops}>
              <Text style={styles.filterDropsLabel}>Filter:</Text>
              <Text style={styles.filterDropsValue}>{filterStatus === 'All' ? 'Show All' : filterStatus}</Text>
            </View>

            <ActionBtn icon="refresh-outline" label="REFRESH" onPress={refreshFromStorage} backgroundColor="#06b6d4" />
            <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
              <Ionicons name="print-outline" size={18} color="#fff" />
              <Text style={styles.printBtnText}>PRINT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteAllBtnSuper} onPress={handleDeleteAll}>
              <Ionicons name="trash-bin-outline" size={18} color="#fff" />
              <Text style={styles.deleteAllBtnText}>DELETE ALL</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View style={styles.reportStatsRow}>
            <StatCard title="TOTAL FIXED" value={fixedCount} icon="checkmark" color="#10b981" bgColor="#ecfdf5" borderColor="#d1fae5" />
            <StatCard title="TOTAL PENDING" value={pendingCount} icon="time" color="#f59e0b" bgColor="#fffbeb" borderColor="#fef3c7" />
            <StatCard title="REPORTS MONTH" value={totalReports} icon="document-text" color="#3b82f6" bgColor="#eff6ff" borderColor="#dbeafe" />
          </View>
        </View>
      </View>

      {/* Modals */}
      <ConfirmModal
        visible={confirmModal === 'deleteSelected'}
        onClose={() => setConfirmModal(null)}
        variant="warning"
        title="Delete Reports?"
        message={`Are you sure you want to delete ${selectedProblems.length} selected reports?`}
        primaryLabel="Delete"
        onPrimary={runDeleteSelected}
        secondaryLabel="Cancel"
      />
      <ConfirmModal
        visible={confirmModal === 'deleteAll'}
        onClose={() => setConfirmModal(null)}
        variant="warning"
        title="Clear All Reports?"
        message="This will permanently delete all report data. This action cannot be undone."
        primaryLabel="Delete Everything"
        onPrimary={runDeleteAll}
        secondaryLabel="Cancel"
      />
      <ConfirmModal
        visible={confirmModal === 'noSelection'}
        onClose={() => setConfirmModal(null)}
        variant="info"
        title="No items selected"
        message="Please select at least one report to perform this action."
        primaryLabel="Got it"
        onPrimary={() => setConfirmModal(null)}
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
  contentArea: { padding: 32, flex: 1, gap: 24 },
  filterBar: { flexDirection: 'row', alignItems: 'center', gap: 16, zIndex: 1000 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, width: 300, height: 44, paddingHorizontal: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 14, color: '#0f172a' },
  filterDropdownWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  filterDropdownBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, height: 44, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', minWidth: 120 },
  filterDropdownText: { fontSize: 14, color: '#0f172a', fontWeight: '600', flex: 1 },
  dropdownMenu: { position: 'absolute', top: 48, left: 45, width: 140, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, overflow: 'hidden', zIndex: 9999 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#fff' },
  dropdownItemActive: { backgroundColor: '#2563eb' },
  dropdownItemText: { fontSize: 14, color: '#64748b' },
  dropdownItemTextActive: { color: '#fff', fontWeight: '700' },
  totalCount: { fontSize: 12, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5 },
  tableContainer: { flex: 1, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', height: 48, backgroundColor: TABLE_BLUE, alignItems: 'center' },
  colCheckbox: { width: 60, alignItems: 'center', paddingLeft: 16 },
  colId: { width: 60, paddingHorizontal: 8 },
  colComputer: { width: 100, paddingHorizontal: 8 },
  colStudent: { width: 130, paddingHorizontal: 8 },
  colFaculty: { width: 160, paddingHorizontal: 8 },
  colBatch: { width: 80, paddingHorizontal: 8 },
  colClass: { width: 90, paddingHorizontal: 8 },
  colServer: { width: 90, paddingHorizontal: 8 },
  colDate: { width: 100, paddingHorizontal: 8 },
  colType: { width: 120, paddingHorizontal: 8 },
  colDesc: { width: 200, paddingHorizontal: 8 },
  colStatus: { width: 120, paddingHorizontal: 8, paddingRight: 16 },
  colHeaderText: { fontSize: 11, fontWeight: '700', color: '#fff', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', minHeight: 52, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center', backgroundColor: '#fff' },
  checkbox: { width: 16, height: 16, borderRadius: 3, borderWidth: 1, borderColor: '#94a3b8', alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  cellText: { fontSize: 13, color: '#0f172a' },
  statusDotRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  typeBadgeText: { fontSize: 11, fontWeight: '700' },
  emptyTable: { alignItems: 'center', justifyContent: 'center', padding: 60 },
  emptyText: { marginTop: 12, fontSize: 15, color: '#94a3b8', fontWeight: '500' },
  actionBar: { backgroundColor: ACTION_BAR_DARK, borderRadius: 10, flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, height: 40, borderRadius: 8 },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  filterDrops: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', height: 36, paddingHorizontal: 14, borderRadius: 8, marginHorizontal: 8 },
  filterDropsLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginRight: 8 },
  filterDropsValue: { fontSize: 13, fontWeight: '700', color: '#fff' },
  printBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, height: 40, borderRadius: 8, backgroundColor: '#8b5cf6' },
  printBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  deleteAllBtnSuper: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, height: 40, borderRadius: 8, backgroundColor: '#ef4444', marginLeft: 'auto' },
  deleteAllBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  reportStatsRow: { flexDirection: 'row', gap: 24 },
  reportStatCard: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 24, borderRadius: 16, borderWidth: 1, gap: 16 },
  reportStatIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  reportStatTitle: { fontSize: 11, fontWeight: '800', marginBottom: 4, letterSpacing: 0.5 },
  reportStatValue: { fontSize: 28, fontWeight: '800', color: '#0f172a' }
});

