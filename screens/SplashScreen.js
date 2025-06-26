// SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setTimeout(() => {
        if (user) {
          navigation.replace("Dashboard");
        } else {
          navigation.replace("Signup");
        }
      }, 3000); // Wait for 3 seconds
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('C:/Users/kisho/OneDrive/Desktop/ss/smart-switch-mobile/assets/images/logo.png')}
        style={styles.logo}
      />
      <Text style={styles.text}>Smart Switch Smart Life</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    borderRadius: 36,
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  text: {
    fontSize: 24,
    color: '#D48D8D',
    fontWeight: 'bold',
  },
});
