import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { JUColors, JURadius, JUSpacing } from '@/constants/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function AppModal({ visible, onClose, title, children }: ModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        style={styles.overlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          entering={FadeInDown.duration(280).springify()}
          style={styles.box}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={JUColors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export type ConfirmVariant = 'warning' | 'info' | 'success';

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  variant: ConfirmVariant;
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
}

const CONFIRM_ICONS: Record<ConfirmVariant, keyof typeof Ionicons.glyphMap> = {
  warning: 'warning',
  info: 'information-circle',
  success: 'checkmark-circle',
};

const CONFIRM_COLORS: Record<ConfirmVariant, string> = {
  warning: JUColors.warning,
  info: JUColors.primary,
  success: JUColors.tertiary,
};

export function ConfirmModal({
  visible,
  onClose,
  variant,
  title,
  message,
  primaryLabel,
  onPrimary,
  secondaryLabel = 'Cancel',
}: ConfirmModalProps) {
  const color = CONFIRM_COLORS[variant];
  const icon = CONFIRM_ICONS[variant];

  const handlePrimary = () => {
    onPrimary();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          entering={FadeInDown.duration(280).springify()}
          style={[styles.box, styles.confirmBox]}
        >
          <View style={[styles.confirmIconWrap, { backgroundColor: color + '22' }]}>
            <Ionicons name={icon} size={48} color={color} />
          </View>
          <Text style={styles.confirmTitle}>{title}</Text>
          <Text style={styles.confirmMessage}>{message}</Text>
          <View style={styles.confirmActions}>
            <TouchableOpacity
              style={[styles.confirmBtn, styles.confirmBtnSecondary]}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmBtnSecondaryText}>{secondaryLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, styles.confirmBtnPrimary, { backgroundColor: color }]}
              onPress={handlePrimary}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmBtnPrimaryText}>{primaryLabel}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  box: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: JUColors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: JUColors.border,
    backgroundColor: JUColors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: JUColors.text,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  // ConfirmModal
  confirmBox: {
    alignItems: 'center',
    paddingVertical: JUSpacing.xl,
    paddingHorizontal: JUSpacing.lg,
  },
  confirmIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: JUSpacing.md,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: JUColors.text,
    marginBottom: JUSpacing.sm,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 15,
    color: JUColors.textMuted,
    textAlign: 'center',
    marginBottom: JUSpacing.lg,
    lineHeight: 22,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: JUSpacing.md,
    width: '100%',
    justifyContent: 'flex-end',
  },
  confirmBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: JURadius.md,
    minWidth: 100,
    alignItems: 'center',
  },
  confirmBtnSecondary: {
    backgroundColor: JUColors.surface,
    borderWidth: 1,
    borderColor: JUColors.border,
  },
  confirmBtnSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: JUColors.text,
  },
  confirmBtnPrimary: {},
  confirmBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: JUColors.white,
  },
});
