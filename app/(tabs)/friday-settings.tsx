import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Clock, MapPin, Bell, Moon, Volume2, VolumeX, Calendar } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FridaySettings {
  enabled: boolean;
  autoSilentBeforePrayer: boolean;
  minutesBeforePrayer: number;
  silentDuration: number;
  onlyInMosqueRadius: boolean;
  notificationEnabled: boolean;
  vibrateInSilentMode: boolean;
  customPrayerTime: string;
  useCustomTime: boolean;
}

export default function FridaySettingsScreen() {
  const [settings, setSettings] = useState<FridaySettings>({
    enabled: true,
    autoSilentBeforePrayer: true,
    minutesBeforePrayer: 10,
    silentDuration: 45,
    onlyInMosqueRadius: true,
    notificationEnabled: true,
    vibrateInSilentMode: false,
    customPrayerTime: '12:30',
    useCustomTime: false,
  });

  useEffect(() => {
    loadFridaySettings();
  }, []);

  const loadFridaySettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('friday_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Cuma ayarları yüklenirken hata oluştu:', error);
    }
  };

  const saveFridaySettings = async (newSettings: FridaySettings) => {
    try {
      await AsyncStorage.setItem('friday_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Cuma ayarları kaydedilirken hata oluştu:', error);
    }
  };

  const toggleSetting = (key: keyof FridaySettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveFridaySettings(newSettings);
  };

  const showTimeOptions = (type: 'before' | 'duration') => {
    if (type === 'before') {
      Alert.alert(
        'Namaz Öncesi Süre',
        'Cuma namazından kaç dakika önce sessize alınsın?',
        [
          { text: '5 dakika', onPress: () => updateMinutesBefore(5) },
          { text: '10 dakika', onPress: () => updateMinutesBefore(10) },
          { text: '15 dakika', onPress: () => updateMinutesBefore(15) },
          { text: '20 dakika', onPress: () => updateMinutesBefore(20) },
          { text: 'İptal', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert(
        'Sessize Alma Süresi',
        'Telefon ne kadar süre sessize kalsın?',
        [
          { text: '30 dakika', onPress: () => updateSilentDuration(30) },
          { text: '45 dakika', onPress: () => updateSilentDuration(45) },
          { text: '60 dakika', onPress: () => updateSilentDuration(60) },
          { text: '90 dakika', onPress: () => updateSilentDuration(90) },
          { text: 'İptal', style: 'cancel' },
        ]
      );
    }
  };

  const updateMinutesBefore = (minutes: number) => {
    const newSettings = { ...settings, minutesBeforePrayer: minutes };
    saveFridaySettings(newSettings);
  };

  const updateSilentDuration = (duration: number) => {
    const newSettings = { ...settings, silentDuration: duration };
    saveFridaySettings(newSettings);
  };

  const showCustomTimeAlert = () => {
    Alert.prompt(
      'Özel Cuma Namazı Saati',
      'Cuma namazı saatini girin (örn: 12:30)',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaydet',
          onPress: (time) => {
            if (time && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
              const newSettings = { ...settings, customPrayerTime: time };
              saveFridaySettings(newSettings);
            } else {
              Alert.alert('Hata', 'Geçerli bir saat formatı girin (örn: 12:30)');
            }
          },
        },
      ],
      'plain-text',
      settings.customPrayerTime
    );
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Varsayılan Ayarlara Dön',
      'Tüm cuma ayarlarını varsayılan değerlere döndürmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: () => {
            const defaultSettings: FridaySettings = {
              enabled: true,
              autoSilentBeforePrayer: true,
              minutesBeforePrayer: 10,
              silentDuration: 45,
              onlyInMosqueRadius: true,
              notificationEnabled: true,
              vibrateInSilentMode: false,
              customPrayerTime: '12:30',
              useCustomTime: false,
            };
            saveFridaySettings(defaultSettings);
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
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Cuma Ayarları</Text>
              <Text style={styles.subtitle}>
                Cuma namazı için özel sessize alma ayarları
              </Text>
            </View>
          </View>

          {/* Main Toggle */}
          <View style={styles.mainToggleCard}>
            <View style={styles.mainToggleContent}>
              <Calendar size={32} color="#DAA520" />
              <View style={styles.mainToggleText}>
                <Text style={styles.mainToggleTitle}>Cuma Namazı Özel Modu</Text>
                <Text style={styles.mainToggleDescription}>
                  Cuma namazı için otomatik sessize alma özelliğini aktifleştir
                </Text>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={() => toggleSetting('enabled')}
                thumbColor={settings.enabled ? '#DAA520' : '#9E9E9E'}
                trackColor={{ false: '#767577', true: '#DAA52080' }}
              />
            </View>
          </View>

          {/* Settings Sections */}
          {settings.enabled && (
            <>
              {/* Timing Settings */}
              <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>Zamanlama Ayarları</Text>
                
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <Clock size={24} color="#DAA520" />
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>Namaz Öncesi Sessize Al</Text>
                      <Text style={styles.settingDescription}>
                        Cuma namazından önce otomatik sessize al
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.autoSilentBeforePrayer}
                    onValueChange={() => toggleSetting('autoSilentBeforePrayer')}
                    thumbColor={settings.autoSilentBeforePrayer ? '#DAA520' : '#9E9E9E'}
                    trackColor={{ false: '#767577', true: '#DAA52080' }}
                  />
                </View>

                {settings.autoSilentBeforePrayer && (
                  <TouchableOpacity 
                    style={styles.settingItem} 
                    onPress={() => showTimeOptions('before')}
                  >
                    <View style={styles.settingLeft}>
                      <Clock size={24} color="#DAA520" />
                      <View style={styles.settingText}>
                        <Text style={styles.settingTitle}>Namaz Öncesi Süre</Text>
                        <Text style={styles.settingDescription}>
                          Mevcut: {settings.minutesBeforePrayer} dakika önce
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.settingValue}>Değiştir</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={styles.settingItem} 
                  onPress={() => showTimeOptions('duration')}
                >
                  <View style={styles.settingLeft}>
                    <VolumeX size={24} color="#DAA520" />
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>Sessize Alma Süresi</Text>
                      <Text style={styles.settingDescription}>
                        Mevcut: {settings.silentDuration} dakika
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.settingValue}>Değiştir</Text>
                </TouchableOpacity>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <Clock size={24} color="#DAA520" />
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>Özel Namaz Saati Kullan</Text>
                      <Text style={styles.settingDescription}>
                        Otomatik saat yerine özel saat kullan
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.useCustomTime}
                    onValueChange={() => toggleSetting('useCustomTime')}
                    thumbColor={settings.useCustomTime ? '#DAA520' : '#9E9E9E'}
                    trackColor={{ false: '#767577', true: '#DAA52080' }}
                  />
                </View>

                {settings.useCustomTime && (
                  <TouchableOpacity 
                    style={styles.settingItem} 
                    onPress={showCustomTimeAlert}
                  >
                    <View style={styles.settingLeft}>
                      <Clock size={24} color="#DAA520" />
                      <View style={styles.settingText}>
                        <Text style={styles.settingTitle}>Cuma Namazı Saati</Text>
                        <Text style={styles.settingDescription}>
                          Mevcut: {settings.customPrayerTime}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.settingValue}>Değiştir</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Location Settings */}
              <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>Konum Ayarları</Text>
                
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MapPin size={24} color="#DAA520" />
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>Sadece Cami Yakınında</Text>
                      <Text style={styles.settingDescription}>
                        Sadece camiye yakın olduğunuzda sessize al
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.onlyInMosqueRadius}
                    onValueChange={() => toggleSetting('onlyInMosqueRadius')}
                    thumbColor={settings.onlyInMosqueRadius ? '#DAA520' : '#9E9E9E'}
                    trackColor={{ false: '#767577', true: '#DAA52080' }}
                  />
                </View>
              </View>

              {/* Notification Settings */}
              <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>Bildirim Ayarları</Text>
                
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <Bell size={24} color="#DAA520" />
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>Bildirimler</Text>
                      <Text style={styles.settingDescription}>
                        Sessize alma bildirimleri göster
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.notificationEnabled}
                    onValueChange={() => toggleSetting('notificationEnabled')}
                    thumbColor={settings.notificationEnabled ? '#DAA520' : '#9E9E9E'}
                    trackColor={{ false: '#767577', true: '#DAA52080' }}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <Volume2 size={24} color="#DAA520" />
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>Sessiz Modda Titreşim</Text>
                      <Text style={styles.settingDescription}>
                        Sessiz modda titreşimi aktif tut
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.vibrateInSilentMode}
                    onValueChange={() => toggleSetting('vibrateInSilentMode')}
                    thumbColor={settings.vibrateInSilentMode ? '#DAA520' : '#9E9E9E'}
                    trackColor={{ false: '#767577', true: '#DAA52080' }}
                  />
                </View>
              </View>

              {/* Info Section */}
              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>Cuma Namazı Özel Özellikleri</Text>
                <Text style={styles.infoText}>
                  • Cuma günleri özel olarak kontrol edilir
                </Text>
                <Text style={styles.infoText}>
                  • Namaz saatinden önce otomatik sessize alma
                </Text>
                <Text style={styles.infoText}>
                  • Cami yakınında olduğunuzda daha hassas kontrol
                </Text>
                <Text style={styles.infoText}>
                  • Namaz bitiminde otomatik ses moduna dönüş
                </Text>
              </View>

              {/* Reset Button */}
              <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
                <Text style={styles.resetButtonText}>Varsayılan Ayarlara Dön</Text>
              </TouchableOpacity>
            </>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#B8D4C6',
    lineHeight: 20,
  },
  mainToggleCard: {
    backgroundColor: 'rgba(218, 165, 32, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  mainToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  mainToggleText: {
    flex: 1,
  },
  mainToggleTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  mainToggleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#B8D4C6',
    lineHeight: 18,
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
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#DAA520',
    marginBottom: 12,
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