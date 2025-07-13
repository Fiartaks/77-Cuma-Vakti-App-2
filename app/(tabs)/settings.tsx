import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Clock, MapPin, Moon, Smartphone, Volume2, VolumeX } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Settings {
  autoSilentMode: boolean;
  fridayPrayerOnly: boolean;
  detectionRadius: number;
  silentDuration: number;
  notifications: boolean;
  vibrateMode: boolean;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>({
    autoSilentMode: true,
    fridayPrayerOnly: true,
    detectionRadius: 500,
    silentDuration: 30,
    notifications: true,
    vibrateMode: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Ayarlar yüklenirken hata oluştu:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata oluştu:', error);
    }
  };

  const toggleSetting = (key: keyof Settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const showDistanceOptions = () => {
    Alert.alert(
      'Algılama Mesafesi',
      'Camiyi algılama mesafesini seçin:',
      [
        { text: '100m', onPress: () => updateDistance(100) },
        { text: '300m', onPress: () => updateDistance(300) },
        { text: '500m', onPress: () => updateDistance(500) },
        { text: '1000m', onPress: () => updateDistance(1000) },
        { text: 'İptal', style: 'cancel' },
      ]
    );
  };

  const showDurationOptions = () => {
    Alert.alert(
      'Sessize Alma Süresi',
      'Telefonu ne kadar süre sessize almak istiyorsunuz?',
      [
        { text: '15 dakika', onPress: () => updateDuration(15) },
        { text: '30 dakika', onPress: () => updateDuration(30) },
        { text: '45 dakika', onPress: () => updateDuration(45) },
        { text: '60 dakika', onPress: () => updateDuration(60) },
        { text: 'İptal', style: 'cancel' },
      ]
    );
  };

  const updateDistance = (distance: number) => {
    const newSettings = { ...settings, detectionRadius: distance };
    saveSettings(newSettings);
  };

  const updateDuration = (duration: number) => {
    const newSettings = { ...settings, silentDuration: duration };
    saveSettings(newSettings);
  };

  const resetSettings = () => {
    Alert.alert(
      'Ayarları Sıfırla',
      'Tüm ayarları varsayılan değerlere döndürmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: () => {
            const defaultSettings: Settings = {
              autoSilentMode: true,
              fridayPrayerOnly: true,
              detectionRadius: 500,
              silentDuration: 30,
              notifications: true,
              vibrateMode: true,
            };
            saveSettings(defaultSettings);
          },
        },
      ]
    );
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
            <Text style={styles.title}>Ayarlar</Text>
            <Text style={styles.subtitle}>
              Otomatik sessize alma özelliklerini özelleştirin
            </Text>
          </View>

          {/* Main Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Genel Ayarlar</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <VolumeX size={24} color="#DAA520" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Otomatik Sessize Al</Text>
                  <Text style={styles.settingDescription}>
                    Camiye yaklaştığınızda telefonu otomatik sessize al
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.autoSilentMode}
                onValueChange={() => toggleSetting('autoSilentMode')}
                thumbColor={settings.autoSilentMode ? '#DAA520' : '#9E9E9E'}
                trackColor={{ false: '#767577', true: '#DAA52080' }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Moon size={24} color="#DAA520" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Sadece Cuma Namazı</Text>
                  <Text style={styles.settingDescription}>
                    Sadece cuma namazı vakti sessize al
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.fridayPrayerOnly}
                onValueChange={() => toggleSetting('fridayPrayerOnly')}
                thumbColor={settings.fridayPrayerOnly ? '#DAA520' : '#9E9E9E'}
                trackColor={{ false: '#767577', true: '#DAA52080' }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Bell size={24} color="#DAA520" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Bildirimler</Text>
                  <Text style={styles.settingDescription}>
                    Sessize alma bildirimleri
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={() => toggleSetting('notifications')}
                thumbColor={settings.notifications ? '#DAA520' : '#9E9E9E'}
                trackColor={{ false: '#767577', true: '#DAA52080' }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Smartphone size={24} color="#DAA520" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Titreşim Modu</Text>
                  <Text style={styles.settingDescription}>
                    Sessiz modda titreşimi aktif tut
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.vibrateMode}
                onValueChange={() => toggleSetting('vibrateMode')}
                thumbColor={settings.vibrateMode ? '#DAA520' : '#9E9E9E'}
                trackColor={{ false: '#767577', true: '#DAA52080' }}
              />
            </View>
          </View>

          {/* Distance and Duration Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Mesafe ve Süre</Text>
            
            <TouchableOpacity style={styles.settingItem} onPress={showDistanceOptions}>
              <View style={styles.settingLeft}>
                <MapPin size={24} color="#DAA520" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Algılama Mesafesi</Text>
                  <Text style={styles.settingDescription}>
                    Mevcut: {settings.detectionRadius}m
                  </Text>
                </View>
              </View>
              <Text style={styles.settingValue}>Değiştir</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={showDurationOptions}>
              <View style={styles.settingLeft}>
                <Clock size={24} color="#DAA520" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Sessize Alma Süresi</Text>
                  <Text style={styles.settingDescription}>
                    Mevcut: {settings.silentDuration} dakika
                  </Text>
                </View>
              </View>
              <Text style={styles.settingValue}>Değiştir</Text>
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Uygulama</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Cuma Namazı Sessize Alma</Text>
              <Text style={styles.infoText}>Versiyon 1.0.0</Text>
              <Text style={styles.infoText}>
                Bu uygulama cuma namazı esnasında telefonunuzu otomatik olarak sessize alarak 
                namaz koncentrasyonunuzu korur.
              </Text>
            </View>
          </View>

          {/* Reset Button */}
          <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
            <Text style={styles.resetButtonText}>Ayarları Sıfırla</Text>
          </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#B8D4C6',
    textAlign: 'center',
    lineHeight: 20,
  },
  settingsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#B8D4C6',
    lineHeight: 18,
  },
  settingValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#DAA520',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#DAA520',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#B8D4C6',
    lineHeight: 20,
    marginBottom: 8,
  },
  resetButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF6B6B',
  },
});