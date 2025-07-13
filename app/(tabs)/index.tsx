import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, BellOff, Clock, MapPin, Moon, Sun, Sunrise, Sunset, RefreshCw } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useLocationService } from '@/hooks/useLocationService';
import { useSilentMode } from '@/hooks/useSilentMode';

export default function HomeScreen() {
  const { prayerTimes, nextPrayer, loading, location, refreshPrayerTimes } = usePrayerTimes();
  const { location: deviceLocation, isNearMosque } = useLocationService();
  const { isSilent, toggleSilentMode } = useSilentMode();

  const getPrayerIcon = (prayer: string) => {
    const iconProps = { size: 24, color: '#DAA520' };
    switch (prayer) {
      case 'Fajr':
        return <Sunrise {...iconProps} />;
      case 'Dhuhr':
        return <Sun {...iconProps} />;
      case 'Asr':
        return <Sunset {...iconProps} />;
      case 'Maghrib':
        return <Moon {...iconProps} />;
      case 'Isha':
        return <Moon {...iconProps} />;
      default:
        return <Clock {...iconProps} />;
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#2D5E3F', '#1a4a32']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Selamun Aleykum</Text>
            <Text style={styles.currentTime}>{getCurrentTime()}</Text>
          </View>

          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <MapPin size={20} color={isNearMosque ? '#4CAF50' : '#9E9E9E'} />
                <Text style={[styles.statusText, { color: isNearMosque ? '#4CAF50' : '#9E9E9E' }]}>
                  {isNearMosque ? 'Camiye yakın' : 'Camiden uzak'}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.statusItem}
                onPress={() => Alert.alert('Bilgi', 'Sessize alma özelliği aktif edildi!')}
              >
                {isSilent ? (
                  <BellOff size={20} color="#FF6B6B" />
                ) : (
                  <Bell size={20} color="#4CAF50" />
                )}
                <Text style={[styles.statusText, { color: isSilent ? '#FF6B6B' : '#4CAF50' }]}>
                  {isSilent ? 'Sessiz mod' : 'Sesli mod'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Next Prayer Card */}
          {nextPrayer && (
            <View style={styles.nextPrayerCard}>
              <Text style={styles.nextPrayerTitle}>Sıradaki Namaz</Text>
              <View style={styles.nextPrayerInfo}>
                {getPrayerIcon(nextPrayer.name)}
                <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
                <Text style={styles.nextPrayerTime}>{formatTime(nextPrayer.time)}</Text>
              </View>
            </View>
          )}

          {/* Prayer Times */}
          <View style={styles.prayerTimesContainer}>
            <View style={styles.prayerTimesHeader}>
              <Text style={styles.sectionTitle}>Namaz Vakitleri</Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={refreshPrayerTimes}
                disabled={loading}
              >
                <RefreshCw size={20} color="#DAA520" />
              </TouchableOpacity>
            </View>
            
            {location && (
              <Text style={styles.locationInfo}>
                Konum: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            )}
            
            {loading ? (
              <Text style={styles.loadingText}>Namaz vakitleri yükleniyor...</Text>
            ) : (
              prayerTimes.map((prayer, index) => (
                <View key={index} style={styles.prayerTimeRow}>
                  <View style={styles.prayerTimeLeft}>
                    {getPrayerIcon(prayer.name)}
                    <Text style={styles.prayerName}>{prayer.name}</Text>
                  </View>
                  <Text style={styles.prayerTime}>{formatTime(prayer.time)}</Text>
                </View>
              ))
            )}
          </View>

          {/* Friday Prayer Special */}
          <View style={styles.fridayCard}>
            <Text style={styles.fridayTitle}>Cuma Namazı Özel</Text>
            <Text style={styles.fridayDescription}>
              Cuma namazı vakti camiye yakın olduğunuzda telefonunuz otomatik olarak sessize alınacak
            </Text>
            <TouchableOpacity 
              style={styles.fridayButton}
              onPress={() => router.push('/friday-settings')}
            >
              <Text style={styles.fridayButtonText}>Cuma Ayarları</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Amiri-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  currentTime: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#B8D4C6',
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  nextPrayerCard: {
    backgroundColor: 'rgba(218, 165, 32, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  nextPrayerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#DAA520',
    marginBottom: 12,
  },
  nextPrayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  nextPrayerName: {
    fontSize: 24,
    fontFamily: 'Amiri-Bold',
    color: '#FFFFFF',
  },
  nextPrayerTime: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#DAA520',
  },
  prayerTimesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  prayerTimesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(218, 165, 32, 0.2)',
  },
  locationInfo: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9E9E9E',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#B8D4C6',
    textAlign: 'center',
  },
  prayerTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  prayerTimeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prayerName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  prayerTime: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#DAA520',
  },
  fridayCard: {
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  fridayTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#DAA520',
    marginBottom: 8,
  },
  fridayDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#B8D4C6',
    lineHeight: 20,
    marginBottom: 16,
  },
  fridayButton: {
    backgroundColor: '#DAA520',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
  },
  fridayButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1a4a32',
  },
});