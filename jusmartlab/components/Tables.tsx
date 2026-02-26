import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { JUColors, JURadius, JUSpacing } from '@/constants/theme';
import type { ProblemStatus } from '@/types';

interface ProblemRowData {
  id: string;
  studentName: string;
  faculty: string;
  classLabel: string;
  computerNumber: string;
  problemType: string;
  description: string;
  status: ProblemStatus;
  submittedAt: string;
}

interface ProblemTableProps {
  problems: ProblemRowData[];
  onStatusPress?: (id: string, currentStatus: ProblemStatus) => void;
}

function StatusBadge({ status }: { status: ProblemStatus }) {
  const isFixed = status === 'Fixed';
  return (
    <Animated.View
      entering={FadeInUp.duration(250)}
      style={[
        styles.badge,
        isFixed ? styles.badgeFixed : styles.badgePending,
      ]}
    >
      <Ionicons
        name={isFixed ? 'checkmark-circle' : 'time'}
        size={14}
        color={isFixed ? JUColors.tertiary : JUColors.pending}
      />
      <Text style={[styles.badgeText, isFixed ? styles.badgeTextFixed : styles.badgeTextPending]}>
        {status}
      </Text>
    </Animated.View>
  );
}

function TableRow({
  row,
  index,
  onStatusPress,
}: {
  row: ProblemRowData;
  index: number;
  onStatusPress?: (id: string, currentStatus: ProblemStatus) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 40).duration(280)}
    >
      <Pressable
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={[
          styles.row,
          index % 2 === 1 && styles.rowAlt,
          isHovered && styles.rowHover
        ]}
      >
        <View style={styles.cellName}>
          <Text style={styles.cellTextBold} numberOfLines={1}>{row.studentName}</Text>
          <Text style={styles.cellTextSmall} numberOfLines={1}>{row.description}</Text>
        </View>
        <View style={styles.cellMeta}>
          <Text style={styles.cellText} numberOfLines={1}>{row.faculty}</Text>
          <Text style={styles.cellTextSmall}>{row.computerNumber} · {row.problemType}</Text>
        </View>
        <View style={styles.cellStatus}>
          <StatusBadge status={row.status} />
          {onStatusPress && (
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => onStatusPress(row.id, row.status)}
              activeOpacity={0.8}
            >
              <Text style={styles.toggleBtnText}>
                {row.status === 'Pending' ? 'Mark Fixed' : 'Mark Pending'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function ProblemTable({ problems, onStatusPress }: ProblemTableProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerCell, styles.headerCellName]}>Student / Problem</Text>
        <Text style={[styles.headerCell, styles.headerCellMeta]}>Details</Text>
        <Text style={[styles.headerCell, styles.headerCellStatus]}>Status</Text>
      </View>
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {problems.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={JUColors.textMuted} />
            <Text style={styles.emptyText}>No problems submitted yet.</Text>
          </View>
        ) : (
          problems.map((row, index) => (
            <TableRow
              key={row.id}
              row={row}
              index={index}
              onStatusPress={onStatusPress}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: JUColors.white,
    borderRadius: JURadius.lg,
    borderWidth: 1,
    borderColor: JUColors.borderLight,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 4px 16px rgba(6, 32, 86, 0.06)' },
      default: {},
    }),
  },
  header: {
    flexDirection: 'row',
    backgroundColor: JUColors.secondary,
    paddingVertical: JUSpacing.md,
    paddingHorizontal: JUSpacing.lg,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  headerCellName: { flex: 1.4 },
  headerCellMeta: { flex: 1 },
  headerCellStatus: { flex: 0.9 },
  body: {
    maxHeight: 420,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: JUSpacing.md,
    paddingHorizontal: JUSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: JUColors.borderLight,
    alignItems: 'center',
  },
  rowAlt: {
    backgroundColor: JUColors.backgroundSoft,
  },
  rowHover: {
    backgroundColor: JUColors.primary + '08', // Very light blue tint
  },
  cellName: { flex: 1.4 },
  cellMeta: { flex: 1 },
  cellStatus: { flex: 0.9, alignItems: 'flex-end', gap: 8 },
  cellText: {
    fontSize: 14,
    color: JUColors.text,
    fontWeight: '500',
  },
  cellTextBold: {
    fontSize: 14,
    fontWeight: '700',
    color: JUColors.text,
  },
  cellTextSmall: {
    fontSize: 12,
    color: JUColors.textMuted,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: JURadius.full,
  },
  badgeFixed: {
    backgroundColor: JUColors.tertiary + '22',
  },
  badgePending: {
    backgroundColor: JUColors.pending + '22',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextFixed: { color: JUColors.tertiary },
  badgeTextPending: { color: JUColors.pending },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: JURadius.sm,
    backgroundColor: JUColors.primaryLight,
  },
  toggleBtnText: {
    fontSize: 12,
    color: JUColors.primary,
    fontWeight: '700',
  },
  empty: {
    padding: JUSpacing.xxl,
    alignItems: 'center',
    gap: JUSpacing.md,
  },
  emptyText: {
    fontSize: 15,
    color: JUColors.textMuted,
    fontWeight: '500',
  },
});
