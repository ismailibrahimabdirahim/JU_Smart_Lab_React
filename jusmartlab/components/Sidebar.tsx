import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { JUColors } from '@/constants/theme';

export type SidebarItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
};

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  items: SidebarItem[];
  activeId?: string;
  onSelect: (item: SidebarItem) => void;
  roleLabel?: string;
}

export function Sidebar({
  visible,
  onClose,
  items,
  activeId,
  onSelect,
  roleLabel = 'Admin',
}: SidebarProps) {
  if (!visible) return null;

  return (
    <>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        activeOpacity={1}
        accessibilityLabel="Close menu"
      />
      <Animated.View
        entering={FadeInLeft.duration(280)}
        style={[styles.container, StyleSheet.absoluteFill]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>JU Smart Lab</Text>
          <Text style={styles.roleLabel}>{roleLabel}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color={JUColors.white} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.item, isActive && styles.itemActive]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={isActive ? JUColors.primary : JUColors.text}
                />
                <Text
                  style={[styles.itemLabel, isActive && styles.itemLabelActive]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: JUColors.white,
    width: 280,
    maxWidth: '85%',
    borderRightWidth: 1,
    borderRightColor: JUColors.border,
    paddingTop: 56,
    zIndex: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: JUColors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: JUColors.secondary,
  },
  roleLabel: {
    fontSize: 12,
    color: JUColors.textMuted,
    marginTop: 4,
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 16,
    padding: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 12,
    marginBottom: 4,
  },
  itemActive: {
    backgroundColor: JUColors.surface,
  },
  itemLabel: {
    fontSize: 15,
    color: JUColors.text,
  },
  itemLabelActive: {
    fontWeight: '600',
    color: JUColors.primary,
  },
});
