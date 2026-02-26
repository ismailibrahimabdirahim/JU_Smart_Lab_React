import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" /> {/* This is your dashboard */}
      <Stack.Screen name="manage-report" />
    </Stack>
  );
}