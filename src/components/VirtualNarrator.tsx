import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';

interface NarratorMessage {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'success' | 'question';
  duration: number;
  action?: () => void;
}

interface VirtualNarratorProps {
  messages: NarratorMessage[];
  onMessageComplete?: (messageId: string) => void;
  autoPlay?: boolean;
  voiceEnabled?: boolean;
}

// Contenedor del narrador
const NarratorContainer = styled.div<{ isVisible: boolean; type: string }>`
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  max-width: 400px;
  background: ${props =>
    props.type === 'info' ? 'rgba(0, 212, 255, 0.9)' :
    props.type === 'warning' ? 'rgba(255, 107, 107, 0.9)' :
    props.type === 'success' ? 'rgba(0, 255, 136, 0.9)' :
    'rgba(255, 165, 0, 0.9)'};
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transform: translateY(${props => props.isVisible ? '0' : '100px'});
  opacity: ${props => props.isVisible ? '1' : '0'};
  transition: all 0.5s ease;
  z-index: 1000;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const NarratorAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(45deg, #00d4ff, #0099cc);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  animation: float 3s ease-in-out infinite;
`;

const MessageText = styled.div`
  color: white;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 15px;
  font-weight: 500;
`;

// const ProgressBar = styled.div<{ progress: number }>`
//   width: 100%;
//   height: 4px;
//   background: rgba(255, 255, 255, 0.2);
//   border-radius: 2px;
//   overflow: hidden;
// `;

// const ProgressFill = styled.div<{ progress: number }>`
//   height: 100%;
//   width: ${props => props.progress}%;
//   background: rgba(255, 255, 255, 0.8);
//   transition: width 0.1s linear;
//   border-radius: 2px;
// `;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const SkipButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 18px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
`;

// Hook para manejar texto con animación de escritura
function useTypingEffect(text: string, speed: number = 50) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!text) return;

    setIsTyping(true);
    setDisplayedText('');

    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(prev => prev + text[index]);
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isTyping };
}

// Hook para síntesis de voz
function useSpeechSynthesis() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const speak = (text: string, lang: string = 'es-ES') => {
    if (!isSupported) return;

    // Cancelar cualquier habla anterior
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return { speak, stop, isSpeaking, isSupported };
}

export default function VirtualNarrator({
  messages,
  onMessageComplete,
  autoPlay = true,
  voiceEnabled = true
}: VirtualNarratorProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentMessage = messages[currentMessageIndex];
  const { displayedText, isTyping } = useTypingEffect(currentMessage?.text || '', 30);
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  const handleNextMessage = useCallback(() => {
    if (currentMessage) {
      onMessageComplete?.(currentMessage.id);
      currentMessage.action?.();
    }

    if (currentMessageIndex < messages.length - 1) {
      setCurrentMessageIndex(prev => prev + 1);
    } else {
      setIsVisible(false);
      setCurrentMessageIndex(0);
    }
  }, [currentMessage, currentMessageIndex, messages.length, onMessageComplete]);

  // Manejar mensajes automáticamente
  useEffect(() => {
    if (!currentMessage || !autoPlay) return;

    // Mostrar mensaje
    setIsVisible(true);
    setProgress(0);

    // Iniciar progreso
    let startTime = Date.now();
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / (currentMessage.duration * 1000)) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        handleNextMessage();
      }
    }, 100);

    // Hablar el mensaje si está habilitado
    if (voiceEnabled && currentMessage.text) {
      setTimeout(() => {
        speak(currentMessage.text);
      }, 500); // Esperar a que aparezca el texto
    }

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      stop();
    };
  }, [currentMessage, autoPlay, voiceEnabled, speak, stop, handleNextMessage]);

  const handleSkip = () => {
    stop();
    handleNextMessage();
  };

  if (!currentMessage) return null;

  return (
    <NarratorContainer isVisible={isVisible} type={currentMessage.type}>
      <SkipButton onClick={handleSkip}>×</SkipButton>

      <NarratorAvatar>
        🎯
      </NarratorAvatar>

      <MessageText>
        {displayedText}
        {isTyping && <span style={{ opacity: 0.5 }}>|</span>}
      </MessageText>

      {currentMessage.duration > 0 && (
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'rgba(255, 255, 255, 0.8)',
            transition: 'width 0.1s linear',
            borderRadius: '2px'
          }} />
        </div>
      )}

      {!autoPlay && (
        <ActionButton onClick={handleNextMessage}>
          Continuar →
        </ActionButton>
      )}

      {isSpeaking && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '12px'
        }}>
          🎵 Hablando...
        </div>
      )}
    </NarratorContainer>
  );
}

// Narrador específico para lecciones
export function LessonNarrator({ lessonId }: { lessonId: number }) {
  const lessonMessages: Record<number, NarratorMessage[]> = {
    1: [
      {
        id: 'intro',
        text: '¡Hola! Soy tu guía virtual. Hoy vamos a aprender sobre punteros básicos en C++.',
        type: 'info',
        duration: 3
      },
      {
        id: 'concept',
        text: 'Un puntero es una variable que almacena la dirección de memoria de otra variable.',
        type: 'info',
        duration: 4
      },
      {
        id: 'example',
        text: 'Mira este ejemplo: int x = 42; int* ptr = &x; Aquí ptr almacena la dirección de x.',
        type: 'info',
        duration: 5
      },
      {
        id: 'practice',
        text: '¡Ahora es tu turno! Observa cómo el puntero apunta a la variable en memoria.',
        type: 'success',
        duration: 3
      }
    ]
  };

  const messages = lessonMessages[lessonId] || [];

  return (
    <VirtualNarrator
      messages={messages}
      autoPlay={true}
      voiceEnabled={true}
      onMessageComplete={(messageId) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        // console.log('Mensaje completado:', messageId);
      }}
    />
  );
}
