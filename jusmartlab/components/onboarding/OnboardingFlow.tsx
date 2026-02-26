import React, { useState } from 'react';
import { View, Text, Platform } from 'react-native';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuUser,
  LuMonitor,
  LuUsers,
  LuClock,
  LuCheck,
  LuArrowRight,
  LuArrowLeft
} from 'react-icons/lu';
import { JUColors } from '@/constants/theme';
import { LandingScreen } from '@/components/LandingScreen';
import { useTheme } from '@/contexts/ThemeContext';

const STEPS = 3; // 0: Landing, 1: How It Works, 2: Benefits

interface OnboardingFlowProps {
  onComplete: () => void;
  logoImageSource?: any;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const { colors, isDark } = useTheme();

  if (Platform.OS !== 'web') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Please use the Web version.</Text>
      </View>
    );
  }

  const handleNext = () => {
    setDirection(1);
    if (step < STEPS - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  // Dedicated render for the landing screen to break out of the "Card" layout
  if (step === 0) {
    return (
      <motion.div
        key="landing"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          height: '100%',
          overflowY: 'auto', // Enable scrolling for the landing page
          overflowX: 'hidden'
        }}
      >
        <LandingScreen onGetStarted={handleNext} />
      </motion.div>
    );
  }

  // Common layout for Steps 1 & 2 (How It Works, Benefits)
  return (
    <div style={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: colors.bg,
      fontFamily: '"Inter", sans-serif',
      overflow: 'hidden',
      position: 'relative',
      transition: 'background 0.3s ease'
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: isDark
          ? `radial-gradient(circle at 10% 10%, ${JUColors.primary}15 0%, transparent 60%)`
          : `radial-gradient(circle at 10% 10%, ${JUColors.primary}15 0%, transparent 60%), radial-gradient(circle at 90% 90%, ${JUColors.secondary}15 0%, transparent 60%)`,
        zIndex: 0,
      }} />

      {/* Main Card */}
      <motion.div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)' : '0 20px 40px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 1,
          margin: '20px',
          height: '600px',
          border: `1px solid ${colors.border}`,
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        {/* Header */}
        <div style={styles.header}>
          {/* Mini Progress */}
          <div style={styles.progressContainer}>
            {[1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  backgroundColor: i === step ? JUColors.primary : (isDark ? '#334155' : '#E2E8F0'),
                  width: i === step ? 32 : 8,
                }}
                style={styles.dot}
              />
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div style={styles.contentArea}>
          <AnimatePresence custom={direction} mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={styles.stepContainer}
              >
                <Step2HowItWorks colors={colors} isDark={isDark} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={styles.stepContainer}
              >
                <Step3Benefits colors={colors} isDark={isDark} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div style={{
          padding: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: isDark ? 'rgba(30,30,40,0.5)' : '#fff',
          borderTop: `1px solid ${colors.border}`,
        }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.textSecondary,
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '12px',
            }}
          >
            <LuArrowLeft size={18} />
            Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            style={{
              ...styles.nextButton,
              width: step === 2 ? '100%' : 'auto',
              justifyContent: step === 2 ? 'center' : 'space-between'
            }}
          >
            {step === 2 ? 'Report a Lab Problem' : 'Next'}
            {step !== 2 && <LuArrowRight size={18} />}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Steps Components ---

function Step2HowItWorks({ colors, isDark }: any) {
  const steps = [
    { icon: <LuUser size={20} />, text: 'Select Faculty & Details' },
    { icon: <LuMonitor size={20} />, text: 'Identify Server & PC' },
    { icon: <LuUsers size={20} />, text: 'Describe the Issue' },
    { icon: <LuClock size={20} />, text: 'Track Resolution' },
  ];

  return (
    <div style={styles.stepContent}>
      <h2 style={{ ...styles.title, color: colors.text }}>How It Works</h2>
      <p style={{ ...styles.subtitle, color: colors.textSecondary }}>Reporting a problem is simple and structured.</p>
      <div style={styles.grid}>
        {steps.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px',
              backgroundColor: isDark ? '#1e293b' : '#fff',
              borderRadius: '16px',
              gap: '12px',
              textAlign: 'center',
              boxShadow: isDark ? '0 4px 6px rgba(0,0,0,0.2)' : '0 4px 6px rgba(0,0,0,0.02)',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={styles.cardIcon}>{item.icon}</div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>{item.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Step3Benefits({ colors, isDark }: any) {
  const benefits = [
    'No student login required',
    'Quick & accurate reporting',
    'Organized academic structure',
    'Improved lab maintenance',
  ];

  return (
    <div style={styles.stepContent}>
      <h2 style={{ ...styles.title, color: colors.text }}>Benefits</h2>
      <p style={{ ...styles.subtitle, color: colors.textSecondary }}>Why this system makes a difference.</p>
      <div style={styles.list}>
        {benefits.map((text, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              backgroundColor: isDark ? '#1e293b' : '#fff',
              padding: '16px',
              borderRadius: '16px',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={styles.checkIcon}>
              <LuCheck color="#fff" size={14} />
            </div>
            <span style={{ fontSize: '15px', fontWeight: 600, color: colors.text }}>{text}</span>
          </motion.div>
        ))}
      </div>
    </div >
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    padding: '32px 32px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  progressContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '10px',
  },
  dot: {
    height: '6px',
    borderRadius: '4px',
  },
  contentArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  stepContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 32px',
    boxSizing: 'border-box',
    justifyContent: 'center', // Centered content
  },
  stepContent: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    margin: '0 0 12px 0',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '16px',
    margin: '0 0 32px 0',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    width: '100%',
  },
  cardIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: `${JUColors.primary}15`,
    color: JUColors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' },
  checkIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: JUColors.tertiary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  nextButton: {
    backgroundColor: JUColors.primary,
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    padding: '14px 28px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: `0 4px 12px ${JUColors.primary}40`,
  },
};
