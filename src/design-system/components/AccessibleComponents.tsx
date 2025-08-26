/**
 * Pointer Quest Design System - Accessible Components
 * 
 * WCAG 2.1 AA compliant React components for educational interfaces.
 * Ensures inclusive design for all learners.
 */

import React, { ReactNode, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../theme';
import { 
  focusVisible, 
  screenReaderOnly, 
  respectsReducedMotion,
  generateAriaLabel,
  AccessibilityAnnouncer
} from '../utils/accessibility';

// Skip Link Component
const SkipLinkContainer = styled.a`
  position: absolute;
  top: -40px;
  left: 6px;
  background: ${theme.colors.primary[500]};
  color: ${theme.colors.text.primary};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  text-decoration: none;
  border-radius: ${theme.borderRadius.sm};
  z-index: ${theme.zIndex.skipLink};
  font-weight: ${theme.typography.fontWeight.semibold};
  
  &:focus {
    top: 6px;
  }
  
  ${focusVisible}
`;

export const SkipLink: React.FC<{ targetId: string; children: ReactNode }> = ({ 
  targetId, 
  children 
}) => (
  <SkipLinkContainer href={`#${targetId}`}>
    {children}
  </SkipLinkContainer>
);

// Screen Reader Only Text
const ScreenReaderText = styled.span`
  ${screenReaderOnly}
`;

export const ScreenReaderOnly: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ScreenReaderText>{children}</ScreenReaderText>
);

// Accessible Heading with proper hierarchy
interface AccessibleHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  id?: string;
  className?: string;
}

const HeadingStyles = styled.div<{ level: number }>`
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.bold};
  line-height: ${theme.typography.lineHeight.tight};
  margin: ${theme.spacing[4]} 0 ${theme.spacing[2]} 0;
  
  ${props => {
    switch (props.level) {
      case 1: return `font-size: ${theme.typography.fontSize['5xl']};`;
      case 2: return `font-size: ${theme.typography.fontSize['4xl']};`;
      case 3: return `font-size: ${theme.typography.fontSize['3xl']};`;
      case 4: return `font-size: ${theme.typography.fontSize['2xl']};`;
      case 5: return `font-size: ${theme.typography.fontSize['xl']};`;
      case 6: return `font-size: ${theme.typography.fontSize['lg']};`;
      default: return `font-size: ${theme.typography.fontSize['lg']};`;
    }
  }}
`;

export const AccessibleHeading: React.FC<AccessibleHeadingProps> = ({ 
  level, 
  children, 
  id, 
  className 
}) => {
  const headingProps = {
    ...(id && { id }),
    className
  };
  
  return React.createElement(
    `h${level}` as keyof JSX.IntrinsicElements,
    headingProps,
    React.createElement(
      HeadingStyles,
      { level },
      children
    )
  );
};

// Accessible Button with proper ARIA
interface AccessibleButtonProps {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AccessibleButtonStyles = styled.button<{ 
  variant: string; 
  size: string; 
  disabled: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  min-height: 44px; /* WCAG AA minimum touch target */
  padding: ${props => {
    switch (props.size) {
      case 'sm': return `${theme.spacing[2]} ${theme.spacing[3]}`;
      case 'lg': return `${theme.spacing[4]} ${theme.spacing[6]}`;
      default: return `${theme.spacing[3]} ${theme.spacing[4]}`;
    }
  }};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-size: ${theme.typography.fontSize.base};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut};
  user-select: none;
  
  ${props => {
    const opacity = props.disabled ? 0.6 : 1;
    switch (props.variant) {
      case 'secondary':
        return `
          background: ${theme.colors.gray[700]};
          color: ${theme.colors.text.primary};
          opacity: ${opacity};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.gray[600]};
            transform: translateY(-1px);
          }
        `;
      case 'danger':
        return `
          background: ${theme.colors.error};
          color: ${theme.colors.text.primary};
          opacity: ${opacity};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.topics.advanced.danger};
            transform: translateY(-1px);
          }
        `;
      default:
        return `
          background: ${theme.colors.primary[500]};
          color: ${theme.colors.text.primary};
          opacity: ${opacity};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.primary[400]};
            transform: translateY(-1px);
          }
        `;
    }
  }}
  
  ${focusVisible}
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border: 2px solid;
  }
`;

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  onClick,
  children,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  variant = 'primary',
  size = 'md',
  className
}) => {
  const announcer = AccessibilityAnnouncer.getInstance();
  
  const handleClick = () => {
    if (!disabled) {
      onClick();
      // Announce the action to screen readers
      if (ariaLabel) {
        announcer.announceInteraction(ariaLabel, 'activated');
      }
    }
  };
  
  return (
    <AccessibleButtonStyles
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      variant={variant}
      size={size}
      className={className}
    >
      {children}
    </AccessibleButtonStyles>
  );
};

// Accessible Code Block with proper semantics
interface AccessibleCodeBlockProps {
  code: string;
  language: string;
  title?: string;
  description?: string;
  children?: ReactNode;
}

const CodeContainer = styled.div`
  background: ${theme.colors.background.code};
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.lg};
  margin: ${theme.spacing[4]} 0;
`;

const CodeHeader = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const LanguageBadge = styled.span`
  background: ${theme.colors.primary[500]};
  color: ${theme.colors.text.primary};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  text-transform: uppercase;
`;

const CodeContent = styled.pre`
  margin: 0;
  padding: ${theme.spacing[4]};
  color: ${theme.colors.text.code};
  font-family: ${theme.typography.fontFamily.code};
  font-size: ${theme.typography.fontSize.sm};
  line-height: ${theme.typography.lineHeight.relaxed};
  overflow-x: auto;
  white-space: pre;
  
  /* Ensure good contrast for syntax highlighting */
  .keyword { color: #569CD6; font-weight: bold; }
  .string { color: #CE9178; }
  .comment { color: #6A9955; font-style: italic; }
  .number { color: #B5CEA8; }
  .operator { color: #D4D4D4; }
`;

export const AccessibleCodeBlock: React.FC<AccessibleCodeBlockProps> = ({
  code,
  language,
  title,
  description,
  children
}) => {
  const codeId = `code-block-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = `${codeId}-description`;
  const lineCount = code.split('\n').length;
  
  const ariaLabel = generateAriaLabel.codeBlock(language, lineCount);
  
  return (
    <CodeContainer role="region" aria-labelledby={codeId} aria-describedby={description ? descriptionId : undefined}>
      <CodeHeader>
        <LanguageBadge>{language}</LanguageBadge>
        {title && (
          <AccessibleHeading level={4} id={codeId}>
            {title}
          </AccessibleHeading>
        )}
        <ScreenReaderOnly>
          {ariaLabel}
        </ScreenReaderOnly>
      </CodeHeader>
      
      {description && (
        <div id={descriptionId} style={{ 
          padding: theme.spacing[3], 
          color: theme.colors.text.secondary,
          fontSize: theme.typography.fontSize.sm
        }}>
          {description}
        </div>
      )}
      
      <CodeContent lang={language} role="textbox" aria-readonly="true" tabIndex={0}>
        {code}
      </CodeContent>
      
      {children}
    </CodeContainer>
  );
};

// Accessible Progress Indicator
interface AccessibleProgressProps {
  value: number;
  max?: number;
  label: string;
  showPercentage?: boolean;
  color?: string;
  className?: string;
}

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  margin: ${theme.spacing[2]} 0;
`;

const ProgressLabel = styled.label`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  min-width: fit-content;
`;

const ProgressBar = styled.div<{ color: string }>`
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: ${props => props.color};
    border-radius: ${theme.borderRadius.full};
    transition: width ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut};
    
    ${respectsReducedMotion('transition: width 0.3s ease;')}
  }
`;

const ProgressValue = styled.span`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  font-family: ${theme.typography.fontFamily.code};
  min-width: 3ch;
  text-align: right;
`;

export const AccessibleProgress: React.FC<AccessibleProgressProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = theme.colors.primary[500],
  className
}) => {
  const percentage = Math.round((value / max) * 100);
  const progressId = `progress-${Math.random().toString(36).substr(2, 9)}`;
  
  // Announce progress changes to screen readers
  useEffect(() => {
    const announcer = AccessibilityAnnouncer.getInstance();
    announcer.announce(`${label}: ${percentage}% complete`);
  }, [percentage, label]);
  
  return (
    <ProgressContainer className={className}>
      <ProgressLabel htmlFor={progressId}>
        {label}
      </ProgressLabel>
      
      <ProgressBar
        color={color}
        role="progressbar"
        id={progressId}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={generateAriaLabel.progress(value, max, percentage)}
        style={{ '--progress-width': `${percentage}%` } as React.CSSProperties & { [key: string]: string }}
      />
      
      {showPercentage && (
        <ProgressValue aria-hidden="true">
          {percentage}%
        </ProgressValue>
      )}
      
      <ScreenReaderOnly>
        Progress: {value} of {max}, {percentage} percent complete
      </ScreenReaderOnly>
    </ProgressContainer>
  );
};

// Accessible Modal/Dialog
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  closeOnEscapeKey?: boolean;
  closeOnBackdropClick?: boolean;
}

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  padding: ${theme.spacing[4]};
`;

const ModalContent = styled.div`
  background: ${theme.colors.background.secondary};
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  
  ${focusVisible}
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[4]};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize['2xl']};
  cursor: pointer;
  padding: ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.sm};
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${focusVisible}
  
  &:hover {
    color: ${theme.colors.text.primary};
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  closeOnEscapeKey = true,
  closeOnBackdropClick = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  
  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (closeOnEscapeKey && event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscapeKey, onClose]);
  
  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);
  
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <ModalOverlay isOpen={isOpen} onClick={handleBackdropClick}>
      <ModalContent
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <ModalHeader>
          <AccessibleHeading level={2} id={titleId}>
            {title}
          </AccessibleHeading>
          
          <CloseButton
            onClick={onClose}
            aria-label="Close dialog"
            title="Close dialog"
          >
            ✕
          </CloseButton>
        </ModalHeader>
        
        <div>
          {children}
        </div>
      </ModalContent>
    </ModalOverlay>
  );
};

