import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { JUColors, JUSpacing, JUGlass, JURadius } from '@/constants/theme';

interface NavbarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void };
}

export function Navbar({ title, subtitle, showBack, rightAction }: NavbarProps) {
  const router = useRouter();

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.container}>
      <View style={styles.inner}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconBtn}
            accessibilityLabel="Go back"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color={JUColors.white} />
          </TouchableOpacity>
        ) : (
          /* Logo on the left if no back button */
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/ju-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        )}
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightAction ? (
          <TouchableOpacity
            onPress={rightAction.onPress}
            style={styles.iconBtn}
            accessibilityLabel="Action"
            activeOpacity={0.8}
          >
            <Ionicons name={rightAction.icon} size={24} color={JUColors.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
        backgroundColor: JUGlass.navbar.backgroundColor,
        backdropFilter: JUGlass.navbar.backdropFilter,
        borderBottomColor: JUGlass.navbar.borderBottomColor,
        borderBottomWidth: JUGlass.navbar.borderBottomWidth,
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      },
      default: {
        backgroundColor: JUColors.secondary,
        elevation: 8,
      }
    }),
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingBottom: 20,
    paddingHorizontal: JUSpacing.lg,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: JUSpacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: JUColors.white,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: JURadius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    ...Platform.select({
      web: { transition: '0.2s all ease' },
    }),
  },
  iconPlaceholder: {
    width: 44,
    height: 44,
  },
  logoContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
    })
  },
  logo: {
    width: 32,
    height: 32,
  },
});
