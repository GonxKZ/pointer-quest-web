import React, { useState } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import * as THREE from 'three';

interface CastState {
  sourceType: 'int' | 'float' | 'const_int' | 'base_ptr' | 'void_ptr';
  targetType: 'int' | 'float' | 'const_int' | 'derived_ptr' | 'char_ptr' | 'void_ptr';
  castType: 'static_cast' | 'reinterpret_cast' | 'const_cast' | 'dynamic_cast';
  sourceValue: string;
  resultValue: string;
  isValidCast: boolean;
  isSafeCast: boolean;
  showWarning: boolean;
  runtimeError: boolean;
  demonstration: 'basic' | 'hierarchy' | 'const_removal' | 'reinterpret';
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #e0e6ed;
  font-family: 'Cascadia Code', 'Fira Code', monospace;
`;

const Header = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-bottom: 2px solid #00d4ff;
`;

const Title = styled.h1`
  margin: 0;
  color: #00d4ff;
  font-size: 1.8rem;
  text-align: center;
`;

const Subtitle = styled.p`
  margin: 0.5rem 0 0 0;
  text-align: center;
  opacity: 0.8;
  font-size: 1.1rem;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  gap: 1rem;
  padding: 1rem;
`;

const LeftPanel = styled.div`
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid rgba(0, 212, 255, 0.3);
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const VisualizationArea = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  border: 1px solid rgba(0, 212, 255, 0.3);
  height: 400px;
`;

const ControlsArea = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid rgba(0, 212, 255, 0.3);
`;

const TheorySection = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid rgba(0, 212, 255, 0.3);
  margin-top: 1rem;
`;

const CodeBlock = styled.pre`
  background: rgba(0, 0, 0, 0.4);
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #00d4ff;
  overflow-x: auto;
  font-family: 'Cascadia Code', 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.7rem 1.2rem;
  margin: 0.3rem;
  border: none;
  border-radius: 6px;
  font-family: 'Cascadia Code', monospace;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.$variant) {
      case 'danger':
        return `
          background: linear-gradient(135deg, #ff4757, #ff3742);
          color: white;
          &:hover { background: linear-gradient(135deg, #ff3742, #ff2f3a); }
        `;
      case 'secondary':
        return `
          background: linear-gradient(135deg, #57606f, #4f5966);
          color: white;
          &:hover { background: linear-gradient(135deg, #4f5966, #47505e); }
        `;
      default:
        return `
          background: linear-gradient(135deg, #00d4ff, #0099cc);
          color: #001a2e;
          &:hover { background: linear-gradient(135deg, #0099cc, #007399); }
        `;
    }
  }}
`;

const StatusDisplay = styled.div<{ $type: 'info' | 'warning' | 'success' | 'error' }>`
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border-left: 4px solid;
  
  ${props => {
    switch (props.$type) {
      case 'error':
        return `
          background: rgba(255, 71, 87, 0.1);
          border-color: #ff4757;
          color: #ff6b7a;
        `;
      case 'warning':
        return `
          background: rgba(255, 165, 0, 0.1);
          border-color: #ffa500;
          color: #ffb84d;
        `;
      case 'success':
        return `
          background: rgba(46, 213, 115, 0.1);
          border-color: #2ed573;
          color: #4ade80;
        `;
      default:
        return `
          background: rgba(0, 212, 255, 0.1);
          border-color: #00d4ff;
          color: #00d4ff;
        `;
    }
  }}
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`;

const InfoCard = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 212, 255, 0.2);
`;

const Highlight = styled.span<{ $color?: string }>`
  color: ${props => props.$color || '#00d4ff'};
  font-weight: bold;
`;

const Input = styled.input`
  padding: 0.5rem;
  margin: 0.5rem;
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
  color: #e0e6ed;
  font-family: 'Cascadia Code', monospace;
  width: 120px;
`;

function CastVisualization({ state }: { state: CastState }) {
  const { sourceType, targetType, castType, sourceValue, resultValue, isValidCast, isSafeCast, showWarning, runtimeError } = state;

  const getCastColor = () => {
    if (runtimeError) return '#ff4757';
    if (!isValidCast) return '#ff4757';
    if (!isSafeCast) return '#ffa500';
    return '#2ed573';
  };

  const renderCastProcess = () => (
    <group>
      {/* Source type/value */}
      <group position={[-3, 0, 0]}>
        <Box args={[1.5, 1, 0.3]}>
          <meshStandardMaterial color="#57606f" transparent opacity={0.8} />
        </Box>
        <Text
          position={[0, 0.3, 0.2]}
          fontSize={0.15}
          color="#00d4ff"
          anchorX="center"
        >
          {sourceType}
        </Text>
        <Text
          position={[0, 0, 0.2]}
          fontSize={0.12}
          color="white"
          anchorX="center"
        >
          {sourceValue}
        </Text>
        <Text
          position={[0, -0.3, 0.2]}
          fontSize={0.1}
          color="#888"
          anchorX="center"
        >
          SOURCE
        </Text>
      </group>

      {/* Cast operation */}
      <group position={[0, 0, 0]}>
        <Box args={[2, 0.6, 0.2]}>
          <meshStandardMaterial color={getCastColor()} transparent opacity={0.7} />
        </Box>
        <Text
          position={[0, 0, 0.15]}
          fontSize={0.12}
          color="white"
          anchorX="center"
        >
          {castType}
        </Text>
        
        {/* Arrow */}
        <mesh position={[1.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.15, 0.4]} />
          <meshStandardMaterial color={getCastColor()} />
        </mesh>
        
        <mesh position={[-1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.15, 0.4]} />
          <meshStandardMaterial color={getCastColor()} />
        </mesh>
      </group>

      {/* Target type/value */}
      <group position={[3, 0, 0]}>
        <Box args={[1.5, 1, 0.3]}>
          <meshStandardMaterial 
            color={isValidCast ? '#2ed573' : '#ff4757'} 
            transparent 
            opacity={0.8} 
          />
        </Box>
        <Text
          position={[0, 0.3, 0.2]}
          fontSize={0.15}
          color="white"
          anchorX="center"
        >
          {targetType}
        </Text>
        <Text
          position={[0, 0, 0.2]}
          fontSize={0.12}
          color="white"
          anchorX="center"
        >
          {isValidCast ? resultValue : 'ERROR'}
        </Text>
        <Text
          position={[0, -0.3, 0.2]}
          fontSize={0.1}
          color="#888"
          anchorX="center"
        >
          TARGET
        </Text>
      </group>

      {/* Status indicators */}
      <group position={[0, -1.5, 0]}>
        {!isValidCast && (
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.15}
            color="#ff4757"
            anchorX="center"
          >
            ❌ COMPILATION ERROR
          </Text>
        )}
        
        {isValidCast && !isSafeCast && (
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.15}
            color="#ffa500"
            anchorX="center"
          >
            ⚠️ POTENTIALLY UNSAFE
          </Text>
        )}
        
        {isValidCast && isSafeCast && (
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.15}
            color="#2ed573"
            anchorX="center"
          >
            ✅ SAFE CAST
          </Text>
        )}
        
        {runtimeError && (
          <Text
            position={[0, 0, 0]}
            fontSize={0.15}
            color="#ff4757"
            anchorX="center"
          >
            💥 RUNTIME ERROR
          </Text>
        )}
      </group>

      {/* Type information */}
      <group position={[0, 1.5, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.12}
          color="#00d4ff"
          anchorX="center"
        >
          {getCastDescription(castType)}
        </Text>
      </group>
    </group>
  );

  const getCastDescription = (cast: string) => {
    switch (cast) {
      case 'static_cast':
        return 'Compile-time type conversion with basic checks';
      case 'reinterpret_cast':
        return 'Low-level bit reinterpretation - dangerous!';
      case 'const_cast':
        return 'Remove/add const/volatile qualifiers';
      case 'dynamic_cast':
        return 'Runtime polymorphic type checking';
      default:
        return '';
    }
  };

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      {renderCastProcess()}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
}

const Lesson28_CastLaboratory: React.FC = () => {
  const [state, setState] = useState<CastState>({
    sourceType: 'int',
    targetType: 'float',
    castType: 'static_cast',
    sourceValue: '42',
    resultValue: '42.0f',
    isValidCast: true,
    isSafeCast: true,
    showWarning: false,
    runtimeError: false,
    demonstration: 'basic'
  });

  const evaluateCast = (sourceType: string, targetType: string, castType: string) => {
    let isValid = true;
    let isSafe = true;
    let hasWarning = false;
    let runtimeError = false;
    let resultValue = 'result';

    // Cast validation logic
    switch (castType) {
      case 'static_cast':
        // Basic type conversions
        if ((sourceType === 'int' && targetType === 'float') ||
            (sourceType === 'float' && targetType === 'int')) {
          isValid = true;
          isSafe = true;
          resultValue = sourceType === 'int' ? '42.0f' : '42';
        }
        // Pointer conversions
        else if (sourceType === 'base_ptr' && targetType === 'derived_ptr') {
          isValid = true;
          isSafe = false;
          hasWarning = true;
          resultValue = 'derived*';
        }
        // Invalid conversions
        else if (sourceType === 'int' && targetType === 'char_ptr') {
          isValid = false;
        }
        // const_int to int
        else if (sourceType === 'const_int' && targetType === 'int') {
          isValid = false; // Can't remove const with static_cast
        }
        else {
          resultValue = 'converted';
        }
        break;

      case 'reinterpret_cast':
        // Almost always compiles but often unsafe
        if (sourceType === 'int' && targetType === 'char_ptr') {
          isValid = true;
          isSafe = false;
          hasWarning = true;
          resultValue = '(char*)0x2A';
        }
        else if (sourceType === 'void_ptr' && targetType === 'int') {
          isValid = true;
          isSafe = false;
          hasWarning = true;
          resultValue = 'raw_bits';
        }
        else {
          isValid = true;
          isSafe = false;
          hasWarning = true;
          resultValue = 'reinterpreted';
        }
        break;

      case 'const_cast':
        // Only for const/volatile changes
        if (sourceType === 'const_int' && targetType === 'int') {
          isValid = true;
          isSafe = false; // Dangerous if original was const
          hasWarning = true;
          resultValue = 'non_const';
        }
        else if (sourceType === 'int' && targetType === 'const_int') {
          isValid = true;
          isSafe = true;
          resultValue = 'const_val';
        }
        else {
          isValid = false;
        }
        break;

      case 'dynamic_cast':
        // Only for polymorphic types
        if (sourceType === 'base_ptr' && targetType === 'derived_ptr') {
          isValid = true;
          isSafe = true;
          // Simulate runtime failure
          if (Math.random() > 0.7) {
            runtimeError = true;
            resultValue = 'nullptr';
          } else {
            resultValue = 'derived*';
          }
        }
        else if (sourceType === 'derived_ptr' && targetType === 'base_ptr') {
          isValid = true;
          isSafe = true;
          resultValue = 'base*';
        }
        else {
          isValid = false;
        }
        break;
    }

    return { isValid, isSafe, hasWarning, runtimeError, resultValue };
  };

  const handleCastChange = (newCastType: string, newSourceType?: string, newTargetType?: string) => {
    const sourceType = newSourceType || state.sourceType;
    const targetType = newTargetType || state.targetType;
    const result = evaluateCast(sourceType, targetType, newCastType);
    
    setState(prev => ({
      ...prev,
      castType: newCastType as any,
      sourceType: sourceType as any,
      targetType: targetType as any,
      ...result,
      showWarning: result.hasWarning
    }));
  };

  const performCast = () => {
    const result = evaluateCast(state.sourceType, state.targetType, state.castType);
    setState(prev => ({ ...prev, ...result, showWarning: result.hasWarning }));
  };

  const getCurrentExample = () => {
    const { sourceType, targetType, castType, sourceValue } = state;
    
    const examples = {
      static_cast: `${sourceType} source = ${sourceValue};
${targetType} target = static_cast<${targetType}>(source);`,
      reinterpret_cast: `${sourceType} source = ${sourceValue};
${targetType} target = reinterpret_cast<${targetType}>(source);`,
      const_cast: `${sourceType} source = ${sourceValue};
${targetType} target = const_cast<${targetType}>(source);`,
      dynamic_cast: `${sourceType} source = ${sourceValue};
${targetType} target = dynamic_cast<${targetType}>(source);`
    };

    return examples[castType as keyof typeof examples];
  };

  return (
    <Container>
      <Header>
        <Title>🧪 Cast Laboratory</Title>
        <Subtitle>Exploring static_cast, reinterpret_cast, const_cast, and dynamic_cast</Subtitle>
      </Header>

      <MainContent>
        <LeftPanel>
          <h3>📚 C++ Cast Theory</h3>
          
          <StatusDisplay $type="info">
            <strong>C++ Casting System</strong><br/>
            Four explicit cast operators provide different levels of safety and semantics
            for type conversions, replacing dangerous C-style casts.
          </StatusDisplay>

          <h4>🎯 Cast Types</h4>
          <Grid>
            <InfoCard>
              <h4>static_cast&lt;T&gt;</h4>
              <CodeBlock>{[
                '// Well-defined conversions',
                'int i = 42;',
                'float f = static_cast<float>(i);     // ✅ Safe',
                '',
                '// Pointer hierarchy (up only)',
                'Derived* d = new Derived();',
                'Base* b = static_cast<Base*>(d);     // ✅ Safe upcast',
                '',
                '// Reverse (dangerous!)',
                'Base* b = new Base();',
                'Derived* d = static_cast<Derived*>(b); // ⚠️ Unchecked downcast',
                '',
                '// Compile-time checks prevent nonsense',
                "int* p = static_cast<int*>(42);      // ❌ Won't compile",
              ].join('\n')}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>dynamic_cast&lt;T&gt;</h4>
              <CodeBlock>{[
                '// Runtime polymorphic checking',
                'class Base { virtual ~Base() {} };',
                'class Derived : public Base {};',
                '',
                'Base* b = new Derived();',
                'Derived* d = dynamic_cast<Derived*>(b); // ✅ Safe, checked',
                '',
                '// Returns nullptr on failure',
                'Base* b = new Base();',
                'Derived* d = dynamic_cast<Derived*>(b); // Returns nullptr',
                '',
                '// References throw std::bad_cast on failure',
                'try {',
                '    Derived& d = dynamic_cast<Derived&>(*b);',
                '} catch (std::bad_cast&) {',
                '    // Handle failed cast',
                '}',
              ].join('\n')}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>const_cast&lt;T&gt;</h4>
              <CodeBlock>{[
                '// Remove/add const/volatile ONLY',
                'const int ci = 42;',
                'int& i = const_cast<int&>(ci);       // ✅ Compiles',
                'i = 100;                             // ⚠️ UB if ci was originally const!',
                '',
                '// Add const (always safe)',
                'int i = 42;',
                'const int& ci = const_cast<const int&>(i); // ✅ Safe',
                '',
                "// Can't change type",
                'const int ci = 42;',
                "float f = const_cast<float>(ci);     // ❌ Won't compile",
                '',
                '// Common pattern: const member function calling non-const',
                'class Widget {',
                '    void helper() { /* non-const work */ }',
                'public:',
                '    void func() const {',
                '        const_cast<Widget*>(this)->helper(); // Common idiom',
                '    }',
                '};',
              ].join('\n')}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>reinterpret_cast&lt;T&gt;</h4>
              <CodeBlock>{[
                '// Low-level bit reinterpretation - DANGEROUS!',
                'int i = 42;',
                'char* p = reinterpret_cast<char*>(&i); // ✅ Compiles, ⚠️ unsafe',
                '',
                '// Pointer to integer',
                'uintptr_t addr = reinterpret_cast<uintptr_t>(p); // Common for addresses',
                '',
                '// Between function pointers (platform dependent)',
                'void (*fp1)() = some_function;',
                'int (*fp2)(int) = reinterpret_cast<int(*)(int)>(fp1); // ⚠️ Dangerous',
                '',
                '// NEVER use for object conversions',
                'Base* b = reinterpret_cast<Base*>(new Derived()); // ❌ Use static_cast',
                '',
                '// Type punning (often UB, use std::bit_cast in C++20)',
                'float f = 3.14f;',
                'uint32_t bits = reinterpret_cast<uint32_t&>(f); // ⚠️ UB',
                'uint32_t bits = std::bit_cast<uint32_t>(f);     // ✅ C++20',
              ].join('\n')}</CodeBlock>
            </InfoCard>
          </Grid>

          <h4>⚠️ Safety Guidelines</h4>
          <CodeBlock>{[
            '// Preference order (safest to most dangerous):',
            '1. No cast (implicit conversion)',
            '2. static_cast<T>()     // Well-defined conversions',
            '3. dynamic_cast<T>()    // Polymorphic hierarchy only',
            '4. const_cast<T>()      // const/volatile changes only',
            '5. reinterpret_cast<T>() // Last resort, very dangerous',
            '',
            '// NEVER use C-style casts',
            'int i = (int)some_float;           // ❌ Hides what\'s happening',
            'int i = static_cast<int>(some_float); // ✅ Explicit intent',
            '',
            '// Common mistakes to avoid:',
            'void* ptr = malloc(sizeof(int));',
            'int* iptr = (int*)ptr;             // ❌ C-style cast',
            'int* iptr = static_cast<int*>(ptr); // ✅ Clear intent',
            '',
            '// reinterpret_cast for unrelated types',
            'float f = reinterpret_cast<float>(42); // ❌ Use static_cast',
            'float f = static_cast<float>(42);      // ✅ Correct',
          ].join('\n')}</CodeBlock>

          <TheorySection>
            <h4>🔍 Current Cast Analysis</h4>
            <StatusDisplay $type={state.isValidCast ? (state.isSafeCast ? 'success' : 'warning') : 'error'}>
              <strong>Cast:</strong> {state.castType}&lt;{state.targetType}&gt;({state.sourceType})<br/>
              <strong>Validity:</strong> {state.isValidCast ? 'Compiles' : 'Compilation Error'}<br/>
              <strong>Safety:</strong> {state.isSafeCast ? 'Safe' : 'Potentially Dangerous'}<br/>
              {state.runtimeError && (<>
                <strong>Runtime:</strong> Throws/Returns nullptr
              </>)}
            </StatusDisplay>
            
            <h4>💻 Generated Code</h4>
            <CodeBlock>{getCurrentExample()}</CodeBlock>
          </TheorySection>
        </LeftPanel>

        <RightPanel>
          <VisualizationArea>
            <CastVisualization state={state} />
          </VisualizationArea>

          <ControlsArea>
            <h4>🎮 Cast Controls</h4>
            
            <div>
              <strong>Cast Type:</strong><br/>
              <Button 
                $variant={state.castType === 'static_cast' ? 'primary' : 'secondary'}
                onClick={() => handleCastChange('static_cast')}
              >
                static_cast
              </Button>
              <Button 
                $variant={state.castType === 'dynamic_cast' ? 'primary' : 'secondary'}
                onClick={() => handleCastChange('dynamic_cast')}
              >
                dynamic_cast
              </Button>
              <Button 
                $variant={state.castType === 'const_cast' ? 'primary' : 'secondary'}
                onClick={() => handleCastChange('const_cast')}
              >
                const_cast
              </Button>
              <Button 
                $variant={state.castType === 'reinterpret_cast' ? 'primary' : 'secondary'}
                onClick={() => handleCastChange('reinterpret_cast')}
              >
                reinterpret_cast
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Source Type:</strong><br/>
              <select 
                value={state.sourceType}
                onChange={(e) => handleCastChange(state.castType, e.target.value, state.targetType)}
                style={{ 
                  padding: '0.5rem', 
                  margin: '0.5rem',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#e0e6ed',
                  border: '1px solid rgba(0,212,255,0.3)'
                }}
              >
                <option value="int">int</option>
                <option value="float">float</option>
                <option value="const_int">const int</option>
                <option value="base_ptr">Base*</option>
                <option value="void_ptr">void*</option>
              </select>
              
              <Input 
                type="text"
                value={state.sourceValue}
                onChange={(e) => setState(prev => ({ ...prev, sourceValue: e.target.value }))}
                placeholder="source value"
              />
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Target Type:</strong><br/>
              <select 
                value={state.targetType}
                onChange={(e) => handleCastChange(state.castType, state.sourceType, e.target.value)}
                style={{ 
                  padding: '0.5rem', 
                  margin: '0.5rem',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#e0e6ed',
                  border: '1px solid rgba(0,212,255,0.3)'
                }}
              >
                <option value="int">int</option>
                <option value="float">float</option>
                <option value="const_int">const int</option>
                <option value="derived_ptr">Derived*</option>
                <option value="char_ptr">char*</option>
                <option value="void_ptr">void*</option>
              </select>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <Button onClick={performCast}>
                🔄 Re-evaluate Cast
              </Button>
              
              <Button 
                onClick={() => setState(prev => ({ ...prev, sourceType: 'int', targetType: 'float', castType: 'static_cast' }))}
              >
                Reset to Safe Cast
              </Button>
            </div>

            <StatusDisplay $type={state.showWarning ? 'warning' : 'info'}>
              <strong>Current Status:</strong><br/>
              {!state.isValidCast && <Highlight $color="#ff4757">❌ This cast will not compile!</Highlight>}<br/>
              {state.isValidCast && !state.isSafeCast && <Highlight $color="#ffa500">⚠️ Dangerous cast - potential runtime issues</Highlight>}<br/>
              {state.isValidCast && state.isSafeCast && <Highlight $color="#2ed573">✅ Safe conversion</Highlight>}<br/>
              {state.runtimeError && <Highlight $color="#ff4757">💥 Runtime failure (nullptr/exception)</Highlight>}
            </StatusDisplay>
          </ControlsArea>
        </RightPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson28_CastLaboratory;
