
import { useState } from 'react';
import { Image, View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { NavigationProp } from "@react-navigation/native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobalState } from '../state';
import { loginAccount } from '../shared/services';
import { LoginAccount } from '../shared/interfaces';

export interface LoginState {
  [key: string]: string;
};

export default function Login({ navigation }: { navigation: NavigationProp<any, any> }) {

  const [state, dispatch] = useGlobalState();
  const [loginFormState, setLoginFormState] = useState<LoginState>({ email: '', password: '' });
  const [loadingState, setLoadingState] = useState<boolean>(false);

  const setProfileFormField = (key: string, value: any): void => {
    setLoginFormState({ ...loginFormState, [key]: value });
  };

  const storeUserData = async (token: string, email: string, role: string): Promise<void> => {
    try {
        await AsyncStorage.setItem('@token', token);
        await AsyncStorage.setItem('@userId', email);
        await AsyncStorage.setItem('@userId', role);
    } catch (error) {
        console.log(error);
    }
  };

  const login = async () => {

    setLoadingState(true);

    const account: LoginAccount = {
      email: loginFormState.email,
      password: loginFormState.password
    };

    const loggedInAccount = await loginAccount(account);
    
    if (loggedInAccount) {

        await storeUserData(
          loggedInAccount.token!,
          loggedInAccount.email,
          loggedInAccount.role as string
        );

        dispatch({
            connected: true,
            account: loggedInAccount.email,
            token: loggedInAccount.token,
            role: loggedInAccount.role,
        });
        
        navigation.navigate('Scanner');

    }

    setLoadingState(false);

};

  return (
    <View style={styles.formContainer}>
      <View style={styles.formContent}>
        <View>
          <Text style={styles.title}>Access Control</Text>
        </View>
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder={'Email'}
                autoCapitalize='none'
                placeholderTextColor={'#333'}
                onChangeText={(value) => setProfileFormField('email', value)}
            />
        </View>
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder={'Password'}
                autoCapitalize='none'
                secureTextEntry={true}
                placeholderTextColor={'#333'}
                onChangeText={(value) => setProfileFormField('password', value)}
            />
        </View>
        <View style={styles.buttonInputContainer}>
            <TouchableOpacity onPress={() => login()}>
                <Text style={styles.button}>Log In</Text>
            </TouchableOpacity>
        </View>
      </View>
      <View style={{height: 100}}>
        <Image style={styles.image} source={require('../../assets/futura-tickets.png')}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    justifyContent: "center",
    width: 107,
    height: 35,
    marginTop: 30
  },
  formContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  formContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 50
  },
  title: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 30,
    fontStyle: 'italic'
  },
  inputContainer: {
    height: 45,
    width: '90%',
    marginBottom: 10,
    justifyContent: 'center',
    backgroundColor: '#ffffff33',
    
  },
  buttonInputContainer: {
    height: 45,
    width: '90%',
    marginBottom: 10,
    justifyContent: 'center',
    backgroundColor: '#ffffff66'
  },
  input: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'center',
    color: '#333',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e4e4e4',
    borderRadius: 8
  },
  button: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 12,
    paddingBottom: 12,
    textAlign: 'center',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#e4e4e4',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    backgroundColor: '#00948a',
    borderRadius: 8
  },
  registerContainer: {
    flexDirection: "row",
    width: '90%'
  },
  registerSentence: {
    color: '#fff',
    fontSize: 16,
  },
});
