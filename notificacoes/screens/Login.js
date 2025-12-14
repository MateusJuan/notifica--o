import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../supabase';
import { registerForPushNotificationsAsync } from '../notificationService';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) throw error;

      // 🔔 TOKEN SOMENTE APÓS LOGIN
      const token = await registerForPushNotificationsAsync();

      if (token) {
        const { data: { user } } = await supabase.auth.getUser();

        await supabase
          .from('profiles')
          .update({ token_dispositivo: token })
          .eq('user_id', user.id);
      }

      navigation.replace('Home');

    } catch (err) {
      Alert.alert('Erro no login', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>Login</Text>

      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput placeholder="Senha" secureTextEntry onChangeText={setSenha} />

      <Button
        title={loading ? 'Entrando...' : 'Entrar'}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
};

export default Login;