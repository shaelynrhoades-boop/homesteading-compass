import { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PageNoteProps = {
  text: string;
  onClose: () => void;
  storageKey?: string;
};

export default function PageNote({ text, onClose, storageKey }: PageNoteProps) {
  const hasChecked = useRef(false);

  useEffect(() => {
    if (!storageKey || hasChecked.current) {
      return;
    }
    hasChecked.current = true;
    let isMounted = true;
    const loadDismissed = async () => {
      try {
        const dismissed = await AsyncStorage.getItem(storageKey);
        if (dismissed === '1' && isMounted) {
          onClose();
        }
      } catch {
        // Ignore storage errors to avoid blocking the UI.
      }
    };
    void loadDismissed();
    return () => {
      isMounted = false;
    };
  }, [onClose, storageKey]);

  const handleClose = () => {
    if (storageKey) {
      AsyncStorage.setItem(storageKey, '1').catch(() => undefined);
    }
    onClose();
  };

  return (
    <View
      style={{
        backgroundColor: '#FFF1D8',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1.5,
        borderColor: '#D8C4A8',
        borderStyle: 'dashed',
        marginBottom: 12,
      }}
    >
      <Pressable
        onPress={handleClose}
        style={{
          position: 'absolute',
          top: 6,
          right: 8,
          padding: 4,
        }}
      >
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 16 }}>x</Text>
      </Pressable>
      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', paddingRight: 16 }}>{text}</Text>
    </View>
  );
}
