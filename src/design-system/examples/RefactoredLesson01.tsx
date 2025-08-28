/**
 * Refactored Lesson 01 - Raw Pointers
 * 
 * This example shows how to refactor the existing Lesson01_RawPtr.tsx
 * to use the new comprehensive design system.
 * 
 * BEFORE: Custom styled components with inconsistent patterns
 * AFTER: Unified design system with accessibility, performance, and consistency
 */

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useApp } from '../../context/AppContext';
import {
  // Layout components
  LessonLayout,
  Section,
  SectionTitle,
  InteractiveSection,
  
  // Interactive components
  LearningObjectives,
  
  // UI components
  Button,
  CodeBlock,
  
  // Utilities
  PerformanceMonitor,
  AccessibilityAnnouncer,
  generateAriaLabel,
  
  // Theme and types
  theme,
  type MemoryState,
  
  // Accessibility
  ScreenReaderOnly
} from '../index';

// 3D Scene Components (refactored for better performance and accessibility)
import { MemoryScene } from '../../3d';

// Enhanced memory state interface
interface EnhancedMemoryState extends MemoryState {
  x: number;
  p: number | null;
  pValue: number | null;
  showArrow: boolean;
  status: 'normal' | 'modified' | 'error';
  message: string;
  stepDescription: string;
}

export const RefactoredLesson01_RawPtr: React.FC = () => {
  const { state } = useApp();
  const performanceMonitor = PerformanceMonitor.getInstance();
  const announcer = AccessibilityAnnouncer.getInstance();
  
  // Enhanced state management
  const [memoryState, setMemoryState] = useState<EnhancedMemoryState>({
    blocks: [],
    pointers: [],
    warnings: [],
    errors: [],
    x: 42,
    p: 0x7fff5fbff71c,
    pValue: 42,
    showArrow: true,
    status: 'normal',
    message: state.language === 'en' ? 'p points correctly to x' : 'p apunta correctamente a x',
    stepDescription: 'Initial state with pointer correctly assigned'
  });

  const [currentStep, setCurrentStep] = useState(0);

  // Learning objectives
  const learningObjectives = [
    {
      id: 'understand-pointers',
      objective: 'Understand what pointers are and how they store addresses',
      description: 'Grasp the fundamental concept that pointers store memory addresses, not values',
      completed: currentStep >= 1
    },
    {
      id: 'address-of-operator',
      objective: 'Master the address-of operator (&)',
      description: 'Learn how & gets the memory address of a variable',
      completed: currentStep >= 2
    },
    {
      id: 'dereference-operator',
      objective: 'Understand the dereference operator (*)',
      description: 'Learn how * accesses the value at the address stored in a pointer',
      completed: currentStep >= 3
    },
    {
      id: 'pointer-stability',
      objective: 'Recognize that pointers store addresses, not values',
      description: 'Understand that changing a variable value does not change its address',
      completed: currentStep >= 4
    }
  ];

  // Enhanced step definitions with accessibility
  const steps = [
    {
      title: state.language === 'en' ? 'Variable Declaration' : 'Declaración de Variables',
      description: state.language === 'en' 
        ? 'Observe the declaration: int x = 42; int* p = &x;'
        : 'Observa la declaración: int x = 42; int* p = &x;',
      action: () => {
        announcer.announce('Step 1: Variable declaration demonstrated');
        setMemoryState(prev => ({
          ...prev,
          stepDescription: 'Variables declared and pointer initialized'
        }));
      },
      actionLabel: state.language === 'en' ? 'Show Declaration' : 'Mostrar Declaración',
      completed: currentStep >= 1,
      disabled: false
    },
    {
      title: state.language === 'en' ? 'Address Storage' : 'Almacenamiento de Dirección',
      description: state.language === 'en'
        ? 'See how p stores the memory address of x, not its value'
        : 'Ve cómo p almacena la dirección de memoria de x, no su valor',
      action: () => {
        announcer.announce('Step 2: Pointer address storage explained');
        setMemoryState(prev => ({
          ...prev,
          showArrow: true,
          stepDescription: 'Pointer arrow shows address relationship'
        }));
      },
      actionLabel: state.language === 'en' ? 'Show Address' : 'Mostrar Dirección',
      completed: currentStep >= 2,
      disabled: currentStep < 1
    },
    {
      title: state.language === 'en' ? 'Value Modification' : 'Modificación de Valor',
      description: state.language === 'en'
        ? 'Modify x and verify that p continues pointing to the same address'
        : 'Modifica x y verifica que p sigue apuntando a la misma dirección',
      action: () => {
        const newValue = memoryState.x + 10;
        setMemoryState(prev => ({
          ...prev,
          x: newValue,
          pValue: newValue,
          status: 'modified',
          message: state.language === 'en' 
            ? `x modified to ${newValue}. p continues pointing to the same address!`
            : `x modificado a ${newValue}. ¡p sigue apuntando a la misma dirección!`,
          stepDescription: `Value changed to ${newValue}, address unchanged`
        }));
        
        announcer.announceSuccess(`Value modified to ${newValue}, pointer address remains the same`);
        
        setTimeout(() => {
          setMemoryState(prev => ({
            ...prev,
            status: 'normal'
          }));
        }, 3000);
      },
      actionLabel: state.language === 'en' ? 'Modify x (+10)' : 'Modificar x (+10)',
      completed: currentStep >= 3,
      disabled: currentStep < 2
    },
    {
      title: state.language === 'en' ? 'Concept Mastery' : 'Dominio del Concepto',
      description: state.language === 'en'
        ? 'Understand that pointers store addresses, which remain constant'
        : 'Comprende que los punteros almacenan direcciones, que permanecen constantes',
      action: () => {
        announcer.announceSuccess('Lesson completed! You understand basic pointer concepts.');
      },
      actionLabel: state.language === 'en' ? 'Complete Lesson' : 'Completar Lección',
      completed: currentStep >= 4,
      disabled: currentStep < 3
    }
  ];

  // Performance monitoring
  useEffect(() => {
    performanceMonitor.startTiming('lesson-01-render');
    return () => {
      performanceMonitor.endTiming('lesson-01-render');
    };
  }, [performanceMonitor]);

  // Reset lesson state
  const resetLesson = () => {
    setMemoryState({
      blocks: [],
      pointers: [],
      warnings: [],
      errors: [],
      x: 42,
      p: 0x7fff5fbff71c,
      pValue: 42,
      showArrow: true,
      status: 'normal',
      message: state.language === 'en' ? 'p points correctly to x' : 'p apunta correctamente a x',
      stepDescription: 'Reset to initial state'
    });
    setCurrentStep(0);
    announcer.announce('Lesson reset to beginning');
  };

  const cppCode = `#include <iostream>

int main() {
    // Declare an integer variable on the stack
    int x = 42;
    
    // Declare a pointer that stores the address of x
    int* p = &x;  // & is the "address-of" operator
    
    std::cout << "Value of x: " << x << std::endl;
    std::cout << "Address of x: " << p << std::endl;
    std::cout << "Value through pointer: " << *p << std::endl;
    
    // Modify x - the pointer address doesn't change!
    x = 100;
    
    std::cout << "New value of x: " << x << std::endl;
    std::cout << "Address of x (unchanged): " << p << std::endl;
    std::cout << "New value through pointer: " << *p << std::endl;
    
    return 0;
}`;

  return (
    <LessonLayout
      title={state.language === 'en' 
        ? 'Lesson 1: Basic Pointers - int* p = &x' 
        : 'Lección 1: Punteros Básicos - int* p = &x'}
      subtitle={state.language === 'en'
        ? 'Understanding memory addresses and pointer fundamentals'
        : 'Comprendiendo direcciones de memoria y fundamentos de punteros'}
      lessonNumber={1}
           difficulty="Beginner"
      estimatedTime={15}
      progress={(currentStep / steps.length) * 100}
      showProgress
      showNavigation
      onNext={() => console.log('Navigate to lesson 2')}
      onPrevious={() => console.log('Navigate to introduction')}
      canGoNext={currentStep >= steps.length - 1}
      canGoPrevious={true}
    >
      <Section>
        {/* Learning Objectives */}
        <LearningObjectives
          objectives={learningObjectives}
                 />

        {/* Fundamental Theory Section */}
        <Section>
          <SectionTitle>
            📖 {state.language === 'en' ? 'Fundamental Theory' : 'Teoría Fundamental'}
          </SectionTitle>
          <div>
            <p>
              {state.language === 'en' 
                ? 'Pointers are variables that store memory addresses instead of direct values. This is the fundamental difference you need to internalize.'
                : 'Los punteros son variables que almacenan direcciones de memoria en lugar de valores directos. Esta es la diferencia fundamental que necesitas interiorizar.'}
            </p>
            
            <h4 style={{ color: theme.colors.secondary[500], marginTop: theme.spacing[4] }}>
              {state.language === 'en' ? 'Key Concepts:' : 'Conceptos Clave:'}
            </h4>
            <ul style={{ lineHeight: theme.typography.lineHeight.relaxed }}>
              <li>
                <strong>int x = 42;</strong> 
                {state.language === 'en' 
                  ? ' - Normal variable storing value 42 on the stack'
                  : ' - Variable normal que almacena el valor 42 en la pila'}
              </li>
              <li>
                <strong>int* p = &x;</strong>
                {state.language === 'en' 
                  ? ' - Pointer storing the address where x lives'
                  : ' - Puntero que almacena la dirección donde vive x'}
              </li>
              <li>
                <strong>&x</strong>
                {state.language === 'en' 
                  ? ' - Address-of operator: "give me the address of x"'
                  : ' - Operador address-of: "dame la dirección de x"'}
              </li>
              <li>
                <strong>*p</strong>
                {state.language === 'en' 
                  ? ' - Dereference operator: "give me the value at the address p"'
                  : ' - Operador de desreferencia: "dame el valor en la dirección p"'}
              </li>
            </ul>
          </div>
        </Section>

        {/* Code Example Section */}
        <Section>
          <SectionTitle>
            💻 {state.language === 'en' ? 'C++ Example Code' : 'Código C++ de Ejemplo'}
          </SectionTitle>
          <CodeBlock
            language="cpp"
            title={state.language === 'en' ? 'Basic Pointer Example' : 'Ejemplo Básico de Punteros'}
            showLineNumbers
            copyable
            highlightLines={[4, 5]}
          >
            {cppCode}
          </CodeBlock>
        </Section>

        {/* Interactive Exercise */}
        <InteractiveSection>
          <SectionTitle>
            🎮 {state.language === 'en' ? 'Interactive Exercise' : 'Ejercicio Interactivo'}
          </SectionTitle>
          
          <div>
            {/* Step Exercise - Simplified Implementation */}
            <p>Interactive exercise content would go here</p>
          </div>

          <div style={{ marginTop: theme.spacing[4] }}>
            <Button
              variant="secondary"
              onClick={resetLesson}
              aria-label={state.language === 'en' ? 'Reset lesson to beginning' : 'Reiniciar lección al principio'}
            >
              {state.language === 'en' ? '🔄 Reset Lesson' : '🔄 Reiniciar Lección'}
            </Button>
          </div>
        </InteractiveSection>

        {/* Critical Understanding Point */}
        <Section>
          <SectionTitle>
            🔍 {state.language === 'en' ? 'Critical Understanding Point' : 'Punto Crítico de Entendimiento'}
          </SectionTitle>
          <div>
            <div style={{
              background: 'rgba(255, 202, 40, 0.1)',
              border: '1px solid #ffca28',
              borderRadius: theme.borderRadius.md,
              padding: theme.spacing[4],
              margin: `${theme.spacing[4]} 0`
            }}>
              <strong>⚠️ {state.language === 'en' ? 'Fundamental Concept:' : 'Concepto Fundamental:'}</strong>
              <br/>
              <br/>
              {state.language === 'en' 
                ? 'When you reassign x = 100, the pointer p does NOT change because it stores an address, not a value. The address of x remains constant throughout its lifetime.'
                : 'Cuando reasignas x = 100, el puntero p NO cambia porque almacena una dirección, no un valor. La dirección de x permanece constante durante toda su vida útil.'}
            </div>
          </div>
        </Section>
      </Section>

      <Section>
        <div>
          <div>🎯 {state.language === 'en' ? 'Lesson 1: Basic Pointers' : 'Lección 1: Punteros Básicos'}</div>
          <div>
            📍 {state.language === 'en' ? `Step: ${currentStep + 1}/${steps.length}` : `Paso: ${currentStep + 1}/${steps.length}`}
          </div>
          <div>
            🔗 {state.language === 'en' ? `Status: ${memoryState.status}` : `Estado: ${memoryState.status}`}
          </div>
          
          <ScreenReaderOnly>
            {generateAriaLabel.memoryState(
              'x', 
              memoryState.x.toString(), 
              memoryState.p?.toString(16)
            )}
          </ScreenReaderOnly>
        </div>
        
        <Canvas 
          camera={{ position: [0, 5, 8], fov: 45 }}
          aria-label={generateAriaLabel.visualization('memory layout', true)}
        >
          <MemoryScene />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={15}
          />
        </Canvas>
        
        {/* Memory state description for accessibility */}
        <div style={{
          position: 'absolute',
          bottom: theme.spacing[4],
          left: theme.spacing[4],
          right: theme.spacing[4],
          background: 'rgba(0, 0, 0, 0.8)',
          padding: theme.spacing[3],
          borderRadius: theme.borderRadius.md,
          color: theme.colors.text.primary,
          fontSize: theme.typography.fontSize.sm
        }}>
          <h4 style={{ color: theme.colors.primary[500], margin: `0 0 ${theme.spacing[2]} 0` }}>
            {state.language === 'en' ? 'Memory State' : 'Estado de Memoria'}
          </h4>
          <p style={{ margin: 0, fontFamily: theme.typography.fontFamily.code }}>
            x = {memoryState.x} | p = {memoryState.p ? `&x (${memoryState.p.toString(16)})` : 'nullptr'}
          </p>
          <p style={{ 
            margin: `${theme.spacing[2]} 0 0 0`, 
            color: memoryState.status === 'error' ? theme.colors.error : theme.colors.secondary[500],
            fontWeight: theme.typography.fontWeight.bold
          }}>
            {memoryState.message}
          </p>
        </div>
      </Section>
    </LessonLayout>
  );
};

export default RefactoredLesson01_RawPtr;