/**
 * Data Display Components
 * Card, Badge, Metric, Progress components for dashboard and analytics
 */

import * as React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { BadgeVariant, BaseComponentProps, MetricProps as DesignSystemMetricProps, CardProps as DesignSystemCardProps, BadgeProps as DesignSystemBadgeProps, ProgressProps as DesignSystemProgressProps } from '../types/designSystem';

// Default theme values as fallbacks
const defaultTheme = {
  colors: {
    primary: { 500: '#00D4FF' },
    secondary: { 500: '#4ECDC4' },
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      600: '#757575',
      700: '#424242',
      900: '#212121'
    },
    success: '#00FF88',
    warning: '#FFCA28',
    error: '#FF6B6B',
    info: '#00D4FF'
  },
  spacing: {
    borderRadius: '8px'
  }
};

// ===== CARD COMPONENT =====
export interface CardProps extends BaseComponentProps {
  title?: string;
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
  interactive?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
}

const cardAnimation = keyframes`
  0% { opacity: 0; transform: translateY(4px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const CardContainer = styled.div<{
  variant: CardProps['variant'];
  padding: CardProps['padding'];
  interactive: boolean;
}>`
  background: ${({ variant }) => 
    variant === 'flat' 
      ? 'transparent'
      : variant === 'outlined' 
        ? defaultTheme.colors.gray[50]
        : defaultTheme.colors.gray[100]
  };
  
  border: ${({ variant }) =>
    variant === 'outlined' 
      ? `1px solid ${defaultTheme.colors.gray[300]}`
      : variant === 'flat' 
        ? 'none'
        : `1px solid ${defaultTheme.colors.gray[200]}`
  };

  border-radius: ${({ variant }) =>
    variant === 'flat' ? '0' : defaultTheme.spacing.borderRadius
  };

  box-shadow: ${({ variant }) => {
    switch (variant) {
      case 'elevated':
        return '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      case 'outlined':
      case 'flat':
        return 'none';
      default:
        return '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
    }
  }};

  padding: ${({ padding }) => {
    switch (padding) {
      case 'none': return '0';
      case 'small': return '12px';
      case 'large': return '32px';
      default: return '20px';
    }
  }};

  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${cardAnimation} 0.3s ease-out;

  ${({ interactive }) => interactive && css`
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    &:active {
      transform: translateY(-1px);
    }

    &:focus-visible {
      outline: 2px solid ${defaultTheme.colors.primary[500]};
      outline-offset: 2px;
    }
  `}
`;

export const Card: React.FC<CardProps> = ({
  children,
  title,
  variant = 'default',
  padding = 'medium',
  interactive = false,
  className,
  onClick,
  'aria-label': ariaLabel,
  ...props
}) => (
  <CardContainer
    variant={variant}
    padding={padding}
    interactive={interactive}
    className={className}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    aria-label={ariaLabel}
    onKeyDown={(e) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick();
      }
    }}
    {...props}
  >
    {title && <h3 style={{ margin: '0 0 16px 0', color: 'inherit' }}>{title}</h3>}
    {children}
  </CardContainer>
);

// ===== BADGE COMPONENT =====
export interface BadgeProps extends BaseComponentProps {
  variant?: BadgeVariant;
  size?: 'small' | 'medium' | 'large';
}

const BadgeContainer = styled.span<{
  variant: BadgeProps['variant'];
  size: BadgeProps['size'];
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: ${defaultTheme.spacing.borderRadius};
  line-height: 1;
  white-space: nowrap;

  font-size: ${({ size }) => {
    switch (size) {
      case 'small': return '0.75rem';
      case 'large': return '1rem';
      default: return '0.875rem';
    }
  }};

  padding: ${({ size }) => {
    switch (size) {
      case 'small': return '4px 8px';
      case 'large': return '8px 16px';
      default: return '6px 12px';
    }
  }};

  background-color: ${({ variant }) => {
    switch (variant) {
      case 'success': return defaultTheme.colors.success;
      case 'warning': return defaultTheme.colors.warning;
      case 'error': return defaultTheme.colors.error;
      case 'danger': return defaultTheme.colors.error;
      case 'info': return defaultTheme.colors.info;
      case 'secondary': return defaultTheme.colors.secondary[500];
      case 'primary': return defaultTheme.colors.primary[500];
      default: return defaultTheme.colors.primary[500];
    }
  }};

  color: ${({ variant }) => {
    switch (variant) {
      case 'warning': return defaultTheme.colors.gray[900];
      default: return defaultTheme.colors.gray[50];
    }
  }};

  border: 1px solid ${({ variant }) => {
    switch (variant) {
      case 'success': return defaultTheme.colors.success;
      case 'warning': return defaultTheme.colors.warning;
      case 'error': return defaultTheme.colors.error;
      case 'danger': return defaultTheme.colors.error;
      case 'info': return defaultTheme.colors.info;
      case 'secondary': return defaultTheme.colors.secondary[500];
      case 'primary': return defaultTheme.colors.primary[500];
      default: return defaultTheme.colors.primary[500];
    }
  }};
`;

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  className,
  ...props
}) => (
  <BadgeContainer
    variant={variant}
    size={size}
    className={className}
    {...props}
  >
    {children}
  </BadgeContainer>
);

// ===== METRIC COMPONENT =====
export interface MetricProps extends BaseComponentProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'danger' | 'info';
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period?: string;
  };
  icon?: React.ReactNode;
  format?: 'number' | 'percentage' | 'time' | 'currency';
}

const MetricContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${defaultTheme.colors.gray[600]};
  font-size: 0.875rem;
  font-weight: 500;
`;

const MetricValue = styled.div`
  color: ${defaultTheme.colors.gray[900]};
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
`;

const MetricChange = styled.div<{ changeType: 'increase' | 'decrease' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ changeType }) => 
    changeType === 'increase' 
      ? defaultTheme.colors.success
      : defaultTheme.colors.error
  };
`;

const formatValue = (value: string | number, format?: MetricProps['format']): string => {
  if (typeof value === 'string') return value;
  
  switch (format) {
    case 'percentage':
      return `${value}%`;
    case 'time':
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value % 3600) / 60);
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    case 'number':
    default:
      return new Intl.NumberFormat().format(value);
  }
};

export const Metric: React.FC<MetricProps> = ({
  label,
  value,
  variant: _variant = 'default',
  change,
  icon,
  format,
  className,
  ...props
}) => (
  <MetricContainer className={className} {...props}>
    <MetricHeader>
      {icon}
      {label}
    </MetricHeader>
    <MetricValue>
      {formatValue(value, format)}
    </MetricValue>
    {change && (
      <MetricChange changeType={change.type}>
        <span>{change.type === 'increase' ? '↗' : '↘'}</span>
        {Math.abs(change.value)}%
        {change.period && <span>vs {change.period}</span>}
      </MetricChange>
    )}
  </MetricContainer>
);

// ===== PROGRESS COMPONENT =====
export interface ProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'danger' | 'info';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

const progressAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${defaultTheme.colors.gray[700]};
`;

const ProgressTrack = styled.div<{
  size: ProgressProps['size'];
}>`
  width: 100%;
  background-color: ${defaultTheme.colors.gray[200]};
  border-radius: ${defaultTheme.spacing.borderRadius};
  overflow: hidden;
  
  height: ${({ size }) => {
    switch (size) {
      case 'small': return '4px';
      case 'large': return '12px';
      default: return '8px';
    }
  }};
`;

const ProgressFill = styled.div<{
  value: number;
  max: number;
  variant: ProgressProps['variant'];
  animated: boolean;
}>`
  height: 100%;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: inherit;
  
  width: ${({ value, max }) => Math.min((value / max) * 100, 100)}%;
  
  background: ${({ variant, animated }) => {
    const color = (() => {
      switch (variant) {
        case 'primary': return defaultTheme.colors.primary[500];
        case 'success': return defaultTheme.colors.success;
        case 'warning': return defaultTheme.colors.warning;
        case 'error': return defaultTheme.colors.error;
        case 'danger': return defaultTheme.colors.error;
        case 'info': return defaultTheme.colors.info;
        default: return defaultTheme.colors.primary[500];
      }
    })();
    
    if (animated) {
      return `linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 50%, ${color} 50%, ${color} 75%, transparent 75%, transparent)`;
    }
    return color;
  }};

  ${({ animated }) => animated && css`
    background-size: 20px 20px;
    animation: ${progressAnimation} 2s linear infinite;
  `}
`;

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  variant = 'default',
  size = 'medium',
  showLabel = true,
  label,
  animated = false,
  className,
  ...props
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <ProgressContainer className={className} {...props}>
      {showLabel && (
        <ProgressLabel>
          <span>{label || 'Progress'}</span>
          <span>{Math.round(percentage)}%</span>
        </ProgressLabel>
      )}
      <ProgressTrack size={size}>
        <ProgressFill
          value={value}
          max={max}
          variant={variant}
          animated={animated}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        />
      </ProgressTrack>
    </ProgressContainer>
  );
};