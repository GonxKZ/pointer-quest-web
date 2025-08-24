import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { UserProgress, MemoryVisualization } from '../types';

interface AppState {
  userProgress: UserProgress;
  currentLesson: number;
  memoryVisualization: MemoryVisualization;
  is3DMode: boolean;
  showError: boolean;
  errorMessage: string;
  language: 'en' | 'es';
}

type AppAction =
  | { type: 'SET_CURRENT_LESSON'; payload: number }
  | { type: 'UPDATE_PROGRESS'; payload: Partial<UserProgress> }
  | { type: 'UPDATE_MEMORY'; payload: Partial<MemoryVisualization> }
  | { type: 'TOGGLE_3D_MODE' }
  | { type: 'SHOW_ERROR'; payload: string }
  | { type: 'HIDE_ERROR' }
  | { type: 'RESET_MEMORY' }
  | { type: 'CHANGE_LANGUAGE'; payload: 'en' | 'es' };

const initialState: AppState = {
  userProgress: {
    currentLesson: 1,
    completedLessons: [],
    totalScore: 0,
    achievements: [],
  },
  currentLesson: 1,
  memoryVisualization: {
    stack: [
      { id: 'stack_var1', type: 'stack', address: 0x1000, value: 'int x = 42', size: 4, color: '#00ff88' },
      { id: 'stack_var2', type: 'stack', address: 0x1004, value: 'char* ptr', size: 8, color: '#00d4ff' }
    ],
    heap: [
      { id: 'heap_block1', type: 'heap', address: 0x2000, value: 'new int[5]', size: 20, color: '#ff6b6b' },
      { id: 'heap_block2', type: 'heap', address: 0x2014, value: 'string data', size: 12, color: '#ffa500' }
    ],
    global: [
      { id: 'global_var', type: 'global', address: 0x3000, value: 'static var', size: 4, color: '#ff6b6b' }
    ],
    pointers: [
      { id: 'ptr1', name: 'ptr1', targetId: 'heap_block1', address: 0x1004, color: '#00ff88', type: 'raw' }
    ],
  },
  is3DMode: false,
  showError: false,
  errorMessage: '',
  language: 'en',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_LESSON':
      return { ...state, currentLesson: action.payload };

    case 'UPDATE_PROGRESS':
      return {
        ...state,
        userProgress: { ...state.userProgress, ...action.payload },
      };

    case 'UPDATE_MEMORY':
      return {
        ...state,
        memoryVisualization: { ...state.memoryVisualization, ...action.payload },
      };

    case 'TOGGLE_3D_MODE':
      return { ...state, is3DMode: !state.is3DMode };

    case 'SHOW_ERROR':
      return {
        ...state,
        showError: true,
        errorMessage: action.payload,
      };

    case 'HIDE_ERROR':
      return { ...state, showError: false, errorMessage: '' };

    case 'RESET_MEMORY':
      return {
        ...state,
        memoryVisualization: {
          stack: [],
          heap: [],
          global: [],
          pointers: [],
        },
      };

    case 'CHANGE_LANGUAGE':
      return { ...state, language: action.payload };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
