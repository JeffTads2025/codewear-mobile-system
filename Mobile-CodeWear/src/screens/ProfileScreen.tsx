import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { api, getApiAssetUrl } from '../services/api';

interface ProfileData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address: string;
  avatarUrl?: string;
}

export function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileData>({ name: '', email: '', cpf: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    api.get('me').then(({ data }) => setProfile(data)).catch(() => Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível carregar seu perfil.' }));
  }, []);

  const updateField = (field: string, value: string) => setProfile((current) => ({ ...current, [field]: value }));
  const chooseAvatar = async () => {
    const [cameraPermission, mediaLibraryPermission] = await Promise.all([
      ImagePicker.requestCameraPermissionsAsync(),
      ImagePicker.requestMediaLibraryPermissionsAsync(),
    ]);
    if (!cameraPermission.granted || !mediaLibraryPermission.granted) {
      Toast.show({ type: 'error', text1: 'Permissões necessárias', text2: 'Permita o acesso à câmera e à galeria para alterar a foto.' });
      return;
    }
    const choice = await new Promise<'camera' | 'gallery' | null>((resolve) => Alert.alert('Foto do perfil', 'Escolha uma origem', [
      { text: 'Câmera', onPress: () => resolve('camera') },
      { text: 'Galeria', onPress: () => resolve('gallery') },
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
    ]));
    if (!choice) return;
    const result = choice === 'camera'
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled) return;
    try {
      setUploading(true);
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('avatar', { uri: asset.uri, name: 'avatar.jpg', type: 'image/jpeg' } as any);
      const { data } = await api.post('users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile((current) => ({ ...current, avatarUrl: data.avatarUrl }));
      Toast.show({ type: 'success', text1: 'Foto atualizada' });
    } catch (error: any) { Toast.show({ type: 'error', text1: 'Erro', text2: error.response?.data?.message || 'Não foi possível enviar a foto.' }); }
    finally { setUploading(false); }
  };
  const save = async () => {
    try {
      setLoading(true);
      await api.put('users/profile', { name: profile.name, phone: profile.phone, address: profile.address, cpf: profile.cpf });
      Toast.show({ type: 'success', text1: 'Perfil atualizado' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Erro', text2: error.response?.data?.message || 'Não foi possível salvar.' });
    } finally { setLoading(false); }
  };

  return <ScrollView contentContainerStyle={styles.container}>
    <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Voltar</Text></TouchableOpacity>
    <Text style={styles.title}>Meu perfil</Text>
    <TouchableOpacity style={styles.avatarButton} onPress={chooseAvatar} disabled={uploading}>
      {profile.avatarUrl ? <Image source={{ uri: getApiAssetUrl(profile.avatarUrl) }} style={styles.avatar} resizeMode="cover" /> : <View style={styles.avatarFallback}><Text style={styles.avatarLetter}>{profile.name?.charAt(0)?.toUpperCase() || '?'}</Text></View>}
      <Text style={styles.avatarAction}>{uploading ? 'Enviando...' : 'Alterar foto'}</Text>
    </TouchableOpacity>
    {(['name', 'email', 'cpf', 'phone', 'address'] as const).map((field) => <View key={field}>
      <Text style={styles.label}>{({ name: 'Nome', email: 'E-mail', cpf: 'CPF', phone: 'Telefone', address: 'Endereço' } as any)[field]}</Text>
      <TextInput style={styles.input} value={profile[field] || ''} onChangeText={(value) => updateField(field, value)} editable={field !== 'email'} multiline={field === 'address'} />
    </View>)}
    <TouchableOpacity style={styles.button} onPress={save} disabled={loading}><Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar alterações'}</Text></TouchableOpacity>
  </ScrollView>;
}

const styles = StyleSheet.create({ container: { flexGrow: 1, backgroundColor: '#0d0d0d', padding: 20 }, back: { color: '#ffcc00', marginBottom: 18 }, title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }, avatarButton: { alignItems: 'center', marginBottom: 10 }, avatar: { width: 96, height: 96, borderRadius: 48 }, avatarFallback: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#ffcc00', alignItems: 'center', justifyContent: 'center' }, avatarLetter: { color: '#000', fontSize: 32, fontWeight: 'bold' }, avatarAction: { color: '#ffcc00', marginTop: 8 }, photoActions: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 8 }, label: { color: '#aaa', marginTop: 12, marginBottom: 5 }, input: { color: '#fff', backgroundColor: '#171717', borderColor: '#333', borderWidth: 1, borderRadius: 6, padding: 12 }, button: { backgroundColor: '#ffcc00', padding: 14, alignItems: 'center', borderRadius: 6, marginTop: 22 }, buttonText: { color: '#000', fontWeight: 'bold' } });
