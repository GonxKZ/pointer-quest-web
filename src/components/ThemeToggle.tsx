/**
 * Theme Toggle Component
 * Provides accessible theme switching controls with visual feedback
 */

import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { useTheme } from '../context/ThemeContext';
import { ThemeName } from '../design-system/themes';

// Styled components
const ThemeToggleContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const ThemeButton = styled.button<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 2px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.theme.colors.background.surface};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.normal} ${props => props.theme.animation.easing.easeOut};
  font-size: 1.2rem;
  position: relative;
  overflow: hidden;

  /* Accessibility focus ring */
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.border.focus};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary[500]}40;
  }

  /* Hover effects */
  &:hover {
    background: ${props => props.theme.colors.background.hover};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  /* Active state */
  ${props => props.isActive && css`
    background: linear-gradient(45deg, ${props.theme.colors.primary[500]}, ${props.theme.colors.secondary[500]});
    color: ${props.theme.colors.text.inverse};
    border-color: ${props.theme.colors.primary[500]};
    box-shadow: ${props.theme.shadows.glow};
  `}

  /* Pressed state */
  &:active {
    transform: translateY(0);
  }

  /* Disabled state */
  &:disabled {
    background: ${props => props.theme.colors.background.disabled};
    color: ${props => props.theme.colors.text.disabled};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* High contrast mode adjustments */
  @media (prefers-contrast: high) {
    border-width: 3px;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    
    &:hover {
      transform: none;
    }
  }
`;

const ThemeDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + ${props => props.theme.spacing[2]});
  right: 0;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  backdrop-filter: blur(10px);
  min-width: 200px;
  z-index: ${props => props.theme.zIndex.dropdown};
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-8px)'};
  transition: all ${props => props.theme.animation.duration.normal} ${props => props.theme.animation.easing.easeOut};

  @media (prefers-reduced-motion: reduce) {
    transition: opacity ${props => props.theme.animation.duration.fast};
    transform: none;
  }
`;

const ThemeOption = styled.button<{ isSelected?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.text.primary};
  text-align: left;
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSize.sm};
  gap: ${props => props.theme.spacing[3]};
  transition: background-color ${props => props.theme.animation.duration.fast};

  &:first-child {
    border-top-left-radius: ${props => props.theme.borderRadius.lg};
    border-top-right-radius: ${props => props.theme.borderRadius.lg};
  }

  &:last-child {
    border-bottom-left-radius: ${props => props.theme.borderRadius.lg};
    border-bottom-right-radius: ${props => props.theme.borderRadius.lg};
  }

  &:hover {
    background: ${props => props.theme.colors.background.hover};
  }

  &:focus {
    outline: none;
    background: ${props => props.theme.colors.background.active};
    box-shadow: inset 2px 0 0 ${props => props.theme.colors.primary[500]};
  }

  ${props => props.isSelected && css`
    background: ${props.theme.colors.primary[500]}20;
    color: ${props.theme.colors.primary[500]};
    font-weight: ${props.theme.typography.fontWeight.medium};
  `}
`;

const ThemeIcon = styled.span`
  font-size: 1.1rem;
  width: 20px;
  display: inline-block;
`;

const ThemeLabel = styled.span`
  flex: 1;
`;

const SystemIndicator = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.tertiary};
  font-style: italic;
`;

const AutoDetectionToggle = styled.div`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border-top: 1px solid ${props => props.theme.colors.border.secondary};
`;

const ToggleSwitch = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};

  input {
    position: relative;
    width: 40px;
    height: 20px;
    appearance: none;
    background: ${props => props.theme.colors.background.input};
    border: 1px solid ${props => props.theme.colors.border.primary};
    border-radius: ${props => props.theme.borderRadius.full};
    cursor: pointer;
    transition: all ${props => props.theme.animation.duration.normal};

    &:checked {
      background: ${props => props.theme.colors.primary[500]};
      border-color: ${props => props.theme.colors.primary[500]};
    }

    &::before {
      content: '';
      position: absolute;
      top: 1px;
      left: 1px;
      width: 16px;
      height: 16px;
      background: white;
      border-radius: ${props => props.theme.borderRadius.full};
      transition: transform ${props => props.theme.animation.duration.normal};
    }

    &:checked::before {
      transform: translateX(18px);
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px ${props => props.theme.colors.primary[500]}40;
    }
  }
`;

// Theme configuration
const themeConfig: Record<ThemeName, { icon: string; label: string; description: string }> = {
  dark: {
    icon: '🌙',
    label: 'Dark',
    description: 'Dark theme for low-light environments'
  },
  light: {
    icon: '☀️',
    label: 'Light', 
    description: 'Light theme for bright environments'
  },
  'high-contrast': {
    icon: '🔆',
    label: 'High Contrast',
    description: 'High contrast theme for accessibility'
  }
};

// Component props
interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'button' | 'dropdown' | 'inline';
}

/**
 * Theme Toggle Component
 */
export function ThemeToggle({ 
  className,
  showLabel: _showLabel = false,
  size: _size = 'medium',
  variant = 'dropdown'
}: ThemeToggleProps) {
  const { 
    theme: _theme, 
    themeName, 
    setTheme, 
    toggleTheme, 
    isSystemTheme, 
    setSystemTheme, 
    availableThemes 
  } = useTheme();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        setIsDropdownOpen(false);
        break;
      case 'Enter':
      case ' ':
        if (variant === 'button') {
          event.preventDefault();
          toggleTheme();
        } else {
          event.preventDefault();
          setIsDropdownOpen(!isDropdownOpen);
        }
        break;
    }
  };

  // Handle theme selection
  const handleThemeSelect = (selectedTheme: ThemeName) => {
    setTheme(selectedTheme);
    setIsDropdownOpen(false);
  };

  // Handle auto-detection toggle
  const handleAutoDetectionToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSystemTheme(event.target.checked);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && !(event.target as Element).closest('[data-theme-toggle]')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Simple button variant
  if (variant === 'button') {
    return (
      <ThemeToggleContainer className={className} data-theme-toggle>
        <ThemeButton
          onClick={toggleTheme}
          onKeyDown={handleKeyDown}
          title={`Switch to ${themeName === 'dark' ? 'light' : 'dark'} theme`}
          aria-label={`Current theme: ${themeConfig[themeName].label}. Click to toggle theme.`}
        >
          {themeConfig[themeName].icon}
        </ThemeButton>
      </ThemeToggleContainer>
    );
  }

  // Dropdown variant (default)
  return (
    <ThemeToggleContainer className={className} data-theme-toggle>
      <ThemeButton
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        onKeyDown={handleKeyDown}
        isActive={isDropdownOpen}
        title="Change theme"
        aria-label="Theme selector"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        {themeConfig[themeName].icon}
      </ThemeButton>

      <ThemeDropdown 
        isOpen={isDropdownOpen}
        role="menu"
        aria-label="Theme options"
      >
        {availableThemes.map((themeOption) => (
          <ThemeOption
            key={themeOption}
            onClick={() => handleThemeSelect(themeOption)}
            isSelected={themeName === themeOption && !isSystemTheme}
            role="menuitem"
            aria-label={`${themeConfig[themeOption].label} theme`}
          >
            <ThemeIcon>{themeConfig[themeOption].icon}</ThemeIcon>
            <ThemeLabel>{themeConfig[themeOption].label}</ThemeLabel>
            {themeName === themeOption && isSystemTheme && (
              <SystemIndicator>(auto)</SystemIndicator>
            )}
          </ThemeOption>
        ))}

        <AutoDetectionToggle>
          <ToggleSwitch>
            <input
              type="checkbox"
              checked={isSystemTheme}
              onChange={handleAutoDetectionToggle}
              aria-label="Automatically detect system theme preference"
            />
            <span>Auto-detect system preference</span>
          </ToggleSwitch>
        </AutoDetectionToggle>
      </ThemeDropdown>
    </ThemeToggleContainer>
  );
}

export default ThemeToggle;