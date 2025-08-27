import React, { useState, memo, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { useApp } from '../context/AppContext';
import { useOptimizedAnimation } from '../hooks/useOptimizedAnimation';
import { useMemoryManagement } from '../hooks/useMemoryManagement';
import { get3DTranslation } from '../translations/3d-visualization.es';
import { THREE } from '../utils/three';

interface SceneProps {
  topic: 'basic' | 'smart' | 'arithmetic' | 'const';
  animated?: boolean;
  autoPlay?: boolean;
  speed?: number;
}

// Enhanced 3D Object Component with better performance
const Enhanced3DObject = memo(({ 
  position, 
  type, 
  label, 
  isHighlighted = false,
  animated = true 
}: {
  position: [number, number, number];
  type: 'variable' | 'pointer' | 'smart_pointer';
  label: string;
  isHighlighted?: boolean;
  animated?: boolean;
}) => {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const { getCachedGeometry, getCachedMaterial } = useMemoryManagement(`enhanced-object-${type}`);
  
  useOptimizedAnimation(
    `enhanced-object-${label}-${position.join('-')}`,
    useCallback((state) => {
      if (!meshRef.current || !animated) return;
      
      const time = state.clock.elapsedTime;
      
      if (isHighlighted) {
        const pulse = 1 + Math.sin(time * 4) * 0.1;
        meshRef.current.scale.setScalar(pulse);
        meshRef.current.rotation.y = Math.sin(time * 2) * 0.1;
      } else {
        meshRef.current.scale.setScalar(1);
        meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.05;
      }
    }, [animated, isHighlighted]),
    1,
    [position, isHighlighted, animated]
  );
  
  const geometry = useMemo(() => 
    getCachedGeometry(`${type}-geometry`, () => 
      new THREE.BoxGeometry(1.5, 1, 0.5)
    ), [getCachedGeometry, type]
  );
  
  const material = useMemo(() => 
    getCachedMaterial(`${type}-material-${isHighlighted}`, () => 
      new THREE.MeshStandardMaterial({
        color: type === 'pointer' ? '#00d4ff' : 
               type === 'smart_pointer' ? '#9C27B0' : '#4ecdc4',
        transparent: true,
        opacity: 0.8,
        emissive: isHighlighted ? 
          (type === 'pointer' ? '#00d4ff' : 
           type === 'smart_pointer' ? '#9C27B0' : '#4ecdc4') : '#000000',
        emissiveIntensity: isHighlighted ? 0.2 : 0
      })
    ), [getCachedMaterial, type, isHighlighted]
  );
  
  return (
    <group position={position}>
      <mesh ref={meshRef} geometry={geometry} material={material} />
      
      <Text
        position={[0, 1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {label}
      </Text>
      
      {/* Type indicator */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.15}
        color={type === 'pointer' ? '#00d4ff' : 
              type === 'smart_pointer' ? '#9C27B0' : '#4ecdc4'}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {type.replace('_', ' ').toUpperCase()}
      </Text>
    </group>
  );
});

const EducationalPointerScene: React.FC<SceneProps> = memo(({ 
  topic, 
  animated = true, 
  autoPlay = false, 
  speed = 1 
}) => {
  const { state } = useApp();
  const [currentDemo, setCurrentDemo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  
  const getTopicContent = useMemo(() => {
    const isSpanish = state.language === 'es';
    
    switch (topic) {
      case 'basic':
        return {
          title: isSpanish ? 'Punteros Básicos' : 'Basic Pointers',
          description: isSpanish ? 'Fundamentos de punteros en C++' : 'C++ Pointer Fundamentals',
          demos: [
            {
              name: isSpanish ? 'Declaración' : 'Declaration',
              code: 'int x = 42;\nint* p = &x;',
              explanation: isSpanish ? 
                'Declaración de variable y puntero apuntando a ella' :
                'Variable declaration and pointer pointing to it',
              objects: [
                { type: 'variable', position: [-2, 0, 0], label: 'int x = 42' },
                { type: 'pointer', position: [2, 0, 0], label: 'int* p = &x' }
              ]
            },
            {
              name: isSpanish ? 'Desreferencia' : 'Dereference',
              code: 'cout << *p; // Imprime 42',
              explanation: isSpanish ?
                'Acceso al valor a través del puntero' :
                'Accessing value through pointer',
              objects: [
                { type: 'variable', position: [-2, 0, 0], label: 'int x = 42' },
                { type: 'pointer', position: [2, 0, 0], label: '*p → 42' }
              ]
            }
          ]
        };
      case 'smart':
        return {
          title: isSpanish ? 'Punteros Inteligentes' : 'Smart Pointers',
          description: isSpanish ? 'unique_ptr y shared_ptr' : 'unique_ptr and shared_ptr',
          demos: [
            {
              name: isSpanish ? 'unique_ptr' : 'unique_ptr',
              code: 'auto p = std::make_unique<int>(42);',
              explanation: isSpanish ?
                'Puntero único con gestión automática de memoria' :
                'Unique pointer with automatic memory management',
              objects: [
                { type: 'smart_pointer', position: [-1, 0, 0], label: 'unique_ptr<int>' },
                { type: 'variable', position: [2, 0, 0], label: 'int(42)' }
              ]
            },
            {
              name: isSpanish ? 'shared_ptr' : 'shared_ptr',
              code: 'auto p1 = std::make_shared<int>(42);\nauto p2 = p1;',
              explanation: isSpanish ?
                'Puntero compartido con conteo de referencias' :
                'Shared pointer with reference counting',
              objects: [
                { type: 'smart_pointer', position: [-2, 1, 0], label: 'shared_ptr p1' },
                { type: 'smart_pointer', position: [-2, -1, 0], label: 'shared_ptr p2' },
                { type: 'variable', position: [2, 0, 0], label: 'int(42) [refs:2]' }
              ]
            }
          ]
        };
      case 'arithmetic':
        return {
          title: isSpanish ? 'Aritmética de Punteros' : 'Pointer Arithmetic',
          description: isSpanish ? 'Navegación por arrays' : 'Array navigation',
          demos: [
            {
              name: isSpanish ? 'Incremento' : 'Increment',
              code: 'int arr[3] = {10, 20, 30};\nint* p = arr;\np++;',
              explanation: isSpanish ?
                'Incremento del puntero al siguiente elemento' :
                'Pointer increment to next element',
              objects: [
                { type: 'variable', position: [-2, 0, 0], label: 'arr[0]=10' },
                { type: 'variable', position: [0, 0, 0], label: 'arr[1]=20' },
                { type: 'variable', position: [2, 0, 0], label: 'arr[2]=30' },
                { type: 'pointer', position: [0, 1, 0], label: 'p++' }
              ]
            }
          ]
        };
      case 'const':
        return {
          title: isSpanish ? 'Const Correctness' : 'Const Correctness',
          description: isSpanish ? 'Inmutabilidad en punteros' : 'Pointer immutability',
          demos: [
            {
              name: isSpanish ? 'Puntero a const' : 'Pointer to const',
              code: 'const int x = 42;\nconst int* p = &x;',
              explanation: isSpanish ?
                'Puntero que no puede modificar el valor' :
                'Pointer that cannot modify the value',
              objects: [
                { type: 'variable', position: [-2, 0, 0], label: 'const int x' },
                { type: 'pointer', position: [2, 0, 0], label: 'const int* p' }
              ]
            }
          ]
        };
      default:
        return {
          title: isSpanish ? 'Visualización de Punteros' : 'Pointer Visualization',
          description: isSpanish ? 'Conceptos de punteros en 3D' : 'Pointer concepts in 3D',
          demos: []
        };
    }
  }, [topic, state.language]);
  
  // Auto-play functionality
  React.useEffect(() => {
    if (!isPlaying || !getTopicContent.demos.length) return;
    
    const interval = setInterval(() => {
      setCurrentDemo(prev => (prev + 1) % getTopicContent.demos.length);
    }, 4000 / speed);
    
    return () => clearInterval(interval);
  }, [isPlaying, speed, getTopicContent.demos.length]);
  
  const nextDemo = useCallback(() => {
    setCurrentDemo(prev => (prev + 1) % getTopicContent.demos.length);
  }, [getTopicContent.demos.length]);
  
  const prevDemo = useCallback(() => {
    setCurrentDemo(prev => 
      prev === 0 ? getTopicContent.demos.length - 1 : prev - 1
    );
  }, [getTopicContent.demos.length]);
  
  const togglePlayback = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const content = getTopicContent;
  const currentDemoData = content.demos[currentDemo] || null;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '1rem',
        borderRadius: '8px',
        color: 'white',
        zIndex: 100
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#00d4ff' }}>
          {content.title}
        </h3>
        <p style={{ margin: '0', fontSize: '0.9rem' }}>
          {content.description}
        </p>
      </div>

      <Canvas camera={{ position: [0, 5, 8], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {currentDemoData?.objects.map((obj, index) => (
          <Enhanced3DObject
            key={`${currentDemo}-${index}`}
            position={obj.position as [number, number, number]}
            type={obj.type as 'variable' | 'pointer' | 'smart_pointer'}
            label={obj.label}
            isHighlighted={index === 0} // Highlight first object as active
            animated={animated}
          />
        ))}
        
        {/* Connection lines between related objects */}
        {currentDemoData?.objects && currentDemoData.objects.length > 1 && 
         currentDemoData.objects[0] && currentDemoData.objects[1] && (
          <line>
            <bufferGeometry>
              <bufferAttribute
                args={[
                  new Float32Array([
                    ...currentDemoData.objects[1].position,
                    ...currentDemoData.objects[0].position
                  ]), 
                  3
                ]}
                attach="attributes-position"
              />
            </bufferGeometry>
            <lineBasicMaterial 
              color="#00d4ff" 
              linewidth={2} 
              transparent 
              opacity={0.6} 
            />
          </line>
        )}
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
        />
        
        {/* Enhanced Demo Information Panel */}
        {currentDemoData && (
        <Html position={[0, -3, 0]} center>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,40,0.95))',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid rgba(0, 212, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            minWidth: '400px',
            maxWidth: '500px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            <h4 style={{ 
              color: '#00D4FF', 
              margin: '0 0 10px 0', 
              textAlign: 'center' 
            }}>
              {currentDemoData.name}
            </h4>
            
            <div style={{
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '10px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#4CAF50',
              whiteSpace: 'pre-wrap'
            }}>
              {currentDemoData.code}
            </div>
            
            <p style={{
              margin: '0 0 15px 0',
              fontSize: '13px',
              lineHeight: '1.4',
              color: '#B0BEC5'
            }}>
              {currentDemoData.explanation}
            </p>
            
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <button
                onClick={prevDemo}
                style={{
                  background: '#607D8B',
                  border: 'none',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ← Anterior
              </button>
              
              <button
                onClick={togglePlayback}
                style={{
                  background: isPlaying ? '#FF5722' : '#4CAF50',
                  border: 'none',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {isPlaying ? '⏸ Pausar' : '▶ Reproducir'}
              </button>
              
              <button
                onClick={nextDemo}
                style={{
                  background: '#00D4FF',
                  border: 'none',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Siguiente →
              </button>
            </div>
            
            <div style={{
              marginTop: '10px',
              textAlign: 'center',
              fontSize: '11px',
              color: '#666'
            }}>
              Demo {currentDemo + 1} de {content.demos.length}
            </div>
          </div>
        </Html>
        )}
      
      </Canvas>
    </div>
  );
});

export default EducationalPointerScene;