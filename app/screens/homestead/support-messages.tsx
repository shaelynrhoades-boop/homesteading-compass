import { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '../../../lib/supabase';
import { useStatusOverlay } from '../../../context/status-overlay';

type Attachment = {
  uri: string;
  name: string;
  type: string;
  base64?: string;
};

type SupportMessage = {
  id: string;
  subject: string | null;
  message: string;
  status: string | null;
  admin_reply: string | null;
  created_at: string;
};

const buildFilename = (uri: string) => {
  const nameFromUri = uri.split('/').pop() ?? '';
  if (nameFromUri.includes('.')) {
    return nameFromUri;
  }
  return `screenshot-${Date.now()}.jpg`;
};

const guessContentType = (uri: string) => {
  const ext = uri.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'heic') return 'image/heic';
  return 'image/jpeg';
};

const base64ToUint8Array = (base64: string) => {
  const cleaned = base64.replace(/[^A-Za-z0-9+/=]/g, '');
  if (typeof atob === 'function') {
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let buffer = 0;
  let bits = 0;
  const output: number[] = [];
  for (let i = 0; i < cleaned.length; i += 1) {
    const value = chars.indexOf(cleaned[i]);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(output);
};

export default function SupportMessagesScreen() {
  const { showStatus } = useStatusOverlay();
  const adminEmail = (process.env.EXPO_PUBLIC_ADMIN_EMAIL || '').toLowerCase();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sending, setSending] = useState(false);
  const [loadingLog, setLoadingLog] = useState(false);
  const [messageLog, setMessageLog] = useState<SupportMessage[]>([]);
  const [adminReplies, setAdminReplies] = useState<Record<string, string>>({});
  const [adminStatuses, setAdminStatuses] = useState<Record<string, string>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'log'>('new');

  const loadAdminStatus = async () => {
    const { data } = await supabase.auth.getUser();
    const email = data?.user?.email?.toLowerCase() ?? '';
    setIsAdmin(Boolean(adminEmail && email && adminEmail === email));
  };

  const loadMessageLog = async () => {
    setLoadingLog(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        setMessageLog([]);
        return;
      }
      const { data, error } = await supabase
        .from('support_messages')
        .select('id, subject, message, status, admin_reply, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) {
        throw error;
      }
      const logData = data ?? [];
      setMessageLog(logData);
      setAdminReplies((prev) => {
        const next = { ...prev };
        logData.forEach((entry) => {
          if (!(entry.id in next)) {
            next[entry.id] = entry.admin_reply ?? '';
          }
        });
        return next;
      });
      setAdminStatuses((prev) => {
        const next = { ...prev };
        logData.forEach((entry) => {
          if (!(entry.id in next)) {
            next[entry.id] = entry.status ?? 'Received';
          }
        });
        return next;
      });
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Unable to load messages';
      showStatus(messageText, 'error', 1800);
    } finally {
      setLoadingLog(false);
    }
  };

  useEffect(() => {
    void loadAdminStatus();
    void loadMessageLog();
  }, []);

  const addAttachment = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to attach screenshots.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsMultipleSelection: false,
      base64: true,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    const fileUri = asset.uri;
    const fileName = buildFilename(fileUri);
    const contentType = asset.mimeType ?? guessContentType(fileUri);
    const base64 = asset.base64 ?? '';

    if (!base64) {
      showStatus('Unable to read screenshot data', 'error', 1600);
      return;
    }

    setAttachments((prev) => [...prev, { uri: fileUri, name: fileName, type: contentType, base64 }]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const pasteClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    if (!text) {
      showStatus('Clipboard is empty', 'info', 1400);
      return;
    }
    setMessage((prev) => `${prev}${prev ? '\n\n' : ''}${text}`);
  };

  const sendMessage = async () => {
    if (!message.trim()) {
      showStatus('Add a message before sending', 'error', 1600);
      return;
    }
    setSending(true);
    showStatus('Sending message...', 'info', 1200);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id ?? null;
      const email = userData?.user?.email ?? null;

      const uploaded: { path: string; name: string }[] = [];
      for (const attachment of attachments) {
        const path = `${userId ?? 'anonymous'}/${Date.now()}-${attachment.name}`;
        const body = attachment.base64 ? base64ToUint8Array(attachment.base64) : null;
        if (!body) {
          throw new Error('Attachment data missing');
        }
        const { error } = await supabase.storage
          .from('support-attachments')
          .upload(path, body, { contentType: attachment.type, upsert: false });
        if (error) {
          throw error;
        }
        uploaded.push({ path, name: attachment.name });
      }

      const { error: insertError } = await supabase.from('support_messages').insert({
        user_id: userId,
        email,
        subject: subject.trim() || null,
        message: message.trim(),
        status: 'Received',
        attachments: uploaded,
      });

      if (insertError) {
        throw insertError;
      }

      setSubject('');
      setMessage('');
      setAttachments([]);
      await loadMessageLog();
      showStatus('Message sent', 'success', 1600);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Unable to send message';
      showStatus(messageText, 'error', 1800);
    } finally {
      setSending(false);
    }
  };

  const saveAdminReply = async (entryId: string) => {
    if (!isAdmin) {
      showStatus('Admin access required', 'error', 1600);
      return;
    }
    const reply = (adminReplies[entryId] ?? '').trim();
    const status = adminStatuses[entryId] ?? 'Received';
    setSending(true);
    showStatus('Updating message...', 'info', 1000);
    try {
      const timestamp = new Date().toISOString();
      const { error } = await supabase
        .from('support_messages')
        .update({
          admin_reply: reply || null,
          status,
          admin_reply_at: timestamp,
          updated_at: timestamp,
        })
        .eq('id', entryId);
      if (error) {
        throw error;
      }
      await loadMessageLog();
      showStatus('Reply saved', 'success', 1400);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Unable to save reply';
      showStatus(messageText, 'error', 1800);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F5F0E1' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
      <Text style={{ fontSize: 34, textAlign: 'center', color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
        The Post Box
      </Text>
        <Text style={{ color: '#6E5B4B', marginTop: 8, marginBottom: 16, fontFamily: 'SedgwickAve', textAlign: 'center' }}>
          Send feedback, bug reports, or feature ideas directly to Shaelyn.
        </Text>
        {isAdmin && (
          <View
            style={{
              alignSelf: 'center',
              marginBottom: 12,
              paddingVertical: 4,
              paddingHorizontal: 10,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#D7C9B7',
              backgroundColor: '#EADBCB',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 12 }}>Admin Mode</Text>
          </View>
        )}

      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#EADBCB',
          borderRadius: 18,
          padding: 4,
          marginBottom: 16,
        }}
      >
        {[
          { id: 'new', label: 'New Message' },
          { id: 'log', label: 'Message Log' },
        ].map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id as 'new' | 'log')}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 14,
                backgroundColor: selected ? '#8B5E3C' : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: selected ? '#FFFFFF' : '#3A2E24', fontFamily: 'SedgwickAve' }}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

        {activeTab === 'new' ? (
          <View
            style={{
              backgroundColor: '#FFF8EE',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#E2D4C1',
            }}
          >
          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Subject (optional)</Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="Bug report, idea, feedback..."
            placeholderTextColor="#A89C8E"
            style={{
              borderWidth: 1,
              borderColor: '#D7C9B7',
              borderRadius: 8,
              padding: 10,
              marginBottom: 12,
              color: '#3A2E24',
              fontFamily: 'SedgwickAve',
            }}
          />

          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Message</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="What happened? What did you expect?"
            placeholderTextColor="#A89C8E"
            multiline
            style={{
              borderWidth: 1,
              borderColor: '#D7C9B7',
              borderRadius: 8,
              padding: 10,
              minHeight: 120,
              marginBottom: 12,
              color: '#3A2E24',
              fontFamily: 'SedgwickAve',
            }}
          />

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            <Pressable
              onPress={pasteClipboard}
              style={{
                backgroundColor: '#C9B8A6',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Paste Clipboard</Text>
            </Pressable>
            <Pressable
              onPress={addAttachment}
              style={{
                backgroundColor: '#8B5E3C',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add Screenshot</Text>
            </Pressable>
          </View>

          {attachments.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                Attachments
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {attachments.map((file, index) => (
                  <Pressable key={`${file.uri}-${index}`} onPress={() => removeAttachment(index)}>
                    <Image
                      source={{ uri: file.uri }}
                      style={{ width: 72, height: 72, borderRadius: 8, borderWidth: 1, borderColor: '#D7C9B7' }}
                    />
                    <Text style={{ color: '#6E5B4B', fontSize: 12, textAlign: 'center', fontFamily: 'SedgwickAve' }}>
                      Remove
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <Pressable
            onPress={sendMessage}
            disabled={sending}
            style={{
              backgroundColor: sending ? '#C9B8A6' : '#4C7744',
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'SedgwickAve' }}>
              {sending ? 'Sending...' : 'Send Message'}
            </Text>
          </Pressable>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: '#FFF8EE',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#E2D4C1',
            }}
          >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 18 }}>Message Log</Text>
            <Pressable
              onPress={loadMessageLog}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#D7C9B7',
                backgroundColor: '#FFFDF6',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                {loadingLog ? 'Loading...' : 'Refresh'}
              </Text>
            </Pressable>
          </View>
          {messageLog.length === 0 ? (
            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
              No messages yet. Send one to start a thread.
            </Text>
          ) : (
            messageLog.map((entry) => (
              <View
                key={entry.id}
                style={{
                  borderWidth: 1,
                  borderColor: '#E2D4C1',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 10,
                  backgroundColor: '#FFFDF6',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 16 }}>
                  {entry.subject || 'Support Message'}
                </Text>
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginTop: 2 }}>
                  Status: {entry.status || 'Received'}
                </Text>
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginTop: 6 }}>
                  You: {entry.message}
                </Text>
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginTop: 6 }}>
                  Response: {entry.admin_reply || 'Awaiting reply'}
                </Text>
                {isAdmin && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                      Admin Reply
                    </Text>
                    <TextInput
                      value={adminReplies[entry.id] ?? ''}
                      onChangeText={(text) =>
                        setAdminReplies((prev) => ({
                          ...prev,
                          [entry.id]: text,
                        }))
                      }
                      placeholder="Type your reply..."
                      placeholderTextColor="#A89C8E"
                      multiline
                      style={{
                        borderWidth: 1,
                        borderColor: '#D7C9B7',
                        borderRadius: 8,
                        padding: 10,
                        minHeight: 80,
                        color: '#3A2E24',
                        fontFamily: 'SedgwickAve',
                        marginBottom: 8,
                      }}
                    />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      {['Received', 'In Progress', 'Fixed'].map((status) => {
                        const selected = (adminStatuses[entry.id] ?? 'Received') === status;
                        return (
                          <Pressable
                            key={`${entry.id}-${status}`}
                            onPress={() =>
                              setAdminStatuses((prev) => ({
                                ...prev,
                                [entry.id]: status,
                              }))
                            }
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                              backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{status}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <Pressable
                      onPress={() => saveAdminReply(entry.id)}
                      disabled={sending}
                      style={{
                        backgroundColor: sending ? '#C9B8A6' : '#4C7744',
                        paddingVertical: 8,
                        borderRadius: 8,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>
                        {sending ? 'Saving...' : 'Save Reply'}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ))
          )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
