/**
 * Pointer Quest Design System - Button Component
 * 
 * Unified button component with consistent styling and behavior across all lessons.
 * Supports multiple variants, sizes, and states for educational interactions.
 */

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../theme';

// Button variant types
export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'ghost' 
  | 'outline';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

// Button props interface
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isFullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

// Variant styles
const variantStyles = {
  primary: css`
    background: linear-gradient(45deg, ${theme.colors.primary[500]}, ${theme.colors.secondary[500]});
    color: ${theme.colors.text.primary};
    border: none;
    
    &:hover {
      background: linear-gradient(45deg, ${theme.colors.primary[600]}, ${theme.colors.secondary[600]});
      box-shadow: ${theme.shadows.glow};
    }
    
    &:active {
      background: linear-gradient(45deg, ${theme.colors.primary[700]}, ${theme.colors.secondary[700]});
    }
  `,
  
  secondary: css`
    background: ${theme.colors.background.glass};
    color: ${theme.colors.text.primary};
    border: 1px solid ${theme.colors.gray[600]};
    
    &:hover {
      background: ${theme.colors.gray[800]};
      border-color: ${theme.colors.gray[500]};
    }
    
    &:active {
      background: ${theme.colors.gray[900]};
    }
  `,
  
  success: css`
    background: linear-gradient(45deg, ${theme.colors.success}, #00CC66);
    color: ${theme.colors.gray[900]};
    border: none;
    
    &:hover {
      background: linear-gradient(45deg, #00CC66, #009944);
      box-shadow: 0 4px 15px rgba(0, 255, 136, 0.4);
    }
    
    &:active {
      background: linear-gradient(45deg, #009944, #006622);
    }
  `,
  
  warning: css`
    background: linear-gradient(45deg, ${theme.colors.warning}, #FFA000);
    color: ${theme.colors.gray[900]};
    border: none;
    
    &:hover {
      background: linear-gradient(45deg, #FFA000, #FF8F00);
      box-shadow: 0 4px 15px rgba(255, 202, 40, 0.4);
    }
    
    &:active {
      background: linear-gradient(45deg, #FF8F00, #FF6F00);
    }
  `,
  
  danger: css`
    background: linear-gradient(45deg, ${theme.colors.error}, #FF5252);
    color: ${theme.colors.text.primary};
    border: none;
    
    &:hover {
      background: linear-gradient(45deg, #FF5252, #F44336);
      box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
    }
    
    &:active {
      background: linear-gradient(45deg, #F44336, #E53935);
    }
  `,
  
  ghost: css`
    background: transparent;
    color: ${theme.colors.primary[500]};
    border: none;
    
    &:hover {
      background: rgba(0, 212, 255, 0.1);
      color: ${theme.colors.primary[400]};
    }
    
    &:active {
      background: rgba(0, 212, 255, 0.2);
    }
  `,
  
  outline: css`
    background: transparent;
    color: ${theme.colors.primary[500]};
    border: 1px solid ${theme.colors.primary[500]};
    
    &:hover {
      background: ${theme.colors.primary[500]};
      color: ${theme.colors.text.primary};
      box-shadow: ${theme.shadows.glow};
    }
    
    &:active {
      background: ${theme.colors.primary[600]};
      border-color: ${theme.colors.primary[600]};
    }
  `
};

// Size styles
const sizeStyles = {
  sm: css`
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    font-size: ${theme.typography.fontSize.sm};
    min-height: 2rem;
  `,
  
  md: css`
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    font-size: ${theme.typography.fontSize.base};
    min-height: 2.5rem;
  `,
  
  lg: css`
    padding: ${theme.spacing[4]} ${theme.spacing[6]};
    font-size: ${theme.typography.fontSize.lg};
    min-height: 3rem;
  `,
  
  xl: css`
    padding: ${theme.spacing[5]} ${theme.spacing[8]};
    font-size: ${theme.typography.fontSize.xl};
    min-height: 3.5rem;
  `
};

// Base button styles
const StyledButton = styled.button<ButtonProps>`
  /* Reset and base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.semibold};
  line-height: ${theme.typography.lineHeight.normal};
  text-decoration: none;
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  user-select: none;
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut};
  position: relative;
  overflow: hidden;
  
  /* Apply variant styles */
  ${props => variantStyles[props.variant || 'primary']}
  
  /* Apply size styles */
  ${props => sizeStyles[props.size || 'md']}
  
  /* Full width modifier */
  ${props => props.isFullWidth && css`
    width: 100%;
  `}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
  
  /* Loading state */
  ${props => props.isLoading && css`
    pointer-events: none;
    opacity: 0.8;
  `}
  
  /* Hover effect for all variants */
  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  
  /* Focus styles for accessibility */
  &:focus-visible {
    outline: 2px solid ${theme.colors.primary[500]};
    outline-offset: 2px;
  }
  
  /* Active state */
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  /* Ripple effect */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.3s ease, height 0.3s ease;
  }
  
  &:active::before {
    width: 300px;
    height: 300px;
  }
`;

const LoadingSpinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const IconWrapper = styled.span<{ position: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  
  ${props => props.position === 'left' && css`
    margin-right: -${theme.spacing[1]};
  `}
  
  ${props => props.position === 'right' && css`
    margin-left: -${theme.spacing[1]};
  `}
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isFullWidth = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      isLoading={isLoading}
      isFullWidth={isFullWidth}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <LoadingSpinner />}
      
      {!isLoading && leftIcon && (
        <IconWrapper position="left">{leftIcon}</IconWrapper>
      )}
      
      {!isLoading && children}
      
      {!isLoading && rightIcon && (
        <IconWrapper position="right">{rightIcon}</IconWrapper>
      )}
    </StyledButton>
  );
};

// Button group component for multiple related buttons
export const ButtonGroup = styled.div<{ orientation?: 'horizontal' | 'vertical'; spacing?: keyof typeof theme.spacing }>`
  display: flex;
  flex-direction: ${props => props.orientation === 'vertical' ? 'column' : 'row'};
  gap: ${props => theme.spacing[props.spacing || '2']};
  align-items: ${props => props.orientation === 'vertical' ? 'stretch' : 'center'};
  flex-wrap: wrap;
`;

// Icon button variant for compact actions
export const IconButton = styled(Button)<{ size?: ButtonSize }>`
  min-width: auto;
  aspect-ratio: 1;
  padding: ${props => {
    switch (props.size) {
      case 'sm': return theme.spacing[2];
      case 'lg': return theme.spacing[4];
      case 'xl': return theme.spacing[5];
      default: return theme.spacing[3];
    }
  }};
`;

// Educational-specific button variants
export const LessonActionButton = styled(Button).attrs({
  size: 'lg' as const
})`
  min-width: 200px;
  font-weight: ${theme.typography.fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.wide};
`;

export const CodeActionButton = styled(Button).attrs({
  variant: 'outline' as const,
  size: 'sm' as const
})`
  font-family: ${theme.typography.fontFamily.code};
  font-size: ${theme.typography.fontSize.xs};
  min-width: auto;
`;

export const NavigationButton = styled(Button).attrs({
  variant: 'ghost' as const
})`
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
  
  &:hover {
    color: ${theme.colors.text.primary};
  }
  
  &:disabled {
    color: ${theme.colors.text.muted};
  }
`;

export default Button;