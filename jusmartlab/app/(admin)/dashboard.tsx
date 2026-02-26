import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, TextInput, useWindowDimensions, Pressable, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useProblems } from '@/contexts/ProblemsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { FACULTY_LABELS } from '@/types';
import { MOCK_BATCHES, MOCK_CLASSES } from '@/data/mockData';
import { MultiPerformanceAreaChart, FacultyBarChart, DonutChart, PerformanceAreaChart } from '@/components/charts/AdminCharts';
import { ConfirmModal } from '@/components/Modals';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { EditProfileModal } from '@/components/EditProfileModal';

type FilterStatus = 'All' | 'Pending' | 'Fixed';

// Define types for user and auth context
type User = {
  name?: string;
  email?: string;
  role?: string;
};

type AuthContextType = {
  logout: () => void;
  user?: User;
};

function ActionBtn({
  icon,
  label,
  onPress,
  backgroundColor,
  hoverBg,
  styles,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  backgroundColor: string;
  hoverBg?: string;
  styles: any;
}) {
  const [hovered, setHovered] = useState(false);
  const bg = hovered && hoverBg ? hoverBg : backgroundColor;
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.actionBtn,
        { backgroundColor: bg, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <Ionicons name={icon} size={18} color="#fff" />
      <Text style={styles.actionBtnText}>{label}</Text>
    </Pressable>
  );
}

function formatReportDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '—';
  }
}
function getBatchLabel(batchId: string) {
  return MOCK_BATCHES.find((b) => b.id === batchId)?.label ?? batchId;
}
function getClassLabel(classId: string) {
  return MOCK_CLASSES.find((c) => c.id === classId)?.label ?? classId;
}

// --- Theme Colors ---
const SIDEBAR_BG = '#0f172a'; // Slate Dark remains constant for sidebar branding
const SIDEBAR_ACTIVE = '#2563eb';

// --- Helper Components ---
const StatCard = ({ title, value, icon, color, bgColor, borderColor, compact, styles }: any) => (
  <View style={[
    styles.statCard,
    { backgroundColor: bgColor, borderColor: borderColor },
    compact && { padding: 12, height: 80 }
  ]}>
    <View style={[
      styles.statIcon,
      { backgroundColor: color },
      compact && { width: 32, height: 32, borderRadius: 6 }
    ]}>
      <Ionicons name={icon} size={compact ? 16 : 20} color="#fff" />
    </View>
    <View>
      <Text style={[
        styles.statTitle,
        { color: color },
        compact && { fontSize: 10, marginBottom: 2 }
      ]}>{title}</Text>
      <Text style={[
        styles.statValue,
        compact && { fontSize: 18, color: styles.statValue.color }
      ]}>{value}</Text>
    </View>
  </View>
);


const SettingsView = ({
  styles,
  preferences,
  onToggle,
  onReset,
  onExport,
  onClearCache
}: {
  styles: any;
  preferences: any;
  onToggle: (key: string, current: boolean) => void;
  onReset: () => void;
  onExport: () => void;
  onClearCache: () => void;
}) => {
  const { toggleTheme } = useTheme();
  const {
    emailNotifications,
    pushNotifications,
    compactView,
    autoSave,
    reportArchiving,
    isDark
  } = preferences;


  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 32, gap: 24 }}>
      {/* Appearance Settings */}
      <View style={styles.settingsSection}>
        <View style={styles.settingsSectionHeader}>
          <View style={styles.settingsIconWrapper}>
            <Ionicons name="color-palette" size={20} color="#2563eb" />
          </View>
          <Text style={styles.settingsSectionTitle}>Appearance</Text>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingsItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsItemTitle}>Dark Mode</Text>
              <Text style={styles.settingsItemDesc}>Toggle dark theme for the dashboard</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, isDark && styles.toggleActive]}
              onPress={toggleTheme}
            >
              <View style={[styles.toggleThumb, isDark && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          <View style={[styles.settingsItem, { borderTopWidth: 1, borderTopColor: '#f1f5f9' }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsItemTitle}>Compact View</Text>
              <Text style={styles.settingsItemDesc}>Show more content in less space</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, compactView && styles.toggleActive]}
              onPress={() => onToggle('compactView', compactView)}
            >
              <View style={[styles.toggleThumb, compactView && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Notification Settings */}
      <View style={styles.settingsSection}>
        <View style={styles.settingsSectionHeader}>
          <View style={styles.settingsIconWrapper}>
            <Ionicons name="notifications" size={20} color="#8b5cf6" />
          </View>
          <Text style={styles.settingsSectionTitle}>Notifications</Text>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingsItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsItemTitle}>Email Notifications</Text>
              <Text style={styles.settingsItemDesc}>Receive updates via email</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, emailNotifications && styles.toggleActive]}
              onPress={() => onToggle('emailNotifications', emailNotifications)}
            >
              <View style={[styles.toggleThumb, emailNotifications && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          <View style={[styles.settingsItem, { borderTopWidth: 1, borderTopColor: '#f1f5f9' }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsItemTitle}>Push Notifications</Text>
              <Text style={styles.settingsItemDesc}>Get instant alerts for new reports</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, pushNotifications && styles.toggleActive]}
              onPress={() => onToggle('pushNotifications', pushNotifications)}
            >
              <View style={[styles.toggleThumb, pushNotifications && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* System Preferences */}
      <View style={styles.settingsSection}>
        <View style={styles.settingsSectionHeader}>
          <View style={styles.settingsIconWrapper}>
            <Ionicons name="cog" size={20} color="#10b981" />
          </View>
          <Text style={styles.settingsSectionTitle}>System Preferences</Text>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingsItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsItemTitle}>Auto-Save Reports</Text>
              <Text style={styles.settingsItemDesc}>Automatically save report changes</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, autoSave && styles.toggleActive]}
              onPress={() => onToggle('autoSave', autoSave)}
            >
              <View style={[styles.toggleThumb, autoSave && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          <View style={[styles.settingsItem, { borderTopWidth: 1, borderTopColor: '#f1f5f9' }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsItemTitle}>Report Archiving</Text>
              <Text style={styles.settingsItemDesc}>Archive old reports automatically after 30 days</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, reportArchiving && styles.toggleActive]}
              onPress={() => onToggle('reportArchiving', reportArchiving)}
            >
              <View style={[styles.toggleThumb, reportArchiving && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          <View style={[styles.settingsItem, { borderTopWidth: 1, borderTopColor: '#f1f5f9' }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsItemTitle}>Data Export</Text>
              <Text style={styles.settingsItemDesc}>Export reports data to CSV or Excel</Text>
            </View>
            <TouchableOpacity style={styles.settingsActionBtn} onPress={onExport}>
              <Ionicons name="download-outline" size={18} color="#2563eb" />
              <Text style={styles.settingsActionBtnText}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Admin Controls */}
      <View style={styles.settingsSection}>
        <View style={styles.settingsSectionHeader}>
          <View style={styles.settingsIconWrapper}>
            <Ionicons name="shield-checkmark" size={20} color="#ef4444" />
          </View>
          <Text style={styles.settingsSectionTitle}>Admin Controls</Text>
        </View>

        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingsItem} onPress={onClearCache}>
            <Ionicons name="trash-outline" size={20} color="#64748b" style={{ marginRight: 12 }} />
            <Text style={styles.settingsItemTitle}>Clear Cache</Text>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingsItem, { borderTopWidth: 1, borderTopColor: '#f1f5f9' }]} onPress={onReset}>
            <Ionicons name="refresh-outline" size={20} color="#64748b" style={{ marginRight: 12 }} />
            <Text style={styles.settingsItemTitle}>Reset Dashboard</Text>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingsItem, { borderTopWidth: 1, borderTopColor: '#f1f5f9' }]}
            onPress={() => Alert.alert("Support", "Please contact the system administrator at support@ju.edu for technical assistance.")}
          >
            <Ionicons name="help-circle-outline" size={20} color="#64748b" style={{ marginRight: 12 }} />
            <Text style={styles.settingsItemTitle}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Version Info */}
      <View style={{ alignItems: 'center', paddingVertical: 24 }}>
        <Text style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>JU Smart Lab Management System</Text>
        <Text style={{ fontSize: 12, color: '#cbd5e1' }}>Version 1.0.0 • Build 2026.02.04</Text>
      </View>
    </ScrollView>
  );
};

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { logout, user } = useAuth() as AuthContextType;
  const { problems, updateStatus, deleteProblem, deleteAllProblems, refreshFromStorage } = useProblems();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1000;
  const { isDark, toggleTheme, colors } = useTheme();
  const styles = createStyles(colors, isDark);

  const [activeTab, setActiveTab] = useState('dashboard'); // Default to Dashboard
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  type ConfirmModalType = 'deleteSelected' | 'deleteAll' | 'noSelection' | 'fixSelected' | null;
  const [confirmModal, setConfirmModal] = useState<ConfirmModalType>(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const filterDropdownRef = useRef<View>(null);
  const dropdownMenuRef = useRef<View>(null);

  // Global Settings State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [reportArchiving, setReportArchiving] = useState(false);
  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('admin-settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setEmailNotifications(parsed.emailNotifications ?? true);
          setPushNotifications(parsed.pushNotifications ?? true);
          setCompactView(parsed.compactView ?? false);
          setAutoSave(parsed.autoSave ?? true);
          setReportArchiving(parsed.reportArchiving ?? false);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Save settings helper
  const savePreference = async (key: string, value: any) => {
    try {
      const savedSettings = await AsyncStorage.getItem('admin-settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      settings[key] = value;
      await AsyncStorage.setItem('admin-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving preference:', error);
    }
  };

  const handleTogglePreference = (key: string, current: boolean) => {
    const newValue = !current;
    if (key === 'compactView') setCompactView(newValue);
    if (key === 'emailNotifications') setEmailNotifications(newValue);
    if (key === 'pushNotifications') setPushNotifications(newValue);
    if (key === 'autoSave') setAutoSave(newValue);
    if (key === 'reportArchiving') setReportArchiving(newValue);

    savePreference(key, newValue);
  };

  const handleResetAllSettings = async () => {
    setEmailNotifications(true);
    setPushNotifications(true);
    setCompactView(false);
    setAutoSave(true);
    setReportArchiving(false);
    if (isDark) toggleTheme();
    await AsyncStorage.removeItem('admin-settings');
    Alert.alert("Dashboard Reset", "All settings have been restored to defaults.");
  };


  // Close filter dropdown on outside click (web)
  useEffect(() => {
    if (!filterDropdownOpen || Platform.OS !== 'web') return;

    const close = (e: MouseEvent) => {
      const dropdownEl = dropdownMenuRef.current as unknown as HTMLElement | null;
      const triggerEl = filterDropdownRef.current as unknown as HTMLElement | null;

      const clickedOnDropdown = dropdownEl?.contains?.(e.target as Node);
      const clickedOnTrigger = triggerEl?.contains?.(e.target as Node);

      if (clickedOnDropdown || clickedOnTrigger) return;
      setFilterDropdownOpen(false);
    };

    const t = setTimeout(() => {
      if (typeof document !== 'undefined') {
        document.addEventListener('click', close);
      }
    }, 0);

    return () => {
      clearTimeout(t);
      if (typeof document !== 'undefined') {
        document.removeEventListener('click', close);
      }
    };
  }, [filterDropdownOpen]);

  // Derived Data
  const pendingCount = problems.filter(p => p.status === 'Pending').length;
  const fixedCount = problems.filter(p => p.status === 'Fixed').length;
  const totalReports = problems.length;

  // Filtered List for Reports View (search + status filter)
  const filteredProblems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return problems.filter(p => {
      if (!p) return false;
      const facultyName = (FACULTY_LABELS[p.facultyId as keyof typeof FACULTY_LABELS] || 'N/A').toLowerCase();
      const batchName = (getBatchLabel(p.batchId) || '').toLowerCase();
      const className = (getClassLabel(p.classId) || '').toLowerCase();
      const studentName = (p.studentName || '').toLowerCase();
      const computerNum = (p.computerNumber || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const serverNum = (p.serverNumber || '').toLowerCase();
      const problemType = (p.problemType || '').toLowerCase();

      const matchSearch = !q ||
        studentName.includes(q) ||
        computerNum.includes(q) ||
        desc.includes(q) ||
        facultyName.includes(q) ||
        batchName.includes(q) ||
        className.includes(q) ||
        serverNum.includes(q) ||
        problemType.includes(q);
      const matchStatus = filterStatus === 'All' || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [problems, searchQuery, filterStatus]);

  // --- Real Data Processing for Charts ---

  // 1. Trend Data (Mapped to real report months)
  const chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const chartData = useMemo(() => {
    // Current year
    const year = new Date().getFullYear();

    const counts = chartLabels.map((m, i) => {
      // Find reports for this specific month in the current year
      return problems.filter(p => {
        const d = new Date(p.submittedAt);
        const monthMatch = d.toLocaleDateString('en-US', { month: 'short' }) === m;
        const yearMatch = d.getFullYear() === year;
        return monthMatch && yearMatch;
      }).length;
    });

    return { labels: chartLabels, data: counts };
  }, [problems]);

  // 2. Faculty Distribution
  // 2. Faculty Distribution
  const facultyData = useMemo(() => {
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

    // Get all faculty IDs from FACULTY_LABELS
    const facultyEntries = Object.entries(FACULTY_LABELS) as [string, string][];

    return facultyEntries.map(([id, label], i) => {
      return {
        label: label.split(' ')[0], // Short name
        value: problems.filter(p => String(p.facultyId) === String(id)).length,
        color: colors[i % colors.length]
      };
    }).filter(d => d.value > 0 || d.label === 'IT'); // Keep IT even if empty for visual balance
  }, [problems]);

  // 3. Status Distribution (Real Project Data)
  const statusBreakdown = useMemo(() => ([
    { label: 'Fixed', value: fixedCount, color: '#10b981' },
    { label: 'Pending', value: pendingCount, color: '#ef4444' },
    { label: 'In Review', value: 0, color: '#f59e0b' }
  ]), [fixedCount, pendingCount]);

  // 4. Problem Type Breakdown
  const typeBreakdown = useMemo(() => {
    const types = ['Software', 'Hardware', 'Network', 'Other'];
    return types.map((t, i) => {
      const colors = ['#6366f1', '#f43f5e', '#0ea5e9', '#94a3b8'];
      return {
        label: t,
        value: problems.filter(p => p.problemType === t).length,
        color: colors[i]
      }
    });
  }, [problems]);

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
    setConfirmModal(null);
  };

  const runDeleteSelected = () => {
    selectedProblems.forEach(id => deleteProblem(id));
    setSelectedProblems([]);
    setConfirmModal(null);
  };

  const handleDeleteSelected = () => {
    if (selectedProblems.length === 0) {
      setConfirmModal('noSelection');
      return;
    }
    setConfirmModal('deleteSelected');
  };

  const handleDeleteAll = () => {
    setConfirmModal('deleteAll');
  };

  const runDeleteAll = () => {
    deleteAllProblems();
    setSelectedProblems([]);
    setConfirmModal(null);
  };

  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "Select your preferred format for exporting report data.",
      [
        { text: "CSV Format", onPress: () => simulateExport('CSV') },
        { text: "Excel Format", onPress: () => simulateExport('Excel') },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const simulateExport = (format: string) => {
    Alert.alert("Export Started", `Generating ${format} file...`);
    setTimeout(() => {
      Alert.alert("Export Complete", `Your data has been exported successfully as a ${format} file.`);
    }, 1500);
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to clear the system cache?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          onPress: () => {
            setTimeout(() => {
              Alert.alert("Success", "System cache has been cleared successfully.");
            }, 500);
          },
          style: "destructive"
        }
      ]
    );
  };

  const handlePrint = () => {
    if (Platform.OS === 'web') {
      const currentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JU Smart Lab Report</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root { --primary: #1e3a8a; --accent: #2563eb; --text: #1e293b; --muted: #64748b; }
    body { font-family: 'Inter', sans-serif; color: var(--text); padding: 0; margin: 0; background: white; }
    .page { max-width: 1000px; margin: 0 auto; padding: 25px; }
    
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid var(--primary); padding-bottom: 15px; margin-bottom: 25px; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .logo-box { width: 44px; height: 44px; background: var(--primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .header-title { color: var(--primary); font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header-date { text-align: right; font-size: 11px; color: var(--muted); line-height: 1.4; }

    /* ── Updated Stats Section ──────────────── */
    .stats { display: flex; gap: 15px; margin-bottom: 25px; }
    .stat-item { flex: 1; border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 14px; position: relative; overflow: hidden; border: 1px solid rgba(0,0,0,0.05); }
    
    .stat-icon-box { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 1px; }
    .stat-value { font-size: 22px; font-weight: 900; line-height: 1; }

    /* Blue - Total */
    .stat-total { background-color: #eff6ff; }
    .stat-total .stat-icon-box { background-color: #2563eb; color: white; }
    .stat-total .stat-label, .stat-total .stat-value { color: #1e40af; }

    /* Orange - Pending */
    .stat-pending { background-color: #fffbeb; }
    .stat-pending .stat-icon-box { background-color: #f59e0b; color: white; }
    .stat-pending .stat-label, .stat-pending .stat-value { color: #b45309; }

    /* Green - Fixed */
    .stat-fixed { background-color: #ecfdf5; }
    .stat-fixed .stat-icon-box { background-color: #10b981; color: white; }
    .stat-fixed .stat-label, .stat-fixed .stat-value { color: #065f46; }

    table { width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    th { background: var(--primary); color: white; padding: 10px 8px; text-align: left; text-transform: uppercase; font-size: 9px; font-weight: 700; }
    td { padding: 9px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    tr:nth-child(even) { background: #fcfcfc; }
    
    .id-col { font-weight: 700; color: var(--primary); font-family: monospace; }
    .name-col { font-weight: 600; color: var(--text); }
    
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 9px; }
    .badge-fixed { background: #dcfce7; color: #166534; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    
    .footer { margin-top: 30px; text-align: center; font-size: 11px; color: var(--muted); border-top: 1px solid #f1f5f9; padding-top: 15px; }

    @media print {
      @page { margin: 1cm; }
      body { -webkit-print-color-adjust: exact; }
      .page { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-left">
        <div class="logo-box">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
        </div>
        <div>
          <div class="header-title">JU Smart Lab</div>
          <div style="font-size: 11px; color: var(--muted); font-weight: 500;">Problem Reports Archive</div>
        </div>
      </div>
      <div class="header-date">
        Generation Time<br><b>${currentDate}</b>
      </div>
    </div>

    <div class="stats">
      <!-- Total Reports Card -->
      <div class="stat-item stat-total">
        <div class="stat-icon-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Reports</span>
          <div class="stat-value">${totalReports}</div>
        </div>
      </div>

      <!-- Pending Card -->
      <div class="stat-item stat-pending">
        <div class="stat-icon-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Pending</span>
          <div class="stat-value">${pendingCount}</div>
        </div>
      </div>

      <!-- Fixed Card -->
      <div class="stat-item stat-fixed">
        <div class="stat-icon-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Fixed</span>
          <div class="stat-value">${fixedCount}</div>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>PC</th>
          <th>Student</th>
          <th>Faculty</th>
          <th>Batch</th>
          <th>Class</th>
          <th>Date</th>
          <th>Type</th>
          <th>Description</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${filteredProblems.map(p => `
          <tr>
            <td class="id-col">#${p.id}</td>
            <td><b>PC ${p.computerNumber}</b></td>
            <td class="name-col">${p.studentName || '—'}</td>
            <td>${FACULTY_LABELS[p.facultyId as keyof typeof FACULTY_LABELS] || 'N/A'}</td>
            <td>${getBatchLabel(p.batchId)}</td>
            <td>${getClassLabel(p.classId)}</td>
            <td style="white-space:nowrap">${formatReportDate(p.submittedAt)}</td>
            <td>${p.problemType}</td>
            <td style="max-width: 180px; color: #4b5563;">${p.description || '—'}</td>
            <td><span class="badge badge-${p.status.toLowerCase()}">${p.status}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="footer">
      Jazeera University - Smart Lab Management System &copy; ${new Date().getFullYear()}<br>
      <span style="font-size: 8px; opacity: 0.6;">Automated System Report for Lab Administration</span>
    </div>
  </div>
</body>
</html>`;

      // Create a hidden iframe for printing
      const iframeId = 'print-iframe';
      let iframe = document.getElementById(iframeId) as HTMLIFrameElement;

      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = iframeId;
        iframe.style.position = 'absolute';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
      }

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();

        // Give it a moment to render fonts and styles
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        }, 800);
      }
    } else {
      alert(`Print feature is available on Web. Current reports: ${filteredProblems.length}`);
    }
  };

  // --- RENDER VIEWS ---

  const renderDashboardOverview = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 32, gap: 24 }}>
      {/* Top Stats Row */}
      <View style={styles.statsRow}>
        <StatCard
          title="Total Reports"
          value={totalReports}
          icon="document-text"
          color="#2563eb"
          bgColor={isDark ? 'rgba(37, 99, 235, 0.1)' : '#eff6ff'}
          borderColor={isDark ? 'rgba(37, 99, 235, 0.2)' : '#dbeafe'}
          styles={styles}
          compact
        />
        <StatCard
          title="Pending"
          value={pendingCount}
          icon="time"
          color="#f59e0b"
          bgColor={isDark ? 'rgba(245, 158, 11, 0.1)' : '#fffbeb'}
          borderColor={isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7'}
          styles={styles}
          compact
        />
        <StatCard
          title="Fixed"
          value={fixedCount}
          icon="checkmark-circle"
          color="#10b981"
          bgColor={isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5'}
          borderColor={isDark ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5'}
          styles={styles}
          compact
        />
      </View>

      {/* Main Stats Grid - EXACT REFERENCE LAYOUT */}
      <View style={[styles.dashboardGrid, { height: 460 }]}>

        {/* Report Volume (Trends) - MATCHING FINANCIAL OVERVIEW */}
        <View style={[styles.card, { flex: 2.2, height: 480 }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Financial Overview</Text>
            <TouchableOpacity style={styles.cardAction}>
              <Ionicons name="ellipsis-horizontal" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>
          <View style={[styles.chartContainer, { paddingBottom: 10 }]}>
            <PerformanceAreaChart
              data={chartData.data}
              labels={chartData.labels}
              height={320}
            />
          </View>
        </View>

        {/* System Status (Overview) - MATCHING ATTENDANCE TODAY */}
        <View style={[styles.card, { flex: 1.2, height: 480 }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Attendance Today</Text>
          </View>
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <DonutChart data={statusBreakdown} size={300} />
          </View>
        </View>
      </View>

      {/* Second Row: Distributions */}
      <View style={styles.dashboardGrid}>

        {/* Faculty Distribution */}
        <View style={[styles.card, { flex: 1.5 }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Reports per Faculty</Text>
              <Text style={styles.cardSub}>Distribution of issues across labs</Text>
            </View>
          </View>
          <View style={{ padding: 20 }}>
            <FacultyBarChart data={facultyData} height={200} />
          </View>
        </View>

        {/* Problem Type Distribution */}
        <View style={[styles.card, { flex: 1 }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Problem Types</Text>
          </View>
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingBottom: 20 }}>
            <DonutChart data={typeBreakdown} size={160} />
          </View>
        </View>

        {/* Recent Activity (Moved here for better layout) */}
        <View style={[styles.card, { flex: 1 }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => setActiveTab('reports')}>
              <Text style={styles.linkText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={{ gap: 12 }}>
            {problems.slice(0, 5).map((p, i) => (
              <View key={p.id} style={[styles.activityItem, i !== Math.min(problems.length, 5) - 1 && { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }]}>
                <View style={[styles.activityIcon, { backgroundColor: p.status === 'Fixed' ? '#ecfdf5' : '#fffbeb' }]}>
                  <Ionicons
                    name={p.status === 'Fixed' ? "checkmark" : "alert"}
                    size={14}
                    color={p.status === 'Fixed' ? "#10b981" : "#f59e0b"}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityText} numberOfLines={1}>
                    <Text style={{ fontWeight: '700' }}>{p.computerNumber}</Text> ({p.problemType})
                  </Text>
                  <Text style={styles.activitySub}>{p.studentName}</Text>
                </View>
              </View>
            ))}
            {problems.length === 0 && (
              <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 20 }}>No activity yet</Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderManageReports = () => (
    <View style={styles.contentArea}>
      {/* Filters Bar - Fixed layout */}
      <View style={styles.filterBarWrap}>
        <View style={styles.filterBar}>
          {/* Search Box */}
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

          {/* Filter Dropdown */}
          <View style={styles.filterDropdownWrapper}>
            <Text style={styles.filterSegmentsLabel}>Filter:</Text>
            <View style={styles.filterDropdownContainer}>
              <Pressable
                ref={filterDropdownRef}
                style={styles.filterDropdownBtn}
                onPress={() => setFilterDropdownOpen((v) => !v)}
              >
                <Ionicons
                  name={filterStatus === 'All' ? 'list-outline' : filterStatus === 'Pending' ? 'time-outline' : 'checkmark-circle-outline'}
                  size={18}
                  color="#0f172a"
                />
                <Text style={styles.filterDropdownText}>
                  {filterStatus === 'All' ? 'All' : filterStatus}
                </Text>
                <Ionicons
                  name={filterDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#64748b"
                />
              </Pressable>

              {/* DROPDOWN MENU */}
              {filterDropdownOpen && (
                <View
                  ref={dropdownMenuRef}
                  style={styles.filterDropdownMenu}
                >
                  {(['All', 'Pending', 'Fixed'] as const).map((status, idx) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterDropdownItem,
                        filterStatus === status && styles.filterDropdownItemActive,
                        idx === 2 && { borderBottomWidth: 0 },
                      ]}
                      onPress={() => {
                        setFilterStatus(status);
                        setFilterDropdownOpen(false);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={status === 'All' ? 'list-outline' : status === 'Pending' ? 'time-outline' : 'checkmark-circle-outline'}
                        size={16}
                        color={filterStatus === status ? '#fff' : '#64748b'}
                      />
                      <Text style={[
                        styles.filterDropdownItemText,
                        filterStatus === status && styles.filterDropdownItemTextActive
                      ]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={{ flex: 1 }} />
          <Text style={styles.totalCount}>
            TOTAL REPORTS: <Text style={{ color: '#2563eb' }}>{problems.length}</Text>
          </Text>
        </View>
      </View>

      {/* TABLE — all 9 form fields + ID + STATUS - REMOVED HORIZONTAL SCROLL */}
      <View style={styles.tableContainer}>
        <View style={{ width: '100%' }}>
          {/* Header - BLUE BACKGROUND */}
          <View style={[styles.tableHeader, compactView && { height: 40 }]}>
            <View style={styles.colCheckbox}>
              <TouchableOpacity onPress={handleSelectAll}>
                <View style={[styles.checkbox, selectedProblems.length === filteredProblems.length && selectedProblems.length > 0 && styles.checkboxActive]} />
              </TouchableOpacity>
            </View>
            <View style={styles.colId}><Text style={[styles.colHeader, compactView && { fontSize: 10 }]}>ID</Text></View>
            <View style={styles.colComputer}><Text style={[styles.colHeader, compactView && { fontSize: 10 }]}>COMPUTER #</Text></View>
            <View style={styles.colStudent}><Text style={[styles.colHeader, compactView && { fontSize: 10 }]}>STUDENT NAME</Text></View>
            <View style={styles.colFaculty}><Text style={[styles.colHeader, compactView && { fontSize: 10 }]}>FACULTY</Text></View>
            <View style={styles.colBatch}><Text style={[styles.colHeader, compactView && { fontSize: 10 }]}>BATCH</Text></View>
            <View style={styles.colClass}><Text style={[styles.colHeader, compactView && { fontSize: 10 }]}>CLASS</Text></View>
            <View style={styles.colServer}><Text style={[styles.colHeader, compactView && { fontSize: 10 }]}>SERVER #</Text></View>
            <View style={styles.colDate}><Text style={[styles.colHeader, compactView && { fontSize: 10 }]}>DATE</Text></View>
            <View style={styles.colType}><Text style={[styles.colHeader, compactView && { fontSize: 10 }]}>PROBLEM TYPE</Text></View>
            <View style={styles.colDesc}><Text style={[styles.colHeader, compactView && { fontSize: 10 }]}>DESCRIPTION</Text></View>
            <View style={styles.colStatus}><Text style={[styles.colHeader, compactView && { fontSize: 10 }]}>STATUS</Text></View>
          </View>

          <ScrollView style={{ maxHeight: 400 }}>
            {filteredProblems.length === 0 ? (
              <View style={styles.tableEmpty}>
                <Ionicons name="document-text-outline" size={48} color="#94a3b8" />
                <Text style={styles.tableEmptyText}>
                  {problems.length === 0
                    ? 'No reports yet. Submit a problem from the student form to see it here.'
                    : 'No reports match your search or filter.'}
                </Text>
              </View>
            ) : filteredProblems.map(p => (
              <View key={p.id} style={[styles.tableRow, compactView && { height: 40 }]}>
                <View style={styles.colCheckbox}>
                  <TouchableOpacity onPress={() => toggleSelection(p.id)}>
                    <View style={[styles.checkbox, selectedProblems.includes(p.id) && styles.checkboxActive]}>
                      {selectedProblems.includes(p.id) && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.colId}><Text style={[styles.cellText, { fontWeight: '700' }, compactView && { fontSize: 11 }]}>#{p.id}</Text></View>
                <View style={styles.colComputer}><Text style={[styles.cellText, compactView && { fontSize: 11 }]}>{p.computerNumber}</Text></View>
                <View style={styles.colStudent}><Text style={[styles.cellText, compactView && { fontSize: 11 }]}>{p.studentName}</Text></View>
                <View style={styles.colFaculty}><Text style={[styles.cellText, compactView && { fontSize: 11 }]}>{FACULTY_LABELS[p.facultyId] || 'N/A'}</Text></View>
                <View style={styles.colBatch}><Text style={[styles.cellText, compactView && { fontSize: 11 }]}>{getBatchLabel(p.batchId)}</Text></View>
                <View style={styles.colClass}><Text style={[styles.cellText, compactView && { fontSize: 11 }]}>{getClassLabel(p.classId)}</Text></View>
                <View style={styles.colServer}><Text style={[styles.cellText, compactView && { fontSize: 11 }]}>{p.serverNumber || '—'}</Text></View>
                <View style={styles.colDate}><Text style={[styles.cellText, compactView && { fontSize: 11 }]}>{formatReportDate(p.submittedAt)}</Text></View>
                <View style={styles.colType}>
                  <View style={[styles.badge,
                  p.problemType === 'Software' ? { backgroundColor: '#dbeafe' } :
                    p.problemType === 'Hardware' ? { backgroundColor: '#fce7f3' } :
                      { backgroundColor: '#ffedd5' },
                  compactView && { height: 22, paddingHorizontal: 6 }
                  ]}>
                    <Text style={[styles.badgeText,
                    p.problemType === 'Software' ? { color: '#2563eb' } :
                      p.problemType === 'Hardware' ? { color: '#be185d' } :
                        { color: '#c2410c' },
                    compactView && { fontSize: 9 }
                    ]}>{p.problemType}</Text>
                  </View>
                </View>
                <View style={styles.colDesc}><Text style={[styles.cellText, { color: '#64748b' }, compactView && { fontSize: 11 }]} numberOfLines={1}>{p.description}</Text></View>
                <View style={styles.colStatus}>
                  <View style={styles.statusDotRow}>
                    <View style={[styles.statusDot, { backgroundColor: p.status === 'Fixed' ? '#10b981' : '#f59e0b' }, compactView && { width: 6, height: 6 }]} />
                    <Text style={[styles.cellText, { fontWeight: '600', color: p.status === 'Fixed' ? '#10b981' : '#f59e0b' }, compactView && { fontSize: 11 }]}>{p.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* ACTION BAR (Bottom) */}
      <View style={styles.actionBar}>
        <ActionBtn
          icon="checkmark-circle"
          label={`Mark ${selectedProblems.length} Fixed`}
          onPress={() => setConfirmModal('fixSelected')}
          backgroundColor="#10b981"
          hoverBg="#059669"
          styles={styles}
        />
        <ActionBtn
          icon="trash-outline"
          label={`Delete ${selectedProblems.length}`}
          onPress={handleDeleteSelected}
          backgroundColor="#ef4444"
          hoverBg="#dc2626"
          styles={styles}
        />

        <View style={styles.filterDrops}>
          <Text style={styles.filterDropsLabel}>Filter:</Text>
          <Text style={styles.filterDropsValue}>{filterStatus === 'All' ? 'Show All' : filterStatus}</Text>
        </View>



        {/* Print Button */}
        <Pressable
          onPress={handlePrint}
          style={({ pressed, hovered }) => [
            styles.printBtn,
            {
              backgroundColor: hovered ? '#7c3aed' : '#8b5cf6',
              opacity: pressed ? 0.9 : 1
            }
          ]}
          onHoverIn={() => { }}
          onHoverOut={() => { }}
        >
          <Ionicons name="print-outline" size={18} color="#fff" />
          <Text style={styles.printBtnText}>PRINT</Text>
        </Pressable>

        <ActionBtn
          icon="trash-bin-outline"
          label="Delete All"
          onPress={handleDeleteAll}
          backgroundColor="#ef4444"
          hoverBg="#dc2626"
          styles={styles}
        />
      </View>

      {/* STATS CARDS (Bottom) */}
      <View style={styles.statsRow}>
        <StatCard
          title="TOTAL FIXED" value={fixedCount}
          icon="checkmark" color="#10b981" bgColor="#ecfdf5" borderColor="#d1fae5"
          styles={styles}
        />
        <StatCard
          title="TOTAL PENDING" value={pendingCount}
          icon="time" color="#f59e0b" bgColor="#fffbeb" borderColor="#fef3c7"
          styles={styles}
          compact={compactView}
        />
        <StatCard
          title="REPORTS MONTH" value={totalReports}
          icon="document-text" color="#3b82f6" bgColor="#eff6ff" borderColor="#dbeafe"
          styles={styles}
          compact={compactView}
        />
      </View>
    </View>
  );

  const renderProfileSettings = () => {
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 32, gap: 24 }}>
        {/* Single Column Layout with Banner */}
        <View style={styles.profileMainContent}>
          {/* Welcome Banner */}
          <View style={styles.profileBanner}>
            <View style={styles.profileBannerIcon}>
              <Ionicons name="person" size={32} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileWelcome}>Welcome back, {user?.name || 'Ahmed Khalid Omar'}!</Text>
              <Text style={styles.profileWelcomeSub}>
                Manage your personal information, security settings, and lab system preferences from your central profile dashboard.
              </Text>
            </View>
            <View style={styles.profileAvatarLarge}>
              <Text style={styles.profileAvatarText}>AU</Text>
            </View>
          </View>
          {/* Admin Information Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileCardHeader}>
              <View style={styles.profileCardIconWrapper}>
                <Ionicons name="information-circle" size={20} color="#2563eb" />
              </View>
              <Text style={styles.profileCardTitle}>Admin Information</Text>
              <TouchableOpacity style={styles.editBtn} onPress={() => setEditProfileModalVisible(true)}>
                <Ionicons name="create-outline" size={18} color="#2563eb" />
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfoGrid}>
              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>FULL NAME</Text>
                <Text style={styles.profileInfoValue}>{user?.name || 'Ahmed Khalid Omar'}</Text>
              </View>

              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>OFFICIAL EMAIL</Text>
                <Text style={styles.profileInfoValue}>{user?.email || 'admin@ju.edu'}</Text>
              </View>

              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>SYSTEM ROLE</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{user?.role?.toUpperCase() || 'ADMIN'}</Text>
                </View>
              </View>

              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>ACCOUNT CREATED</Text>
                <Text style={styles.profileInfoValue}>February 1, 2026</Text>
              </View>
            </View>
          </View>

          {/* Security Settings Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileCardHeader}>
              <View style={styles.profileCardIconWrapper}>
                <Ionicons name="shield-checkmark" size={20} color="#10b981" />
              </View>
              <Text style={styles.profileCardTitle}>Security Settings</Text>
            </View>

            <View style={styles.securityItem}>
              <View style={styles.securityIcon}>
                <Ionicons name="key" size={20} color="#f59e0b" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.securityTitle}>Password Management</Text>
                <Text style={styles.securitySubtitle}>Last changed 4 months ago</Text>
              </View>
              <TouchableOpacity
                style={styles.updatePasswordBtn}
                onPress={() => setPasswordModalVisible(true)}
              >
                <Text style={styles.updatePasswordBtnText}>Update Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>

      {/* --- SIDEBAR --- */}
      <View style={[styles.sidebar, { width: isDesktop ? 260 : 80 }, compactView && isDesktop && { width: 220 }]}>

        {/* Logo Area */}
        <View style={[styles.sidebarHeader, compactView && { padding: 16 }]}>
          <View style={styles.logoBox}>
            <Image
              source={require('@/assets/images/ju-logo.png')}
              style={{ width: isDesktop ? 32 : 28, height: isDesktop ? 32 : 28 }}
              resizeMode="contain"
            />
          </View>
          {isDesktop && (
            <View>
              <Text style={styles.appName}>JU Smart Lab</Text>
              <Text style={styles.appSub}>MANAGEMENT SYSTEM</Text>
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {[
            { id: 'dashboard', icon: 'grid-outline', label: 'Dashboard' },
            { id: 'reports', icon: 'clipboard-outline', label: 'Manage Reports' },
            { id: 'profile', icon: 'person-outline', label: 'Profile' },
            { id: 'settings', icon: 'settings-outline', label: 'Settings' },
          ].map(item => {
            const isActive = activeTab === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  isActive && styles.menuItemActive,
                  !isDesktop && { justifyContent: 'center', paddingHorizontal: 0 }
                ]}
                onPress={() => setActiveTab(item.id)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={isActive ? "#fff" : "rgba(255,255,255,0.6)"}
                />
                {isDesktop && (
                  <Text style={[
                    styles.menuText,
                    isActive && { color: '#fff', fontWeight: '700' }
                  ]}>
                    {item.label}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* User Profile (Bottom) */}
        <View style={styles.userProfile}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AD</Text>
            </View>
            {isDesktop && (
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>Admin User</Text>
                <Text style={styles.userEmail}>admin@jazeera.edu</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.logoutIconBtn}
            onPress={() => { logout(); router.replace('/'); }}
          >
            <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- MAIN CONTENT --- */}
      <View style={styles.main}>
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>
            {activeTab === 'dashboard' ? 'Dashboard Overview' :
              activeTab === 'profile' ? 'Admin Profile' :
                activeTab === 'settings' ? 'System Settings' : 'Manage Problem Reports'}
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={toggleTheme}>
              <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={20} color="#64748b" style={{ marginRight: 16 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert("Notifications", "You have no new notifications.")}>
              <Ionicons name="notifications-outline" size={20} color="#64748b" style={{ marginRight: 16 }} />
            </TouchableOpacity>
            <View style={styles.uniTag}>
              <Text style={styles.uniText}>Jazeera University</Text>
            </View>
          </View>
        </View>

        {/* Dynamic Content */}
        {activeTab === 'dashboard' ? renderDashboardOverview() :
          activeTab === 'profile' ? renderProfileSettings() :
            activeTab === 'settings' ? (
              <SettingsView
                styles={styles}
                preferences={{
                  emailNotifications,
                  pushNotifications,
                  compactView,
                  autoSave,
                  reportArchiving,
                  isDark
                }}
                onToggle={handleTogglePreference}
                onReset={handleResetAllSettings}
                onExport={handleExportData}
                onClearCache={handleClearCache}
              />
            ) :
              renderManageReports()}

      </View>

      {/* Beautiful confirm modals (no alerts) */}
      <ConfirmModal
        visible={confirmModal === 'noSelection'}
        onClose={() => setConfirmModal(null)}
        variant="info"
        title="No selection"
        message="Please select at least one report to delete."
        primaryLabel="OK"
        onPrimary={() => setConfirmModal(null)}
      />
      <ConfirmModal
        visible={confirmModal === 'deleteSelected'}
        onClose={() => setConfirmModal(null)}
        variant="warning"
        title="Delete reports?"
        message={`Delete ${selectedProblems.length} report(s)? This action cannot be undone.`}
        primaryLabel="Delete"
        onPrimary={runDeleteSelected}
        secondaryLabel="Cancel"
      />
      <ConfirmModal
        visible={confirmModal === 'deleteAll'}
        onClose={() => setConfirmModal(null)}
        variant="warning"
        title="Delete all reports?"
        message="Are you sure you want to delete ALL reports? This action cannot be undone."
        primaryLabel="Delete All"
        onPrimary={runDeleteAll}
        secondaryLabel="Cancel"
      />
      <ConfirmModal
        visible={confirmModal === 'fixSelected'}
        onClose={() => setConfirmModal(null)}
        variant="success"
        title="Mark as Fixed?"
        message={`Mark ${selectedProblems.length} report(s) as fixed?`}
        primaryLabel="Mark Fixed"
        onPrimary={handleFixSelected}
        secondaryLabel="Cancel"
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editProfileModalVisible}
        onClose={() => setEditProfileModalVisible(false)}
      />
    </View>
  );
}

// --- STYLES ---
const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.bg
  },

  // Sidebar
  sidebar: {
    backgroundColor: SIDEBAR_BG,
    paddingVertical: 24,
    justifyContent: 'space-between'
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
    gap: 12
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  appName: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16
  },
  appSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1
  },

  menuContainer: {
    gap: 8
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    borderRadius: 10,
    gap: 12,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: SIDEBAR_ACTIVE,
  },
  menuText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600'
  },

  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
    marginTop: 'auto',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)'
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SIDEBAR_ACTIVE,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12
  },
  userName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13
  },
  userEmail: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11
  },
  logoutIconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  // Main
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    height: 70,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  uniTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
    borderRadius: 6
  },
  uniText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600'
  },

  contentArea: {
    flex: 1,
    padding: 32,
    gap: 24
  },

  // Dashboard Overview
  statsRow: {
    flexDirection: 'row',
    gap: 24
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text
  },

  dashboardGrid: {
    flexDirection: 'row',
    gap: 24,
    height: 400
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16, // Smoother corners matching reference
    borderWidth: 1,
    borderColor: colors.border, // Lighter border
    padding: 24, // More airy padding
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
  cardSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  cardAction: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'
  },
  linkText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '600'
  },

  // Chart Container
  chartContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Activity
  activityItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activityText: {
    fontSize: 13,
    color: colors.text
  },
  activitySub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  activityTime: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500'
  },

  // Filter Bar
  filterBarWrap: {
    position: 'relative',
    zIndex: 1000
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    width: 300,
    height: 44,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: colors.text
  },
  totalCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5
  },

  // Filter Dropdown
  filterDropdownWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  filterSegmentsLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  filterDropdownContainer: {
    position: 'relative'
  },
  filterDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.card,
    minWidth: 120,
    borderWidth: 1,
    borderColor: colors.border
  },
  filterDropdownText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    flex: 1
  },
  filterDropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
    minWidth: 120,
    zIndex: 999999,
    overflow: 'hidden'
  },
  filterDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card
  },
  filterDropdownItemActive: {
    backgroundColor: '#2563eb'
  },
  filterDropdownItemText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500'
  },
  filterDropdownItemTextActive: {
    color: '#fff',
    fontWeight: '600'
  },

  // Table
  tableContainer: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden'
  },
  tableHeader: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: isDark ? '#1e293b' : '#1e3a8a',
    alignItems: 'center',
    paddingHorizontal: 0
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    paddingHorizontal: 0,
    backgroundColor: colors.card
  },
  colCheckbox: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 16
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxActive: {
    backgroundColor: '#3b82f6',
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase'
  },
  colId: {
    width: 60,
    paddingHorizontal: 8,
    justifyContent: 'center'
  },
  colComputer: {
    width: 100,
    paddingHorizontal: 8,
    justifyContent: 'center'
  },
  colStudent: {
    width: 130,
    paddingHorizontal: 8,
    justifyContent: 'center'
  },
  colFaculty: {
    width: 160,
    paddingHorizontal: 8,
    justifyContent: 'center'
  },
  colBatch: {
    width: 80,
    paddingHorizontal: 8,
    justifyContent: 'center'
  },
  colClass: {
    width: 90,
    paddingHorizontal: 8,
    justifyContent: 'center'
  },
  colServer: {
    width: 90,
    paddingHorizontal: 8,
    justifyContent: 'center'
  },
  colDate: {
    width: 100,
    paddingHorizontal: 8,
    justifyContent: 'center'
  },
  colType: {
    width: 120,
    paddingHorizontal: 8,
    justifyContent: 'center'
  },
  colDesc: {
    width: 200,
    paddingHorizontal: 8,
    justifyContent: 'center'
  },
  colStatus: {
    width: 100,
    paddingHorizontal: 8,
    justifyContent: 'center',
    paddingRight: 16
  },
  tableEmpty: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  tableEmptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320
  },
  cellText: {
    fontSize: 13,
    color: colors.text
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600'
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },

  // Print Button
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    gap: 8
  },
  printBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700'
  },

  // Action Bar
  actionBar: {
    backgroundColor: isDark ? colors.card : '#0f172a',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    gap: 8
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700'
  },
  filterDrops: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginHorizontal: 8
  },
  filterDropsLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginRight: 8
  },
  filterDropsValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff'
  },

  // Profile Settings Styles
  profileBanner: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  profileBannerIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileWelcome: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  profileWelcomeSub: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  profileAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: isDark ? colors.bg : '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2563eb',
  },
  profileGrid: {
    flexDirection: 'row',
    gap: 24,
  },
  profileMainContent: {
    width: '100%',
    gap: 24,
  },
  profileColumn: {
    flex: 2,
    gap: 24,
  },
  profileColumnRight: {
    flex: 1,
    gap: 24,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  profileCardIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: isDark ? 'rgba(37, 99, 235, 0.1)' : '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: isDark ? 'rgba(37, 99, 235, 0.1)' : '#eff6ff',
    marginLeft: 'auto',
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
  profileInfoGrid: {
    gap: 20,
  },
  profileInfoItem: {
    gap: 6,
  },
  profileInfoLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  profileInfoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : '#dbeafe',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7',
    borderRadius: 12,
    gap: 16,
  },
  securityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  securitySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  updatePasswordBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  updatePasswordBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
  },
  activityGrid: {
    gap: 16,
  },
  activityCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card
  },
  activityCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityCardValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
  },
  activityCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  supportCard: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  supportIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  supportText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  supportBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  supportBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366f1',
  },

  // Settings Page Styles
  settingsSection: {
    gap: 16,
  },
  settingsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  settingsIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: isDark ? 'rgba(37, 99, 235, 0.1)' : '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  settingsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  settingsItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  settingsItemDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: isDark ? '#334155' : '#cbd5e1',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#2563eb',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  settingsActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: isDark ? 'rgba(37, 99, 235, 0.1)' : '#eff6ff',
  },
  settingsActionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
});