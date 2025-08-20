import React, { useState } from 'react';
import styled from 'styled-components';

const EditorContainer = styled.div`
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
`;

const EditorHeader = styled.div`
  background: linear-gradient(135deg, #2a2a4e, #3a3a6e);
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const LanguageBadge = styled.span`
  background: #00d4ff;
  color: #000;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
`;

const CopyButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #00d4ff;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: #00d4ff;
  }
`;

const CodeArea = styled.pre`
  padding: 1rem;
  margin: 0;
  color: #e0e0e0;
  line-height: 1.5;
  font-size: 0.9rem;
  overflow-x: auto;
  white-space: pre;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
`;

const LineNumbers = styled.div`
  display: inline-block;
  min-width: 40px;
  text-align: right;
  color: #666;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding-right: 0.5rem;
  margin-right: 1rem;
  user-select: none;
`;

const CodeContent = styled.code`
  color: #e0e0e0;

  .keyword {
    color: #ff6b6b;
    font-weight: bold;
  }

  .type {
    color: #4ecdc4;
  }

  .string {
    color: #ffa500;
  }

  .comment {
    color: #666;
    font-style: italic;
  }

  .number {
    color: #00d4ff;
  }

  .operator {
    color: #ff6b6b;
  }

  .function {
    color: #00ff88;
  }
`;

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({
  code,
  language,
  onChange, // eslint-disable-line @typescript-eslint/no-unused-vars
  readOnly = false // eslint-disable-line @typescript-eslint/no-unused-vars
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Error copying to clipboard
    }
  };

  const highlightCode = (code: string) => {
    // Simple syntax highlighting for C++
    return code
      .replace(/(#include|int|void|class|public|private|const|auto|std::)/g, '<span class="keyword">$1</span>')
      .replace(/(std::string|std::cout|std::endl)/g, '<span class="function">$1</span>')
      .replace(/(&lt;[^>]+&gt;)/g, '<span class="type">$1</span>')
      .replace(/(["'].*?["'])/g, '<span class="string">$1</span>')
      .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
      .replace(/(\d+)/g, '<span class="number">$1</span>')
      .replace(/([+\-*/=<>!]+)/g, '<span class="operator">$1</span>');
  };

  const lines = code.split('\n');

  return (
    <EditorContainer>
      <EditorHeader>
        <LanguageBadge>{language.toUpperCase()}</LanguageBadge>
        <CopyButton onClick={copyToClipboard}>
          {copied ? '✓ Copiado' : '📋 Copiar'}
        </CopyButton>
      </EditorHeader>

      <CodeArea>
        {lines.map((line, index) => (
          <div key={index}>
            <LineNumbers>{index + 1}</LineNumbers>
            <CodeContent
              dangerouslySetInnerHTML={{
                __html: highlightCode(line) || '\u00A0'
              }}
            />
          </div>
        ))}
      </CodeArea>
    </EditorContainer>
  );
}
