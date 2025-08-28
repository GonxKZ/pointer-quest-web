/**
 * WCAG 2.1 AA Compliant Form Components
 * Accessible form controls with comprehensive error handling and screen reader support
 */

import React, { useState, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { useAccessibility } from '../accessibility/AccessibilityManager';

// Types
interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  help?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  'aria-describedby'?: string;
  className?: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  error?: string;
  help?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

interface TextAreaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  error?: string;
  help?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

// Styled components with WCAG AA compliance
const FormGroup = styled.div<{ $hasError?: boolean }>`
  margin-bottom: ${props => props.theme.spacing[4]};
  
  ${props => props.$hasError && css`
    border-left: 4px solid ${props.theme.colors.error};
    padding-left: ${props.theme.spacing[3]};
    background: ${props.theme.colors.error}10;
    border-radius: ${props.theme.borderRadius.base};
  `}
`;

const Label = styled.label<{ $required?: boolean }>`
  display: block;
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[2]};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  
  ${props => props.$required && css`
    &::after {
      content: ' *';
      color: ${props.theme.colors.error};
      font-weight: ${props.theme.typography.fontWeight.bold};
      aria-label: 'required';
    }
  `}
  
  @media (prefers-contrast: high) {
    color: #ffffff;
    font-weight: ${props => props.theme.typography.fontWeight.bold};
  }
`;

const inputStyles = css<{ $hasError?: boolean }>`
  width: 100%;
  min-height: 44px; /* WCAG AA minimum touch target */
  padding: ${props => props.theme.spacing[3]};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-family: ${props => props.theme.typography.fontFamily.primary};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background.input};
  border: 2px solid ${props => props.$hasError ? props.theme.colors.error : props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.base};
  transition: all ${props => props.theme.animation.duration.normal};
  
  &:focus,
  &:focus-visible {
    outline: 3px solid #00d4ff;
    outline-offset: 2px;
    border-color: ${props => props.theme.colors.border.focus};
    box-shadow: 0 0 0 4px rgba(0, 212, 255, 0.3);
  }
  
  &:disabled {
    background: ${props => props.theme.colors.background.disabled};
    color: ${props => props.theme.colors.text.disabled};
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.placeholder};
    opacity: 1;
  }
  
  &:invalid:not(:focus) {
    border-color: ${props => props.theme.colors.error};
  }
  
  @media (prefers-contrast: high) {
    background: #000000 !important;
    color: #ffffff !important;
    border: 3px solid #ffffff !important;
    
    &:focus,
    &:focus-visible {
      outline: 3px solid #ffff00 !important;
      border-color: #ffff00 !important;
    }
  }
  
  @media (prefers-reduced-motion: reduce) {
    transition: border-color ${props => props.theme.animation.duration.fast};
  }
`;

const Input = styled.input<{ $hasError?: boolean }>`
  ${inputStyles}
`;

const Select = styled.select<{ $hasError?: boolean }>`
  ${inputStyles}
  cursor: pointer;
  
  option {
    background: ${props => props.theme.colors.background.surface};
    color: ${props => props.theme.colors.text.primary};
    padding: ${props => props.theme.spacing[2]};
  }
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  ${inputStyles}
  resize: vertical;
  min-height: 120px;
  font-family: ${props => props.theme.typography.fontFamily.primary};
`;

const HelpText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing[2]};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
  
  @media (prefers-contrast: high) {
    color: #cccccc;
  }
`;

const ErrorMessage = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.error};
  margin-top: ${props => props.theme.spacing[2]};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[2]};
  
  &::before {
    content: '⚠️';
    font-size: 1em;
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  @media (prefers-contrast: high) {
    color: #ff6666;
    font-weight: ${props => props.theme.typography.fontWeight.bold};
  }
`;

const RequiredIndicator = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const CharacterCount = styled.div<{ $isOverLimit?: boolean }>`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.$isOverLimit ? props.theme.colors.error : props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing[1]};
  text-align: right;
  
  @media (prefers-contrast: high) {
    color: ${props => props.$isOverLimit ? '#ff6666' : '#cccccc'};
  }
`;

// Form field components
export function AccessibleFormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  help,
  required = false,
  disabled = false,
  placeholder,
  pattern,
  minLength,
  maxLength,
  className
}: FormFieldProps) {
  const [hasBeenTouched, setHasBeenTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { announceToScreenReader } = useAccessibility();
  
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedByIds = [helpId, errorId].filter(Boolean).join(' ');
  
  useEffect(() => {
    if (error && hasBeenTouched) {
      announceToScreenReader(`Error in ${label}: ${error}`, 'assertive');
    }
  }, [error, hasBeenTouched, label, announceToScreenReader]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  
  const handleBlur = () => {
    setHasBeenTouched(true);
  };
  
  const currentLength = value.length;
  const showCharacterCount = maxLength && maxLength > 0;
  const isOverLimit = Boolean(maxLength && currentLength > maxLength);
  
  return (
    <FormGroup className={className} $hasError={!!error}>
      <Label htmlFor={id} $required={required}>
        {label}
        {required && (
          <RequiredIndicator>required</RequiredIndicator>
        )}
      </Label>
      
      <Input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        pattern={pattern}
        minLength={minLength}
        maxLength={maxLength}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedByIds || undefined}
        $hasError={!!error}
      />
      
      {help && (
        <HelpText id={helpId}>
          {help}
        </HelpText>
      )}
      
      {showCharacterCount && (
        <CharacterCount $isOverLimit={isOverLimit}>
          {currentLength}/{maxLength} characters
        </CharacterCount>
      )}
      
      {error && (
        <ErrorMessage 
          id={errorId} 
          role="alert" 
          aria-live="polite"
        >
          {error}
        </ErrorMessage>
      )}
    </FormGroup>
  );
}

export function AccessibleSelectField({
  id,
  label,
  value,
  onChange,
  options,
  error,
  help,
  required = false,
  disabled = false,
  className
}: SelectFieldProps) {
  const [hasBeenTouched, setHasBeenTouched] = useState(false);
  const { announceToScreenReader } = useAccessibility();
  
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedByIds = [helpId, errorId].filter(Boolean).join(' ');
  
  useEffect(() => {
    if (error && hasBeenTouched) {
      announceToScreenReader(`Error in ${label}: ${error}`, 'assertive');
    }
  }, [error, hasBeenTouched, label, announceToScreenReader]);
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
    const selectedOption = options.find(opt => opt.value === e.target.value);
    if (selectedOption) {
      announceToScreenReader(`Selected: ${selectedOption.label}`);
    }
  };
  
  const handleBlur = () => {
    setHasBeenTouched(true);
  };
  
  return (
    <FormGroup className={className} $hasError={!!error}>
      <Label htmlFor={id} $required={required}>
        {label}
        {required && (
          <RequiredIndicator>required</RequiredIndicator>
        )}
      </Label>
      
      <Select
        id={id}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        required={required}
        disabled={disabled}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedByIds || undefined}
        $hasError={!!error}
      >
        <option value="" disabled>
          Select {label.toLowerCase()}...
        </option>
        {options.map(option => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </Select>
      
      {help && (
        <HelpText id={helpId}>
          {help}
        </HelpText>
      )}
      
      {error && (
        <ErrorMessage 
          id={errorId} 
          role="alert" 
          aria-live="polite"
        >
          {error}
        </ErrorMessage>
      )}
    </FormGroup>
  );
}

export function AccessibleTextAreaField({
  id,
  label,
  value,
  onChange,
  rows = 4,
  error,
  help,
  required = false,
  disabled = false,
  placeholder,
  maxLength,
  className
}: TextAreaFieldProps) {
  const [hasBeenTouched, setHasBeenTouched] = useState(false);
  const { announceToScreenReader } = useAccessibility();
  
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedByIds = [helpId, errorId].filter(Boolean).join(' ');
  
  useEffect(() => {
    if (error && hasBeenTouched) {
      announceToScreenReader(`Error in ${label}: ${error}`, 'assertive');
    }
  }, [error, hasBeenTouched, label, announceToScreenReader]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };
  
  const handleBlur = () => {
    setHasBeenTouched(true);
  };
  
  const currentLength = value.length;
  const showCharacterCount = maxLength && maxLength > 0;
  const isOverLimit = Boolean(maxLength && currentLength > maxLength);
  
  return (
    <FormGroup className={className} $hasError={!!error}>
      <Label htmlFor={id} $required={required}>
        {label}
        {required && (
          <RequiredIndicator>required</RequiredIndicator>
        )}
      </Label>
      
      <TextArea
        id={id}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        rows={rows}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedByIds || undefined}
        $hasError={!!error}
      />
      
      {help && (
        <HelpText id={helpId}>
          {help}
        </HelpText>
      )}
      
      {showCharacterCount && (
        <CharacterCount $isOverLimit={isOverLimit}>
          {currentLength}/{maxLength} characters
        </CharacterCount>
      )}
      
      {error && (
        <ErrorMessage 
          id={errorId} 
          role="alert" 
          aria-live="polite"
        >
          {error}
        </ErrorMessage>
      )}
    </FormGroup>
  );
}

// Utility component for form validation
export function useFormValidation(initialValues: Record<string, string>) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});
  
  const setValue = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const setError = (name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  };
  
  const clearError = (name: string) => {
    setErrors(prev => ({ ...prev, [name]: '' }));
  };
  
  const setTouched = (name: string) => {
    setTouchedState(prev => ({ ...prev, [name]: true }));
  };
  
  const validateRequired = (name: string, label: string) => {
    if (!values[name] || values[name]?.trim() === '') {
      setError(name, `${label} is required`);
      return false;
    }
    clearError(name);
    return true;
  };
  
  const validateEmail = (name: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (values[name] && !emailRegex.test(values[name]!)) {
      setError(name, 'Please enter a valid email address');
      return false;
    }
    clearError(name);
    return true;
  };
  
  const validateMinLength = (name: string, minLength: number) => {
    if (values[name] && values[name]!.length < minLength) {
      setError(name, `Must be at least ${minLength} characters long`);
      return false;
    }
    clearError(name);
    return true;
  };
  
  const hasErrors = Object.values(errors).some(error => error !== '');
  const isValid = !hasErrors && Object.keys(touched).length > 0;
  
  return {
    values,
    errors,
    touched,
    setValue,
    setError,
    clearError,
    setTouched,
    validateRequired,
    validateEmail,
    validateMinLength,
    hasErrors,
    isValid
  };
}

export default {
  AccessibleFormField,
  AccessibleSelectField,
  AccessibleTextAreaField,
  useFormValidation
};