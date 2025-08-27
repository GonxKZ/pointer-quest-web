/**
 * Theme Context for Pointer Quest
 * Provides theme management with dark/light mode switching and system preference detection
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { themes, Theme, ThemeName, generateCSSCustomProperties, mediaQueries } from '../design-system/themes';

// Theme context types
interface ThemeContextValue {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
  isSystemTheme: boolean;
  setSystemTheme: (useSystem: boolean) => void;
  availableThemes: ThemeName[];
  themePreferences: ThemePreferences;
  updateThemePreference: (key: keyof ThemePreferences, value: any) => void;
}

interface ThemePreferences {
  mode: ThemeName | 'auto';
  respectSystemPreferences: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  reducedTransparency: boolean;
}

// Default theme preferences
const defaultPreferences: ThemePreferences = {
  mode: 'auto',
  respectSystemPreferences: true,
  highContrast: false,
  reducedMotion: false,
  reducedTransparency: false
};

// Storage keys
const STORAGE_KEYS = {
  THEME_MODE: 'pq-theme-mode',
  THEME_PREFERENCES: 'pq-theme-preferences'
} as const;

// Create context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeName;
  storageKey?: string;
}

/**
 * Theme Provider Component
 * Manages theme state, system preference detection, and persistence
 */
export function ThemeProvider({ 
  children, 
  defaultMode = 'dark',
  storageKey = STORAGE_KEYS.THEME_MODE
}: ThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(defaultMode);
  const [isSystemTheme, setIsSystemTheme] = useState(false);
  const [themePreferences, setThemePreferences] = useState<ThemePreferences>(defaultPreferences);

  // Get current theme object
  const theme = themes[themeName];

  // Available theme options
  const availableThemes: ThemeName[] = Object.keys(themes) as ThemeName[];

  /**
   * Detect system theme preference
   */
  const detectSystemTheme = useCallback((): ThemeName => {
    // Check for high contrast first (accessibility priority)
    if (window.matchMedia(mediaQueries.prefersHighContrast).matches) {
      return 'high-contrast';
    }
    
    // Check for dark/light mode preference
    if (window.matchMedia(mediaQueries.prefersDarkMode).matches) {
      return 'dark';
    }
    
    if (window.matchMedia(mediaQueries.prefersLightMode).matches) {
      return 'light';
    }
    
    // Default fallback
    return 'dark';
  }, []);

  /**
   * Update system accessibility preferences
   */
  const updateSystemPreferences = useCallback(() => {
    const newPreferences: Partial<ThemePreferences> = {
      highContrast: window.matchMedia(mediaQueries.prefersHighContrast).matches,
      reducedMotion: window.matchMedia(mediaQueries.prefersReducedMotion).matches,
      reducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)').matches
    };
    
    setThemePreferences(prev => ({ ...prev, ...newPreferences }));
  }, []);

  /**
   * Load theme from storage
   */
  const loadThemeFromStorage = useCallback(() => {
    try {
      // Load theme mode
      const savedMode = localStorage.getItem(storageKey) as ThemeName | 'auto';
      
      // Load theme preferences
      const savedPreferences = localStorage.getItem(STORAGE_KEYS.THEME_PREFERENCES);
      const preferences = savedPreferences ? JSON.parse(savedPreferences) : defaultPreferences;
      
      setThemePreferences(preferences);
      
      if (savedMode === 'auto' || preferences.respectSystemPreferences) {
        const systemTheme = detectSystemTheme();
        setThemeName(systemTheme);
        setIsSystemTheme(true);
      } else if (savedMode && availableThemes.includes(savedMode)) {
        setThemeName(savedMode);
        setIsSystemTheme(false);
      }
    } catch (error) {
      console.warn('[Theme] Failed to load theme from storage:', error);
    }
  }, [storageKey, detectSystemTheme, availableThemes]);

  /**
   * Save theme to storage
   */
  const saveThemeToStorage = useCallback((mode: ThemeName | 'auto', preferences: ThemePreferences) => {
    try {
      localStorage.setItem(storageKey, mode);
      localStorage.setItem(STORAGE_KEYS.THEME_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.warn('[Theme] Failed to save theme to storage:', error);
    }
  }, [storageKey]);

  /**
   * Set theme manually
   */
  const setTheme = useCallback((newTheme: ThemeName) => {
    setThemeName(newTheme);
    setIsSystemTheme(false);
    
    const newPreferences = { ...themePreferences, mode: newTheme as ThemeName };
    setThemePreferences(newPreferences);
    saveThemeToStorage(newTheme, newPreferences);
  }, [themePreferences, saveThemeToStorage]);

  /**
   * Toggle between dark and light themes
   */
  const toggleTheme = useCallback(() => {
    const nextTheme = themeName === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [themeName, setTheme]);

  /**
   * Enable/disable system theme tracking
   */
  const setSystemTheme = useCallback((useSystem: boolean) => {
    if (useSystem) {
      const systemTheme = detectSystemTheme();
      setThemeName(systemTheme);
      setIsSystemTheme(true);
      
      const newPreferences = { ...themePreferences, mode: 'auto' as const, respectSystemPreferences: true };
      setThemePreferences(newPreferences);
      saveThemeToStorage('auto', newPreferences);
    } else {
      setIsSystemTheme(false);
      const newPreferences = { ...themePreferences, respectSystemPreferences: false };
      setThemePreferences(newPreferences);
      saveThemeToStorage(themeName, newPreferences);
    }
  }, [detectSystemTheme, themePreferences, themeName, saveThemeToStorage]);

  /**
   * Update individual theme preference
   */
  const updateThemePreference = useCallback((key: keyof ThemePreferences, value: any) => {
    const newPreferences = { ...themePreferences, [key]: value };
    setThemePreferences(newPreferences);
    saveThemeToStorage(isSystemTheme ? 'auto' : themeName, newPreferences);
    
    // Apply special handling for certain preferences
    if (key === 'highContrast' && value) {
      setTheme('high-contrast');
    } else if (key === 'respectSystemPreferences' && value) {
      setSystemTheme(true);
    }
  }, [themePreferences, isSystemTheme, themeName, saveThemeToStorage, setTheme, setSystemTheme]);

  /**
   * Handle system theme changes
   */
  useEffect(() => {
    if (!isSystemTheme || !themePreferences.respectSystemPreferences) return;

    const mediaQueries = [
      window.matchMedia('(prefers-color-scheme: dark)'),
      window.matchMedia('(prefers-color-scheme: light)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-reduced-transparency: reduce)')
    ];

    const handleSystemThemeChange = () => {
      const newTheme = detectSystemTheme();
      setThemeName(newTheme);
      updateSystemPreferences();
    };

    // Add listeners
    mediaQueries.forEach(mq => {
      mq.addEventListener('change', handleSystemThemeChange);
    });

    // Initial update
    updateSystemPreferences();

    // Cleanup
    return () => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', handleSystemThemeChange);
      });
    };
  }, [isSystemTheme, themePreferences.respectSystemPreferences, detectSystemTheme, updateSystemPreferences]);

  /**
   * Load theme on mount
   */
  useEffect(() => {
    loadThemeFromStorage();
  }, [loadThemeFromStorage]);

  /**
   * Apply CSS custom properties when theme changes
   */
  useEffect(() => {
    const cssVars = generateCSSCustomProperties(theme);
    
    // Apply CSS variables to document root
    Object.entries(cssVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    // Apply theme class to body for additional styling
    document.body.className = document.body.className
      .replace(/pq-theme-\w+/g, '')
      .concat(` pq-theme-${themeName}`)
      .trim();

    // Apply accessibility preferences
    if (themePreferences.reducedMotion) {
      document.documentElement.style.setProperty('--pq-animation-duration', '0ms');
    }

    if (themePreferences.reducedTransparency) {
      document.documentElement.style.setProperty('--pq-glass-opacity', '1');
    }

  }, [theme, themeName, themePreferences]);

  // Context value
  const contextValue: ThemeContextValue = {
    theme,
    themeName,
    setTheme,
    toggleTheme,
    isSystemTheme,
    setSystemTheme,
    availableThemes,
    themePreferences,
    updateThemePreference
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
}

/**
 * Theme hook
 * Provides access to theme context with error handling
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

/**
 * Theme selector hook
 * Simplified hook for components that only need theme object
 */
export function useThemeMode(): [Theme, ThemeName, (theme: ThemeName) => void] {
  const { theme, themeName, setTheme } = useTheme();
  return [theme, themeName, setTheme];
}

/**
 * System theme detection hook
 * For components that need to react to system changes
 */
export function useSystemTheme(): [ThemeName, boolean] {
  const [systemTheme, setSystemTheme] = useState<ThemeName>('dark');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if system theme detection is supported
    const hasSystemThemeSupport = window.matchMedia && window.matchMedia('(prefers-color-scheme)').media !== 'not all';
    setIsSupported(hasSystemThemeSupport);

    if (!hasSystemThemeSupport) return;

    const detectTheme = (): ThemeName => {
      if (window.matchMedia('(prefers-contrast: high)').matches) {
        return 'high-contrast';
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    };

    const updateTheme = () => setSystemTheme(detectTheme());

    // Initial detection
    updateTheme();

    // Listen for changes
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const lightModeQuery = window.matchMedia('(prefers-color-scheme: light)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    darkModeQuery.addEventListener('change', updateTheme);
    lightModeQuery.addEventListener('change', updateTheme);
    highContrastQuery.addEventListener('change', updateTheme);

    return () => {
      darkModeQuery.removeEventListener('change', updateTheme);
      lightModeQuery.removeEventListener('change', updateTheme);
      highContrastQuery.removeEventListener('change', updateTheme);
    };
  }, []);

  return [systemTheme, isSupported];
}

/**
 * Accessibility preferences hook
 */
export function useAccessibilityPreferences() {
  const { themePreferences, updateThemePreference } = useTheme();
  
  return {
    preferences: themePreferences,
    updatePreference: updateThemePreference,
    respectsReducedMotion: themePreferences.reducedMotion,
    respectsHighContrast: themePreferences.highContrast,
    respectsReducedTransparency: themePreferences.reducedTransparency
  };
}