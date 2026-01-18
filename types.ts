export type Page = 'BASE' | 'STREAMS' | 'BASEPULSE' | 'MISSIONS' | 'NOTEBM' | 'SETTINGS' | 'TODO';

export interface DiaryEntry {
  id: string;
  date: string; // ISO String
  type: 'FACT' | 'LIFE';
  content: string;
  lastUpdated: string;
}

export interface Mission {
  id: string;
  title: string;
  category: 'EVERYDAY' | 'FINITE';
  status: 'PENDING' | 'COMPLETED';
  deadline?: string;
  description?: string;
}

export interface Document {
  id: string;
  title: string;
  type: 'DIARY_EXPORT' | 'PROJECT' | 'MEAL_PLAN' | 'OTHER';
  content: string;
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  isThinking?: boolean;
}

export interface ToDoItem {
  id: string;
  text: string;
  completed: boolean;
  reminderTime?: string; // ISO String
  reminderFrequency?: number; // Minutes
  lastReminded?: string; // ISO String
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'TODO' | 'MISSION' | 'SYSTEM';
}

export interface AppState {
  currentPage: Page;
  userProfile: {
    name: string;
    career: string;
    birthday: string;
    phoneNumber?: string;
    aiVoice?: string;
  };
  diaryEntries: DiaryEntry[];
  missions: Mission[];
  documents: Document[];
  chatHistory: ChatMessage[];
  toDos: ToDoItem[];
  notifications: AppNotification[];
  basePulseLog: string[];
}