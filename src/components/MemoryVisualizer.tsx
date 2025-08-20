import React from 'react';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';

const Container = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 1rem;
  font-family: 'Fira Code', monospace;
`;

const Header = styled.div`
  color: #00d4ff;
  margin-bottom: 1rem;
  font-size: 1.1rem;
`;

const MemoryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
`;

const MemorySection = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 0.75rem;
`;

const SectionTitle = styled.h4`
  color: #00d4ff;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  text-align: center;
`;

const MemoryBlock = styled.div<{ type: 'stack' | 'heap' | 'global' }>`
  background: ${props =>
    props.type === 'stack' ? 'linear-gradient(135deg, #4ecdc4, #44a08d)' :
    props.type === 'heap' ? 'linear-gradient(135deg, #ff6b6b, #cc5555)' :
    'linear-gradient(135deg, #ffa500, #cc8400)'};
  color: white;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  position: relative;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  word-break: break-all;
`;

const Address = styled.div`
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 0.6rem;
  opacity: 0.7;
`;

const Value = styled.div`
  font-weight: bold;
`;

const Pointer = styled.div<{ type: 'raw' | 'unique' | 'shared' | 'weak' }>`
  background: ${props =>
    props.type === 'raw' ? 'linear-gradient(135deg, #00d4ff, #0099cc)' :
    props.type === 'unique' ? 'linear-gradient(135deg, #00ff88, #00cc66)' :
    props.type === 'shared' ? 'linear-gradient(135deg, #ff6b6b, #cc5555)' :
    'linear-gradient(135deg, #ffa500, #cc8400)'};
  color: white;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
`;

const PointerArrow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 12px solid currentColor;
  transform: rotate(-90deg);
  right: -15px;
  top: 50%;
  transform: translateY(-50%) rotate(-90deg);
  opacity: 0.8;
`;

const EmptyState = styled.div`
  color: #666;
  font-size: 0.8rem;
  text-align: center;
  padding: 1rem;
  font-style: italic;
`;

const Legend = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #b8c5d6;
  font-size: 0.8rem;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  background: ${props => props.color};
  border-radius: 2px;
`;

export default function MemoryVisualizer() {
  const { state } = useApp();

  const formatAddress = (addr: number) => `0x${addr.toString(16).padStart(8, '0')}`;

  const getPointerTypeSymbol = (type: 'raw' | 'unique' | 'shared' | 'weak') => {
    switch (type) {
      case 'raw': return 'T*';
      case 'unique': return 'unique_ptr';
      case 'shared': return 'shared_ptr';
      case 'weak': return 'weak_ptr';
    }
  };

  return (
    <Container>
      <Header>🧠 Visualización de Memoria</Header>

      <MemoryGrid>
        <MemorySection>
          <SectionTitle>📚 Stack</SectionTitle>
          {state.memoryVisualization.stack.length === 0 ? (
            <EmptyState>Sin variables en stack</EmptyState>
          ) : (
            state.memoryVisualization.stack.map((block) => (
              <MemoryBlock key={block.id} type="stack">
                <Address>{formatAddress(block.address)}</Address>
                <Value>{block.value}</Value>
              </MemoryBlock>
            ))
          )}
        </MemorySection>

        <MemorySection>
          <SectionTitle>🏗️ Heap</SectionTitle>
          {state.memoryVisualization.heap.length === 0 ? (
            <EmptyState>Sin objetos en heap</EmptyState>
          ) : (
            state.memoryVisualization.heap.map((block) => (
              <MemoryBlock key={block.id} type="heap">
                <Address>{formatAddress(block.address)}</Address>
                <Value>{block.value}</Value>
              </MemoryBlock>
            ))
          )}
        </MemorySection>

        <MemorySection>
          <SectionTitle>🌍 Global</SectionTitle>
          {state.memoryVisualization.global.length === 0 ? (
            <EmptyState>Sin variables globales</EmptyState>
          ) : (
            state.memoryVisualization.global.map((block) => (
              <MemoryBlock key={block.id} type="global">
                <Address>{formatAddress(block.address)}</Address>
                <Value>{block.value}</Value>
              </MemoryBlock>
            ))
          )}
        </MemorySection>

        <MemorySection style={{ gridColumn: '1 / -1' }}>
          <SectionTitle>🎯 Punteros</SectionTitle>
          {state.memoryVisualization.pointers.length === 0 ? (
            <EmptyState>Sin punteros activos</EmptyState>
          ) : (
            state.memoryVisualization.pointers.map((ptr) => (
              <Pointer key={ptr.id} type={ptr.type} title={`Apunta a: ${ptr.targetId || 'null'}`}>
                <strong>{ptr.name}</strong> ({getPointerTypeSymbol(ptr.type)})
                {ptr.refCount !== undefined && (
                  <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                    RefCount: {ptr.refCount}
                  </div>
                )}
                <PointerArrow />
              </Pointer>
            ))
          )}
        </MemorySection>

        <Legend>
          <LegendItem>
            <LegendColor color="#4ecdc4" />
            Stack Variables
          </LegendItem>
          <LegendItem>
            <LegendColor color="#ff6b6b" />
            Heap Objects
          </LegendItem>
          <LegendItem>
            <LegendColor color="#ffa500" />
            Global Variables
          </LegendItem>
          <LegendItem>
            <LegendColor color="#00d4ff" />
            Raw Pointers (T*)
          </LegendItem>
          <LegendItem>
            <LegendColor color="#00ff88" />
            unique_ptr
          </LegendItem>
          <LegendItem>
            <LegendColor color="#ff6b6b" />
            shared_ptr
          </LegendItem>
        </Legend>
      </MemoryGrid>
    </Container>
  );
}
