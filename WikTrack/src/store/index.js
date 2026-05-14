import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useBusinessStore = create(
  persist(
    (set, get) => ({
      // Business data
      businessId: null,
      businessName: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      // Onboarding state
      onboardingComplete: false,

      // SMS parser settings
      enabledTypes: ['pochi', 'p2p', 'till', 'paybill'],

      // Sync state
      lastSyncAt: null,
      syncStatus: 'idle', // 'idle' | 'syncing' | 'error' | 'offline'

      // Push notifications
      pushToken: null,
      notificationsEnabled: true,

      // Actions
      setBusiness: (data) => set(data),
      setEnabledTypes: (types) => set({ enabledTypes: types }),
      setSyncStatus: (status) => set({ syncStatus: status }),
      setLastSync: () => set({ lastSyncAt: new Date().toISOString() }),
      setPushToken: (token) => set({ pushToken: token }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      setOnboardingComplete: (value) => set({ onboardingComplete: value }),

      // Reset
      logout: () =>
        set({
          businessId: null,
          businessName: '',
          ownerName: '',
          ownerEmail: '',
          ownerPhone: '',
          onboardingComplete: false,
          enabledTypes: ['pochi', 'p2p', 'till', 'paybill'],
          lastSyncAt: null,
          syncStatus: 'idle',
          pushToken: null,
          notificationsEnabled: true,
        }),
    }),
    {
      name: 'wiktrack-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
