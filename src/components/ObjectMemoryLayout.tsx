import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 15px;
  padding: 2rem;
  margin: 1rem 0;
  position: relative;
  overflow: hidden;
`;

const Title = styled.h3`
  color: #00d4ff;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  position: relative;
  z-index: 2;
`;

const ObjectSelector = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 2;
`;

const ObjectButton = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  border: 2px solid ${props => props.active ? '#00d4ff' : 'rgba(255, 255, 255, 0.2)'};
  background: ${props => props.active ? 'rgba(0, 212, 255, 0.1)' : 'rgba(0, 0, 0, 0.3)'};
  color: ${props => props.active ? '#00d4ff' : '#ffffff'};
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00d4ff;
    background: rgba(0, 212, 255, 0.1);
  }
`;

const MemoryVisualization = styled.div`
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1rem 0;
  position: relative;
  z-index: 2;
`;

const MemoryAddress = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 0.8rem;
  font-family: 'Fira Code', monospace;
`;

const MemoryBytes = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 2px;
  margin-left: 6rem;
`;

const MemoryByte = styled.div<{
  value: string;
  type: 'data' | 'padding' | 'pointer' | 'vtable';
  active?: boolean;
}>`
  background: ${props =>
    props.type === 'data' ? 'linear-gradient(45deg, #4ecdc4, #44a08d)' :
    props.type === 'padding' ? 'linear-gradient(45deg, #666, #444)' :
    props.type === 'pointer' ? 'linear-gradient(45deg, #00d4ff, #0099cc)' :
    'linear-gradient(45deg, #ffa500, #cc8400)'};
  border: 1px solid ${props => props.active ? '#00ff88' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 4px;
  padding: 0.5rem;
  text-align: center;
  font-family: 'Fira Code', monospace;
  font-size: 0.7rem;
  color: white;
  min-height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    z-index: 10;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
`;

const ByteValue = styled.div`
  font-weight: bold;
  margin-bottom: 0.25rem;
`;

const ByteType = styled.div`
  font-size: 0.6rem;
  opacity: 0.8;
`;

const ObjectInfo = styled.div`
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  position: relative;
  z-index: 2;
`;

const InfoTitle = styled.h4`
  color: #00d4ff;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
`;

const InfoText = styled.div`
  color: #b8c5d6;
  line-height: 1.6;
  font-size: 0.9rem;
`;

const Legend = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin: 1rem 0;
  flex-wrap: wrap;
  position: relative;
  z-index: 2;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #b8c5d6;
  font-size: 0.9rem;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  background: ${props => props.color};
  border-radius: 3px;
`;

// Definir diferentes layouts de objetos
const objectLayouts = {
  simple_int: {
    name: 'int',
    size: 4,
    alignment: 4,
    fields: [
      { name: 'value', type: 'int', offset: 0, size: 4, value: '42' }
    ]
  },
  simple_struct: {
    name: 'Point',
    size: 8,
    alignment: 4,
    fields: [
      { name: 'x', type: 'int', offset: 0, size: 4, value: '10' },
      { name: 'y', type: 'int', offset: 4, size: 4, value: '20' }
    ]
  },
  complex_object: {
    name: 'ComplexObject',
    size: 24,
    alignment: 8,
    fields: [
      { name: 'vtable', type: 'pointer', offset: 0, size: 8, value: '0x400' },
      { name: 'id', type: 'int', offset: 8, size: 4, value: '123' },
      { name: 'padding', type: 'padding', offset: 12, size: 4, value: '???' },
      { name: 'data', type: 'pointer', offset: 16, size: 8, value: '0x1A2B' }
    ]
  },
  array: {
    name: 'int[3]',
    size: 12,
    alignment: 4,
    fields: [
      { name: '[0]', type: 'int', offset: 0, size: 4, value: '1' },
      { name: '[1]', type: 'int', offset: 4, size: 4, value: '2' },
      { name: '[2]', type: 'int', offset: 8, size: 4, value: '3' }
    ]
  }
};

export default function ObjectMemoryLayout() {
  const [selectedObject, setSelectedObject] = useState('simple_struct');
  const [hoveredByte, setHoveredByte] = useState<number | null>(null);

  const currentLayout = objectLayouts[selectedObject as keyof typeof objectLayouts];

  // Crear representación de bytes
  const createByteRepresentation = () => {
    const bytes = [];
    for (let i = 0; i < currentLayout.size; i++) {
      const field = currentLayout.fields.find(f => i >= f.offset && i < f.offset + f.size);
      if (field) {
        const byteIndex = i - field.offset;
        let byteValue = '00';

        if (field.type === 'int' && field.value !== '???') {
          const intValue = parseInt(field.value);
          byteValue = ((intValue >> (byteIndex * 8)) & 0xFF).toString(16).padStart(2, '0');
        } else if (field.type === 'pointer' && field.value !== '???') {
          const pointerValue = parseInt(field.value, 16);
          byteValue = ((pointerValue >> (byteIndex * 8)) & 0xFF).toString(16).padStart(2, '0');
        }

        bytes.push({
          value: byteValue.toUpperCase(),
          type: field.type as 'data' | 'padding' | 'pointer' | 'vtable',
          field: field.name,
          isActive: hoveredByte === i
        });
      }
    }
    return bytes;
  };

  const bytes = createByteRepresentation();

  return (
    <Container>
      <Title>🔍 Layout de Objetos en Memoria</Title>

      <ObjectSelector>
        {Object.entries(objectLayouts).map(([key, layout]) => (
          <ObjectButton
            key={key}
            active={selectedObject === key}
            onClick={() => setSelectedObject(key)}
          >
            {layout.name}
          </ObjectButton>
        ))}
      </ObjectSelector>

      <MemoryVisualization>
        <MemoryAddress>
          0x7FFEEB8C{currentLayout.fields[0]?.offset.toString(16).padStart(4, '0')}
        </MemoryAddress>

        <MemoryBytes>
          {bytes.map((byte, index) => (
            <MemoryByte
              key={index}
              value={byte.value}
              type={byte.type}
              active={byte.isActive}
              onMouseEnter={() => setHoveredByte(index)}
              onMouseLeave={() => setHoveredByte(null)}
              title={`Byte ${index}: ${byte.field}`}
            >
              <ByteValue>{byte.value}</ByteValue>
              <ByteType>{byte.type}</ByteType>
            </MemoryByte>
          ))}
        </MemoryBytes>
      </MemoryVisualization>

      <Legend>
        <LegendItem>
          <LegendColor color="linear-gradient(45deg, #4ecdc4, #44a08d)" />
          Datos
        </LegendItem>
        <LegendItem>
          <LegendColor color="linear-gradient(45deg, #00d4ff, #0099cc)" />
          Punteros
        </LegendItem>
        <LegendItem>
          <LegendColor color="linear-gradient(45deg, #ffa500, #cc8400)" />
          VTable
        </LegendItem>
        <LegendItem>
          <LegendColor color="linear-gradient(45deg, #666, #444)" />
          Padding
        </LegendItem>
      </Legend>

      <ObjectInfo>
        <InfoTitle>📊 Información del Objeto: {currentLayout.name}</InfoTitle>
        <InfoText>
          <strong>Tamaño total:</strong> {currentLayout.size} bytes<br/>
          <strong>Alineación:</strong> {currentLayout.alignment} bytes<br/>
          <strong>Campos:</strong> {currentLayout.fields.length}<br/>
          <strong>Padding:</strong> {currentLayout.fields.filter(f => f.type === 'padding').length > 0 ? 'Presente' : 'Ninguno'}
        </InfoText>
      </ObjectInfo>

      <ObjectInfo>
        <InfoTitle>🎯 Explicación Técnica</InfoTitle>
        <InfoText>
          <strong>Layout en Memoria:</strong><br/>
          Los objetos en C++ tienen un layout específico determinado por el compilador.
          Los campos se ordenan en memoria según su declaración, pero se puede agregar
          padding para mantener la alineación correcta.

          <strong>¿Por qué importa la alineación?</strong><br/>
          • <strong>Performance:</strong> Acceso alineado es más rápido (cache, SIMD)<br/>
          • <strong>Requerimientos de hardware:</strong> Algunos tipos requieren alineación específica<br/>
          • <strong>Compilación cruzada:</strong> Diferentes arquitecturas tienen reglas diferentes

          <strong>¿Qué es el padding?</strong><br/>
          Bytes adicionales agregados por el compilador para alinear campos correctamente.
          No contienen datos útiles, solo mantienen la estructura alineada.

          <strong>VTable:</strong><br/>
          Tabla virtual para clases polimórficas. Contiene punteros a funciones virtuales.
          Siempre está al inicio del objeto en la mayoría de compiladores.
        </InfoText>
      </ObjectInfo>

      <ObjectInfo>
        <InfoTitle>💡 Consejos para Desarrolladores</InfoTitle>
        <InfoText>
          • <strong>Reordenar campos:</strong> Pon los más grandes primero para minimizar padding<br/>
          • <strong>Usar #pragma pack:</strong> Solo si sabes lo que haces (portabilidad)<br/>
          • <strong>alignas():</strong> Especifica alineación personalizada cuando sea necesario<br/>
          • <strong>Considerar cache:</strong> Campos accedidos juntos deberían estar cerca<br/>
          • <strong>sizeof():</strong> Siempre usa para obtener el tamaño real del objeto<br/>
          • <strong>Debuggers:</strong> Aprende a usar el visualizador de memoria de tu debugger
        </InfoText>
      </ObjectInfo>
    </Container>
  );
}
