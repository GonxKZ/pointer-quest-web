import React, { useState, useRef } from 'react';
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

// Componente de Terminal para ejecutar código C++
const TerminalContainer = styled.div`
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  margin-top: 1rem;
  overflow: hidden;
`;

const TerminalHeader = styled.div`
  background: linear-gradient(135deg, #2a2a4e, #3a3a6e);
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const TerminalTitle = styled.div`
  color: #00d4ff;
  font-size: 0.9rem;
  font-weight: bold;
`;

const TerminalControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const TerminalButton = styled.button<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: ${props => props.color};
  cursor: pointer;
`;

const TerminalOutput = styled.div`
  padding: 1rem;
  color: #00ff88;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
`;

const TerminalInput = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.9rem;
`;

const TerminalPrompt = styled.span`
  color: #00ff88;
  margin-right: 0.5rem;
`;

const TerminalCommand = styled.span`
  color: #ffffff;
  flex: 1;
`;

const ExecuteButton = styled.button`
  background: linear-gradient(45deg, #00d4ff, #0099cc);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  margin-left: 1rem;

  &:hover {
    background: linear-gradient(45deg, #0099cc, #006699);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

interface TerminalProps {
  code: string;
  language: string;
  lessonId?: number;
}

export function Terminal({ code: _code, language, lessonId }: TerminalProps) {
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const outputRef = useRef<HTMLDivElement>(null);

  // Simulaciones de ejecución para diferentes lecciones
  const executionSteps: Record<number, Array<{ text: string; delay: number }>> = {
    0: [
      { text: '$ g++ punteros_basicos.cpp -o punteros_basicos', delay: 500 },
      { text: 'Compilación exitosa...', delay: 800 },
      { text: '$ ./punteros_basicos', delay: 300 },
      { text: '', delay: 500 },
      { text: 'Valor de edad: 25', delay: 200 },
      { text: 'Dirección de edad: 0x7ffd8b8a4f4c', delay: 200 },
      { text: 'Valor al que apunta el puntero: 25', delay: 300 },
      { text: '', delay: 200 },
      { text: '🎯 ¡Puntero creado exitosamente!', delay: 400 },
      { text: '📍 Dirección de memoria obtenida', delay: 200 },
      { text: '🔓 Valor accedido a través del puntero', delay: 500 },
      { text: '', delay: 200 },
      { text: '✅ Ejecución completada exitosamente', delay: 0 }
    ],
    1: [
      { text: '$ g++ punteros_nullptr.cpp -o punteros_nullptr', delay: 500 },
      { text: 'Compilación exitosa...', delay: 800 },
      { text: '$ ./punteros_nullptr', delay: 300 },
      { text: '', delay: 500 },
      { text: '=== DEMOSTRACIÓN nullptr ===', delay: 200 },
      { text: '✅ Puntero seguro inicializado con nullptr', delay: 300 },
      { text: '🛡️ Verificación de nullptr antes del acceso', delay: 200 },
      { text: '', delay: 200 },
      { text: 'Valor del puntero válido: 42', delay: 400 },
      { text: 'Puntero nullptr manejado correctamente', delay: 300 },
      { text: '', delay: 200 },
      { text: '✅ ¡nullptr usado correctamente!', delay: 500 },
      { text: '', delay: 200 },
      { text: '✅ Ejecución completada exitosamente', delay: 0 }
    ],
    2: [
      { text: '$ g++ dangling_ptr.cpp -o dangling_ptr', delay: 500 },
      { text: 'Compilación exitosa...', delay: 800 },
      { text: '$ ./dangling_ptr', delay: 300 },
      { text: '', delay: 500 },
      { text: '=== PELIGRO: Puntero colgante ===', delay: 200 },
      { text: '✅ Puntero creado apuntando a memoria válida', delay: 300 },
      { text: '❌ Memoria liberada con delete', delay: 200 },
      { text: '🚨 ¡PELIGRO! Acceso a puntero colgante', delay: 400 },
      { text: '💥 Comportamiento indefinido detectado', delay: 300 },
      { text: '', delay: 200 },
      { text: '✅ Lección aprendida: ¡nullptr después de delete!', delay: 500 },
      { text: '', delay: 200 },
      { text: '✅ Ejecución completada (con demostración de error)', delay: 0 }
    ]
  };

  const scrollToBottom = () => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  };

  const executeCode = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setOutput('');
    setCurrentStep(0);

    const steps = executionSteps[lessonId || 0] || executionSteps[0];

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);

      if (steps[i].delay > 0) {
        await new Promise(resolve => setTimeout(resolve, steps[i].delay));
      }

      setOutput(prev => prev + steps[i].text + '\n');
      scrollToBottom();
    }

    setIsRunning(false);
  };

  const stopExecution = () => {
    setIsRunning(false);
  };

  const clearTerminal = () => {
    setOutput('');
    setCurrentStep(0);
  };

  return (
    <TerminalContainer>
      <TerminalHeader>
        <TerminalTitle>🖥️ Terminal - {language.toUpperCase()}</TerminalTitle>
        <TerminalControls>
          <TerminalButton color="#ff6b6b" onClick={stopExecution} />
          <TerminalButton color="#ffa500" />
          <TerminalButton color="#00ff88" />
        </TerminalControls>
      </TerminalHeader>

      <TerminalOutput ref={outputRef}>
        {output}
        {isRunning && (
          <span style={{ color: '#00d4ff' }}>
            ▓▓▓ Ejecutando... {Math.round((currentStep / (executionSteps[lessonId || 0]?.length || 1)) * 100)}%
          </span>
        )}
      </TerminalOutput>

      <TerminalInput>
        <TerminalPrompt>$</TerminalPrompt>
        <TerminalCommand>
          {isRunning ? 'Ejecutando código...' : './programa_compilado'}
        </TerminalCommand>
        <ExecuteButton onClick={executeCode} disabled={isRunning}>
          {isRunning ? 'Ejecutando...' : '▶️ Ejecutar'}
        </ExecuteButton>
        <ExecuteButton onClick={clearTerminal} disabled={isRunning}>
          🗑️ Limpiar
        </ExecuteButton>
      </TerminalInput>
    </TerminalContainer>
  );
}
