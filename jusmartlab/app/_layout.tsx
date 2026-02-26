import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { ProblemsProvider } from '@/contexts/ProblemsContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'; // Import our custom provider
import { JUColors } from '@/constants/theme';
import '../global.css'; // Remove focus outlines from all inputs

// Wrapper component to consume theme for StatusBar and Navigation
function AppContent() {
  const { isDark, colors } = useTheme();

  const NavigationTheme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      primary: JUColors.primary,
      background: colors.bg,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationThemeProvider value={NavigationTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg }, // Dynamic background
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(superadmin)" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={isDark ? colors.bg : JUColors.secondary} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProblemsProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </ProblemsProvider>
    </AuthProvider>
  );
}
