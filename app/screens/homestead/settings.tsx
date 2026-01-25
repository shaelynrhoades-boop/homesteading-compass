import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppHealth } from '../../../context/app-health';
import { supabase } from '../../../lib/supabase';
import { useTheme } from '../../../context/theme';
import InfoButton from '../../../components/info-button';

const noteKeys = [
  'page-note:homestead:chore-list',
  'page-note:homestead:almanac',
  'page-note:homestead:weather',
  'page-note:homestead:log-book',
  'page-note:homestead:recipe-book',
  'page-note:homestead:quick-notes',
  'page-note:homestead:farm-stand',
  'page-note:homestead:emergency-plan',
  'page-note:homestead:maps',
  'page-note:waystation:trading-post',
  'page-note:waystation:homestead-map',
  'page-note:waystation:outpost',
  'page-note:waystation:front-porch-hub',
  'page-note:field-guide:garden',
  'page-note:field-guide:pantry',
  'page-note:field-guide:workshop',
  'page-note:field-guide:stockyard-harvest',
  'page-note:field-guide:barnyard',
  'page-note:field-guide:chickens',
  'page-note:field-guide:ducks',
  'page-note:field-guide:turkeys',
  'page-note:field-guide:quail',
  'page-note:field-guide:rabbits',
  'page-note:field-guide:goats',
  'page-note:field-guide:sheep',
  'page-note:field-guide:cows',
  'page-note:field-guide:pigs',
  'page-note:field-guide:horses',
  'page-note:field-guide:bees',
  'page-note:field-guide:livestock-guardians',
];

export default function SettingsScreen() {
  const [showBackup, setShowBackup] = useState(false);
  const [backupText, setBackupText] = useState('Preparing backup...');
  const [backupLoading, setBackupLoading] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteReasons, setDeleteReasons] = useState<string[]>([]);
  const [deleteNotes, setDeleteNotes] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const { health, loaded, refresh } = useAppHealth();
  const { darkMode, setDarkMode } = useTheme();
  const deleteReasonOptions = [
    'I no longer need the app',
    'I didn’t find the features useful',
    'The app was confusing or hard to use',
    'I experienced bugs or technical issues',
    'Missing features I was hoping for',
    'Too expensive / pricing didn’t fit my needs',
    'I’m using a different app or system',
    'Privacy or data concerns',
    'I was just testing the app',
    'Other (please explain below)',
  ];

  const dataKeys = [
    'homestead:data',
    'homestead:chore-list',
    'homestead:log-book',
    'draft:trading-post',
    'draft:outpost-profile',
    'draft:farm-stand',
    'draft:quick-notes',
    'draft:recipe-book',
  ];

  const resetNotes = () => {
    Alert.alert('Reset tips?', 'This will show all page tips again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(noteKeys);
          Alert.alert('Tips reset', 'Page tips will show again next time you open a screen.');
        },
      },
    ]);
  };

  const buildBackup = async () => {
    setBackupLoading(true);
    try {
      const entries = await AsyncStorage.multiGet(dataKeys);
      const backup: Record<string, unknown> = {};
      entries.forEach(([key, value]) => {
        if (!value) return;
        try {
          backup[key] = JSON.parse(value);
        } catch {
          backup[key] = value;
        }
      });
      setBackupText(JSON.stringify(backup, null, 2));
    } catch {
      setBackupText('Unable to load backup data.');
    } finally {
      setBackupLoading(false);
    }
  };

  const resetAllData = () => {
    Alert.alert('Reset all data?', 'This clears all local logs, drafts, and tips.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove([...dataKeys, ...noteKeys]);
          Alert.alert('Data cleared', 'All local data has been removed.');
        },
      },
    ]);
  };

  const signOut = () => {
    Alert.alert('Sign out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  const toggleDeleteReason = (reason: string) => {
    setDeleteReasons((prev) => (prev.includes(reason) ? prev.filter((item) => item !== reason) : [...prev, reason]));
  };

  const confirmDeleteAccount = async () => {
    if (deletingAccount) return;
    setDeletingAccount(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id ?? null;
      const email = userData?.user?.email ?? null;
      const summary = [
        'Account deletion request',
        deleteReasons.length ? `Reasons: ${deleteReasons.join(', ')}` : 'Reasons: none selected',
        deleteNotes.trim() ? `Notes: ${deleteNotes.trim()}` : 'Notes: none',
      ].join('\n');

      await supabase.from('support_messages').insert({
        user_id: userId,
        email,
        subject: 'Delete account request',
        message: summary,
        status: 'Received',
      });
    } catch {
      // Ignore messaging errors.
    }

    await supabase.auth.signOut();
    await AsyncStorage.multiRemove([...dataKeys, ...noteKeys]);
    setDeleteReasons([]);
    setDeleteNotes('');
    setShowDeleteAccount(false);
    setDeletingAccount(false);
    Alert.alert('Account deleted', 'Your account removal request has been submitted.');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F0E1' }} contentContainerStyle={{ padding: 20 }}>
      <View style={{ alignItems: 'flex-end', marginBottom: 6 }}>
        <InfoButton text="Adjust notifications, privacy, backups, and app health tools. Connects to: Account." />
      </View>
      <Text style={{ fontSize: 28, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
        Settings
      </Text>
      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 16 }}>
        Control notifications, privacy, and display preferences.
      </Text>
      <Pressable
        onPress={signOut}
        style={{
          backgroundColor: '#C46A4A',
          paddingVertical: 10,
          borderRadius: 10,
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Sign Out of Your Account</Text>
      </Pressable>
      <View
        style={{
          backgroundColor: '#FFF1D8',
          borderRadius: 16,
          padding: 14,
          borderWidth: 1.5,
          borderColor: '#D8C4A8',
          borderStyle: 'dashed',
        }}
      >
        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Preferences</Text>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
          Choose what you want to see and how you’re notified.
        </Text>
        <View
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 10,
            backgroundColor: '#FFF8EE',
            borderWidth: 1,
            borderColor: '#E2D4C1',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Dark mode</Text>
          <Pressable
            onPress={() => setDarkMode(!darkMode)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: darkMode ? '#4C7744' : '#C9B8A6',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>
              {darkMode ? 'On' : 'Off'}
            </Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={resetNotes}
        style={{
          backgroundColor: '#8B5E3C',
          paddingVertical: 10,
          borderRadius: 10,
          alignItems: 'center',
          marginTop: 16,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Reset Page Tips</Text>
      </Pressable>

      <Pressable
        onPress={() => setShowDeleteAccount(true)}
        style={{
          backgroundColor: '#B85C5C',
          paddingVertical: 10,
          borderRadius: 10,
          alignItems: 'center',
          marginTop: 14,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Delete Account</Text>
      </Pressable>


      <View
        style={{
          backgroundColor: '#FFF1D8',
          borderRadius: 16,
          padding: 14,
          borderWidth: 1.5,
          borderColor: '#D8C4A8',
          borderStyle: 'dashed',
          marginTop: 18,
        }}
      >
        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Data</Text>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
          Backup or reset local data before cloud sync is enabled.
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <Pressable
            onPress={() => {
              setShowBackup(true);
              void buildBackup();
            }}
            style={{
              flex: 1,
              backgroundColor: '#8B5E3C',
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>View Backup</Text>
          </Pressable>
          <Pressable
            onPress={resetAllData}
            style={{
              flex: 1,
              backgroundColor: '#C9B8A6',
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Reset All Data</Text>
          </Pressable>
        </View>
      </View>

      <View
        style={{
          backgroundColor: '#FFF1D8',
          borderRadius: 16,
          padding: 14,
          borderWidth: 1.5,
          borderColor: '#D8C4A8',
          borderStyle: 'dashed',
          marginTop: 18,
        }}
      >
        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Health Check</Text>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 10 }}>
          Quick diagnostics for storage and recent errors.
        </Text>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
          Storage: {loaded ? (health.storageOk ? 'OK' : 'Issue') : 'Loading...'}
        </Text>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
          Data version: {health.appDataVersion}
        </Text>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
          Last migration: {health.lastMigrationAt || 'None'}
        </Text>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
          Last error: {health.lastError || 'None'}
        </Text>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 10 }}>
          Error time: {health.lastErrorAt || 'N/A'}
        </Text>
        <Pressable
          onPress={refresh}
          style={{
            backgroundColor: '#8B5E3C',
            paddingVertical: 8,
            borderRadius: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Refresh Health</Text>
        </Pressable>
      </View>

      <Modal
        visible={showDeleteAccount}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteAccount(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' }}>
          <KeyboardAvoidingView behavior="padding" style={{ padding: 20 }}>
            <View
              style={{
                backgroundColor: '#FFF8EE',
                borderRadius: 16,
                padding: 18,
                borderWidth: 1.5,
                borderColor: '#D8C4A8',
              }}
            >
              <ScrollView style={{ maxHeight: 420 }}>
                <Text style={{ fontSize: 20, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                  We’re sorry to see you leave.
                </Text>
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 10 }}>
                  Your feedback helps us improve The Homesteading Compass for fellow homesteaders.
                </Text>
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                  Why are you deleting your account?
                </Text>
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 10 }}>
                  (Select all that apply)
                </Text>
                {deleteReasonOptions.map((reason) => {
                  const selected = deleteReasons.includes(reason);
                  return (
                    <Pressable
                      key={reason}
                      onPress={() => toggleDeleteReason(reason)}
                      style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}
                    >
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          borderWidth: 1,
                          borderColor: '#8B5E3C',
                          marginRight: 8,
                          backgroundColor: selected ? '#8B5E3C' : '#FFFDF6',
                        }}
                      />
                      <Text
                        style={{
                          color: '#3A2E24',
                          fontFamily: 'SedgwickAve',
                          flex: 1,
                          flexWrap: 'wrap',
                        }}
                      >
                        {reason}
                      </Text>
                    </Pressable>
                  );
                })}

                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginTop: 12, marginBottom: 6 }}>
                  Care to share more?
                </Text>
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                  Your thoughts help guide future improvements, but this is completely optional.
                </Text>
                <TextInput
                  placeholder="Anything you’d like us to know before you go…"
                  placeholderTextColor="#A89C8E"
                  multiline
                  value={deleteNotes}
                  onChangeText={setDeleteNotes}
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 10,
                    padding: 10,
                    minHeight: 90,
                    color: '#3A2E24',
                    fontFamily: 'SedgwickAve',
                    backgroundColor: '#FFFFFF',
                  }}
                />

                <View
                  style={{
                    marginTop: 14,
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: '#FCEFE2',
                    borderWidth: 1,
                    borderColor: '#E4C8B0',
                  }}
                >
                  <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    Deleting your account will permanently remove your data, logs, and records.
                  </Text>
                  <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve' }}>
                    This action cannot be undone.
                  </Text>
                </View>
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <Pressable
                  onPress={() => setShowDeleteAccount(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#C9B8A6',
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Keep My Account</Text>
                </Pressable>
                <Pressable
                  onPress={confirmDeleteAccount}
                  style={{
                    flex: 1,
                    backgroundColor: '#B85C5C',
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>
                    {deletingAccount ? 'Deleting...' : 'Delete Account'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={showBackup} animationType="slide" transparent onRequestClose={() => setShowBackup(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(58, 46, 36, 0.45)', justifyContent: 'center', padding: 20 }}>
          <View
            style={{
              backgroundColor: '#FFF1D8',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1.5,
              borderColor: '#D8C4A8',
              borderStyle: 'dashed',
              maxHeight: '80%',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 18, marginBottom: 8 }}>
              Local Backup
            </Text>
            <ScrollView style={{ marginBottom: 12 }}>
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                {backupLoading ? 'Loading…' : backupText}
              </Text>
            </ScrollView>
            <Pressable
              onPress={() => setShowBackup(false)}
              style={{
                backgroundColor: '#8B5E3C',
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
