
import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NavigationProp } from "@react-navigation/native";

// STATE
import { useGlobalState } from '../state';

// SERVICES
import { getEvents } from '../shared/services';

// INTERFACES
import { Event } from '../shared/interfaces';

export default function Events({ navigation }: { navigation: NavigationProp<any, any> }) {

  const [state, dispatch] = useGlobalState();

  const [eventsState, setEventsState] = useState<Event[]>([]);
  const [loading, setLoadingState] = useState<boolean>(false);
  const [error, setErrorState] = useState<boolean>(false);

  const setEvents = async (): Promise<void> => {
    try {
      
      setLoadingState(true);
  
      const events = await getEvents();
      setEventsState(events || []);
  
      setLoadingState(false);
    
    } catch (error) {
      setLoadingState(false);
      setErrorState(false);  
    }

  };
  
  const goToScanner = (event: string): void => {
    navigation.navigate('Scanner', { event });
  };

  useEffect(() => {
    !loading && setEvents();
  }, []);

  if (loading) {
    return (
      <View style={styles.eventsContainer}>
        <Text>loading</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.eventsContainer}>
        <Text>error</Text>
      </View>
    )
  }

  return (
    <SafeAreaView>
      <ScrollView style={styles.eventsScrollContainer}>
          <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Events</Text>
          </View>
          
            {eventsState?.map((event: Event, i: number) => {
              return <View style={styles.sectionTitle} key={i} ><Text onPress={() => goToScanner(event._id)}>{event.name}</Text></View>
            })}
          
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  eventsContainer: {

  },
  eventsVisible: {
      display: 'flex',
      flex: 1,
  },
  eventsInvisible: {
      display: 'none'
  },
  image: {
      flex: 1,
      justifyContent: "center",
      width: '100%',
  },
  eventsScrollContainer: {
      width: '100%',
      paddingBottom: 40
  },
  sectionTitleContainer: {
      alignItems: 'center',
      marginTop: 25,
      marginBottom: 10
  },
  sectionTitle: {
      color: '#333',
      fontSize: 32,
      fontWeight: 'bold',
      alignItems: 'center',
  },
  button: {
      height: 50,
      color: '#000',
      fontSize: 18,
      lineHeight: 50,
      paddingLeft: 12,
      paddingRight: 12,
      fontWeight: 'bold',
      textAlign: 'center',
      backgroundColor: '#fff',
  }
});
