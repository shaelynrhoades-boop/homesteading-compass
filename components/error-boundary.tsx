import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { recordLastError } from '../context/app-health';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  onReset?: () => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  errorMessage: string;
  errorStack: string;
};

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, errorMessage: '', errorStack: '' };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Error boundary caught:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error && typeof error.stack === 'string' ? error.stack : '';
    this.setState({ errorMessage: message, errorStack: stack });
    void recordLastError(message);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  handleCopy = async () => {
    const { errorMessage, errorStack } = this.state;
    const payload = `Message: ${errorMessage || 'Unknown error'}\nStack: ${errorStack || 'No stack available'}`;
    try {
      await Clipboard.setStringAsync(payload);
      Alert.alert('Copied', 'Error details copied to clipboard.');
    } catch {
      Alert.alert('Copy failed', 'Unable to copy error details.');
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#F5F0E1' }} contentContainerStyle={{ padding: 24 }}>
        <Text style={{ fontSize: 28, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
          Something went wrong
        </Text>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 18 }}>
          We hit an unexpected issue. You can try again or reopen the app.
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          <Pressable
            onPress={this.handleReset}
            style={{
              backgroundColor: '#8B5E3C',
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Try Again</Text>
          </Pressable>
          <Pressable
            onPress={this.handleCopy}
            style={{
              backgroundColor: '#D8C4A8',
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Copy Error</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }
}
