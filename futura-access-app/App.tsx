
import React from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// STATE
import { GlobalStateProvider } from './components/state';

// COMPONENTS
import Events from './components/Events';
import FuturaAccess from './FuturaAccess';
import Login from './components/Login';
import Scanner from './components/Scanner';

// INTERFACES
import {RootParamList} from './components/shared/interfaces';

const Stack = createNativeStackNavigator();


export default function App() {

  const navigationRef = useNavigationContainerRef<RootParamList>();

  return (
    <GlobalStateProvider>
      <NavigationContainer ref={navigationRef}>
        <FuturaAccess navigatorRef={navigationRef}>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            {/* <Stack.Screen name="Events" component={Events} /> */}
            <Stack.Screen name="Scanner" component={Scanner} />
          </Stack.Navigator>
        </FuturaAccess>
      </NavigationContainer>
    </GlobalStateProvider>
  );

}
