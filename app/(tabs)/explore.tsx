import React from 'react';
import { View, StyleSheet, Image, Platform, Text, TouchableOpacity, Linking } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';



export default function TabTwoScreen() {
  const call1990 = () => {
    Linking.openURL('tel:1990');
  };
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Instructions for Emergency Situations</Text>

      </View>
      <View style={styles.inforContainer}>
        <Text style={styles.inforText}>1️⃣  In case of emergency, please call 1990 immediately.</Text>
        <Text style={styles.inforText}>2️⃣  Keep the Person Calm & Sitting Down</Text>
        <Text style={styles.inforText}>3️⃣  Give Aspirin (If Available & No Allergy)</Text>
        <Text style={styles.inforText}>4️⃣  If They Have Nitroglycerin, Use It</Text>
        <Text style={styles.inforText}>5️⃣  Perform CPR if the Person Becomes Unconscious</Text>
        <Text style={styles.inforText}>6️⃣  Stay with Them Until Help Arrives</Text>
        <View style={{justifyContent: 'center', marginTop: 16, alignItems: 'center'}}>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => call1990()}
          >
            <Text style={styles.checkButtonText}>📞 Call 1990</Text>
          </TouchableOpacity>
        </View>
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
  inforContainer: {
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
    backgroundColor: '#E8F9FF',
  },
  inforText: {
    padding: 5,
    fontSize: 15,
    color: '#004D40',
    textAlign: 'left',
    marginTop: 8,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00796B',
    textAlign: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#E8F9FF',

  },
  callButton: {
    backgroundColor: '#00796B',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});