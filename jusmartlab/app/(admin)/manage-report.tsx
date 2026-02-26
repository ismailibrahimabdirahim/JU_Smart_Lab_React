import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useProblems } from '@/contexts/ProblemsContext';
import { FACULTY_LABELS } from '@/types';
import type { ProblemSubmission, ProblemStatus } from '@/types';
import { JUColors, JUSpacing, JURadius } from '@/constants/theme';

export default function ManageReportScreen() {
  const router = useRouter();
  const { problems, updateStatus, deleteProblem, deleteAllProblems } = useProblems();
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Fixed'>('All');
  const [isLoading, setIsLoading] = useState(false);

  // Filter problems based on search and status
  const filteredProblems = useMemo(() => {
    return problems.filter(problem => {
      const matchesSearch =
        problem.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.computerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === 'All' || problem.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [problems, searchQuery, filterStatus]);

  const handleSelectProblem = (id: string) => {
    if (selectedProblems.includes(id)) {
      setSelectedProblems(selectedProblems.filter(problemId => problemId !== id));
    } else {
      setSelectedProblems([...selectedProblems, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedProblems.length === filteredProblems.length) {
      setSelectedProblems([]);
    } else {
      setSelectedProblems(filteredProblems.map(p => p.id));
    }
  };

  const handleFixProblem = (id: string) => {
    updateStatus(id, 'Fixed');
  };

  const handleDeleteProblem = (id: string) => {
    Alert.alert(
      'Delete Problem',
      'Are you sure you want to delete this problem report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProblem(id)
        }
      ]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedProblems.length === 0) return;

    Alert.alert(
      'Delete Selected',
      `Are you sure you want to delete ${selectedProblems.length} selected problem(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            for (const id of selectedProblems) {
              await deleteProblem(id);
            }
            setSelectedProblems([]);
            setIsLoading(false);
          }
        }
      ]
    );
  };

  const handleDeleteAll = () => {
    if (problems.length === 0) return;

    Alert.alert(
      'Delete All Reports',
      `Are you sure you want to delete all ${problems.length} problem reports? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            await deleteAllProblems();
            setSelectedProblems([]);
            setIsLoading(false);
          }
        }
      ]
    );
  };

  const handlePrint = () => {
    // In a real app, this would generate a PDF or open print dialog
    Alert.alert('Print', 'Print functionality would open a print dialog or generate a PDF report.');
  };

  const handleRefresh = () => {
    // Refresh logic would depend on your implementation
    // This is typically handled automatically by your context
    Alert.alert('Refresh', 'Reports have been refreshed.');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Report</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionBtn} onPress={handleRefresh}>
            <Ionicons name="refresh-outline" size={22} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn} onPress={handlePrint}>
            <Ionicons name="print-outline" size={22} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Controls Bar */}
      <View style={styles.controlsBar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reports..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterBtn, filterStatus === 'All' && styles.filterBtnActive]}
            onPress={() => setFilterStatus('All')}
          >
            <Text style={[styles.filterText, filterStatus === 'All' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filterStatus === 'Pending' && styles.filterBtnActive]}
            onPress={() => setFilterStatus('Pending')}
          >
            <Text style={[styles.filterText, filterStatus === 'Pending' && styles.filterTextActive]}>
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filterStatus === 'Fixed' && styles.filterBtnActive]}
            onPress={() => setFilterStatus('Fixed')}
          >
            <Text style={[styles.filterText, filterStatus === 'Fixed' && styles.filterTextActive]}>
              Fixed
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, selectedProblems.length === 0 && styles.actionBtnDisabled]}
            onPress={handleDeleteSelected}
            disabled={selectedProblems.length === 0 || isLoading}
          >
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Delete Selected</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteAllBtn]}
            onPress={handleDeleteAll}
            disabled={problems.length === 0 || isLoading}
          >
            <Ionicons name="trash-bin-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Delete All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <TouchableOpacity style={styles.checkboxHeader} onPress={handleSelectAll}>
          <View style={[
            styles.checkbox,
            selectedProblems.length === filteredProblems.length && selectedProblems.length > 0 && styles.checkboxChecked
          ]}>
            {selectedProblems.length === filteredProblems.length && selectedProblems.length > 0 && (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            )}
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerCell, { flex: 0.5 }]}>ID</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Server No</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Computer</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Batch</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Class</Text>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Problem Type</Text>
        <Text style={[styles.headerCell, { flex: 1.5 }]}>Description</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Status</Text>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Submitted</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Actions</Text>
      </View>

      {/* Table Content */}
      <ScrollView style={styles.tableContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        ) : filteredProblems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No reports found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'No problem reports have been submitted yet'}
            </Text>
          </View>
        ) : (
          filteredProblems.map((problem, index) => (
            <Animated.View
              key={problem.id}
              entering={FadeInUp.delay(index * 50).duration(300)}
              style={[
                styles.tableRow,
                index % 2 === 0 && styles.tableRowEven
              ]}
            >
              {/* Checkbox */}
              <TouchableOpacity
                style={styles.checkboxCell}
                onPress={() => handleSelectProblem(problem.id)}
              >
                <View style={[
                  styles.checkbox,
                  selectedProblems.includes(problem.id) && styles.checkboxChecked
                ]}>
                  {selectedProblems.includes(problem.id) && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>

              {/* ID */}
              <Text style={[styles.tableCell, { flex: 0.5 }]}>
                {problem.id.slice(0, 4)}...
              </Text>

              {/* Server No */}
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {problem.serverNumber || 'N/A'}
              </Text>

              {/* Computer */}
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {problem.computerNumber}
              </Text>

              {/* Batch */}
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {problem.batchId}
              </Text>

              {/* Class */}
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {problem.classId}
              </Text>

              {/* Problem Type */}
              <Text style={[styles.tableCell, { flex: 1.2 }]}>
                {problem.problemType}
              </Text>

              {/* Description */}
              <Text
                style={[styles.tableCell, styles.descriptionCell, { flex: 1.5 }]}
                numberOfLines={1}
              >
                {problem.description}
              </Text>

              {/* Status */}
              <View style={[styles.tableCell, { flex: 1 }]}>
                <View style={[
                  styles.statusBadge,
                  problem.status === 'Pending' ? styles.statusPending : styles.statusFixed
                ]}>
                  <Text style={styles.statusText}>
                    {problem.status}
                  </Text>
                </View>
              </View>

              {/* Submitted */}
              <Text style={[styles.tableCell, { flex: 1.2 }]}>
                {new Date(problem.submittedAt).toLocaleDateString()}
              </Text>

              {/* Actions */}
              <View style={[styles.tableCell, styles.actionsCell, { flex: 1 }]}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.fixButton]}
                  onPress={() => handleFixProblem(problem.id)}
                  disabled={problem.status === 'Fixed'}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={16}
                    color={problem.status === 'Fixed' ? '#9CA3AF' : '#10B981'}
                  />
                  <Text style={[
                    styles.actionButtonText,
                    problem.status === 'Fixed' && styles.actionButtonTextDisabled
                  ]}>
                    Fix
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteProblem(problem.id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Footer Stats */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Showing {filteredProblems.length} of {problems.length} reports
          {selectedProblems.length > 0 && ` • ${selectedProblems.length} selected`}
        </Text>
        <View style={styles.footerStats}>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.statText}>Pending: {problems.filter(p => p.status === 'Pending').length}</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statText}>Fixed: {problems.filter(p => p.status === 'Fixed').length}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Controls Bar
  controlsBar: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
    ...Platform.select({
      web: { outlineStyle: 'none' }
    }),
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterBtnActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  deleteAllBtn: {
    backgroundColor: '#DC2626',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Table Header
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E40AF',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A8A',
  },
  checkboxHeader: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  headerCell: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Table Content
  tableContent: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableRowEven: {
    backgroundColor: '#F9FAFB',
  },
  checkboxCell: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableCell: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  descriptionCell: {
    textAlign: 'left',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'center',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusFixed: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  actionsCell: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    minWidth: 60,
    justifyContent: 'center',
  },
  fixButton: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  actionButtonTextDisabled: {
    color: '#9CA3AF',
  },
  deleteButtonText: {
    color: '#EF4444',
  },
  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  // Footer
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 12,
  },
  footerStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
});