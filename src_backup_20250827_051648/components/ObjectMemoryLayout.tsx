import React, { useState, useRef, Suspense } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { useOptimizedAnimation } from '../hooks/useOptimizedAnimation';
import * as THREE from 'three';

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

// 3D Memory Block Component
const MemoryBlock3D = React.memo(({ 
  position, 
  field, 
  byteIndex, 
  isHovered = false,
 
}: {
  position: [number, number, number];
  field: { name: string; type: string; offset: number; size: number; value: string };
  byteIndex: number;
  isHovered?: boolean;
  animated?: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const getBlockColor = () => {
    switch (field.type) {
      case 'int': return '#4CAF50';
      case 'pointer': return '#2196F3';
      case 'vtable': return '#FF9800';
      case 'padding': return '#666666';
      default: return '#9E9E9E';
    }
  };
  
  useOptimizedAnimation(
    `memory-block-${byteIndex}`,
    React.useCallback((state) => {
      if (!meshRef.current) return;
      
      const time = state.clock.elapsedTime;
      
      if (isHovered) {
        const pulse = 1 + Math.sin(time * 8) * 0.15;
        meshRef.current.scale.setScalar(pulse);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }, [isHovered]),
    1,
    [position, isHovered]
  );
  
  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.8, 0.6, 0.4]} />
        <meshStandardMaterial
          color={getBlockColor()}
          transparent
          opacity={isHovered ? 1 : 0.8}
          emissive={getBlockColor()}
          emissiveIntensity={isHovered ? 0.3 : 0.05}
        />
      </mesh>
      
      {/* Byte value */}
      <Text
        position={[0, 0, 0.25]}
        fontSize={0.15}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {field.type === 'int' && field.value !== '???' ? 
          (((parseInt(field.value) >> ((byteIndex - field.offset) * 8)) & 0xFF).toString(16).padStart(2, '0')).toUpperCase() :
          field.type === 'pointer' && field.value !== '???' ?
          (((parseInt(field.value, 16) >> ((byteIndex - field.offset) * 8)) & 0xFF).toString(16).padStart(2, '0')).toUpperCase() :
          '00'
        }
      </Text>
      
      {/* Field type indicator */}
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.08}
        color="#CCCCCC"
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {field.type}
      </Text>
      
      {/* Interactive tooltip */}
      {isHovered && (
        <Html position={[0, 0.8, 0]} center>
          <div style={{
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontFamily: 'monospace',
            textAlign: 'center',
            border: `2px solid ${getBlockColor()}`,
            whiteSpace: 'nowrap'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{field.name}</div>
            <div>Byte {byteIndex}: {field.type}</div>
            <div>Offset: +{byteIndex}</div>
          </div>
        </Html>
      )}
    </group>
  );
});

// 3D Object Layout Scene
const ObjectLayout3DScene = React.memo(({ 
  layout,
  hoveredByte,
  onByteHover 
}: {
  layout: any;
  hoveredByte: number | null;
  onByteHover: (index: number | null) => void;
}) => {
  // Create 3D representation of memory bytes
  const memoryBlocks = [];
  for (let i = 0; i < layout.size; i++) {
    const field = layout.fields.find((f: any) => i >= f.offset && i < f.offset + f.size);
    if (field) {
      memoryBlocks.push({
        position: [i * 1.2 - (layout.size * 0.6), 0, 0] as [number, number, number],
        field,
        byteIndex: i,
        isHovered: hoveredByte === i
      });
    }
  }
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, 5, 5]} intensity={0.4} />
      
      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
      />
      
      {/* Memory blocks */}
      {memoryBlocks.map((block, index) => (
        <group
          key={index}
          onPointerEnter={() => onByteHover(block.byteIndex)}
          onPointerLeave={() => onByteHover(null)}
        >
          <MemoryBlock3D
            position={block.position}
            field={block.field}
            byteIndex={block.byteIndex}
            isHovered={block.isHovered}
          />
        </group>
      ))}
      
      {/* Memory layout title */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.4}
        color="#00D4FF"
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {layout.name} Memory Layout
      </Text>
      
      {/* Size and alignment info */}
      <Text
        position={[0, -2, 0]}
        fontSize={0.2}
        color="#4CAF50"
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        Size: {layout.size} bytes • Alignment: {layout.alignment} bytes
      </Text>
      
      {/* Address markers */}
      {Array.from({ length: Math.ceil(layout.size / 4) }).map((_, i) => (
        <group key={i} position={[i * 4 * 1.2 - (layout.size * 0.6), -1.5, 0]}>
          <Text
            fontSize={0.12}
            color="#666666"
            anchorX="center"
            anchorY="middle"
            font="/fonts/FiraCode-Regular.woff"
          >
            +{i * 4}
          </Text>
        </group>
      ))}
      
      {/* Interactive field boundaries */}
      {layout.fields.map((field: any, index: number) => (
        <group key={index}>
          {/* Field boundary lines */}
          <mesh position={[(field.offset + field.size/2) * 1.2 - (layout.size * 0.6), 0.8, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.6]} />
            <meshBasicMaterial color="#FF9800" transparent opacity={0.6} />
          </mesh>
          
          {/* Field name label */}
          <Html position={[(field.offset + field.size/2) * 1.2 - (layout.size * 0.6), 1.2, 0]} center>
            <div style={{
              background: 'rgba(255, 152, 0, 0.9)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '10px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {field.name}
            </div>
          </Html>
        </group>
      ))}
      
      {/* Background grid */}
      <mesh position={[0, -0.5, -1]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[layout.size * 1.5, 4]} />
        <meshBasicMaterial color="#0a0a0a" transparent opacity={0.3} />
      </mesh>
    </>
  );
});

export default function ObjectMemoryLayout() {
  const [selectedObject, setSelectedObject] = useState('simple_struct');
  const [hoveredByte, setHoveredByte] = useState<number | null>(null);
  const [show3D, setShow3D] = useState(false);

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
      {/* 3D Visualization Toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '20px 0'
      }}>
        <button
          onClick={() => setShow3D(!show3D)}
          style={{
            padding: '12px 24px',
            background: show3D ? 
              'linear-gradient(45deg, #00d4ff, #4ecdc4)' :
              'linear-gradient(45deg, #666, #444)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: show3D ? '0 4px 15px rgba(0, 212, 255, 0.4)' : 'none'
          }}
        >
          {show3D ? '🔄 Switch to 2D View' : '🎯 Switch to 3D View'}
        </button>
      </div>
      
      {/* 3D Visualization */}
      {show3D && (
        <div style={{
          width: '100%',
          height: '500px',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2a 100%)',
          borderRadius: '15px',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Suspense fallback={
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: '#00d4ff',
              fontSize: '18px'
            }}>
              🔄 Loading 3D Memory Layout...
            </div>
          }>
            <Canvas 
              camera={{ position: [0, 3, 8], fov: 60 }}
              style={{ background: 'transparent' }}
            >
              <ObjectLayout3DScene
                layout={currentLayout}
                hoveredByte={hoveredByte}
                onByteHover={setHoveredByte}
              />
            </Canvas>
          </Suspense>
          
          {/* 3D Controls hint */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            🖱️ Drag to rotate • 🔍 Scroll to zoom • Hover bytes for details
          </div>
        </div>
      )}
      
      {/* Enhanced Memory Analysis */}
      <ObjectInfo>
        <InfoTitle>🔬 Advanced Memory Analysis</InfoTitle>
        <InfoText>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginTop: '15px'
          }}>
            <div>
              <strong style={{ color: '#4CAF50' }}>Memory Efficiency:</strong>
              <div style={{ fontSize: '12px', marginTop: '5px', lineHeight: '1.4' }}>
                • <strong>Utilization:</strong> {((currentLayout.fields.filter((f: any) => f.type !== 'padding').reduce((acc: number, f: any) => acc + f.size, 0) / currentLayout.size) * 100).toFixed(1)}%<br/>
                • <strong>Padding bytes:</strong> {currentLayout.fields.filter((f: any) => f.type === 'padding').reduce((acc: number, f: any) => acc + f.size, 0)}<br/>
                • <strong>Wasted space:</strong> {currentLayout.size - currentLayout.fields.filter((f: any) => f.type !== 'padding').reduce((acc: number, f: any) => acc + f.size, 0)} bytes
              </div>
            </div>
            
            <div>
              <strong style={{ color: '#2196F3' }}>Cache Performance:</strong>
              <div style={{ fontSize: '12px', marginTop: '5px', lineHeight: '1.4' }}>
                • <strong>Cache lines:</strong> {Math.ceil(currentLayout.size / 64)}<br/>
                • <strong>Alignment:</strong> {currentLayout.alignment}-byte aligned<br/>
                • <strong>Access pattern:</strong> {currentLayout.size <= 64 ? 'Single cache line' : 'Multiple cache lines'}
              </div>
            </div>
          </div>
          
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(0, 212, 255, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(0, 212, 255, 0.3)'
          }}>
            <strong style={{ color: '#00D4FF' }}>🚀 Optimization Suggestions:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '12px', lineHeight: '1.4' }}>
              {currentLayout.fields.filter((f: any) => f.type === 'padding').length > 0 && (
                <li>Consider reordering fields to minimize padding</li>
              )}
              {currentLayout.size > 64 && (
                <li>Large object - consider splitting for better cache performance</li>
              )}
              {currentLayout.alignment < 8 && currentLayout.size >= 8 && (
                <li>Consider using alignas() for better alignment</li>
              )}
              <li>Use #pragma pack carefully - may hurt performance</li>
            </ul>
          </div>
        </InfoText>
      </ObjectInfo>
    </Container>
  );
}
