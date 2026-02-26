import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, TextInput, useWindowDimensions,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { JUColors, JUSpacing, JURadius, JUShadow } from '@/constants/theme';
import { useProblems } from '@/contexts/ProblemsContext';
import { FACULTY_LABELS, FACULTY_IDS, ProblemType } from '@/types';
import { MOCK_BATCHES, MOCK_CLASSES, MOCK_STUDENTS } from '@/data/mockData';
import { Select } from '@/components/ui/Select';

// --- Theme Helper ---
const getThemeColors = (isDark: boolean) => ({
  bg: isDark ? '#0f172a' : '#ffffff',
  surface: isDark ? '#1e293b' : '#f8fafc',
  text: isDark ? '#f8fafc' : '#0f172a',
  textMuted: isDark ? '#94a3b8' : '#64748b',
  border: isDark ? '#334155' : '#e2e8f0',
  inputBg: isDark ? '#1e293b' : '#f8fafc',
  error: '#ef4444',
  success: '#10b981',
});

const PROBLEM_TYPES: ProblemType[] = ['Software', 'Hardware', 'Network', 'Other'];

// Server options
const SERVER_OPTIONS = [
  { label: 'Server 1', value: 'Server 1' },
  { label: 'Server 2', value: 'Server 2' },
  { label: 'Server 3', value: 'Server 3' },
];

// Generate PC options for a given server
function getPcOptions(server: string) {
  if (server === 'Server 1') {
    return Array.from({ length: 28 }, (_, i) => ({ label: `PC ${i + 1}`, value: String(i + 1) }));
  }
  if (server === 'Server 2') {
    return Array.from({ length: 28 }, (_, i) => ({ label: `PC ${i + 29}`, value: String(i + 29) }));
  }
  if (server === 'Server 3') {
    return Array.from({ length: 28 }, (_, i) => ({ label: `PC ${i + 57}`, value: String(i + 57) }));
  }
  return [];
}

export function StudentHomeContent() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1000;

  const { addProblem } = useProblems();

  // --- Form State ---
  const [studentName, setStudentName] = useState('');
  const [facultyId, setFacultyId] = useState<any>(null);
  const [batchId, setBatchId] = useState('');
  const [classId, setClassId] = useState('');
  const [computerNumber, setComputerNumber] = useState('');
  const [serverNumber, setServerNumber] = useState('');
  const [problemType, setProblemType] = useState<ProblemType | null>(null);
  const [description, setDescription] = useState('');

  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showNotRegisteredModal, setShowNotRegisteredModal] = useState(false);

  // --- Derived Data ---
  const batches = useMemo(() => facultyId ? MOCK_BATCHES.filter(b => b.facultyId === facultyId) : [], [facultyId]);
  const classes = useMemo(() => batchId ? MOCK_CLASSES.filter(c => c.batchId === batchId) : [], [batchId]);
  const registeredStudents = useMemo(() => classId ? MOCK_STUDENTS.filter(s => s.classId === classId) : [], [classId]);
  const pcOptions = useMemo(() => getPcOptions(serverNumber), [serverNumber]);

  // Current date string
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const handleReset = () => {
    setStudentName('');
    setFacultyId(null);
    setBatchId('');
    setClassId('');
    setComputerNumber('');
    setServerNumber('');
    setProblemType(null);
    setDescription('');
    setErrors({});
  };

  const validate = () => {
    const newErrors: any = {};
    if (!facultyId) newErrors.facultyId = true;
    if (!batchId) newErrors.batchId = true;
    if (!classId) newErrors.classId = true;
    if (!studentName.trim()) newErrors.studentName = true;
    if (!serverNumber) newErrors.serverNumber = true;
    if (!computerNumber) newErrors.computerNumber = true;
    if (!problemType) newErrors.problemType = true;
    if (!description.trim()) newErrors.description = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      // Check if student is registered
      const isRegistered = registeredStudents.some(
        s => s.fullName.trim().toLowerCase() === studentName.trim().toLowerCase()
      );
      if (!isRegistered) {
        setShowNotRegisteredModal(true);
        return;
      }
      addProblem({
        studentName, facultyId, batchId, classId,
        computerNumber, serverNumber, problemType, description
      });
      setShowSuccessModal(true);
    } else {
      setShowErrorModal(true);
    }
  };

  // Helper for Input with Icon
  const InputWithIcon = ({ icon, style, hasError, ...props }: any) => (
    <View style={[
      styles.inputWrapper,
      { backgroundColor: colors.inputBg, borderColor: hasError ? colors.error : colors.border },
      style
    ]}>
      <Ionicons name={icon} size={20} color={hasError ? colors.error : colors.textMuted} style={{ marginRight: 10 }} />
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.inputField, { color: colors.text }]}
        {...props}
      />
      {hasError && <Ionicons name="alert-circle" size={18} color={colors.error} />}
    </View>
  );

  return (
    <View style={[styles.container, { flexDirection: isDesktop ? 'row' : 'column', backgroundColor: colors.bg }]}>

      {/* --- LEFT SIDEBAR (BRANDING) --- */}
      <View style={[styles.sidebar, { width: isDesktop ? '35%' : '100%', minHeight: isDesktop ? '100%' : 'auto' }]}>
        <View style={styles.sidebarContent}>
          <View style={styles.brandRow}>
            <Ionicons name="school" size={32} color="#fff" />
            <Text style={styles.brandName}>Jazeera University</Text>
          </View>

          <Text style={styles.sidebarTitle}>JU Smart Lab{'\n'}Management{'\n'}System</Text>

          <Text style={styles.sidebarDesc}>
            Professional academic portal for reporting technical issues within our computer laboratories.
            Your feedback helps us maintain excellence in learning environments.
          </Text>

          {isDesktop && (
            <View style={styles.sidebarFooter}>
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={24} color="#fff" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoText}>Please provide accurate details for faster resolution.</Text>
                </View>
              </View>
            </View>
          )}
        </View>
        <View style={styles.decoCircle} />
      </View>

      {/* --- RIGHT CONTENT (FORM) --- */}
      <View style={styles.mainContent}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: isDesktop ? 40 : 100 }]}
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.headerRow}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Lab Problem Report Form</Text>

            {/* Header Right Actions */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(37,99,235,0.2)' : '#eff6ff' }]}>
                <Text style={styles.badgeText}>STUDENT ACCESS</Text>
              </View>

              {/* ADMIN LOGIN BUTTON */}
              <TouchableOpacity
                onPress={() => router.push('/login')}
                style={[styles.adminBtn, { borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]}
              >
                <Ionicons name="log-in-outline" size={18} color={colors.text} />
                <Text style={[styles.adminBtnText, { color: colors.text }]}>Admin Login</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FORM GRID */}
          <View style={styles.grid}>

            {/* ROW 1: Faculty & Batch */}
            <View style={styles.col}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.text }]}>Faculty</Text>
                {errors.facultyId && <Text style={[styles.errorText, { color: colors.error }]}>Required</Text>}
              </View>
              <Select
                label="" value={facultyId} placeholder="Select Faculty"
                options={FACULTY_IDS.map(id => ({ label: FACULTY_LABELS[id], value: id }))}
                onChange={(val) => { setFacultyId(val); setBatchId(''); setClassId(''); setStudentName(''); if (errors.facultyId) setErrors({ ...errors, facultyId: false }) }}
                icon="school-outline"
              />
            </View>
            <View style={styles.col}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.text }]}>Batch</Text>
                {errors.batchId && <Text style={[styles.errorText, { color: colors.error }]}>Required</Text>}
              </View>
              <Select
                label="" value={batchId} placeholder="Select Batch"
                options={batches.map(b => ({ label: b.label, value: b.id }))}
                onChange={(val) => { setBatchId(val); setClassId(''); setStudentName(''); if (errors.batchId) setErrors({ ...errors, batchId: false }) }}
                disabled={!facultyId}
                icon="calendar-outline"
              />
            </View>

            {/* ROW 2: Class & Student Name */}
            <View style={styles.col}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.text }]}>Class</Text>
                {errors.classId && <Text style={[styles.errorText, { color: colors.error }]}>Required</Text>}
              </View>
              <Select
                label="" value={classId} placeholder="Select Class"
                options={classes.map(c => ({ label: c.label, value: c.id }))}
                onChange={(val) => { setClassId(val); setStudentName(''); if (errors.classId) setErrors({ ...errors, classId: false }) }}
                disabled={!batchId}
                icon="people-outline"
              />
            </View>
            <View style={styles.col}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.text }]}>Student Name</Text>
                {errors.studentName && <Text style={[styles.errorText, { color: colors.error }]}>Required</Text>}
              </View>
              <InputWithIcon
                icon="person-outline"
                placeholder="Enter Full Name"
                value={studentName}
                onChangeText={(val: string) => { setStudentName(val); if (errors.studentName && val.trim()) setErrors({ ...errors, studentName: false }) }}
                hasError={errors.studentName}
              />
            </View>

            {/* REGISTERED STUDENTS CARD — shown after class is selected */}
            {classId && registeredStudents.length > 0 && (
              <View style={[styles.colFull, { marginTop: 4, marginBottom: 8 }]}>
                <View style={[styles.registeredCard, { backgroundColor: isDark ? 'rgba(37,99,235,0.08)' : '#eff6ff', borderColor: isDark ? 'rgba(37,99,235,0.25)' : '#bfdbfe' }]}>
                  <View style={styles.registeredHeader}>
                    <Ionicons name="people" size={20} color="#2563eb" />
                    <Text style={[styles.registeredTitle, { color: isDark ? '#93c5fd' : '#1e40af' }]}>
                      Registered Students ({registeredStudents.length})
                    </Text>
                  </View>
                  <View style={styles.studentChipsWrap}>
                    {registeredStudents.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        style={[styles.studentChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#fff', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0' }]}
                        onPress={() => setStudentName(s.fullName)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="person-circle-outline" size={16} color={isDark ? '#93c5fd' : '#2563eb'} />
                        <Text style={[styles.studentChipText, { color: isDark ? '#e2e8f0' : '#1e293b' }]}>{s.fullName}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={[styles.registeredHint, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                    Tap a name to auto-fill, or type your name above
                  </Text>
                </View>
              </View>
            )}

            {/* ROW 3: Server & Computer */}
            <View style={styles.col}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.text }]}>Server Number</Text>
                {errors.serverNumber && <Text style={[styles.errorText, { color: colors.error }]}>Required</Text>}
              </View>
              <Select
                label="" value={serverNumber} placeholder="Select Server"
                options={SERVER_OPTIONS}
                onChange={(val) => { setServerNumber(val); setComputerNumber(''); if (errors.serverNumber) setErrors({ ...errors, serverNumber: false }) }}
                icon="server-outline"
              />
            </View>
            <View style={styles.col}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.text }]}>Computer Number</Text>
                {errors.computerNumber && <Text style={[styles.errorText, { color: colors.error }]}>Required</Text>}
              </View>
              <Select
                label="" value={computerNumber} placeholder="Select PC"
                options={pcOptions}
                onChange={(val) => { setComputerNumber(val); if (errors.computerNumber) setErrors({ ...errors, computerNumber: false }) }}
                disabled={!serverNumber}
                icon="desktop-outline"
              />
            </View>

            {/* ROW 4: Date & Problem Type */}
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.text }]}>Date</Text>
              <InputWithIcon
                icon="calendar-number-outline"
                value={currentDate}
                editable={false}
              />
            </View>
            <View style={styles.col}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.text }]}>Problem Type</Text>
                {errors.problemType && <Text style={[styles.errorText, { color: colors.error }]}>Required</Text>}
              </View>
              <Select
                label="" value={problemType} placeholder="Select Type"
                options={PROBLEM_TYPES.map(t => ({ label: t, value: t }))}
                onChange={(val) => { setProblemType(val); if (errors.problemType) setErrors({ ...errors, problemType: false }) }}
                icon="alert-circle-outline"
              />
            </View>

            {/* ROW 5: Description */}
            <View style={[styles.colFull, { marginTop: 8 }]}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.text }]}>Problem Description</Text>
                {errors.description && <Text style={[styles.errorText, { color: colors.error }]}>Required</Text>}
              </View>
              <View style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: errors.description ? colors.error : colors.border,
                  alignItems: 'flex-start', paddingVertical: 12
                }
              ]}>
                <Ionicons name="document-text-outline" size={20} color={errors.description ? colors.error : colors.textMuted} style={{ marginRight: 10, marginTop: 2 }} />
                <TextInput
                  style={[styles.inputField, { color: colors.text, height: 100, textAlignVertical: 'top' }]}
                  placeholder="Describe the issue in detail..."
                  placeholderTextColor={colors.textMuted}
                  multiline numberOfLines={5}
                  value={description}
                  onChangeText={(val) => { setDescription(val); if (errors.description && val.trim()) setErrors({ ...errors, description: false }) }}
                />
                {errors.description && <Ionicons name="alert-circle" size={18} color={colors.error} style={{ marginTop: 2 }} />}
              </View>
            </View>

          </View>

          {/* FOOTER ACTIONS */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.btnOutline, { borderColor: colors.border }]}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={18} color={colors.textMuted} />
              <Text style={[styles.btnOutlineText, { color: colors.text }]}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnOutline, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={handleReset}
            >
              <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
              <Text style={[styles.btnOutlineText, { color: colors.text }]}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit}>
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={styles.btnPrimaryText}>Submit Report</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>

      {/* --- SUCCESS MODAL --- */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInUp.springify()} style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Submission Successful!</Text>
            <Text style={[styles.modalDesc, { color: colors.textMuted }]}>
              Your problem report has been successfully logged. The lab technicians will look into it shortly.
            </Text>
            <TouchableOpacity
              style={[styles.btnPrimary, { width: '100%', marginTop: 24 }]}
              onPress={() => { setShowSuccessModal(false); handleReset(); }}
            >
              <Text style={styles.btnPrimaryText}>Submit Another Report</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* --- ERROR MODAL (Missing Fields) --- */}
      <Modal visible={showErrorModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeIn.duration(200)} style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Ionicons name="warning" size={48} color={colors.error} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Missing Details</Text>
            <Text style={[styles.modalDesc, { color: colors.textMuted }]}>
              Please fill in all required fields marked in red to proceed.
            </Text>
            <TouchableOpacity
              style={[styles.btnOutline, { width: '100%', marginTop: 24, justifyContent: 'center' }]}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={[styles.btnOutlineText, { color: colors.text }]}>Okay, I'll fix it</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* --- NOT REGISTERED MODAL --- */}
      <Modal visible={showNotRegisteredModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInUp.springify()} style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.08)' }]}>
              <View style={styles.notRegIconInner}>
                <Ionicons name="person-remove" size={40} color="#ef4444" />
              </View>
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Not Registered</Text>
            <Text style={[styles.modalDesc, { color: colors.textMuted }]}>
              The name you entered is not registered in this class. Please check your name or contact your administrator.
            </Text>
            <View style={styles.notRegDivider} />
            <View style={styles.notRegInfoRow}>
              <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
              <Text style={[styles.notRegInfoText, { color: colors.textMuted }]}>
                Only registered students can submit problem reports.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.btnPrimary, { width: '100%', marginTop: 20, backgroundColor: '#ef4444' }]}
              onPress={() => setShowNotRegisteredModal(false)}
            >
              <Ionicons name="arrow-back" size={18} color="#fff" />
              <Text style={styles.btnPrimaryText}>Go Back & Correct</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sidebar: {
    backgroundColor: JUColors.secondary,
    padding: 40,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  sidebarContent: { zIndex: 2, maxWidth: 500 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 60 },
  brandName: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: 0.5 },
  sidebarTitle: { fontSize: 36, fontWeight: '800', color: '#fff', lineHeight: 44, marginBottom: 24 },
  sidebarDesc: { fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 26, marginBottom: 40 },
  sidebarFooter: { marginTop: 'auto' },
  infoBox: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20, borderRadius: 16, gap: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  infoText: { color: '#fff', fontSize: 14, lineHeight: 20, fontWeight: '500' },
  decoCircle: {
    position: 'absolute', bottom: -100, right: -100, width: 400, height: 400,
    borderRadius: 200, backgroundColor: 'rgba(255,255,255,0.03)', zIndex: 0,
  },
  mainContent: { flex: 1, paddingTop: 40 },
  scrollContent: { paddingHorizontal: 40, maxWidth: 1000, alignSelf: 'center', width: '100%' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 10 },
  formTitle: { fontSize: 26, fontWeight: '800' },
  badge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  badgeText: { color: '#2563eb', fontSize: 12, fontWeight: '700' },

  // Admin Login Button
  adminBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 6, borderWidth: 1
  },
  adminBtnText: {
    fontSize: 13, fontWeight: '600'
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
  col: { flexBasis: '45%', flexGrow: 1, minWidth: 280 },
  colFull: { width: '100%' },

  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  errorText: { fontSize: 12, fontWeight: '600' },

  // Input Styles
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    ...Platform.select({ web: { transition: '0.2s all' } })
  },
  inputField: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    ...Platform.select({ web: { outlineStyle: 'none' } })
  },

  // Registered Students Card
  registeredCard: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
  },
  registeredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  registeredTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  studentChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  studentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  studentChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  registeredHint: {
    fontSize: 12,
    marginTop: 12,
    fontStyle: 'italic',
  },

  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 40, paddingTop: 30, borderTopWidth: 1, flexWrap: 'wrap' },
  btnOutline: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, paddingHorizontal: 24, borderRadius: 8, borderWidth: 1, justifyContent: 'center' },
  btnOutlineText: { fontWeight: '600', fontSize: 14 },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    height: 48, backgroundColor: '#2563eb', paddingHorizontal: 32, borderRadius: 8,
    ...Platform.select({
      web: { boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)', cursor: 'pointer' },
      default: { elevation: 3 }
    })
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }
    })
  },
  modalIconBox: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20
  },
  modalTitle: { fontSize: 24, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  modalDesc: { fontSize: 15, textAlign: 'center', lineHeight: 22 },

  // Not Registered Modal extras
  notRegIconInner: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(239,68,68,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  notRegDivider: {
    width: '100%', height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 16,
  },
  notRegInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  notRegInfoText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
