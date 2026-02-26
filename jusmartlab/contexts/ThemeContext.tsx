import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JUColors } from '@/constants/theme';

type ThemeContextType = {
    isDark: boolean;
    toggleTheme: () => void;
    colors: typeof JUColors & {
        bg: string;
        text: string;
        textSecondary: string;
        card: string;
        border: string;
        navBg: string;
    };
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Load persisted theme
        const loadTheme = async () => {
            try {
                const stored = await AsyncStorage.getItem('ju-theme-mode');
                if (stored) setIsDark(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to load theme', e);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newMode = !isDark;
        setIsDark(newMode);
        try {
            await AsyncStorage.setItem('ju-theme-mode', JSON.stringify(newMode));
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    };

    const colors = {
        ...JUColors,
        bg: isDark ? '#0f172a' : '#ffffff',
        text: isDark ? '#f8fafc' : JUColors.secondary,
        textSecondary: isDark ? '#94a3b8' : '#64748B',
        card: isDark ? '#1e293b' : '#ffffff',
        border: isDark ? '#334155' : '#e2e8f0',
        navBg: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255,255,255,0.8)',
    };

    // We cast to any here to avoid strict readonly mismatch issues with JUColors
    // In a real strict project, we'd define a mutable Interface, but this works for now.
    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, colors: colors as any }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
