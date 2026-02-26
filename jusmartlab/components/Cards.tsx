import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { JUColors, JURadius, JUShadow, JUSpacing } from '@/constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: ViewStyle;
  index?: number;
  accent?: 'primary' | 'tertiary' | 'pending';
}

export function Card({ title, value, icon, onPress, style, index = 0, accent = 'primary' }: CardProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const accentColor =
    accent === 'primary' ? JUColors.primary : accent === 'tertiary' ? JUColors.tertiary : JUColors.pending;

  const content = (
    <Animated.View
      entering={FadeInUp.delay(index * 80).duration(360)}
      style={[styles.wrapper, style]}
    >
      <View style={[styles.iconWrap, { backgroundColor: accentColor + '22' }]}>
        <Ionicons name={icon} size={32} color={accentColor} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </Animated.View>
  );

  if (onPress) {
    return (
      <AnimatedTouchable
        style={animatedStyle}
        onPress={onPress}
        onPressIn={() => (scale.value = withTiming(0.97, { duration: 150 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
        activeOpacity={1}
      >
        {content}
      </AnimatedTouchable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: JUColors.white,
    borderRadius: JURadius.lg,
    padding: JUSpacing.lg,
    borderWidth: 1,
    borderColor: JUColors.borderLight,
    ...JUShadow.md,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 16px rgba(6, 32, 86, 0.08)',
      },
      default: {},
    }),
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: JUSpacing.md,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: JUColors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    color: JUColors.text,
    letterSpacing: -0.5,
  },
});
