import { useEffect } from 'react';
import { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// STATE
import { useGlobalState } from './components/state';

// SERVICES
import { checkExpiration } from './components/shared/services';

// INTERFACES
import { RootParamList } from './components/shared/interfaces';

export default function FuturaTickets({ children, navigatorRef }: { children: React.ReactNode, navigatorRef: NavigationContainerRefWithCurrent<RootParamList> }) {

    const [state, dispatch] = useGlobalState();

    const navigateTo = (route: any): void => {
        navigatorRef.current?.navigate(route);
    };
    
    const initAccount = async (): Promise<void> => {

        const token = await AsyncStorage.getItem('@token');
        
        if (token) {
          try {
    
            const decodedToken = await checkExpiration();

            if (!decodedToken || !decodedToken.account) {
                await AsyncStorage.removeItem('@token');
                navigateTo('Login');
                return;
            }

            dispatch({ isConnected: true, account: decodedToken });
            navigateTo('Scanner');
    
          } catch (error) {
            dispatch({ isConnected: false, account: undefined });
            navigateTo('Login');
          }
        } else {
          dispatch({ isConnected: false, account: undefined });
          navigateTo('Login');
        }
      };

    useEffect(() => {
        initAccount();
      }, []);

    return children;
}