import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Page, DiaryEntry, Mission, Document, ChatMessage, ToDoItem, AppNotification } from '../types';
import { addMinutes, isPast, parseISO } from 'date-fns';

interface AppContextType extends AppState {
  setPage: (page: Page) => void;
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'lastUpdated'>) => void;
  addMission: (mission: Omit<Mission, 'id' | 'status'>) => void;
  toggleMissionStatus: (id: string) => void;
  deleteMission: (id: string) => void;
  addDocument: (doc: Omit<Document, 'id' | 'lastUpdated'>) => void;
  deleteDocument: (id: string) => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id'>) => void;
  clearChat: () => void;
  addToDo: (text: string, reminderTime?: string, reminderFrequency?: number) => void;
  toggleToDo: (id: string) => void;
  deleteToDo: (id: string) => void;
  updateUserProfile: (profile: Partial<AppState['userProfile']>) => void;
  addLog: (log: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetAppData: () => void;
}

const defaultState: AppState = {
  currentPage: 'BASE',
  userProfile: {
    name: 'Noh',
    career: 'Developer',
    birthday: '1995-05-15',
    phoneNumber: '',
    aiVoice: 'Kore',
  },
  diaryEntries: [],
  missions: [],
  documents: [],
  chatHistory: [
    { id: '1', role: 'model', text: 'Hello Noh, BasePulse is online. How can I assist you today?', timestamp: new Date().toISOString() }
  ],
  toDos: [],
  notifications: [],
  basePulseLog: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from local storage or use default
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('lifebm_state');
    return saved ? JSON.parse(saved) : defaultState;
  });

  useEffect(() => {
    localStorage.setItem('lifebm_state', JSON.stringify(state));
  }, [state]);

  // Request Notification Permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Reminder Worker
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      let hasUpdates = false;
      
      const updatedToDos = state.toDos.map(todo => {
        if (todo.completed) return todo;
        
        // Skip if no reminder set
        if (!todo.reminderTime && !todo.reminderFrequency) return todo;

        let shouldRemind = false;
        let referenceTime = todo.reminderTime ? parseISO(todo.reminderTime) : null;
        const lastReminded = todo.lastReminded ? parseISO(todo.lastReminded) : null;

        // Case 1: Specific Time Reminder
        if (referenceTime && !lastReminded) {
          if (isPast(referenceTime)) {
            shouldRemind = true;
          }
        }
        
        // Case 2: Recurring Reminder (based on Last Reminded OR start time)
        if (todo.reminderFrequency) {
           const baseTime = lastReminded || referenceTime || now;
           if (lastReminded) {
               const nextReminder = addMinutes(lastReminded, todo.reminderFrequency);
               if (isPast(nextReminder)) {
                   shouldRemind = true;
               }
           } else if (referenceTime && isPast(referenceTime)) {
               shouldRemind = true;
           } else if (!referenceTime && !lastReminded) {
               shouldRemind = true; 
           }
        }

        if (shouldRemind) {
          hasUpdates = true;
          
          // Trigger System Notification
          if ('Notification' in window && Notification.permission === 'granted') {
              if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.ready.then(registration => {
                      registration.showNotification('LifeBM Task Reminder', {
                          body: `${todo.text}\n(Tap to open)`,
                          icon: 'https://cdn-icons-png.flaticon.com/512/9386/9386918.png',
                          vibrate: [200, 100, 200],
                          tag: `todo-${todo.id}`,
                          renotify: true,
                          requireInteraction: true // Keeps it on screen
                      } as any);
                  });
              } else {
                  new Notification('LifeBM Task Reminder', { body: todo.text });
              }
          }

          // Add App Notification history
          addNotificationInternal({
            title: 'Task Reminder',
            message: `It's time for: ${todo.text}`,
            type: 'TODO'
          });

          // Return updated todo with new lastReminded time
          return { ...todo, lastReminded: now.toISOString() };
        }

        return todo;
      });

      if (hasUpdates) {
        setState(prev => ({ ...prev, toDos: updatedToDos }));
      }
    };

    const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [state.toDos]);

  const addNotificationInternal = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    setState(prev => ({
        ...prev,
        notifications: [
            {
                ...notif,
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                read: false
            },
            ...prev.notifications
        ]
    }));
  };

  const setPage = (page: Page) => setState(prev => ({ ...prev, currentPage: page }));

  const addDiaryEntry = (entry: Omit<DiaryEntry, 'id' | 'lastUpdated'>) => {
    const newEntry: DiaryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, diaryEntries: [newEntry, ...prev.diaryEntries] }));
    addLog(`Diary Entry Added: ${entry.type} - ${entry.date}`);
  };

  const addMission = (mission: Omit<Mission, 'id' | 'status'>) => {
    const newMission: Mission = {
      ...mission,
      id: crypto.randomUUID(),
      status: 'PENDING',
    };
    setState(prev => ({ ...prev, missions: [newMission, ...prev.missions] }));
    addNotificationInternal({ title: 'New Mission', message: `Mission "${mission.title}" has been added.`, type: 'MISSION' });
    addLog(`Mission Created: ${mission.title}`);
  };

  const toggleMissionStatus = (id: string) => {
    setState(prev => ({
      ...prev,
      missions: prev.missions.map(m => m.id === id ? { ...m, status: m.status === 'PENDING' ? 'COMPLETED' : 'PENDING' } : m)
    }));
  };

  const deleteMission = (id: string) => {
    setState(prev => ({
      ...prev,
      missions: prev.missions.filter(m => m.id !== id)
    }));
  };

  const addDocument = (doc: Omit<Document, 'id' | 'lastUpdated'>) => {
    const newDoc: Document = {
      ...doc,
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, documents: [newDoc, ...prev.documents] }));
    addLog(`Document Created: ${doc.title}`);
  };

  const deleteDocument = (id: string) => {
    setState(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== id)
    }));
  };

  const addChatMessage = (msg: Omit<ChatMessage, 'id'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: crypto.randomUUID(),
    };
    setState(prev => ({ ...prev, chatHistory: [...prev.chatHistory, newMsg] }));
  };

  const clearChat = () => {
    setState(prev => ({
      ...prev,
      chatHistory: [{ id: crypto.randomUUID(), role: 'model', text: 'Chat history cleared. I am ready for new tasks.', timestamp: new Date().toISOString() }]
    }));
    addLog('Chat history cleared');
  };

  const addToDo = (text: string, reminderTime?: string, reminderFrequency?: number) => {
    const newTodo: ToDoItem = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      reminderTime,
      reminderFrequency
    };
    setState(prev => ({ ...prev, toDos: [newTodo, ...prev.toDos] }));
    addLog(`To-Do Added: ${text}`);
  };

  const toggleToDo = (id: string) => {
    setState(prev => ({
      ...prev,
      toDos: prev.toDos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  };

  const deleteToDo = (id: string) => {
    setState(prev => ({
      ...prev,
      toDos: prev.toDos.filter(t => t.id !== id)
    }));
  };

  const updateUserProfile = (profile: Partial<AppState['userProfile']>) => {
    setState(prev => ({ ...prev, userProfile: { ...prev.userProfile, ...profile } }));
  };

  const addLog = (log: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setState(prev => ({ ...prev, basePulseLog: [`[${timestamp}] ${log}`, ...prev.basePulseLog] }));
  };

  const markNotificationRead = (id: string) => {
      setState(prev => ({
          ...prev,
          notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      }));
  };

  const clearAllNotifications = () => {
      setState(prev => ({ ...prev, notifications: [] }));
  };

  const resetAppData = () => {
    if(confirm('Are you sure you want to wipe all data? This cannot be undone.')) {
        setState(defaultState);
        localStorage.removeItem('lifebm_state');
    }
  };

  return (
    <AppContext.Provider value={{
      ...state,
      setPage,
      addDiaryEntry,
      addMission,
      toggleMissionStatus,
      deleteMission,
      addDocument,
      deleteDocument,
      addChatMessage,
      clearChat,
      addToDo,
      toggleToDo,
      deleteToDo,
      updateUserProfile,
      addLog,
      markNotificationRead,
      clearAllNotifications,
      resetAppData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};