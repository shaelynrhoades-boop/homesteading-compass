import React, { createContext, useContext, useRef, useState } from 'react';
import { View, Text } from 'react-native';

type StatusTone = 'info' | 'success' | 'error' | 'warning';

type StatusOverlayContextValue = {
  showStatus: (message: string, tone?: StatusTone, durationMs?: number) => void;
};

const StatusOverlayContext = createContext<StatusOverlayContextValue | null>(null);

const toneStyles: Record<StatusTone, { background: string; border: string; text: string }> = {
  info: { background: '#FFF1D8', border: '#D8C4A8', text: '#3A2E24' },
  success: { background: '#E6F2E0', border: '#9BC29A', text: '#2F5E3A' },
  warning: { background: '#FFF3D6', border: '#E0B36A', text: '#6B4E3D' },
  error: { background: '#FCE4E4', border: '#D38B8B', text: '#7A2E2E' },
};

export function StatusOverlayProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<StatusTone>('info');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showStatus = (nextMessage: string, nextTone: StatusTone = 'info', durationMs = 1400) => {
    setMessage(nextMessage);
    setTone(nextTone);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setMessage('');
    }, durationMs);
  };

  const toneStyle = toneStyles[tone];

  return (
    <StatusOverlayContext.Provider value={{ showStatus }}>
      {children}
      {!!message && (
        <View
          style={{
            position: 'absolute',
            top: '45%',
            alignSelf: 'center',
            backgroundColor: toneStyle.background,
            borderRadius: 14,
            paddingVertical: 12,
            paddingHorizontal: 18,
            borderWidth: 1.5,
            borderColor: toneStyle.border,
            borderStyle: 'dashed',
            shadowColor: '#3A2E24',
            shadowOpacity: 0.2,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text style={{ color: toneStyle.text, fontFamily: 'SedgwickAve', fontSize: 16 }}>{message}</Text>
        </View>
      )}
    </StatusOverlayContext.Provider>
  );
}

export function useStatusOverlay() {
  const context = useContext(StatusOverlayContext);
  if (!context) {
    throw new Error('useStatusOverlay must be used within StatusOverlayProvider');
  }
  return context;
}

export const isOnline = () => {
  if (typeof navigator === 'undefined') {
    return true;
  }
  return navigator.onLine !== false;
};
