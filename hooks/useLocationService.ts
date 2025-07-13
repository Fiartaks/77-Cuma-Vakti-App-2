import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Mosque {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export function useLocationService() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isNearMosque, setIsNearMosque] = useState(false);
  const [nearestMosque, setNearestMosque] = useState<Mosque | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (permissionGranted) {
      const interval = setInterval(() => {
        getCurrentLocation();
      }, 60000); // Check every minute

      getCurrentLocation(); // Initial check
      
      return () => clearInterval(interval);
    }
  }, [permissionGranted]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'web') {
      // For web, we'll simulate location permission
      setPermissionGranted(true);
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
      } else {
        console.log('Location permission denied');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, use browser geolocation API
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const webLocation = {
                coords: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  altitude: null,
                  accuracy: position.coords.accuracy,
                  altitudeAccuracy: null,
                  heading: null,
                  speed: null,
                },
                timestamp: Date.now(),
              };
              setLocation(webLocation);
              checkNearbyMosques(webLocation);
            },
            (error) => {
              console.error('Web geolocation error:', error);
              // Use default location (Ankara)
              const defaultLocation = {
                coords: {
                  latitude: 39.9334,
                  longitude: 32.8597,
                  altitude: null,
                  accuracy: 100,
                  altitudeAccuracy: null,
                  heading: null,
                  speed: null,
                },
                timestamp: Date.now(),
              };
              setLocation(defaultLocation);
              checkNearbyMosques(defaultLocation);
            }
          );
        }
      } else {
        // For native platforms
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLocation);
        checkNearbyMosques(currentLocation);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const checkNearbyMosques = async (currentLocation: Location.LocationObject) => {
    try {
      const savedMosques = await AsyncStorage.getItem('mosques');
      if (!savedMosques) {
        setIsNearMosque(false);
        return;
      }

      const mosques: Mosque[] = JSON.parse(savedMosques);
      let nearestDistance = Infinity;
      let nearest: Mosque | null = null;

      for (const mosque of mosques) {
        const distance = calculateDistance(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          mosque.latitude,
          mosque.longitude
        );

        if (distance <= mosque.radius && distance < nearestDistance) {
          nearestDistance = distance;
          nearest = mosque;
        }
      }

      setNearestMosque(nearest);
      setIsNearMosque(nearest !== null);
    } catch (error) {
      console.error('Error checking nearby mosques:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  return {
    location,
    isNearMosque,
    nearestMosque,
    permissionGranted,
  };
}