import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { JUColors, JUSpacing, JURadius, JUShadow } from '@/constants/theme';
import { FACULTY_LABELS, FACULTY_IDS } from '@/types';
import type { FacultyId, ProblemType } from '@/types';
import { MOCK_BATCHES, MOCK_CLASSES, MOCK_STUDENTS } from '@/data/mockData';
import { useProblems } from '@/contexts/ProblemsContext';
import { Select } from '@/components/ui/Select';

const PROBLEM_TYPES: ProblemType[] = ['Software', 'Hardware', 'Network', 'Other'];

const SERVER_OPTIONS = [
  { label: 'Server 1', value: 'Server 1' },
  { label: 'Server 2', value: 'Server 2' },
  { label: 'Server 3', value: 'Server 3' },
];

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

export function ProblemForm() {
  const { addProblem, isLoading } = useProblems();
  const [studentName, setStudentName] = useState('');
  const [facultyId, setFacultyId] = useState<FacultyId | null>(null);
  const [batchId, setBatchId] = useState('');
  const [classId, setClassId] = useState('');
  const [computerNumber, setComputerNumber] = useState('');
  const [serverNumber, setServerNumber] = useState('');
  const [problemType, setProblemType] = useState<ProblemType | null>(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showNotRegisteredModal, setShowNotRegisteredModal] = useState(false);

  const batches = useMemo(
    () => (facultyId ? MOCK_BATCHES.filter((b) => b.facultyId === facultyId) : []),
    [facultyId]
  );
  const classes = useMemo(
    () => (batchId ? MOCK_CLASSES.filter((c) => c.batchId === batchId) : []),
    [batchId]
  );
  const registeredStudents = useMemo(
    () => (classId ? MOCK_STUDENTS.filter((s) => s.classId === classId) : []),
    [classId]
  );
  const pcOptions = useMemo(() => getPcOptions(serverNumber), [serverNumber]);

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const resetForm = () => {
    setStudentName('');
    setFacultyId(null);
    setBatchId('');
    setClassId('');
    setComputerNumber('');
    setServerNumber('');
    setProblemType(null);
    setDescription('');
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (
      !studentName.trim() ||
      facultyId == null ||
      !batchId ||
      !classId ||
      !serverNumber ||
      !computerNumber ||
      problemType == null ||
      !description.trim()
    ) {
      return;
    }

    // Check registration
    const isRegistered = registeredStudents.some(
      s => s.fullName.trim().toLowerCase() === studentName.trim().toLowerCase()
    );
    if (!isRegistered) {
      setShowNotRegisteredModal(true);
      return;
    }

    addProblem({
      studentName: studentName.trim(),
      facultyId,
      batchId,
      classId,
      computerNumber,
      serverNumber,
      problemType,
      description: description.trim(),
    });
    setSubmitted(true);
    setTimeout(resetForm, 2500);
  };

  const isValid =
    studentName.trim() &&
    facultyId != null &&
    batchId &&
    classId &&
    serverNumber &&
    computerNumber &&
    problemType != null &&
    description.trim();

  if (submitted) {
    return (
      <Animated.View entering={FadeInUp.duration(400)} style={styles.successWrap}>
        <View style={styles.successIconOuter}>
          <View style={styles.successIconWrap}>
            <Ionicons name="checkmark-circle" size={64} color={JUColors.tertiary} />
          </View>
        </View>
        <Text style={styles.successTitle}>Problem Submitted</Text>
        <Text style={styles.successText}>Thank you. The lab team will look into it shortly.</Text>
      </Animated.View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Select
                label="Faculty *"
                value={facultyId}
                placeholder="Select Faculty"
                options={FACULTY_IDS.map((id) => ({
                  label: FACULTY_LABELS[id],
                  value: id,
                }))}
                onChange={(val) => {
                  setFacultyId(val);
                  setBatchId('');
                  setClassId('');
                  setStudentName('');
                }}
                icon="school-outline"
              />
            </View>

            <View style={styles.halfField}>
              <Select
                label="Batch *"
                value={batchId}
                placeholder="Select Batch"
                options={batches.map((b) => ({ label: b.label, value: b.id }))}
                onChange={(val) => {
                  setBatchId(val);
                  setClassId('');
                  setStudentName('');
                }}
                icon="calendar-outline"
                disabled={!facultyId}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Select
              label="Class *"
              value={classId}
              placeholder="Select Class"
              options={classes.map((c) => ({ label: c.label, value: c.id }))}
              onChange={(val) => { setClassId(val); setStudentName(''); }}
              icon="people-outline"
              disabled={!batchId}
            />
          </View>
        </View>

        <Animated.View entering={FadeInUp.duration(280)} style={styles.field}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={studentName}
            onChangeText={setStudentName}
            placeholder="Enter your full name"
            placeholderTextColor={JUColors.textMuted}
            editable={!isLoading}
          />
        </Animated.View>

        {/* Registered Students Card */}
        {classId && registeredStudents.length > 0 && (
          <Animated.View entering={FadeInUp.duration(300)} style={styles.registeredCard}>
            <View style={styles.registeredHeader}>
              <Ionicons name="people" size={18} color={JUColors.primary} />
              <Text style={styles.registeredTitle}>
                Registered Students ({registeredStudents.length})
              </Text>
            </View>
            <View style={styles.studentChipsWrap}>
              {registeredStudents.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.studentChip}
                  onPress={() => setStudentName(s.fullName)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="person-circle-outline" size={15} color={JUColors.primary} />
                  <Text style={styles.studentChipText}>{s.fullName}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.registeredHint}>Tap a name to auto-fill</Text>
          </Animated.View>
        )}

        <View style={styles.row}>
          <Animated.View entering={FadeInUp.delay(80).duration(280)} style={[styles.field, styles.halfField]}>
            <Select
              label="Server No *"
              value={serverNumber}
              placeholder="Select Server"
              options={SERVER_OPTIONS}
              onChange={(val) => { setServerNumber(val); setComputerNumber(''); }}
              icon="server-outline"
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(80).duration(280)} style={[styles.field, styles.halfField]}>
            <Select
              label="Computer No *"
              value={computerNumber}
              placeholder="Select PC"
              options={pcOptions}
              onChange={setComputerNumber}
              icon="desktop-outline"
              disabled={!serverNumber}
            />
          </Animated.View>
        </View>

        <Animated.View entering={FadeInUp.delay(100).duration(280)} style={styles.field}>
          <Text style={styles.label}>Date</Text>
          <View style={styles.dateDisplay}>
            <Ionicons name="calendar-outline" size={18} color={JUColors.textMuted} />
            <Text style={styles.dateText}>{currentDate}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(120).duration(280)} style={styles.field}>
          <Select
            label="Problem Type *"
            value={problemType}
            placeholder="Select Problem Type"
            options={PROBLEM_TYPES.map((type) => ({ label: type, value: type }))}
            onChange={setProblemType}
            icon="alert-circle-outline"
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(160).duration(280)} style={styles.field}>
          <Text style={styles.label}>
            {problemType === 'Other' ? 'Others Description *' : 'Problem Description *'}
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder={problemType === 'Other' ? "Please specify the problem..." : "Describe the issue..."}
            placeholderTextColor={JUColors.textMuted}
            multiline
            numberOfLines={4}
            editable={!isLoading}
          />
        </Animated.View>

        <TouchableOpacity
          style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={JUColors.white} />
          ) : (
            <>
              <Ionicons name="send" size={20} color={JUColors.white} />
              <Text style={styles.submitBtnText}>Submit Problem</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* --- NOT REGISTERED MODAL --- */}
      <Modal visible={showNotRegisteredModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInUp.springify()} style={styles.modalContent}>
            <View style={styles.notRegIconBox}>
              <Ionicons name="person-remove" size={40} color="#ef4444" />
            </View>
            <Text style={styles.notRegTitle}>Not Registered</Text>
            <Text style={styles.notRegDesc}>
              The name you entered is not registered in this class. Please check your name or contact your administrator.
            </Text>
            <View style={styles.notRegDivider} />
            <View style={styles.notRegInfoRow}>
              <Ionicons name="information-circle-outline" size={16} color={JUColors.textMuted} />
              <Text style={styles.notRegInfoText}>Only registered students can submit problem reports.</Text>
            </View>
            <TouchableOpacity
              style={styles.notRegBtn}
              onPress={() => setShowNotRegisteredModal(false)}
            >
              <Ionicons name="arrow-back" size={18} color="#fff" />
              <Text style={styles.notRegBtnText}>Go Back & Correct</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: JUSpacing.md, paddingBottom: JUSpacing.xxl },
  field: { marginBottom: JUSpacing.lg },
  row: { flexDirection: 'row', gap: JUSpacing.md },
  halfField: { flex: 1 },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: JUColors.text,
    marginBottom: JUSpacing.sm,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1.5,
    borderColor: JUColors.border,
    borderRadius: JURadius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: JUColors.text,
    backgroundColor: JUColors.surface,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  section: {
    marginBottom: JUSpacing.sm,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: JUColors.border,
    borderRadius: JURadius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: JUColors.surface,
  },
  dateText: {
    fontSize: 15,
    color: JUColors.text,
    fontWeight: '500',
  },

  // Registered Students Card
  registeredCard: {
    borderRadius: JURadius.md,
    padding: 16,
    marginBottom: JUSpacing.lg,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  registeredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  registeredTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e40af',
  },
  studentChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  studentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  studentChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1e293b',
  },
  registeredHint: {
    fontSize: 11,
    marginTop: 10,
    color: '#94a3b8',
    fontStyle: 'italic',
  },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: JUColors.primary,
    paddingVertical: 16,
    borderRadius: JURadius.md,
    marginTop: JUSpacing.lg,
    ...JUShadow.md,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: JUColors.white,
  },
  successWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: JUSpacing.xl,
  },
  successIconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: JUColors.tertiary + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: JUSpacing.lg,
  },
  successIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: JUColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...JUShadow.md,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: JUColors.tertiary,
    marginBottom: JUSpacing.sm,
    letterSpacing: 0.2,
  },
  successText: {
    fontSize: 16,
    color: JUColors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Not Registered Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    backgroundColor: '#fff',
    ...Platform.select({
      web: { boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }
    }),
  },
  notRegIconBox: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  notRegTitle: {
    fontSize: 22, fontWeight: '800', color: '#1e293b', marginBottom: 10,
  },
  notRegDesc: {
    fontSize: 14, textAlign: 'center', color: '#64748b', lineHeight: 20,
  },
  notRegDivider: {
    width: '100%', height: 1, backgroundColor: '#e2e8f0', marginVertical: 14,
  },
  notRegInfoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 6,
  },
  notRegInfoText: {
    fontSize: 12, color: '#94a3b8', lineHeight: 16, flex: 1,
  },
  notRegBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', height: 44, backgroundColor: '#ef4444', borderRadius: 10,
    marginTop: 16,
  },
  notRegBtnText: {
    color: '#fff', fontWeight: '700', fontSize: 14,
  },
});
