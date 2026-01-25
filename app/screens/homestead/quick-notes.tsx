import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import CalendarWithYear from '../../../components/calendar-with-year';
import { useLocalSearchParams } from 'expo-router';
import { QuickNote, useHomesteadData } from '../../../context/homestead-data';
import { isOnline, useStatusOverlay } from '../../../context/status-overlay';
import InfoButton from '../../../components/info-button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDisplayDate } from '../../../lib/format-date';

const categories = [
  'Livestock',
  'Garden',
  'Pantry',
  'Harvest',
  'Recipes',
  'Field Guide',
  'Homestead',
  'Other',
];

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function QuickNotesScreen() {
  const { quickNotes, addQuickNote, updateQuickNote, removeQuickNote, addAlmanacEntry, removeAlmanacEntries } =
    useHomesteadData();
  const { showStatus } = useStatusOverlay();
  const { noteId } = useLocalSearchParams<{ noteId?: string }>();
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Other');
  const [body, setBody] = useState('');
  const [attachmentLabel, setAttachmentLabel] = useState('');
  const [attachmentNote, setAttachmentNote] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderLeadDays, setReminderLeadDays] = useState('');
  const [showReminderCalendar, setShowReminderCalendar] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [highlightedNoteId, setHighlightedNoteId] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    if (noteId) {
      setHighlightedNoteId(noteId);
      const timeout = setTimeout(() => setHighlightedNoteId(null), 2500);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [noteId]);

  const saveNote = () => {
    if (!subject.trim() && !body.trim()) {
      showStatus('Log unable to save', 'error', 1400);
      return;
    }
    if (reminderLeadDays.trim() && !reminderDate) {
      showStatus('Pick a reminder date', 'error', 1600);
      return;
    }
    if (reminderLeadDays.trim() && !/^\d+$/.test(reminderLeadDays.trim())) {
      showStatus('Lead days must be a number', 'error', 1600);
      return;
    }
    if (!isOnline()) {
      showStatus('No internet, logs will not save', 'warning', 1800);
      return;
    }
    showStatus('Log saving...', 'info', 900);
    const noteIdValue = editingNoteId ?? makeId();
    let nextAlmanacId: string | null = null;
    if (editingNoteId) {
      const existing = quickNotes.find((note) => note.id === editingNoteId);
      if (existing?.almanacId) {
        removeAlmanacEntries([existing.almanacId]);
      }
    }
    if (reminderDate) {
      nextAlmanacId = `${noteIdValue}-reminder`;
      addAlmanacEntry({
        id: nextAlmanacId,
        date: reminderDate,
        label: `Note: ${subject.trim() || 'Quick Note'}${reminderLeadDays ? ` (alert ${reminderLeadDays}d)` : ''}`,
        type: 'log',
        source: 'Quick Notes',
      });
    }
    const newNote: QuickNote = {
      id: noteIdValue,
      subject: subject.trim() || 'Quick Note',
      category,
      body: body.trim(),
      attachmentLabel,
      attachmentNote,
      reminderDate,
      reminderLeadDays,
      almanacId: nextAlmanacId,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    if (editingNoteId) {
      updateQuickNote(newNote);
    } else {
      addQuickNote(newNote);
    }
    setSubject('');
    setCategory('Other');
    setBody('');
    setAttachmentLabel('');
    setAttachmentNote('');
    setReminderDate('');
    setReminderLeadDays('');
    setEditingNoteId(null);
    setShowModal(false);
    setTimeout(() => showStatus('Log saved', 'success', 1400), 900);
  };

  const resetDraftFields = () => {
    setSubject('');
    setCategory('Other');
    setBody('');
    setAttachmentLabel('');
    setAttachmentNote('');
    setReminderDate('');
    setReminderLeadDays('');
    setShowReminderCalendar(false);
  };

  const clearDraft = () => {
    Alert.alert('Clear draft?', 'This removes any in-progress note data.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          resetDraftFields();
          try {
            await AsyncStorage.removeItem('draft:quick-notes');
          } catch {
            // Ignore storage errors.
          }
        },
      },
    ]);
  };

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const stored = await AsyncStorage.getItem('draft:quick-notes');
        if (!stored) {
          setDraftLoaded(true);
          return;
        }
        const draft = JSON.parse(stored);
        setSubject(draft.subject ?? '');
        setCategory(draft.category ?? 'Other');
        setBody(draft.body ?? '');
        setAttachmentLabel(draft.attachmentLabel ?? '');
        setAttachmentNote(draft.attachmentNote ?? '');
        setReminderDate(draft.reminderDate ?? '');
        setReminderLeadDays(draft.reminderLeadDays ?? '');
      } catch {
        // Ignore load errors.
      } finally {
        setDraftLoaded(true);
      }
    };
    if (!editingNoteId) {
      void loadDraft();
    } else {
      setDraftLoaded(true);
    }
  }, [editingNoteId]);

  useEffect(() => {
    if (!draftLoaded || editingNoteId) {
      return;
    }
    const persistDraft = async () => {
      try {
        await AsyncStorage.setItem(
          'draft:quick-notes',
          JSON.stringify({
            subject,
            category,
            body,
            attachmentLabel,
            attachmentNote,
            reminderDate,
            reminderLeadDays,
          })
        );
      } catch {
        // Ignore save errors.
      }
    };
    void persistDraft();
  }, [
    draftLoaded,
    editingNoteId,
    subject,
    category,
    body,
    attachmentLabel,
    attachmentNote,
    reminderDate,
    reminderLeadDays,
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F0E1' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Text style={{ fontSize: 32, textAlign: 'center', color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
          Quick Notes
        </Text>
        <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
          <InfoButton text="Save snippets, ideas, and reminders in one place. Connects to: Almanac, Global Search." />
        </View>

        <View
          style={{
            backgroundColor: '#FFF1D8',
            borderRadius: 16,
            padding: 14,
            marginTop: 18,
            borderWidth: 1.5,
            borderColor: '#D8C4A8',
            borderStyle: 'dashed',
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
            Saved Notes
          </Text>
          {quickNotes.length === 0 ? (
            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
              No notes yet. Tap the + button to add one.
            </Text>
          ) : (
            quickNotes.map((note) => (
              <View
                key={note.id}
                style={{
                  borderWidth: 1,
                  borderColor: highlightedNoteId === note.id ? '#8B5E3C' : '#E2D4C1',
                  borderRadius: 12,
                  padding: 10,
                  marginBottom: 8,
                  backgroundColor: highlightedNoteId === note.id ? '#FFF2DC' : '#FFF7E6',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 16 }}>
                  {note.subject}
                </Text>
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                  {note.category} • {formatDisplayDate(note.createdAt)}
                </Text>
                {!!note.reminderDate && (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginTop: 4 }}>
                    Reminder: {note.reminderDate}
                    {note.reminderLeadDays ? ` (alert ${note.reminderLeadDays}d)` : ''}
                  </Text>
                )}
                {!!note.body && (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginTop: 6 }}>
                    {note.body}
                  </Text>
                )}
                {!!note.attachmentLabel && (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginTop: 6 }}>
                    Attachment: {note.attachmentLabel}
                  </Text>
                )}
                {!!note.attachmentLabel && (
                  <View
                    style={{
                      height: 80,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: '#E2D4C1',
                      backgroundColor: '#FFFDF6',
                      marginTop: 6,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#A08974', fontFamily: 'SedgwickAve' }}>Image preview</Text>
                  </View>
                )}
                {!!note.attachmentNote && (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginTop: 4 }}>
                    Attachment notes: {note.attachmentNote}
                  </Text>
                )}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  <Pressable
                    onPress={() => {
                      setEditingNoteId(note.id);
                      setSubject(note.subject);
                      setCategory(note.category);
                      setBody(note.body);
                      setAttachmentLabel(note.attachmentLabel);
                      setAttachmentNote(note.attachmentNote);
                      setReminderDate(note.reminderDate);
                      setReminderLeadDays(note.reminderLeadDays);
                      setShowModal(true);
                    }}
                  >
                    <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Edit</Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      Alert.alert('Delete note?', 'This cannot be undone.', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => {
                            if (note.almanacId) {
                              removeAlmanacEntries([note.almanacId]);
                            }
                            removeQuickNote(note.id);
                          },
                        },
                      ])
                    }
                  >
                    <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve' }}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => setShowModal(true)}
        style={{
          position: 'absolute',
          right: 20,
          bottom: 30,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#8B5E3C',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#3A2E24',
          shadowOpacity: 0.2,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 26, fontFamily: 'SedgwickAve' }}>+</Text>
      </Pressable>

      <Modal
        visible={showModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
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
              borderRadius: 20,
              padding: 16,
              borderWidth: 1.5,
              borderColor: '#D8C4A8',
              borderStyle: 'dashed',
            }}
        >
          <Text style={{ fontSize: 20, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
            {editingNoteId ? 'Edit Quick Note' : 'Add Quick Note'}
          </Text>
          <TextInput
            placeholder="Subject"
              value={subject}
              onChangeText={setSubject}
              placeholderTextColor="#A08974"
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 10,
                padding: 10,
                marginBottom: 10,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
                backgroundColor: '#FFFDF6',
              }}
            />
            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {categories.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: category === item ? '#8B5E3C' : '#D7C9B7',
                    backgroundColor: category === item ? '#EADBCB' : '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              placeholder="Paste or type your note"
              value={body}
              onChangeText={setBody}
              placeholderTextColor="#A08974"
              multiline
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 10,
                padding: 10,
                minHeight: 100,
                marginBottom: 12,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
              backgroundColor: '#FFFDF6',
            }}
          />
            <Pressable
              onPress={() =>
                setAttachmentLabel(attachmentLabel ? '' : 'Image attached (placeholder)')
              }
              style={{
                backgroundColor: '#C9B8A6',
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                {attachmentLabel ? 'Remove Attachment' : 'Attach Image (later)'}
              </Text>
            </Pressable>
            {attachmentLabel && (
              <TextInput
                placeholder="Attachment notes"
                value={attachmentNote}
                onChangeText={setAttachmentNote}
                placeholderTextColor="#A08974"
                style={{
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 10,
                  color: '#3A2E24',
                  fontFamily: 'SedgwickAve',
                  backgroundColor: '#FFFDF6',
                }}
              />
            )}

            <TextInput
              placeholder="Reminder lead time (days)"
              value={reminderLeadDays}
              onChangeText={setReminderLeadDays}
              placeholderTextColor="#A08974"
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 10,
                padding: 10,
                marginBottom: 10,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
                backgroundColor: '#FFFDF6',
              }}
            />
            <Pressable
              onPress={() => setShowReminderCalendar((prev) => !prev)}
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 10,
                padding: 10,
                marginBottom: 8,
                backgroundColor: '#FFFDF6',
              }}
            >
              <Text style={{ color: reminderDate ? '#3A2E24' : '#A08974', fontFamily: 'SedgwickAve' }}>
                {reminderDate || 'Add reminder date (optional)'}
              </Text>
            </Pressable>
            {showReminderCalendar && (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 10,
                  overflow: 'hidden',
                  marginBottom: 12,
                }}
              >
                <CalendarWithYear
                  onDayPress={(day) => {
                    setReminderDate(day.dateString);
                    setShowReminderCalendar(false);
                  }}
                  markedDates={
                    reminderDate
                      ? {
                          [reminderDate]: {
                            selected: true,
                            selectedColor: '#4C7744',
                            selectedTextColor: '#FFFFFF',
                          },
                        }
                      : undefined
                  }
                  theme={{
                    backgroundColor: '#FFF1D8',
                    calendarBackground: '#FFF1D8',
                    textSectionTitleColor: '#6B4E3D',
                    dayTextColor: '#3A2E24',
                    todayTextColor: '#8B5E3C',
                    monthTextColor: '#6B4E3D',
                    arrowColor: '#6B4E3D',
                    textMonthFontFamily: 'SedgwickAve',
                    textDayHeaderFontFamily: 'SedgwickAve',
                    textDayFontFamily: 'SedgwickAve',
                  }}
                />
              </View>
            )}
            <Pressable
              onPress={saveNote}
              style={{
                backgroundColor: '#8B5E3C',
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>
                {editingNoteId ? 'Save Note' : 'Add Note'}
              </Text>
            </Pressable>
            {!editingNoteId && (
              <Pressable onPress={clearDraft} style={{ alignItems: 'center', paddingVertical: 4 }}>
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>Clear Draft</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => {
                setShowModal(false);
                setEditingNoteId(null);
                resetDraftFields();
              }}
              style={{ alignItems: 'center', paddingVertical: 4 }}
            >
              <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
