import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes';
import { api } from '../services/api';
import Toast from 'react-native-toast-message';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigation = useNavigation<NavigationProp>();

  const handleRegister = async () => {
    const digits = cpf.replace(/\D/g, '');
    const validCpf = digits.length === 11 && !/^([0-9])\1+$/.test(digits) && [9, 10].every((position) => {
      const sum = digits.slice(0, position).split('').reduce((total, digit, index) => total + Number(digit) * (position + 1 - index), 0);
      return (sum * 10) % 11 % 10 === Number(digits[position]);
    });
    if (!name || !email.includes('@') || !cpf || !phone || !address || password.length < 8 || password !== confirmPassword || !validCpf) {
      Toast.show({ type: 'error', text1: 'Cadastro inválido', text2: 'Confira nome, e-mail, CPF, senha e endereço.' });
      return;
    }
    try {
      await api.post('users', { name, email, cpf, phone, address, password });
      Toast.show({ type: 'success', text1: 'Conta criada', text2: 'Agora faça login.' });
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Erro no cadastro', text2: error.response?.data?.message || 'Não foi possível criar a conta.' });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Text style={{ fontSize: 24 }}>🛒</Text>
        </View>
        <Text style={styles.brandTitle}>CodeWear</Text>
        <Text style={styles.brandSubtitle}>Cadastre-se</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Cadastro</Text>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>👤 Nome Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              placeholderTextColor="#555"
              value={name}
              onChangeText={setName}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>✉ E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="exemplo@email.com"
              placeholderTextColor="#555"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>💳 CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              placeholderTextColor="#555"
              value={cpf}
              onChangeText={setCpf}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>📞 Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor="#555"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>📍 Endereço</Text>
          <TextInput
            style={styles.input}
            placeholder="Rua, número, bairro e cidade"
            placeholderTextColor="#555"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>🔒 Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor="#555"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>🔒 Confirmar Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Repita sua senha"
            placeholderTextColor="#555"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister}>
          <Text style={styles.btnPrimaryText}>Criar Conta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backLinkText}>← Já tenho conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboard: { flex: 1 },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBox: {
    backgroundColor: '#FFCC00',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#FFCC00',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#161616',
    width: '100%',
    maxWidth: 500,
    borderRadius: 12,
    padding: 28,
    borderWidth: 1,
    borderColor: '#222',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    color: '#888',
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFF',
    fontSize: 13,
  },
  btnPrimary: {
    backgroundColor: '#FFCC00',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  btnPrimaryText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  backLinkText: {
    color: '#888',
    fontSize: 14,
  },
});