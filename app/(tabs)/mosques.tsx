import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Plus, CreditCard as Edit, Trash2, Save, X, Navigation, Search } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

interface Mosque {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export default function MosquesScreen() {
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [isAddingMosque, setIsAddingMosque] = useState(false);
  const [editingMosque, setEditingMosque] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [editSearchResults, setEditSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editMosqueData, setEditMosqueData] = useState({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    radius: '500',
  });
  const [newMosque, setNewMosque] = useState({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    radius: '500',
  });

  useEffect(() => {
    loadMosques();
  }, []);

  const loadMosques = async () => {
    try {
      const savedMosques = await AsyncStorage.getItem('mosques');
      if (savedMosques) {
        setMosques(JSON.parse(savedMosques));
      } else {
        // Default mosques
        const defaultMosques: Mosque[] = [
          {
            id: '1',
            name: 'Merkez Camii',
            address: 'Merkez Mahallesi, Ankara',
            latitude: 39.9334,
            longitude: 32.8597,
            radius: 500,
          },
          {
            id: '2',
            name: 'Büyük Camii',
            address: 'Ulus, Ankara',
            latitude: 39.9400,
            longitude: 32.8500,
            radius: 300,
          },
        ];
        setMosques(defaultMosques);
        await AsyncStorage.setItem('mosques', JSON.stringify(defaultMosques));
      }
    } catch (error) {
      console.error('Camiler yüklenirken hata oluştu:', error);
    }
  };

  const saveMosques = async (updatedMosques: Mosque[]) => {
    try {
      await AsyncStorage.setItem('mosques', JSON.stringify(updatedMosques));
      setMosques(updatedMosques);
    } catch (error) {
      console.error('Camiler kaydedilirken hata oluştu:', error);
    }
  };

  const addMosque = async () => {
    if (!newMosque.name || !newMosque.address) {
      Alert.alert('Hata', 'Cami adı ve adresi gereklidir.');
      return;
    }

    if (newMosque.latitude === 0 || newMosque.longitude === 0) {
      Alert.alert('Hata', 'Lütfen konum seçin veya mevcut konumunuzu kullanın.');
      return;
    }
    const mosque: Mosque = {
      id: Date.now().toString(),
      name: newMosque.name,
      address: newMosque.address,
      latitude: newMosque.latitude,
      longitude: newMosque.longitude,
      radius: parseInt(newMosque.radius) || 500,
    };

    const updatedMosques = [...mosques, mosque];
    await saveMosques(updatedMosques);
    setIsAddingMosque(false);
    setNewMosque({ name: '', address: '', latitude: 0, longitude: 0, radius: '500' });
    setSearchResults([]);
  };

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Hata', 'Konum izni gereklidir.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse geocoding to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const fullAddress = `${address.street || ''} ${address.district || ''} ${address.city || ''} ${address.country || ''}`.trim();
        
        setNewMosque({
          ...newMosque,
          address: fullAddress,
          latitude,
          longitude,
        });
      } else {
        setNewMosque({
          ...newMosque,
          latitude,
          longitude,
        });
      }
    } catch (error) {
      Alert.alert('Hata', 'Konum alınamadı. Lütfen tekrar deneyin.');
      console.error('Location error:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await Location.geocodeAsync(query);
      const searchResults = await Promise.all(
        results.slice(0, 5).map(async (result) => {
          try {
            const reverseGeocode = await Location.reverseGeocodeAsync({
              latitude: result.latitude,
              longitude: result.longitude,
            });
            
            const address = reverseGeocode[0];
            const fullAddress = address 
              ? `${address.street || ''} ${address.district || ''} ${address.city || ''} ${address.country || ''}`.trim()
              : query;
            
            return {
              ...result,
              displayAddress: fullAddress,
            };
          } catch {
            return {
              ...result,
              displayAddress: query,
            };
          }
        })
      );
      
      setSearchResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    setNewMosque({
      ...newMosque,
      address: result.displayAddress,
      latitude: result.latitude,
      longitude: result.longitude,
    });
    setSearchResults([]);
  };

  const startEditingMosque = (mosque: Mosque) => {
    setEditingMosque(mosque.id);
    setEditMosqueData({
      name: mosque.name,
      address: mosque.address,
      latitude: mosque.latitude,
      longitude: mosque.longitude,
      radius: mosque.radius.toString(),
    });
  };

  const updateMosque = async () => {
    if (!editMosqueData.name || !editMosqueData.address) {
      Alert.alert('Hata', 'Cami adı ve adresi gereklidir.');
      return;
    }

    if (editMosqueData.latitude === 0 || editMosqueData.longitude === 0) {
      Alert.alert('Hata', 'Lütfen konum seçin veya mevcut konumunuzu kullanın.');
      return;
    }

    const updatedMosques = mosques.map(mosque => 
      mosque.id === editingMosque 
        ? {
            ...mosque,
            name: editMosqueData.name,
            address: editMosqueData.address,
            latitude: editMosqueData.latitude,
            longitude: editMosqueData.longitude,
            radius: parseInt(editMosqueData.radius) || 500,
          }
        : mosque
    );

    await saveMosques(updatedMosques);
    setEditingMosque(null);
    setEditMosqueData({ name: '', address: '', latitude: 0, longitude: 0, radius: '500' });
    setEditSearchResults([]);
  };

  const cancelEditing = () => {
    setEditingMosque(null);
    setEditMosqueData({ name: '', address: '', latitude: 0, longitude: 0, radius: '500' });
    setEditSearchResults([]);
  };

  const getCurrentLocationForEdit = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Hata', 'Konum izni gereklidir.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse geocoding to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const fullAddress = `${address.street || ''} ${address.district || ''} ${address.city || ''} ${address.country || ''}`.trim();
        
        setEditMosqueData({
          ...editMosqueData,
          address: fullAddress,
          latitude,
          longitude,
        });
      } else {
        setEditMosqueData({
          ...editMosqueData,
          latitude,
          longitude,
        });
      }
    } catch (error) {
      Alert.alert('Hata', 'Konum alınamadı. Lütfen tekrar deneyin.');
      console.error('Location error:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const searchAddressForEdit = async (query: string) => {
    if (query.length < 3) {
      setEditSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await Location.geocodeAsync(query);
      const searchResults = await Promise.all(
        results.slice(0, 5).map(async (result) => {
          try {
            const reverseGeocode = await Location.reverseGeocodeAsync({
              latitude: result.latitude,
              longitude: result.longitude,
            });
            
            const address = reverseGeocode[0];
            const fullAddress = address 
              ? `${address.street || ''} ${address.district || ''} ${address.city || ''} ${address.country || ''}`.trim()
              : query;
            
            return {
              ...result,
              displayAddress: fullAddress,
            };
          } catch {
            return {
              ...result,
              displayAddress: query,
            };
          }
        })
      );
      
      setEditSearchResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setEditSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectEditSearchResult = (result: any) => {
    setEditMosqueData({
      ...editMosqueData,
      address: result.displayAddress,
      latitude: result.latitude,
      longitude: result.longitude,
    });
    setEditSearchResults([]);
  };

  const deleteMosque = async (id: string) => {
    Alert.alert(
      'Camiyi Sil',
      'Bu camiyi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const updatedMosques = mosques.filter(mosque => mosque.id !== id);
            await saveMosques(updatedMosques);
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
            <Text style={styles.title}>Cami Lokasyonları</Text>
            <Text style={styles.subtitle}>
              Otomatik sessize alma için cami lokasyonlarını yönetin
            </Text>
          </View>

          {/* Add Mosque Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAddingMosque(true)}
          >
            <Plus size={20} color="#1a4a32" />
            <Text style={styles.addButtonText}>Yeni Cami Ekle</Text>
          </TouchableOpacity>

          {/* Add Mosque Form */}
          {isAddingMosque && (
            <View style={styles.addMosqueForm}>
              <Text style={styles.formTitle}>Yeni Cami Ekle</Text>
              <TextInput
                style={styles.input}
                placeholder="Cami Adı"
                placeholderTextColor="#B8D4C6"
                value={newMosque.name}
                onChangeText={(text) => setNewMosque({ ...newMosque, name: text })}
              />
              
              {/* Address Search */}
              <View style={styles.addressSection}>
                <Text style={styles.sectionLabel}>Adres</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Adres ara... (örn: Kızılay Ankara)"
                  placeholderTextColor="#B8D4C6"
                  value={newMosque.address}
                  onChangeText={(text) => {
                    setNewMosque({ ...newMosque, address: text });
                    searchAddress(text);
                  }}
                />
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <View style={styles.searchResults}>
                    {searchResults.map((result, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.searchResultItem}
                        onPress={() => selectSearchResult(result)}
                      >
                        <MapPin size={16} color="#DAA520" />
                        <Text style={styles.searchResultText} numberOfLines={2}>
                          {result.displayAddress}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                
                {/* Current Location Button */}
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={getCurrentLocation}
                  disabled={isLoadingLocation}
                >
                  <Navigation size={16} color="#1a4a32" />
                  <Text style={styles.locationButtonText}>
                    {isLoadingLocation ? 'Konum alınıyor...' : 'Mevcut Konumumu Kullan'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Selected Location Display */}
              {(newMosque.latitude !== 0 && newMosque.longitude !== 0) && (
                <View style={styles.selectedLocation}>
                  <MapPin size={16} color="#4CAF50" />
                  <Text style={styles.selectedLocationText}>
                    Konum seçildi: {newMosque.latitude.toFixed(4)}, {newMosque.longitude.toFixed(4)}
                  </Text>
                </View>
              )}
              
              <TextInput
                style={styles.input}
                placeholder="Algılama Mesafesi (metre)"
                placeholderTextColor="#B8D4C6"
                value={newMosque.radius}
                onChangeText={(text) => setNewMosque({ ...newMosque, radius: text })}
                keyboardType="numeric"
              />
              
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.formButton, styles.cancelButton]}
                  onPress={() => {
                    setIsAddingMosque(false);
                    setNewMosque({ name: '', address: '', latitude: 0, longitude: 0, radius: '500' });
                    setSearchResults([]);
                  }}
                >
                  <X size={16} color="#FFFFFF" />
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.formButton, styles.saveButton]}
                  onPress={addMosque}
                >
                  <Save size={16} color="#1a4a32" />
                  <Text style={styles.saveButtonText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Mosques List */}
          <View style={styles.mosquesContainer}>
            <Text style={styles.sectionTitle}>Kayıtlı Camiler ({mosques.length})</Text>
            {mosques.map((mosque) => (
              <View key={mosque.id} style={styles.mosqueCard}>
               {editingMosque === mosque.id ? (
                 // Edit Form
                 <View>
                   <Text style={styles.formTitle}>Camiyi Düzenle</Text>
                   <TextInput
                     style={styles.input}
                     placeholder="Cami Adı"
                     placeholderTextColor="#B8D4C6"
                     value={editMosqueData.name}
                     onChangeText={(text) => setEditMosqueData({ ...editMosqueData, name: text })}
                   />
                   
                   {/* Address Search for Edit */}
                   <View style={styles.addressSection}>
                     <Text style={styles.sectionLabel}>Adres</Text>
                     <TextInput
                       style={styles.input}
                       placeholder="Adres ara... (örn: Kızılay Ankara)"
                       placeholderTextColor="#B8D4C6"
                       value={editMosqueData.address}
                       onChangeText={(text) => {
                         setEditMosqueData({ ...editMosqueData, address: text });
                         searchAddressForEdit(text);
                       }}
                     />
                     
                     {/* Edit Search Results */}
                     {editSearchResults.length > 0 && (
                       <View style={styles.searchResults}>
                         {editSearchResults.map((result, index) => (
                           <TouchableOpacity
                             key={index}
                             style={styles.searchResultItem}
                             onPress={() => selectEditSearchResult(result)}
                           >
                             <MapPin size={16} color="#DAA520" />
                             <Text style={styles.searchResultText} numberOfLines={2}>
                               {result.displayAddress}
                             </Text>
                           </TouchableOpacity>
                         ))}
                       </View>
                     )}
                     
                     {/* Current Location Button for Edit */}
                     <TouchableOpacity
                       style={styles.locationButton}
                       onPress={getCurrentLocationForEdit}
                       disabled={isLoadingLocation}
                     >
                       <Navigation size={16} color="#1a4a32" />
                       <Text style={styles.locationButtonText}>
                         {isLoadingLocation ? 'Konum alınıyor...' : 'Mevcut Konumumu Kullan'}
                       </Text>
                     </TouchableOpacity>
                   </View>
                   
                   {/* Selected Location Display for Edit */}
                   {(editMosqueData.latitude !== 0 && editMosqueData.longitude !== 0) && (
                     <View style={styles.selectedLocation}>
                       <MapPin size={16} color="#4CAF50" />
                       <Text style={styles.selectedLocationText}>
                         Konum seçildi: {editMosqueData.latitude.toFixed(4)}, {editMosqueData.longitude.toFixed(4)}
                       </Text>
                     </View>
                   )}
                   
                   <TextInput
                     style={styles.input}
                     placeholder="Algılama Mesafesi (metre)"
                     placeholderTextColor="#B8D4C6"
                     value={editMosqueData.radius}
                     onChangeText={(text) => setEditMosqueData({ ...editMosqueData, radius: text })}
                     keyboardType="numeric"
                   />
                   
                   <View style={styles.formButtons}>
                     <TouchableOpacity
                       style={[styles.formButton, styles.cancelButton]}
                       onPress={cancelEditing}
                     >
                       <X size={16} color="#FFFFFF" />
                       <Text style={styles.cancelButtonText}>İptal</Text>
                     </TouchableOpacity>
                     <TouchableOpacity
                       style={[styles.formButton, styles.saveButton]}
                       onPress={updateMosque}
                     >
                       <Save size={16} color="#1a4a32" />
                       <Text style={styles.saveButtonText}>Güncelle</Text>
                     </TouchableOpacity>
                   </View>
                 </View>
               ) : (
                 // Display Mode
                 <View>
                   <View style={styles.mosqueHeader}>
                     <MapPin size={20} color="#DAA520" />
                     <Text style={styles.mosqueName}>{mosque.name}</Text>
                   </View>
                   <Text style={styles.mosqueAddress}>{mosque.address}</Text>
                   <View style={styles.mosqueDetails}>
                     <Text style={styles.mosqueDetail}>
                       Mesafe: {mosque.radius}m
                     </Text>
                     <Text style={styles.mosqueDetail}>
                       Konum: {mosque.latitude.toFixed(4)}, {mosque.longitude.toFixed(4)}
                     </Text>
                   </View>
                   <View style={styles.mosqueActions}>
                     <TouchableOpacity
                       style={styles.actionButton}
                       onPress={() => startEditingMosque(mosque)}
                     >
                       <Edit size={16} color="#4CAF50" />
                     </TouchableOpacity>
                     <TouchableOpacity
                       style={styles.actionButton}
                       onPress={() => deleteMosque(mosque.id)}
                     >
                       <Trash2 size={16} color="#FF6B6B" />
                     </TouchableOpacity>
                   </View>
                 </View>
               )}
              </View>
            ))}
          </View>

          {/* Usage Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Nasıl Çalışır?</Text>
            <Text style={styles.infoText}>
              • Camiye belirlediğiniz mesafede yaklaştığınızda telefonunuz otomatik olarak sessize alınır
            </Text>
            <Text style={styles.infoText}>
              • Cuma namazı vakti özel olarak kontrol edilir
            </Text>
            <Text style={styles.infoText}>
              • Camiden uzaklaştığınızda ses modu normal duruma döner
            </Text>
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
  addButton: {
    backgroundColor: '#DAA520',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a4a32',
  },
  addMosqueForm: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  saveButton: {
    backgroundColor: '#DAA520',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1a4a32',
  },
  addressSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  searchResults: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  searchResultText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    flex: 1,
  },
  locationButton: {
    backgroundColor: '#DAA520',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  locationButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1a4a32',
  },
  selectedLocation: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  selectedLocationText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#4CAF50',
    flex: 1,
  },
  mosquesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  mosqueCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  mosqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  mosqueName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    flex: 1,
  },
  mosqueAddress: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#B8D4C6',
    marginBottom: 12,
  },
  mosqueDetails: {
    marginBottom: 12,
  },
  mosqueDetail: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9E9E9E',
    marginBottom: 4,
  },
  mosqueActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoCard: {
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
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
});