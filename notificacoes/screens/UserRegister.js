import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../supabase';

const UserRegister = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!nome || !email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
      });

      if (error) throw error;

      const user = data.user;

      if (!user) {
        Alert.alert(
          'Confirmação',
          'Verifique seu email para confirmar a conta.'
        );
        return;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          nome,
          token_dispositivo: null,
        });

      if (profileError) throw profileError;

      Alert.alert('Sucesso', 'Usuário criado com sucesso!');
      navigation.goBack();

    } catch (err) {
      console.error(err);
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Novo Usuário</Text>

      <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />

      <Button title={loading ? 'Criando...' : 'Cadastrar'} onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 15, padding: 10, borderRadius: 5 }
});

export default UserRegister;
