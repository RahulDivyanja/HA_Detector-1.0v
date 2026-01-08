import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { io } from 'socket.io-client';
import { registerForPushNotificationsAsync } from '@/lib/PushNotification';
import * as Notifications from 'expo-notifications';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Circle } from 'react-native-svg';
import moment from 'moment';
import { removeValue, storeData } from '@/lib/Storage';
// Get the current month
var date = moment()
  .utcOffset('+05:30')
  .format('MMM DD');
console.log(date);
//Notification Handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,

  }),
});
export default function HomeScreen() {
  const [showReport, setShowReport] = useState(false);
  const [pulseRate, setPulseRate] = useState<number>(0);
  const [o2Level, setO2Level] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'https://ha-detector-backend-production.up.railway.app';

  useEffect(() => {
    // Connect to the Socket.IO server
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected to the server');
      setLoading(false);
    });

    socket.on('data', (data) => {
      console.log('Data received:', data);
      setPulseRate(data.pulseRate ? data.pulseRate : 0);
      setO2Level(data.oxygenLevel);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from the server');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Unable to connect to the server. Please try again.');
      setLoading(false);
    });

    // Cleanup the socket connection
    return () => {
      socket.disconnect();
    };
  }, []);



  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token ?? ''))
      .catch((error: any) => setExpoPushToken(`${error}`));

    notificationListener.current = Notifications.addNotificationReceivedListener(async (notification) => {
      setNotification(notification);
      console.log(notification)
      await storeData(notification, "notification");
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);

    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Save push token to backend when it's available
  useEffect(() => {
    if (expoPushToken && !expoPushToken.startsWith('Error')) {
      fetch('https://ha-detector-backend-production.up.railway.app/api/save-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expoPushToken }),
      })
        .then(response => response.json())
        .then(data => console.log('Token saved successfully:', data))
        .catch(error => console.error('Error saving token:', error));
    }
  }, [expoPushToken]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#00796B" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainCard}>
        <Text style={styles.cardTitle}>Check your Health</Text>
        <Text style={styles.cardSubtitle}>
          We provide best quality medical services without further cost
        </Text>
      </View>
      <View style={styles.reportSection}>

        <View style={[styles.reportCard, styles.pulseCard]}>
          <Text style={styles.reportTitle}>Pulse Rate</Text>
          <AnimatedCircularProgress
            size={120}
            width={8}
            backgroundWidth={5}
            fill={Number(pulseRate) || 0} // 
            tintColor={((Number(pulseRate) >= 100) || (Number(pulseRate) <= 60)) ? "#a61919" : "#ffb7bc"}
            backgroundColor={"#3d5875"}
            arcSweepAngle={240}
            rotation={240}
            lineCap="round"
            duration={2000}

          >
            {
              (fill) => (
                <Text style={[styles.reportText, { color: ((Number(pulseRate) >= 100) || (Number(pulseRate) <= 60)) ? '#a61919' : '#000000' }]}>
                  {pulseRate ? `${pulseRate} bpm` : 'N/A'}
                </Text>
              )
            }
          </AnimatedCircularProgress>
        </View>
        <View style={[styles.reportCard, styles.oxygenCard]}>
          <Text style={styles.reportTitle}>O₂ level</Text>
          <AnimatedCircularProgress
            size={120}
            width={8}
            backgroundWidth={5}
            fill={Number(o2Level) || 0} // ✅ Convert to number
            tintColor={
              (Number(o2Level) >= 95 && Number(o2Level) <= 100) ? "#50ff20" :
                (Number(o2Level) >= 90 && Number(o2Level) < 95) ? "#ffa500" :
                  (Number(o2Level) >= 85 && Number(o2Level) < 90) ? "#ff4500" :
                    (Number(o2Level) < 85) ? "#a61919" :
                      "#ffffff"
            }
            backgroundColor={"#3d5875"}
            arcSweepAngle={240}
            rotation={240}
            lineCap="round"
            duration={2000}
          >
            {
              (fill) => (
                <Text style={[styles.reportText, {
                  color: (Number(o2Level) >= 95) ? '#50ff20' :
                    (Number(o2Level) >= 90 && Number(o2Level) < 95) ? '#ffa500' :
                      (Number(o2Level) >= 85 && Number(o2Level) < 90) ? '#ff4500' :
                        (Number(o2Level) < 85) ? '#a61919' :
                          '#000000'
                }]}>
                  {o2Level ? `${o2Level} SaO₂` : 'N/A'}
                </Text>
              )
            }
            
          </AnimatedCircularProgress>
        </View>
      </View>
      <View style={styles.todayReport}>
        <Text style={styles.dateText}>{date}</Text>
        <TouchableOpacity
          style={styles.checkButton}
          onPress={() => setShowReport(prevState => !prevState)}

        >
          <Text style={styles.checkButtonText}>Check Now</Text>
        </TouchableOpacity>
      </View>
      {showReport && (
        <View style={styles.todayReportPrint}>
          <Text style={styles.printTitle}>{date} Report</Text>
          <Text style={styles.printSub}>Pulse Rate: <Text style={{ fontWeight: 'bold' }}>{pulseRate || 'N/A'} bpm</Text></Text>
          <Text style={styles.printSub}>O₂ level: <Text style={{ fontWeight: 'bold' }}>{o2Level || 'N/A'} SaO₂</Text> </Text>
        </View>
      )}
      <View style={styles.footer}>
        {/* <Text style={styles.footerItem}>Home</Text>
        <Text style={styles.footerItem}>Report</Text>
        <Text style={styles.footerItem}>History</Text> */}
      </View>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
  },
  header: {
    marginTop: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  greetingText: {
    fontSize: 18,
    color: '#333333',
  },
  usernameText: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  mainCard: {
    backgroundColor: '#E0F7FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00796B',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#004D40',
    textAlign: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reportSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  reportCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  pulseCard: {
    backgroundColor: '#ffffff',
  },
  oxygenCard: {
    backgroundColor: '#ffffff',
    alignSelf: 'center',
  },
  reportTitle: {
    fontSize: 14,
    color: '#333333',
  },
  reportValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 8,
  },
  reportText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  todayReport: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  todayReportPrint: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  checkButton: {
    backgroundColor: '#29B6F6',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 12,
  },
  checkButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  printTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  printSub: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#EEEEEE',
  },
  footerItem: {
    fontSize: 16,
    color: '#757575',
  },
});