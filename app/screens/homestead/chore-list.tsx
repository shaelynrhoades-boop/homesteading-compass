import { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import CalendarWithYear from '../../../components/calendar-with-year';
import { useHomesteadData } from '../../../context/homestead-data';
import { isOnline, useStatusOverlay } from '../../../context/status-overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

type Chore = {
  id: string;
  title: string;
  frequency: string;
  due: string[];
  notes: string;
  color: string;
  completed: boolean;
  almanacIds: string[];
};

type Todo = {
  id: string;
  title: string;
  due: string;
  date: string | null;
  notes: string;
  color: string;
  completed: boolean;
  almanacId: string | null;
};

export default function ChoreListScreen() {
  const { addAlmanacEntry, removeAlmanacEntries } = useHomesteadData();
  const { showStatus } = useStatusOverlay();
  const [activeList, setActiveList] = useState<'chores' | 'todos'>('chores');
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState('');
  const [due, setDue] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [choreColor, setChoreColor] = useState('#8B5E3C');
  const [chores, setChores] = useState<Chore[]>([]);
  const [editingChoreId, setEditingChoreId] = useState<string | null>(null);
  const [todoTitle, setTodoTitle] = useState('');
  const [todoDue, setTodoDue] = useState('');
  const [todoDate, setTodoDate] = useState<string | null>(null);
  const [showTodoCalendar, setShowTodoCalendar] = useState(false);
  const [todoNotes, setTodoNotes] = useState('');
  const [todoColor, setTodoColor] = useState('#4C7744');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [showChoreForm, setShowChoreForm] = useState(false);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [sortTodosByDate, setSortTodosByDate] = useState(false);

  const frequencyOptions = ['Daily', 'Weekly', 'Biweekly', 'Monthly', 'Seasonal', 'As needed'];
  const dayOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const colorOptions = ['#8B5E3C', '#4C7744', '#3F7C8C', '#B65C3A', '#7A5E9A', '#C7A35D'];

  const canAddChore = useMemo(() => title.trim().length > 0, [title]);
  const canAddTodo = useMemo(() => todoTitle.trim().length > 0, [todoTitle]);
  const sortedTodos = useMemo(() => {
    if (!sortTodosByDate) {
      return todos;
    }
    return [...todos].sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.localeCompare(b.date);
    });
  }, [todos, sortTodosByDate]);

  const formatDate = (date: string) => {
    const parsed = new Date(`${date}T00:00:00`);
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const dayIndexByName: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const getNextDateForDay = (dayName: string) => {
    const target = dayIndexByName[dayName];
    if (target === undefined) {
      return null;
    }
    const today = new Date();
    const diff = (target - today.getDay() + 7) % 7;
    const next = new Date(today);
    next.setDate(today.getDate() + diff);
    return next.toISOString().slice(0, 10);
  };

  const buildChoreAlmanacEntries = (choreId: string, choreTitle: string, days: string[], color: string) => {
    const ids: string[] = [];
    days.forEach((day) => {
      const nextDate = getNextDateForDay(day);
      if (nextDate) {
        const entryId = `${choreId}-${day}-${nextDate}`;
        ids.push(entryId);
        addAlmanacEntry({
          id: entryId,
          date: nextDate,
          label: `Chore: ${choreTitle}`,
          type: 'chore',
          source: 'Chore List',
          color,
        });
      }
    });
    return ids;
  };

  const addChore = () => {
    if (!isOnline()) {
      showStatus('No internet, logs will not save', 'warning', 1800);
      return;
    }
    if (!canAddChore) {
      showStatus('Log unable to save', 'error', 1400);
      return;
    }
    if (!frequency.trim()) {
      showStatus('Select a frequency', 'error', 1500);
      return;
    }
    if (due.length === 0) {
      showStatus('Select at least one day', 'error', 1500);
      return;
    }
    showStatus('Log saving...', 'info', 900);
    const choreId = editingChoreId ?? `${Date.now()}`;
    if (editingChoreId) {
      const existing = chores.find((chore) => chore.id === editingChoreId);
      if (existing?.almanacIds.length) {
        removeAlmanacEntries(existing.almanacIds);
      }
    }
    const almanacIds = buildChoreAlmanacEntries(choreId, title.trim(), due, choreColor);
    const newChore: Chore = {
      id: choreId,
      title: title.trim(),
      frequency: frequency.trim(),
      due,
      notes: notes.trim(),
      color: choreColor,
      completed: editingChoreId ? chores.find((chore) => chore.id === editingChoreId)?.completed ?? false : false,
      almanacIds,
    };

    setChores((prev) =>
      editingChoreId
        ? prev.map((chore) => (chore.id === editingChoreId ? newChore : chore))
        : [newChore, ...prev]
    );
    setTitle('');
    setFrequency('');
    setDue([]);
    setNotes('');
    setChoreColor('#8B5E3C');
    setShowChoreForm(false);
    setEditingChoreId(null);
    setTimeout(() => showStatus('Log saved', 'success', 1400), 900);
  };

  const toggleChore = (id: string) => {
    setChores((prev) =>
      prev.map((chore) =>
        chore.id === id ? { ...chore, completed: !chore.completed } : chore
      )
    );
  };

  const addTodo = () => {
    if (!isOnline()) {
      showStatus('No internet, logs will not save', 'warning', 1800);
      return;
    }
    if (!canAddTodo) {
      showStatus('Log unable to save', 'error', 1400);
      return;
    }
    showStatus('Log saving...', 'info', 900);
    const todoId = editingTodoId ?? `${Date.now()}`;
    if (editingTodoId) {
      const existing = todos.find((todo) => todo.id === editingTodoId);
      if (existing?.almanacId) {
        removeAlmanacEntries([existing.almanacId]);
      }
    }
    const almanacId = todoDate ? `${todoId}-todo` : null;
    const newTodo: Todo = {
      id: todoId,
      title: todoTitle.trim(),
      due: todoDue.trim(),
      date: todoDate,
      notes: todoNotes.trim(),
      color: todoColor,
      completed: editingTodoId ? todos.find((todo) => todo.id === editingTodoId)?.completed ?? false : false,
      almanacId,
    };

    setTodos((prev) =>
      editingTodoId ? prev.map((todo) => (todo.id === editingTodoId ? newTodo : todo)) : [newTodo, ...prev]
    );
    if (newTodo.date && almanacId) {
      addAlmanacEntry({
        id: almanacId,
        date: newTodo.date,
        label: `To-Do: ${newTodo.title}`,
        type: 'todo',
        source: 'To-Do List',
        color: todoColor,
      });
    }
    setTodoTitle('');
    setTodoDue('');
    setTodoDate(null);
    setTodoNotes('');
    setTodoColor('#4C7744');
    setShowTodoCalendar(false);
    setShowTodoForm(false);
    setEditingTodoId(null);
    setTimeout(() => showStatus('Log saved', 'success', 1400), 900);
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    );
  };

  const onTodoDateSelect = (dateString: string) => {
    setTodoDate(dateString);
    setTodoDue(formatDate(dateString));
    setShowTodoCalendar(false);
  };

  const toggleDay = (day: string) => {
    setDue((prev) =>
      prev.includes(day) ? prev.filter((value) => value !== day) : [...prev, day]
    );
  };

  const formatDayAbbrev = (day: string) =>
    ({
      Sunday: 'Sun',
      Monday: 'Mon',
      Tuesday: 'Tue',
      Wednesday: 'Wed',
      Thursday: 'Thu',
      Friday: 'Fri',
      Saturday: 'Sat',
    })[day] ?? day;

  const resetDraftFields = () => {
    setTitle('');
    setFrequency('');
    setDue([]);
    setNotes('');
    setChoreColor('#8B5E3C');
    setTodoTitle('');
    setTodoDue('');
    setTodoDate(null);
    setTodoNotes('');
    setTodoColor('#4C7744');
  };

  const clearDraft = () => {
    Alert.alert('Clear draft?', 'This removes any in-progress chore or to-do fields.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          resetDraftFields();
          try {
            const stored = await AsyncStorage.getItem('homestead:chore-list');
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed && typeof parsed === 'object') {
                delete parsed.draft;
                await AsyncStorage.setItem('homestead:chore-list', JSON.stringify(parsed));
              }
            }
          } catch {
            // Ignore storage errors.
          }
        },
      },
    ]);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem('homestead:chore-list');
        if (!stored) {
          setDataLoaded(true);
          return;
        }
        const parsed = JSON.parse(stored);
        if (parsed.activeList === 'chores' || parsed.activeList === 'todos') {
          setActiveList(parsed.activeList);
        }
        if (Array.isArray(parsed.chores)) setChores(parsed.chores);
        if (Array.isArray(parsed.todos)) setTodos(parsed.todos);
        if (typeof parsed.sortTodosByDate === 'boolean') setSortTodosByDate(parsed.sortTodosByDate);
        if (parsed.draft) {
          const draft = parsed.draft;
          setTitle(draft.title ?? '');
          setFrequency(draft.frequency ?? '');
          setDue(Array.isArray(draft.due) ? draft.due : []);
          setNotes(draft.notes ?? '');
          setChoreColor(draft.choreColor ?? '#8B5E3C');
          setTodoTitle(draft.todoTitle ?? '');
          setTodoDue(draft.todoDue ?? '');
          setTodoDate(draft.todoDate ?? null);
          setTodoNotes(draft.todoNotes ?? '');
          setTodoColor(draft.todoColor ?? '#4C7744');
        }
      } catch {
        // Ignore load errors.
      } finally {
        setDataLoaded(true);
      }
    };
    void loadData();
  }, []);

  useEffect(() => {
    if (!dataLoaded) return;
    const importQueued = async () => {
      try {
        const stored = await AsyncStorage.getItem('homestead:queued-chores');
        if (!stored) return;
        const queued = JSON.parse(stored);
        if (!Array.isArray(queued) || queued.length === 0) return;
        const next = queued
          .filter((item) => item && typeof item === 'object')
          .map((item) => {
            const choreId = item.id ?? `${Date.now()}`;
            const almanacIds = buildChoreAlmanacEntries(choreId, item.title ?? 'Chore', item.due ?? [], item.color ?? '#8B5E3C');
            return {
              id: choreId,
              title: String(item.title ?? 'Chore'),
              frequency: String(item.frequency ?? 'As needed'),
              due: Array.isArray(item.due) ? item.due : [],
              notes: String(item.notes ?? ''),
              color: String(item.color ?? '#8B5E3C'),
              completed: false,
              almanacIds,
            } as Chore;
          });
        setChores((prev) => {
          const existingIds = new Set(prev.map((chore) => chore.id));
          const merged = next.filter((item) => !existingIds.has(item.id));
          return merged.length ? [...merged, ...prev] : prev;
        });
        await AsyncStorage.removeItem('homestead:queued-chores');
      } catch {
        // Ignore queued chore errors.
      }
    };
    void importQueued();
  }, [dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) {
      return;
    }
    const persist = async () => {
      try {
        await AsyncStorage.setItem(
          'homestead:chore-list',
          JSON.stringify({
            activeList,
            chores,
            todos,
            sortTodosByDate,
            draft: {
              title,
              frequency,
              due,
              notes,
              choreColor,
              todoTitle,
              todoDue,
              todoDate,
              todoNotes,
              todoColor,
            },
          })
        );
      } catch {
        // Ignore save errors.
      }
    };
    void persist();
  }, [
    activeList,
    chores,
    todos,
    title,
    frequency,
    due,
    notes,
    choreColor,
    todoTitle,
    todoDue,
    todoDate,
    todoNotes,
    todoColor,
    sortTodosByDate,
    dataLoaded,
  ]);

  const renderHeader = () => (
    <>
      <Text
        style={{
          fontSize: 36,
          textAlign: 'center',
          color: '#3A2E24',
          marginTop: 8,
          marginBottom: 10,
          fontFamily: 'SedgwickAve',
        }}
      >
        Chore List
      </Text>
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
          { id: 'chores', label: 'Chores' },
          { id: 'todos', label: 'To-Do' },
        ].map((tab) => {
          const selected = activeList === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveList(tab.id as 'chores' | 'todos')}
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
      <Text style={{ color: '#6E5B4B', marginBottom: 14, fontFamily: 'SedgwickAve' }}>
        {activeList === 'todos'
          ? "A place to jot down what needs doing, whether it's big plans or small reminders. Keep your day moving without keeping it all in your head."
          : 'The steady rhythm of daily care - feeding, cleaning, tending, and checking in. Keep chores simple and accounted for. Press and hold a chore to drag it into place. Chores sync with your Almanac calendar.'}
      </Text>
    </>
  );

  const renderChoreHeader = () => (
    <>
      {renderHeader()}
      <Text style={{ fontSize: 20, marginBottom: 12, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
        My chores
      </Text>

      <Pressable
        onPress={() => setShowChoreForm((prev) => !prev)}
        style={{
          backgroundColor: '#8B5E3C',
          paddingVertical: 10,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 18,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'SedgwickAve' }}>
          Add Chore
        </Text>
      </Pressable>
      <Pressable onPress={clearDraft} style={{ alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>Clear Draft</Text>
      </Pressable>
      {showChoreForm && (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 10,
            padding: 16,
            borderWidth: 1,
            borderColor: '#E5DDCC',
            marginBottom: 18,
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 10, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
            {editingChoreId ? 'Edit chore' : 'Add a chore'}
          </Text>

          <TextInput
            placeholder="Chore title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#A89C8E"
            style={{
              borderWidth: 1,
              borderColor: '#D7C9B7',
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
              color: '#3A2E24',
              fontFamily: 'SedgwickAve',
            }}
          />

          <View style={{ marginBottom: 10 }}>
            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Frequency</Text>
            <Pressable
              onPress={() => setShowFrequencyPicker((prev) => !prev)}
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                backgroundColor: '#FFFFFF',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                {frequency || 'Select frequency'}
              </Text>
            </Pressable>
            {showFrequencyPicker && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {frequencyOptions.map((option) => {
                  const selected = frequency === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => {
                        setFrequency(option);
                        setShowFrequencyPicker(false);
                      }}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                        backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                      }}
                    >
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View style={{ marginBottom: 10 }}>
            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Day of week</Text>
            <Pressable
              onPress={() => setShowDayPicker((prev) => !prev)}
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                backgroundColor: '#FFFFFF',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                {due.length > 0 ? due.map(formatDayAbbrev).join(', ') : 'Select days'}
              </Text>
            </Pressable>
            {showDayPicker && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {dayOptions.map((option) => {
                  const selected = due.includes(option);
                  return (
                    <Pressable
                      key={option}
                      onPress={() => toggleDay(option)}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                        backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                      }}
                    >
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Color</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
            {colorOptions.map((color) => {
              const selected = choreColor === color;
              return (
                <Pressable
                  key={`chore-color-${color}`}
                  onPress={() => setChoreColor(color)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: color,
                    borderWidth: selected ? 2 : 1,
                    borderColor: selected ? '#3A2E24' : '#E0D6C7',
                  }}
                />
              );
            })}
          </View>

          <TextInput
            placeholder="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholderTextColor="#A89C8E"
            multiline
            style={{
              borderWidth: 1,
              borderColor: '#D7C9B7',
              borderRadius: 8,
              padding: 10,
              minHeight: 70,
              marginBottom: 12,
              color: '#3A2E24',
              fontFamily: 'SedgwickAve',
            }}
          />

          <Pressable
            onPress={addChore}
            style={{
              backgroundColor: canAddChore ? '#8B5E3C' : '#C9B8A6',
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'SedgwickAve' }}>
              {editingChoreId ? 'Save Chore' : 'Add Chore'}
            </Text>
          </Pressable>
          {editingChoreId && (
            <Pressable
              onPress={() => {
                setEditingChoreId(null);
                setTitle('');
                setFrequency('');
                setDue([]);
                setNotes('');
                setChoreColor('#8B5E3C');
              }}
              style={{ marginTop: 8, alignItems: 'center' }}
            >
              <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Cancel edit</Text>
            </Pressable>
          )}
        </View>
      )}
    </>
  );

  const renderTodoHeader = () => (
    <>
      {renderHeader()}
      <Text style={{ fontSize: 20, marginBottom: 12, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
        My To-Do's
      </Text>

      <Pressable
        onPress={() => setShowTodoForm((prev) => !prev)}
        style={{
          backgroundColor: '#8B5E3C',
          paddingVertical: 10,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 18,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'SedgwickAve' }}>
          Add Task
        </Text>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        <Pressable
          onPress={clearDraft}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#D7C9B7',
            backgroundColor: '#FFFDF6',
          }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Clear Draft</Text>
        </Pressable>
        <Pressable
          onPress={() => setSortTodosByDate((prev) => !prev)}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#D7C9B7',
            backgroundColor: sortTodosByDate ? '#EADBCB' : '#FFFDF6',
          }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
            {sortTodosByDate ? 'Sorted by date' : 'Sort by date'}
          </Text>
        </Pressable>
      </View>
      {showTodoForm && (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 10,
            padding: 16,
            borderWidth: 1,
            borderColor: '#E5DDCC',
            marginBottom: 18,
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 10, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
            {editingTodoId ? 'Edit To-Do' : 'Add a To-Do'}
          </Text>

          <TextInput
            placeholder="To-Do title"
            value={todoTitle}
            onChangeText={setTodoTitle}
            placeholderTextColor="#A89C8E"
            style={{
              borderWidth: 1,
              borderColor: '#D7C9B7',
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
              color: '#3A2E24',
              fontFamily: 'SedgwickAve',
            }}
          />

          <TextInput
            editable={false}
            placeholder="Select date"
            value={todoDue}
            placeholderTextColor="#A89C8E"
            style={{
              borderWidth: 1,
              borderColor: '#D7C9B7',
              borderRadius: 8,
              padding: 10,
              marginBottom: 8,
              color: '#3A2E24',
              fontFamily: 'SedgwickAve',
            }}
          />

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <Pressable
              onPress={() => setShowTodoCalendar((prev) => !prev)}
              style={{
                backgroundColor: '#8B5E3C',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Pick date</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setTodoDate(null);
                setTodoDue('');
                setShowTodoCalendar(false);
              }}
              style={{
                backgroundColor: '#C9B8A6',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Clear</Text>
            </Pressable>
          </View>

          {showTodoCalendar && (
            <View
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 10,
                overflow: 'hidden',
                marginBottom: 10,
              }}
            >
              <CalendarWithYear
                onDayPress={(day) => onTodoDateSelect(day.dateString)}
                markedDates={
                  todoDate
                    ? {
                        [todoDate]: {
                          selected: true,
                          selectedColor: '#4C7744',
                          selectedTextColor: '#FFFFFF',
                        },
                      }
                    : undefined
                }
                theme={{
                  backgroundColor: '#FFFFFF',
                  calendarBackground: '#FFFFFF',
                  textSectionTitleColor: '#4C7744',
                  dayTextColor: '#3A2E24',
                  todayTextColor: '#8B5E3C',
                  monthTextColor: '#4C7744',
                  arrowColor: '#4C7744',
                  textMonthFontFamily: 'SedgwickAve',
                  textDayHeaderFontFamily: 'SedgwickAve',
                  textDayFontFamily: 'SedgwickAve',
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                }}
              />
            </View>
          )}

          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Color</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
            {colorOptions.map((color) => {
              const selected = todoColor === color;
              return (
                <Pressable
                  key={`todo-color-${color}`}
                  onPress={() => setTodoColor(color)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: color,
                    borderWidth: selected ? 2 : 1,
                    borderColor: selected ? '#3A2E24' : '#E0D6C7',
                  }}
                />
              );
            })}
          </View>

          <TextInput
            placeholder="Notes"
            value={todoNotes}
            onChangeText={setTodoNotes}
            placeholderTextColor="#A89C8E"
            multiline
            style={{
              borderWidth: 1,
              borderColor: '#D7C9B7',
              borderRadius: 8,
              padding: 10,
              minHeight: 70,
              marginBottom: 12,
              color: '#3A2E24',
              fontFamily: 'SedgwickAve',
            }}
          />

          <Pressable
            onPress={addTodo}
            style={{
              backgroundColor: canAddTodo ? '#8B5E3C' : '#C9B8A6',
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'SedgwickAve' }}>
              {editingTodoId ? 'Save To-Do' : 'Add To-Do'}
            </Text>
          </Pressable>
          {editingTodoId && (
            <Pressable
              onPress={() => {
                setEditingTodoId(null);
                setTodoTitle('');
                setTodoDue('');
                setTodoDate(null);
                setTodoNotes('');
                setTodoColor('#4C7744');
                setShowTodoCalendar(false);
              }}
              style={{ marginTop: 8, alignItems: 'center' }}
            >
              <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Cancel edit</Text>
            </Pressable>
          )}
        </View>
      )}
    </>
  );

  const renderChoreItem = ({ item, drag, isActive }: RenderItemParams<Chore>) => (
    <Pressable
      onPress={() => toggleChore(item.id)}
      onLongPress={drag}
      delayLongPress={180}
      disabled={isActive}
      style={{
        backgroundColor: item.completed ? '#E4EFE3' : '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5DDCC',
        padding: 12,
        marginBottom: 10,
        opacity: isActive ? 0.85 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text
          style={{
            fontSize: 18,
            color: '#3A2E24',
            textDecorationLine: item.completed ? 'line-through' : 'none',
            fontFamily: 'SedgwickAve',
          }}
        >
          {item.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: item.color ?? '#8B5E3C',
            }}
          />
          <Pressable
            onPress={() => {
              setEditingChoreId(item.id);
              setTitle(item.title);
              setFrequency(item.frequency);
              setDue(item.due);
              setNotes(item.notes);
              setChoreColor(item.color ?? '#8B5E3C');
              setShowChoreForm(true);
            }}
          >
            <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Edit</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              Alert.alert('Delete chore?', 'This will remove the chore and its Almanac dates.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    removeAlmanacEntries(item.almanacIds);
                    setChores((prev) => prev.filter((entry) => entry.id !== item.id));
                  },
                },
              ])
            }
          >
            <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve' }}>Delete</Text>
          </Pressable>
        </View>
      </View>
      {!!item.frequency && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
          <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>{item.frequency}</Text>
          {item.due.length > 0 && (
            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
              {item.due
                .map(
                  (day) =>
                    ({
                      Sunday: 'Sun',
                      Monday: 'Mon',
                      Tuesday: 'Tue',
                      Wednesday: 'Wed',
                      Thursday: 'Thu',
                      Friday: 'Fri',
                      Saturday: 'Sat',
                    })[day] ?? day
                )
                .join(', ')}
            </Text>
          )}
        </View>
      )}
      {!!item.notes && (
        <Text style={{ color: '#6E5B4B', marginTop: 4, fontFamily: 'SedgwickAve' }}>
          {item.notes}
        </Text>
      )}
    </Pressable>
  );

  const renderTodoItem =
    (allowDrag: boolean) =>
    ({ item, drag, isActive }: RenderItemParams<Todo>) => (
    <Pressable
      onPress={() => toggleTodo(item.id)}
      onLongPress={allowDrag ? drag : undefined}
      delayLongPress={180}
      disabled={isActive || !allowDrag}
      style={{
        backgroundColor: item.completed ? '#E4EFE3' : '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5DDCC',
        padding: 12,
        marginBottom: 10,
        opacity: isActive ? 0.85 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: '#8B5E3C',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: item.completed ? '#EADBCB' : '#FFFDF6',
            }}
          >
            {item.completed ? (
              <Text style={{ color: '#3A2E24', fontSize: 12, fontFamily: 'SedgwickAve' }}>X</Text>
            ) : null}
          </View>
          <Text
            style={{
              fontSize: 18,
              color: '#3A2E24',
              textDecorationLine: item.completed ? 'line-through' : 'none',
              fontFamily: 'SedgwickAve',
            }}
          >
            {item.title}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: item.color ?? '#4C7744',
            }}
          />
          <Pressable
            onPress={() => {
              setEditingTodoId(item.id);
              setTodoTitle(item.title);
              setTodoDue(item.due);
              setTodoDate(item.date);
              setTodoNotes(item.notes);
              setTodoColor(item.color ?? '#4C7744');
              setShowTodoForm(true);
            }}
          >
            <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Edit</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              Alert.alert('Delete to-do?', 'This will remove it from the Almanac.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    if (item.almanacId) {
                      removeAlmanacEntries([item.almanacId]);
                    }
                    setTodos((prev) => prev.filter((entry) => entry.id !== item.id));
                  },
                },
              ])
            }
          >
            <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve' }}>Delete</Text>
          </Pressable>
        </View>
      </View>
      {!!item.due && (
        <Text style={{ color: '#6E5B4B', marginTop: 1, fontFamily: 'SedgwickAve' }}>
          Due: {item.due}
        </Text>
      )}
      {!!item.notes && (
        <Text style={{ color: '#6E5B4B', marginTop: 2, fontFamily: 'SedgwickAve' }}>
          {item.notes}
        </Text>
      )}
    </Pressable>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F5F0E1' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
      >
        {activeList === 'chores' ? (
          <>
            {renderChoreHeader()}
            {chores.length === 0 ? (
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                No chores yet. Add one above.
              </Text>
            ) : (
              <DraggableFlatList
                data={chores}
                keyExtractor={(item) => item.id}
                renderItem={renderChoreItem}
                onDragEnd={({ data }) => setChores(data)}
                scrollEnabled={false}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </>
        ) : (
          <>
            {renderTodoHeader()}
            {todos.length === 0 ? (
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                No To-Do's yet. Add one above.
              </Text>
            ) : (
        <DraggableFlatList
          data={sortedTodos}
          keyExtractor={(item) => item.id}
          renderItem={renderTodoItem(!sortTodosByDate)}
          onDragEnd={({ data }) => {
            if (!sortTodosByDate) {
              setTodos(data);
            }
          }}
          scrollEnabled={false}
          keyboardShouldPersistTaps="handled"
        />
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
