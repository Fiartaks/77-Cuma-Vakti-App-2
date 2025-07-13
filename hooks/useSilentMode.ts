import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocationService } from './useLocationService';

export function useSilentMode() {
  const [isSilent, setIsSilent] = useState(false);
  const [silentTimer, setSilentTimer] = useState<NodeJS.Timeout | null>(null);
  const { isNearMosque, nearestMosque } = useLocationService();

  useEffect(() => {
    checkSilentMode();
  }, [isNearMosque]);

  const checkSilentMode = async () => {
    try {
      const settings = await AsyncStorage.getItem('app_settings');
      if (!settings) return;

      const parsedSettings = JSON.parse(settings);
      
      // Check if auto silent mode is enabled
      if (!parsedSettings.autoSilentMode) return;

      // Check if it's Friday and Friday-only mode is enabled
      const today = new Date();
      const isFriday = today.getDay() === 5; // Friday is day 5
      
      if (parsedSettings.fridayPrayerOnly && !isFriday) return;

      // Check if it's prayer time (for Friday, check if it's around Dhuhr time)
      if (isFriday && parsedSettings.fridayPrayerOnly) {
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;
        
        // Friday prayer is usually around Dhuhr time (12:00-14:00)
        const fridayPrayerStart = 12 * 60; // 12:00
        const fridayPrayerEnd = 14 * 60; // 14:00
        
        if (currentTime < fridayPrayerStart || currentTime > fridayPrayerEnd) {
          return;
        }
      }

      // If near mosque, activate silent mode
      if (isNearMosque && !isSilent) {
        activateSilentMode(parsedSettings.silentDuration);
      } else if (!isNearMosque && isSilent) {
        deactivateSilentMode();
      }
    } catch (error) {
      console.error('Error checking silent mode:', error);
    }
  };

  const activateSilentMode = (duration: number) => {
    if (Platform.OS === 'web') {
      // For web, we can't actually change system sound settings
      // But we can show the user that silent mode is active
      console.log('Silent mode activated (web simulation)');
    } else {
      // For native platforms, you would use native modules to control sound
      // This would require expo-audio or similar packages
      console.log('Silent mode activated (native)');
    }

    setIsSilent(true);

    // Set timer to deactivate silent mode after specified duration
    if (silentTimer) {
      clearTimeout(silentTimer);
    }

    const timer = setTimeout(() => {
      deactivateSilentMode();
    }, duration * 60 * 1000); // Convert minutes to milliseconds

    setSilentTimer(timer);
  };

  const deactivateSilentMode = () => {
    if (Platform.OS === 'web') {
      console.log('Silent mode deactivated (web simulation)');
    } else {
      console.log('Silent mode deactivated (native)');
    }

    setIsSilent(false);

    if (silentTimer) {
      clearTimeout(silentTimer);
      setSilentTimer(null);
    }
  };

  const toggleSilentMode = () => {
    if (isSilent) {
      deactivateSilentMode();
    } else {
      activateSilentMode(30); // Default 30 minutes
    }
  };

  return {
    isSilent,
    toggleSilentMode,
    activateSilentMode,
    deactivateSilentMode,
  };
}