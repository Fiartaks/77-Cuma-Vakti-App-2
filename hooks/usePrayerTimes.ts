import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

interface PrayerTime {
  name: string;
  time: string;
}

export function usePrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    getCurrentLocationAndFetchPrayers();
  }, []);

  const getCurrentLocationAndFetchPrayers = async () => {
    try {
      setLoading(true);
      
      if (Platform.OS === 'web') {
        // Web için browser geolocation API kullan
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              setLocation(userLocation);
              fetchPrayerTimes(userLocation.latitude, userLocation.longitude);
            },
            (error) => {
              console.error('Web geolocation error:', error);
              // Varsayılan konum olarak Ankara kullan
              const defaultLocation = { latitude: 39.9334, longitude: 32.8597 };
              setLocation(defaultLocation);
              fetchPrayerTimes(defaultLocation.latitude, defaultLocation.longitude);
            }
          );
        } else {
          // Geolocation desteklenmiyorsa varsayılan konum
          const defaultLocation = { latitude: 39.9334, longitude: 32.8597 };
          setLocation(defaultLocation);
          fetchPrayerTimes(defaultLocation.latitude, defaultLocation.longitude);
        }
      } else {
        // Native platformlar için
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const userLocation = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          };
          setLocation(userLocation);
          fetchPrayerTimes(userLocation.latitude, userLocation.longitude);
        } else {
          // İzin verilmezse varsayılan konum
          const defaultLocation = { latitude: 39.9334, longitude: 32.8597 };
          setLocation(defaultLocation);
          fetchPrayerTimes(defaultLocation.latitude, defaultLocation.longitude);
        }
      }
    } catch (error) {
      console.error('Konum alınırken hata oluştu:', error);
      // Hata durumunda varsayılan konum
      const defaultLocation = { latitude: 39.9334, longitude: 32.8597 };
      setLocation(defaultLocation);
      fetchPrayerTimes(defaultLocation.latitude, defaultLocation.longitude);
    }
  };

  const fetchPrayerTimes = async (latitude: number, longitude: number) => {
    try {
      // Get current date
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=13`
      );
      
      const data = await response.json();
      
      if (data.data && data.data.timings) {
        const timings = data.data.timings;
        const prayers: PrayerTime[] = [
          { name: 'İmsak', time: timings.Fajr },
          { name: 'Güneş', time: timings.Sunrise },
          { name: 'Öğle', time: timings.Dhuhr },
          { name: 'İkindi', time: timings.Asr },
          { name: 'Akşam', time: timings.Maghrib },
          { name: 'Yatsı', time: timings.Isha },
        ];
        
        setPrayerTimes(prayers);
        setNextPrayer(getNextPrayer(prayers));
      }
    } catch (error) {
      console.error('Namaz vakitleri alınırken hata oluştu:', error);
      // Fallback prayer times
      const fallbackTimes: PrayerTime[] = [
        { name: 'İmsak', time: '05:30' },
        { name: 'Güneş', time: '07:00' },
        { name: 'Öğle', time: '12:30' },
        { name: 'İkindi', time: '15:45' },
        { name: 'Akşam', time: '18:15' },
        { name: 'Yatsı', time: '19:45' },
      ];
      setPrayerTimes(fallbackTimes);
      setNextPrayer(getNextPrayer(fallbackTimes));
    } finally {
      setLoading(false);
    }
  };

  const getNextPrayer = (prayers: PrayerTime[]): PrayerTime | null => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTime = hours * 60 + minutes;
      
      if (prayerTime > currentTime) {
        return prayer;
      }
    }
    
    // If no prayer is found for today, return the first prayer of tomorrow
    return prayers[0];
  };

  const refreshPrayerTimes = () => {
    if (location) {
      fetchPrayerTimes(location.latitude, location.longitude);
    } else {
      getCurrentLocationAndFetchPrayers();
    }
  };

  return { 
    prayerTimes, 
    nextPrayer, 
    loading, 
    location,
    refreshPrayerTimes 
  };
}