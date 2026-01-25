import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

type InfoButtonProps = {
  text: string;
};

export default function InfoButton({ text }: InfoButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: '#D8C4A8',
          backgroundColor: '#FFF1D8',
        }}
      >
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 16 }}>i</Text>
      </Pressable>

      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(58, 46, 36, 0.45)',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#FFF1D8',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1.5,
              borderColor: '#D8C4A8',
              borderStyle: 'dashed',
            }}
          >
            <Pressable onPress={() => setOpen(false)} style={{ alignSelf: 'flex-end', padding: 4 }}>
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 16 }}>x</Text>
            </Pressable>
            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>{text}</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}
