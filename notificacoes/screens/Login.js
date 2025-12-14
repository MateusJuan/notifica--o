import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button, Alert } from 'react-native';
import { supabase } from '../supabase'; 
import { registerForPushNotificationsAsync } from '../notificationService';

const Login = ({ navigation }) => {

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !senha) {
            Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
            return;
        }

        setLoading(true);

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: email,
                password: senha,
            });

            if (signInError) {
                throw signInError; 
            }
            
            const token = await registerForPushNotificationsAsync();
            const { data: { user } } = await supabase.auth.getUser();

            if (token && user) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ token_dispositivo: token })
                    .eq('user_id', user.id);

                if (updateError) {
                    console.error("Erro ao atualizar token:", updateError);
                }
            }
            
            navigation.navigate('Home'); 
            
        } catch (error) {
            console.error('Erro no Login:', error.message);
            Alert.alert('Erro no Login', 'Usuário ou senha inválidos.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleRegister = () => {
       navigation.navigate('Usuário'); 
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            
            <TextInput 
                style={styles.input} 
                placeholder="Email"
                value={email} 
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
                editable={!loading}
            />
            
            <TextInput 
                style={styles.input} 
                placeholder="Senha"
                value={senha} 
                onChangeText={setSenha} 
                secureTextEntry
                editable={!loading}
            />
            
            <Button 
                title={loading ? 'Entrando...' : 'Login'} 
                onPress={handleLogin}
                disabled={loading}
            />
            
            <View style={{ height: 20 }} /> 
            
            <Button 
                title={'Cadastre-se'} 
                onPress={handleRegister}
                disabled={loading}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        marginBottom: 30,
        fontWeight: 'bold',
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        width: '100%',
        maxWidth: 300,
        height: 50,
        paddingHorizontal: 15,
        marginBottom: 15,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
});

export default Login;