import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const Modal = styled.div`
  background: linear-gradient(135deg, #2a1810, #4a1a0a);
  border: 2px solid #ff6b6b;
  border-radius: 15px;
  padding: 2rem;
  max-width: 500px;
  width: 90vw;
  text-align: center;
  box-shadow: 0 20px 60px rgba(255, 107, 107, 0.3);
  animation: shake 0.5s ease-in-out;
  position: relative;
  overflow: hidden;

  &:before {
    content: '⚠️';
    position: absolute;
    top: -10px;
    right: -10px;
    background: #ff6b6b;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    box-shadow: 0 5px 15px rgba(255, 107, 107, 0.5);
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;

const Title = styled.h2`
  color: #ff6b6b;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  text-shadow: 0 0 10px #ff6b6b;
`;

const Message = styled.div`
  color: #e0e0e0;
  margin-bottom: 2rem;
  line-height: 1.6;
  white-space: pre-line;
  font-family: 'Fira Code', monospace;
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #ff6b6b;
`;

const Button = styled.button`
  background: linear-gradient(45deg, #ff6b6b, #cc4444);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;

  &:hover {
    background: linear-gradient(45deg, #cc4444, #aa2222);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

export default function ErrorModal({ message, onClose }: ErrorModalProps) {
  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Title>¡Error Crítico!</Title>
        <Message>{message}</Message>
        <Button onClick={onClose}>Entendido</Button>
      </Modal>
    </Overlay>
  );
}
