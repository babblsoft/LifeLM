import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Page, DiaryEntry, Mission, Document, ChatMessage, ToDoItem, AppNotification } from '../types';

interface UserProfile {
  name: string;
  career: string;
  birthday: string;
  phoneNumber?: string;
  aiVoice?: string;
  googleClientId?: string;
}

interface AppContextType {
  currentPage: Page;
  setPage: (page: Page) => void;
  user: string | null;
  loadingAuth: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => void;
  diaryEntries: DiaryEntry[];
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'lastUpdated'>) => void;
  missions: Mission[];
  addMission: (mission: Omit<Mission, 'id' | 'status'>) => void;
  toggleMissionStatus: (id: string) => void;
  deleteMission: (id: string) => void;
  documents: Document[];
  addDocument: (doc: Omit<Document, 'id' | 'lastUpdated'>) => void;
  deleteDocument: (id: string) => void;
  chatHistory: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id'>) => void;
  clearChat: () => void;
  toDos: ToDoItem[];
  addToDo: (text: string, reminderTime?: string, reminderFrequency?: number) => void;
  toggleToDo: (id: string) => void;
  deleteToDo: (id: string) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  basePulseLog: string[];
  addLog: (log: string) => void;
  resetAppData: () => void;
  speak: (text: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // State definitions matching inferred usage
  const [currentPage, setCurrentPage] = useState<Page>('BASE');
  const [user, setUser] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // Data States
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'User',
    career: 'Explorer',
    birthday: '',
    aiVoice: 'Kore'
  });
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [toDos, setToDos] = useState<ToDoItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [basePulseLog, setBasePulseLog] = useState<string[]>([]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const loadData = () => {
      const storedUser = localStorage.getItem('lifebm_user');
      if (storedUser) {
        setUser(storedUser);
        
        const storedProfile = localStorage.getItem('lifebm_profile');
        if (storedProfile) setUserProfile(JSON.parse(storedProfile));
        
        const storedDiary = localStorage.getItem('lifebm_diary');
        if (storedDiary) setDiaryEntries(JSON.parse(storedDiary));

        const storedMissions = localStorage.getItem('lifebm_missions');
        if (storedMissions) setMissions(JSON.parse(storedMissions));
        
        const storedDocs = localStorage.getItem('lifebm_docs');
        if (storedDocs) setDocuments(JSON.parse(storedDocs));
        
        const storedChat = localStorage.getItem('lifebm_chat');
        if (storedChat) setChatHistory(JSON.parse(storedChat));
        
        const storedTodos = localStorage.getItem('lifebm_todos');
        if (storedTodos) setToDos(JSON.parse(storedTodos));
        
        const storedNotifs = localStorage.getItem('lifebm_notifs');
        if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
      }
      setLoadingAuth(false);
    };
    loadData();
  }, []);

  // Persist helpers
  const save = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  const login = async (email: string) => {
    localStorage.setItem('lifebm_user', email);
    setUser(email);
  };

  const logout = () => {
    localStorage.removeItem('lifebm_user');
    setUser(null);
    setPage('BASE');
  };

  const setPage = (page: Page) => setCurrentPage(page);

  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    save('lifebm_profile', profile);
  };

  const resetAppData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const addDiaryEntry = (entry: Omit<DiaryEntry, 'id' | 'lastUpdated'>) => {
    const newEntry: DiaryEntry = { 
      ...entry, 
      id: Date.now().toString(), 
      lastUpdated: new Date().toISOString() 
    };
    const updated = [newEntry, ...diaryEntries];
    setDiaryEntries(updated);
    save('lifebm_diary', updated);
  };

  const addMission = (mission: Omit<Mission, 'id' | 'status'>) => {
    const newMission: Mission = { 
      ...mission, 
      id: Date.now().toString(), 
      status: 'PENDING' 
    };
    const updated = [newMission, ...missions];
    setMissions(updated);
    save('lifebm_missions', updated);
    addNotification('New Mission', `Mission "${mission.title}" has been initialized.`, 'MISSION');
  };

  const toggleMissionStatus = (id: string) => {
    const updated = missions.map(m => m.id === id ? { ...m, status: (m.status === 'PENDING' ? 'COMPLETED' : 'PENDING') as 'PENDING' | 'COMPLETED' } : m);
    setMissions(updated);
    save('lifebm_missions', updated);
  };

  const deleteMission = (id: string) => {
    const updated = missions.filter(m => m.id !== id);
    setMissions(updated);
    save('lifebm_missions', updated);
  };

  const addDocument = (doc: Omit<Document, 'id' | 'lastUpdated'>) => {
    const newDoc: Document = { 
      ...doc, 
      id: Date.now().toString(), 
      lastUpdated: new Date().toISOString() 
    };
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    save('lifebm_docs', updated);
  };

  const deleteDocument = (id: string) => {
    const updated = documents.filter(d => d.id !== id);
    setDocuments(updated);
    save('lifebm_docs', updated);
  };

  const addChatMessage = (msg: Omit<ChatMessage, 'id'>) => {
    const newMsg: ChatMessage = { ...msg, id: Date.now().toString() };
    const updated = [...chatHistory, newMsg];
    setChatHistory(updated);
    save('lifebm_chat', updated);
  };

  const clearChat = () => {
    setChatHistory([]);
    save('lifebm_chat', []);
  };

  const addToDo = (text: string, reminderTime?: string, reminderFrequency?: number) => {
    const newTodo: ToDoItem = {
      id: Date.now().toString(),
      text,
      completed: false,
      reminderTime,
      reminderFrequency
    };
    const updated = [newTodo, ...toDos];
    setToDos(updated);
    save('lifebm_todos', updated);
    addNotification('To-Do Added', `Task "${text}" added to your list.`, 'TODO');
  };

  const toggleToDo = (id: string) => {
    const updated = toDos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setToDos(updated);
    save('lifebm_todos', updated);
  };

  const deleteToDo = (id: string) => {
    const updated = toDos.filter(t => t.id !== id);
    setToDos(updated);
    save('lifebm_todos', updated);
  };

  const addNotification = (title: string, message: string, type: 'TODO' | 'MISSION' | 'SYSTEM') => {
    const newNotif: AppNotification = {
      id: Date.now().toString(),
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    save('lifebm_notifs', updated);
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    save('lifebm_notifs', updated);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    save('lifebm_notifs', []);
  };

  const addLog = (log: string) => {
    setBasePulseLog(prev => [log, ...prev]);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Simple voice selection based on profile if available in browser
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
          utterance.voice = voices.find(v => v.name.includes('Google')) || voices[0];
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const value = {
    currentPage,
    setPage,
    user,
    loadingAuth,
    login,
    logout,
    userProfile,
    updateUserProfile,
    diaryEntries,
    addDiaryEntry,
    missions,
    addMission,
    toggleMissionStatus,
    deleteMission,
    documents,
    addDocument,
    deleteDocument,
    chatHistory,
    addChatMessage,
    clearChat,
    toDos,
    addToDo,
    toggleToDo,
    deleteToDo,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    basePulseLog,
    addLog,
    resetAppData,
    speak
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};