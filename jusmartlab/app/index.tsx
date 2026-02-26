import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { getOnboardingComplete, setOnboardingComplete } from '@/utils/onboardingStorage';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { StudentHomeContent } from '@/components/StudentHomeContent';

export default function StudentHomeScreen() {
  const [onboardingComplete, setOnboardingCompleteState] = useState<boolean | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setOnboardingCompleteState(true);
    } else {
      setOnboardingCompleteState(getOnboardingComplete());
    }
  }, []);

  const handleOnboardingComplete = () => {
    setOnboardingComplete(true);
    setOnboardingCompleteState(true);
  };

  // Wait for storage so we don't flash wrong screen
  if (onboardingComplete === null) {
    return <View style={styles.placeholder} />;
  }

  if (!onboardingComplete) {
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        logoImageSource={require('@/assets/images/ju-logo.png')}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StudentHomeContent />
      {/* Temporary Debug Button */}
      {Platform.OS === 'web' && (
        <button
          onClick={() => {
            localStorage.removeItem('jusmartlab_onboarding_complete');
            window.location.reload();
          }}
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            padding: '8px 12px',
            background: 'red',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            zIndex: 9999
          }}
        >
          Reset Onboarding
        </button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#f0f6ff' : '#f0f6ff',
  },
});
