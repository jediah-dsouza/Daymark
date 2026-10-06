import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { createSampleData } from '../data/sampleData';
import {
  DEFAULT_PREFERENCES,
  type AppData,
  type Preferences,
  type PersistenceStatus,
} from '../types';
import {
  getBrowserStorage,
  loadAppData,
  serializeAppData,
  STORAGE_KEY,
  type LoadResult,
} from '../services/storage/localStorage';
import { appDataReducer } from './reducer';

interface AppContextValue {
  data: AppData;
  persistenceStatus: PersistenceStatus;
  storageMessage: string | null;
  recoveryMessage: string | null;
  updatePreferences: (patch: Partial<Preferences>) => void;
  replaceData: (next: AppData) => void;
  updateData: (update: (current: AppData) => AppData) => void;
  restoreSampleData: () => boolean;
  clearLocalData: () => boolean;
  retryPersistence: () => boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

function applyTheme(preferences: Preferences): () => void {
  const root = document.documentElement;
  const media =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;
  const update = () => {
    const dark =
      preferences.theme === 'dark' || (preferences.theme === 'system' && Boolean(media?.matches));
    root.dataset.theme = dark ? 'dark' : 'light';
    root.dataset.compact = String(preferences.compactMode);
    root.dataset.reducedMotion = String(preferences.reducedMotion);
    root.style.colorScheme = dark ? 'dark' : 'light';
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeColor) themeColor.content = dark ? '#1d201d' : '#f5f2ea';
  };
  update();
  if (preferences.theme !== 'system' || !media) return () => undefined;
  const onChange = () => update();
  media.addEventListener?.('change', onChange);
  return () => media.removeEventListener?.('change', onChange);
}

export function AppProvider({ children }: PropsWithChildren) {
  const storageRef = useRef<ReturnType<typeof getBrowserStorage>>(null);
  const initialRef = useRef<LoadResult | null>(null);
  const firstEffectRef = useRef(true);
  const [data, dispatch] = useReducer(appDataReducer, undefined, () => {
    storageRef.current = getBrowserStorage();
    initialRef.current = loadAppData(storageRef.current);
    return initialRef.current.data;
  });
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceStatus>(
    initialRef.current?.status ?? 'memory-only',
  );
  const [storageMessage, setStorageMessage] = useState<string | null>(
    initialRef.current?.storageMessage ?? null,
  );
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(
    initialRef.current?.recoveryMessage ?? null,
  );

  useEffect(() => {
    if (firstEffectRef.current) {
      firstEffectRef.current = false;
      if (!initialRef.current?.persistOnMount) return;
    }
    if (!storageRef.current) {
      setPersistenceStatus('memory-only');
      setStorageMessage(
        'Daymark could not reach local storage. Changes will remain in this page only.',
      );
      return;
    }
    try {
      storageRef.current.setItem(STORAGE_KEY, serializeAppData(data));
      setPersistenceStatus('available');
      setStorageMessage(null);
      setRecoveryMessage(null);
    } catch {
      setPersistenceStatus('memory-only');
      setStorageMessage(
        'Daymark could not save to local storage. Your current changes remain visible here, but may not survive a reload.',
      );
    }
  }, [data]);

  useEffect(() => applyTheme(data.preferences), [data.preferences]);

  const updatePreferences = useCallback((patch: Partial<Preferences>) => {
    dispatch({ type: 'preferences/update', patch });
  }, []);
  const replaceData = useCallback((next: AppData) => {
    dispatch({ type: 'data/replace', data: next });
    setRecoveryMessage(null);
  }, []);
  const updateData = useCallback((update: (current: AppData) => AppData) => {
    dispatch({ type: 'data/update', update });
  }, []);
  const persistReplacement = useCallback((next: AppData, failureMessage: string): boolean => {
    const storage = storageRef.current ?? getBrowserStorage();
    storageRef.current = storage;
    if (!storage) {
      setPersistenceStatus('memory-only');
      setStorageMessage(failureMessage);
      return false;
    }
    try {
      storage.setItem(STORAGE_KEY, serializeAppData(next));
    } catch {
      setPersistenceStatus('memory-only');
      setStorageMessage(failureMessage);
      return false;
    }
    dispatch({ type: 'data/replace', data: next });
    setPersistenceStatus('available');
    setStorageMessage(null);
    setRecoveryMessage(null);
    return true;
  }, []);
  const restoreSampleData = useCallback(() => {
    const sampleData = {
      ...createSampleData(),
      preferences: { ...DEFAULT_PREFERENCES },
    };
    const saved = persistReplacement(
      sampleData,
      'Daymark could not save the sample workspace. It is available in this page only; retry saving before you leave.',
    );
    if (!saved) {
      dispatch({ type: 'data/replace', data: sampleData });
      setRecoveryMessage(null);
    }
    return saved;
  }, [persistReplacement]);
  const clearLocalData = useCallback(
    () =>
      persistReplacement(
        {
          tasks: [],
          projects: [],
          activity: [],
          preferences: { ...DEFAULT_PREFERENCES },
        },
        'Daymark could not clear the saved workspace. Your current data has not been changed.',
      ),
    [persistReplacement],
  );
  const retryPersistence = useCallback((): boolean => {
    const storage = storageRef.current ?? getBrowserStorage();
    storageRef.current = storage;
    if (!storage) {
      setPersistenceStatus('memory-only');
      setStorageMessage('Local storage is still unavailable in this browser.');
      return false;
    }
    try {
      storage.setItem(STORAGE_KEY, serializeAppData(data));
      setPersistenceStatus('available');
      setStorageMessage(null);
      setRecoveryMessage(null);
      return true;
    } catch {
      setPersistenceStatus('memory-only');
      setStorageMessage(
        'Daymark still cannot save to local storage. Check browser storage permissions and try again.',
      );
      return false;
    }
  }, [data]);

  const value = useMemo(
    () => ({
      data,
      persistenceStatus,
      storageMessage,
      recoveryMessage,
      updatePreferences,
      replaceData,
      updateData,
      restoreSampleData,
      clearLocalData,
      retryPersistence,
    }),
    [
      data,
      persistenceStatus,
      storageMessage,
      recoveryMessage,
      updatePreferences,
      replaceData,
      updateData,
      restoreSampleData,
      clearLocalData,
      retryPersistence,
    ],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider.');
  return context;
}
