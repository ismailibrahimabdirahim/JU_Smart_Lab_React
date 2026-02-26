import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  ImageBackground
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext'; // Import Theme Hook
import { JUColors, JUSpacing, JURadius, JUShadow } from '@/constants/theme';
import {
  LuShield, LuUser, LuLock, LuArrowRight,
  LuCheck, LuX, LuShieldCheck, LuSchool, LuSun, LuMoon
} from 'react-icons/lu';

// Remote Assets
const REMOTE_BG = "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1974&auto=format&fit=crop";

type Role = 'admin' | 'superadmin';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme(); // Use Theme
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1000;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('admin');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Dynamic Styles based on Theme
  const dynamicStyles = {
    rightPanel: {
      backgroundColor: isDark ? '#0f172a' : '#fff'
    },
    text: {
      color: isDark ? '#f8fafc' : '#0f172a'
    },
    textMuted: {
      color: isDark ? '#94a3b8' : '#64748b'
    },
    inputWrapper: {
      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
      borderColor: isDark ? '#334155' : '#e2e8f0',
    },
    input: {
      color: isDark ? '#fff' : '#0f172a',
    },
    roleContainer: {
      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
    },
    roleTabActive: {
      backgroundColor: isDark ? '#334155' : '#fff',
    },
    roleText: {
      color: isDark ? '#94a3b8' : '#64748b'
    },
    roleTextActive: {
      color: isDark ? '#fff' : JUColors.primary
    },
    checkbox: {
      borderColor: isDark ? '#475569' : '#e2e8f0',
      backgroundColor: isDark ? 'transparent' : 'transparent',
    },
    footerBtn: {
      borderColor: isDark ? '#334155' : '#e2e8f0',
    },
    encryptionBadge: {
      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
    }
  };

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = login(email.trim(), password, role);
      setLoading(false);
      if (res.success) {
        if (role === 'admin') router.replace('/(admin)/dashboard');
        else router.replace('/(superadmin)/dashboard');
      } else {
        Alert.alert('Login Failed', res.message);
      }
    }, 800);
  };

  return (
    <View style={styles.container}>
      {/* LEFT PANEL - BRANDING (Desktop Only) */}
      {isDesktop && (
        <Animated.View entering={FadeInRight.duration(800)} style={styles.leftPanel}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${REMOTE_BG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2,
            zIndex: 0,
            filter: 'grayscale(100%) blur(2px)'
          }} />

          <View style={styles.leftContent}>
            <View style={styles.logoBox}>
              <LuSchool size={40} color="#fff" />
            </View>

            <View style={styles.decorativeLine} />

            <Text style={styles.brandTitle}>
              JU Smart Lab{'\n'}Management System
            </Text>

            <Text style={styles.brandQuote}>
              "Empowering future innovators through state-of-the-art laboratory infrastructure and seamless management."
            </Text>

            <Text style={styles.brandSubtitle}>
              Jazeera University is committed to excellence in academic research and practical learning. Our Smart Lab System ensures every student and staff member has the resources they need to succeed.
            </Text>

            <View style={{ flex: 1 }} />

            <Text style={styles.copyright}>
              © 2026 Jazeera University   •   Secure Access Portal
            </Text>
          </View>
        </Animated.View>
      )}

      {/* RIGHT PANEL - LOGIN FORM */}
      <View style={[styles.rightPanel, dynamicStyles.rightPanel, !isDesktop && { width: '100%' }]}>

        {/* Toggle Theme Absolute (Top Right) */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={{ position: 'absolute', top: 30, right: 30, padding: 10, zIndex: 10 }}
        >
          {isDark ? <LuSun size={24} color="#fbbf24" /> : <LuMoon size={24} color="#64748b" />}
        </TouchableOpacity>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ width: '100%', maxWidth: 480, padding: 20 }}
        >
          <Animated.View entering={FadeInUp.duration(600).springify()}>

            <View style={{ marginBottom: 40 }}>
              <Text style={[styles.welcomeTitle, dynamicStyles.text]}>Welcome Back</Text>
              <Text style={[styles.welcomeSub, dynamicStyles.textMuted]}>Please select your role and enter your credentials.</Text>
            </View>

            {/* Role Switcher */}
            <View style={[styles.roleContainer, dynamicStyles.roleContainer]}>
              <TouchableOpacity
                style={[styles.roleTab, role === 'admin' && [styles.roleTabActive, dynamicStyles.roleTabActive]]}
                onPress={() => setRole('admin')}
              >
                <Text style={[styles.roleText, dynamicStyles.roleText, role === 'admin' && dynamicStyles.roleTextActive]}>Staff Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleTab, role === 'superadmin' && [styles.roleTabActive, dynamicStyles.roleTabActive]]}
                onPress={() => setRole('superadmin')}
              >
                <Text style={[styles.roleText, dynamicStyles.roleText, role === 'superadmin' && dynamicStyles.roleTextActive]}>System Super Admin</Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, dynamicStyles.text]}>Email Address</Text>
              <View style={[styles.inputWrapper, dynamicStyles.inputWrapper]}>
                <View style={styles.inputIcon}><LuUser size={18} color={isDark ? "#94a3b8" : "#94a3b8"} /></View>
                <TextInput
                  style={[styles.input, dynamicStyles.input]}
                  placeholder={role === 'admin' ? "admin@jazeera.edu" : "super@jazeera.edu"}
                  placeholderTextColor={isDark ? "#64748b" : "#cbd5e1"}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={[styles.label, dynamicStyles.text]}>Password</Text>
                <TouchableOpacity><Text style={styles.forgotPass}>Forgot Password?</Text></TouchableOpacity>
              </View>
              <View style={[styles.inputWrapper, dynamicStyles.inputWrapper]}>
                <View style={styles.inputIcon}><LuLock size={18} color={isDark ? "#94a3b8" : "#94a3b8"} /></View>
                <TextInput
                  style={[styles.input, dynamicStyles.input]}
                  placeholder="••••••••••••"
                  placeholderTextColor={isDark ? "#64748b" : "#cbd5e1"}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {/* Remember Me */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setRememberMe(!rememberMe)}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, dynamicStyles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <LuCheck size={12} color="#fff" />}
              </View>
              <Text style={[styles.checkboxLabel, dynamicStyles.textMuted]}>Remember this device</Text>
            </TouchableOpacity>

            {/* Actions */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <LuShieldCheck size={20} />
                  <Text style={styles.loginBtnText}>Secure Login</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <TouchableOpacity style={[styles.footerBtn, dynamicStyles.footerBtn]} onPress={() => { setEmail(''); setPassword(''); }}>
                <Text style={[styles.footerBtnText, dynamicStyles.textMuted]}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.footerBtn, dynamicStyles.footerBtn]} onPress={() => router.back()}>
                <Text style={[styles.footerBtnText, dynamicStyles.textMuted]}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.encryptionBadge, dynamicStyles.encryptionBadge]}>
              <LuShield size={14} color={JUColors.primary} />
              <Text style={styles.encryptionText}>ENCRYPTED CONNECTION</Text>
            </View>

          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 1,
    backgroundColor: '#1e3a8a', // Deep academic blue
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },
  leftContent: {
    zIndex: 2,
    maxWidth: 500,
  },
  logoBox: {
    width: 64, height: 64,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
  },
  decorativeLine: {
    width: 60, height: 4, backgroundColor: '#fff', marginBottom: 24, borderRadius: 2
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 48,
    marginBottom: 32,
    fontFamily: Platform.OS === 'web' ? 'Inter, sans-serif' : 'System'
  },
  brandQuote: {
    fontSize: 20,
    color: '#fff',
    fontStyle: 'italic',
    lineHeight: 30,
    marginBottom: 24,
    opacity: 0.9
  },
  brandSubtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 24,
    marginBottom: 60
  },
  copyright: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5
  },

  // Right Panel
  rightPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  welcomeSub: {
    fontSize: 15,
  },
  roleContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 8,
    marginBottom: 32,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  roleTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  roleTextActive: {
    fontWeight: '700',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  forgotPass: {
    fontSize: 12,
    color: JUColors.primary,
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkbox: {
    width: 20, height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: JUColors.primary,
    borderColor: JUColors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  loginBtn: {
    backgroundColor: JUColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 10,
    gap: 10,
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(4, 104, 206, 0.3)',
        cursor: 'pointer',
      }
    })
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  footerBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  footerBtnText: {
    fontWeight: '600',
  },
  encryptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
    alignSelf: 'center',
  },
  encryptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: JUColors.primary,
    letterSpacing: 0.5,
  },
});
