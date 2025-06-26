import React, { useEffect, useState } from 'react';
import {View,Text,TouchableOpacity,ScrollView,Switch,StyleSheet,Alert,Modal,Image,Platform,TextInput,} from 'react-native';
import { getAuth, signOut, deleteUser } from 'firebase/auth';
import { getDatabase, ref, onValue, set, remove } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import DefaultRoomImage from '../assets/images/lab.jpg';

export default function DashboardCombinedScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('home');
  const [rooms, setRooms] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [renameModal, setRenameModal] = useState(false);
  const [renameKey, setRenameKey] = useState('');
  const [newName, setNewName] = useState('');
  const auth = getAuth();
  const db = getDatabase();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const roomsRef = ref(db, `devices/${user.uid}`);
    onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedRooms = Object.entries(data).map(([key, value]) => ({
          name: key,
          ...value,
        }));
        setRooms(loadedRooms);
      }
    });
  }, []);

  const toggleSwitch = async (roomName, status) => {
    try {
      await set(ref(db, `devices/${user.uid}/${roomName}/fan`), status);
      await set(ref(db, `devices/${user.uid}/${roomName}/light`), status);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRenamePrompt = (roomKey) => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Rename Room',
        'Enter a new name:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: async (text) => {
              if (text.trim()) {
                await set(ref(db, `devices/${user.uid}/${roomKey}/customName`), text.trim());
              }
            },
          },
        ],
        'plain-text'
      );
    } else {
      // Android fallback
      setRenameKey(roomKey);
      setNewName('');
      setRenameModal(true);
    }
  };

  const handleSaveRename = async () => {
    if (newName.trim()) {
      await set(ref(db, `devices/${user.uid}/${renameKey}/customName`), newName.trim());
      setRenameModal(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (user) {
                await set(ref(db, `ml-control/${user.uid}/shutdown`), true);
                await remove(ref(db, `devices/${user.uid}`));
                await deleteUser(user);
                Alert.alert('Account Deleted', 'Your account and device data have been deleted.');
                navigation.replace('Signup');
              }
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => navigation.replace('Signup'))
      .catch((error) => Alert.alert('Sign Out Error', error.message));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="settings-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.scheduleBox}>
        <Text style={styles.scheduleTitle}>Today's Schedule</Text>
        <Text style={styles.scheduleContent}>No upcoming schedules</Text>
      </View>

      <View style={styles.tabToggle}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'home' && styles.activeTab]}
          onPress={() => setSelectedTab('home')}
        >
          <Text style={[styles.tabText, selectedTab === 'home' && styles.activeTabText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'commercial' && styles.activeTab]}
          onPress={() => setSelectedTab('commercial')}
        >
          <Text style={[styles.tabText, selectedTab === 'commercial' && styles.activeTabText]}>Commercial</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.roomGrid}>
        {rooms
          .filter((room) => (selectedTab === 'commercial' ? room.isCommercial : !room.isCommercial))
          .map((room, idx) => (
            <View key={idx} style={styles.roomCardBox}>
              <Image source={DefaultRoomImage} style={styles.roomImage} />
              <View style={styles.roomFooter}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.roomNameText}>
                      {room.customName ? room.customName : 'Room'}
                    </Text>
                    <TouchableOpacity onPress={() => handleRenamePrompt(room.name)}>
                      <Ionicons name="pencil" size={16} color="#333" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.deviceKeyText}>{room.name}</Text>
                </View>
                <Switch
                  value={room.fan === 'ON' && room.light === 'ON'}
                  onValueChange={(val) => toggleSwitch(room.name, val ? 'ON' : 'OFF')}
                  trackColor={{ false: '#ccc', true: '#D48D8D' }} 
                  thumbColor={room.fan === 'ON' && room.light === 'ON' ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          ))}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalBackground} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={handleSignOut} style={styles.modalButton}>
              <Text style={styles.modalText}>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteAccount} style={styles.modalButton}>
              <Text style={styles.modalText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Rename Modal (for Android) */}
      <Modal visible={renameModal} transparent animationType="fade">
        <View style={styles.renameModalBackground}>
          <View style={styles.renameModalContent}>
            <Text style={styles.renameTitle}>Rename Room</Text>
            <TextInput
              placeholder="Enter new name"
              value={newName}
              onChangeText={setNewName}
              style={styles.renameInput}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <TouchableOpacity onPress={() => setRenameModal(false)} style={styles.renameButton}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveRename} style={styles.renameButton}>
                <Text>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scheduleBox: {
    backgroundColor: '#f4c2c2',
    borderRadius: 12,
    padding: 16,
    marginTop: 19,
  },
  scheduleTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  scheduleContent: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: '#ddd',
    borderRadius: 20,
    marginTop: 20,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    color: '#555',
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  roomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  roomCardBox: {
    width: '48%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    marginBottom: 16,
    elevation: 3,
  },
  roomImage: {
    width: '100%',
    height: 130,
    resizeMode: 'cover',
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F1F3',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  roomNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deviceKeyText: {
    fontSize: 12,
    color: '#777',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 70,
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    width: 200,
  },
  modalButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
  },
  renameModalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  renameModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    width: '80%',
    borderRadius: 10,
  },
  renameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  renameInput: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 10,
  },
  renameButton: {
    padding: 10,
  },
});
