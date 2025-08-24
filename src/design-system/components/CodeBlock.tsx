/**
 * Pointer Quest Design System - CodeBlock Component
 * 
 * Standardized code block component for consistent C++ code presentation.
 * Features syntax highlighting, copy functionality, and educational annotations.
 */

import React, { useState, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../theme';
import { Button, IconButton } from './Button';

// CodeBlock props interface
export interface CodeBlockProps {
  children: string;
  language?: 'cpp' | 'c' | 'javascript' | 'typescript' | 'bash' | 'text';
  title?: string;
  filename?: string;
  highlightLines?: number[];
  showLineNumbers?: boolean;
  maxHeight?: string;
  copyable?: boolean;
  editable?: boolean;
  onEdit?: (code: string) => void;
  annotations?: Array<{
    line: number;
    content: ReactNode;
    type?: 'info' | 'warning' | 'error' | 'success';
  }>;
  className?: string;
}

// Syntax highlighting themes for different languages
const syntaxColors = {
  keyword: '#569CD6',      // Blue for keywords (int, class, if, etc.)
  string: '#CE9178',       // Orange for strings
  comment: '#6A9955',      // Green for comments
  number: '#B5CEA8',       // Light green for numbers
  operator: '#D4D4D4',     // Light gray for operators
  function: '#DCDCAA',     // Yellow for functions
  type: '#4EC9B0',         // Teal for types
  preprocessor: '#C586C0', // Purple for preprocessor directives
  error: '#F44747',        // Red for errors
  warning: '#FF8C00'       // Orange for warnings
};

// Main container
const CodeContainer = styled.div<{ maxHeight?: string }>`
  background: ${theme.colors.background.code};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  position: relative;
  font-family: ${theme.typography.fontFamily.code};
  
  ${props => props.maxHeight && css`
    max-height: ${props.maxHeight};
    overflow-y: auto;
  `}
`;

// Header with title and actions
const CodeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: ${theme.typography.fontSize.sm};
`;

const CodeTitle = styled.div`
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const LanguageBadge = styled.span<{ language: string }>`
  background: ${theme.colors.primary[500]};
  color: ${theme.colors.text.primary};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  text-transform: uppercase;
`;

const CodeActions = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  align-items: center;
`;

// Main code content area
const CodeContent = styled.div<{ showLineNumbers: boolean }>`
  position: relative;
  overflow-x: auto;
  
  ${props => props.showLineNumbers && css`
    padding-left: 3.5rem;
  `}
`;

// Line numbers
const LineNumbers = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 3rem;
  background: rgba(0, 0, 0, 0.2);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: ${theme.spacing[4]} ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.muted};
  line-height: 1.5;
  text-align: right;
  user-select: none;
`;

// Code block
const CodeBlock = styled.pre<{ highlightLines?: number[] }>`
  margin: 0;
  padding: ${theme.spacing[4]};
  color: ${theme.colors.text.code};
  font-size: ${theme.typography.fontSize.sm};
  line-height: 1.5;
  white-space: pre;
  overflow-x: auto;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: ${theme.borderRadius.sm};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.primary[500]};
    border-radius: ${theme.borderRadius.sm};
    
    &:hover {
      background: ${theme.colors.primary[400]};
    }
  }
`;

// Editable code area
const EditableCode = styled.textarea`
  width: 100%;
  height: 100%;
  padding: ${theme.spacing[4]};
  background: transparent;
  border: none;
  color: ${theme.colors.text.code};
  font-family: ${theme.typography.fontFamily.code};
  font-size: ${theme.typography.fontSize.sm};
  line-height: 1.5;
  resize: none;
  outline: none;
  
  &:focus {
    background: rgba(0, 212, 255, 0.05);
  }
`;

// Line highlighting
const HighlightedLine = styled.div<{ type: 'highlight' | 'info' | 'warning' | 'error' | 'success' }>`
  position: absolute;
  left: 0;
  right: 0;
  height: 1.5em;
  pointer-events: none;
  
  ${props => {
    switch (props.type) {
      case 'highlight':
        return css`
          background: rgba(0, 212, 255, 0.1);
          border-left: 3px solid ${theme.colors.primary[500]};
        `;
      case 'info':
        return css`
          background: rgba(0, 150, 255, 0.1);
          border-left: 3px solid ${theme.colors.info};
        `;
      case 'warning':
        return css`
          background: rgba(255, 202, 40, 0.1);
          border-left: 3px solid ${theme.colors.warning};
        `;
      case 'error':
        return css`
          background: rgba(255, 107, 107, 0.1);
          border-left: 3px solid ${theme.colors.error};
        `;
      case 'success':
        return css`
          background: rgba(0, 255, 136, 0.1);
          border-left: 3px solid ${theme.colors.success};
        `;
    }
  }}
`;

// Annotation tooltip
const AnnotationTooltip = styled.div<{ type: 'info' | 'warning' | 'error' | 'success' }>`
  position: absolute;
  right: ${theme.spacing[4]};
  background: ${props => {
    switch (props.type) {
      case 'info': return theme.colors.info;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      case 'success': return theme.colors.success;
      default: return theme.colors.primary[500];
    }
  }};
  color: ${props => props.type === 'warning' ? theme.colors.gray[900] : theme.colors.text.primary};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.xs};
  max-width: 200px;
  z-index: ${theme.zIndex.tooltip};
  box-shadow: ${theme.shadows.lg};
  
  &::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 6px solid currentColor;
  }
`;

// Copy notification
const CopyNotification = styled.div<{ visible: boolean }>`
  position: absolute;
  top: ${theme.spacing[2]};
  right: ${theme.spacing[2]};
  background: ${theme.colors.success};
  color: ${theme.colors.gray[900]};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  transform: ${props => props.visible ? 'translateY(0)' : 'translateY(-100%)'};
  opacity: ${props => props.visible ? 1 : 0};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut};
  z-index: ${theme.zIndex.toast};
`;

// Simple syntax highlighting for C++
const highlightCppSyntax = (code: string): string => {
  return code
    // Keywords
    .replace(/\b(int|char|float|double|bool|void|class|struct|enum|namespace|using|typedef|const|static|virtual|override|public|private|protected|if|else|for|while|do|switch|case|default|break|continue|return|new|delete|nullptr|true|false|auto|decltype|template|typename|std|include)\b/g, 
      `<span style="color: ${syntaxColors.keyword}; font-weight: bold;">$1</span>`)
    
    // Preprocessor directives
    .replace(/#\w+/g, `<span style="color: ${syntaxColors.preprocessor};">&</span>`)
    
    // Strings
    .replace(/"([^"\\]|\\.)*"/g, `<span style="color: ${syntaxColors.string};">&</span>`)
    .replace(/'([^'\\]|\\.)*'/g, `<span style="color: ${syntaxColors.string};">&</span>`)
    
    // Comments
    .replace(/\/\/.*$/gm, `<span style="color: ${syntaxColors.comment}; font-style: italic;">&</span>`)
    .replace(/\/\*[\s\S]*?\*\//g, `<span style="color: ${syntaxColors.comment}; font-style: italic;">&</span>`)
    
    // Numbers
    .replace(/\b\d+\.?\d*\b/g, `<span style="color: ${syntaxColors.number};">&</span>`)
    
    // Operators
    .replace(/[+\-*/%=<>!&|^~?:]/g, `<span style="color: ${syntaxColors.operator};">&</span>`);
};

// Main component
export const CodeBlockComponent: React.FC<CodeBlockProps> = ({
  children,
  language = 'cpp',
  title,
  filename,
  highlightLines = [],
  showLineNumbers = true,
  maxHeight,
  copyable = true,
  editable = false,
  onEdit,
  annotations = [],
  className
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(children);
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  const lines = children.split('\n');
  const lineCount = lines.length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setShowCopyNotification(true);
      setTimeout(() => setShowCopyNotification(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleEdit = () => {
    if (isEditing && onEdit) {
      onEdit(editedCode);
    }
    setIsEditing(!isEditing);
  };

  const highlightedCode = language === 'cpp' ? highlightCppSyntax(children) : children;

  return (
    <CodeContainer maxHeight={maxHeight} className={className}>
      <CopyNotification visible={showCopyNotification}>
        Copied to clipboard!
      </CopyNotification>
      
      {(title || filename || copyable || editable) && (
        <CodeHeader>
          <CodeTitle>
            {filename && <span>📄 {filename}</span>}
            {title && <span>{title}</span>}
            <LanguageBadge language={language}>{language}</LanguageBadge>
          </CodeTitle>
          
          <CodeActions>
            {copyable && (
              <IconButton
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                title="Copy code"
              >
                📋
              </IconButton>
            )}
            
            {editable && (
              <IconButton
                size="sm"
                variant={isEditing ? 'success' : 'ghost'}
                onClick={handleEdit}
                title={isEditing ? 'Save changes' : 'Edit code'}
              >
                {isEditing ? '✅' : '✏️'}
              </IconButton>
            )}
          </CodeActions>
        </CodeHeader>
      )}
      
      <CodeContent showLineNumbers={showLineNumbers}>
        {showLineNumbers && (
          <LineNumbers>
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i + 1}>{i + 1}</div>
            ))}
          </LineNumbers>
        )}
        
        {isEditing ? (
          <EditableCode
            value={editedCode}
            onChange={(e) => setEditedCode(e.target.value)}
            rows={lineCount}
          />
        ) : (
          <CodeBlock
            highlightLines={highlightLines}
            dangerouslySetInnerHTML={{
              __html: highlightedCode
            }}
          />
        )}
        
        {/* Line highlights and annotations */}
        {highlightLines.map(lineNumber => (
          <HighlightedLine
            key={`highlight-${lineNumber}`}
            type="highlight"
            style={{
              top: `${(lineNumber - 1) * 1.5}em`,
            }}
          />
        ))}
        
        {annotations.map((annotation, index) => (
          <div key={`annotation-${index}`}>
            <HighlightedLine
              type={annotation.type || 'info'}
              style={{
                top: `${(annotation.line - 1) * 1.5}em`,
              }}
            />
            <AnnotationTooltip
              type={annotation.type || 'info'}
              style={{
                top: `${(annotation.line - 1) * 1.5}em`,
              }}
            >
              {annotation.content}
            </AnnotationTooltip>
          </div>
        ))}
      </CodeContent>
    </CodeContainer>
  );
};

// Inline code component
export const InlineCode = styled.code`
  background: ${theme.colors.background.code};
  color: ${theme.colors.text.code};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.sm};
  font-family: ${theme.typography.fontFamily.code};
  font-size: 0.9em;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

// Code snippet for small examples
export const CodeSnippet = styled.pre`
  background: ${theme.colors.background.code};
  color: ${theme.colors.text.code};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.typography.fontFamily.code};
  font-size: ${theme.typography.fontSize.sm};
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin: ${theme.spacing[2]} 0;
  overflow-x: auto;
  line-height: 1.4;
`;

export default CodeBlockComponent;