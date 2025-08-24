# Design System Usage Guide

This guide provides practical examples for implementing the Pointer Quest Design System across all lesson types, from basic pointer concepts (1-20) to advanced performance optimization (101-120).

## 📖 Table of Contents

1. [Basic Lesson Structure](#basic-lesson-structure)
2. [Advanced Lesson Components](#advanced-lesson-components)
3. [Responsive Design Patterns](#responsive-design-patterns)
4. [Accessibility Implementation](#accessibility-implementation)
5. [Performance Optimization](#performance-optimization)
6. [Theme Customization](#theme-customization)
7. [Common Patterns](#common-patterns)

## 🏗️ Basic Lesson Structure

### Standard Two-Panel Layout (Lessons 1-80)

```tsx
import React, { useState } from 'react';
import { 
  LessonLayout, 
  TheoryPanel, 
  VisualizationPanel,
  Section,
  SectionTitle,
  SectionContent
} from '../design-system/components/Layout';
import { Button } from '../design-system/components/Button';
import { CodeBlockComponent } from '../design-system/components/CodeBlock';

export const Lesson75_PlacementNew: React.FC = () => {
  const [memoryState, setMemoryState] = useState({
    buffer: null,
    objects: []
  });

  return (
    <LessonLayout
      title="Placement New and Memory Alignment"
      subtitle="Advanced memory allocation techniques"
      lessonNumber={75}
      topic="advanced"
      difficulty="Expert"
      estimatedTime={30}
      prerequisites={[72, 73, 74]}
      showProgress
      showNavigation
    >
      <TheoryPanel topic="advanced">
        <Section>
          <SectionTitle>🎯 Learning Objectives</SectionTitle>
          <SectionContent>
            <ul>
              <li>Understand placement new operator</li>
              <li>Master memory alignment concepts</li>
              <li>Implement custom memory allocators</li>
              <li>Avoid undefined behavior in placement scenarios</li>
            </ul>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>💻 Placement New Syntax</SectionTitle>
          <CodeBlockComponent
            language="cpp"
            title="Basic Placement New"
            showLineNumbers
            copyable
            highlightLines={[3, 4]}
            annotations={[
              {
                line: 3,
                type: "warning",
                content: "Memory must be properly aligned"
              },
              {
                line: 4, 
                type: "info",
                content: "Constructs object at specified address"
              }
            ]}
          >
{`#include <new>

alignas(MyClass) char buffer[sizeof(MyClass)];
MyClass* obj = new (buffer) MyClass(args);

// Don't forget explicit destructor call!
obj->~MyClass();`}
          </CodeBlockComponent>
        </Section>
      </TheoryPanel>

      <VisualizationPanel topic="advanced">
        {/* 3D Memory visualization goes here */}
        <Canvas>
          <PlacementNewVisualization memoryState={memoryState} />
        </Canvas>
      </VisualizationPanel>
    </LessonLayout>
  );
};
```

### Three-Panel Layout (Complex Lessons 90-120)

```tsx
export const Lesson95_LockFreeProgramming: React.FC = () => {
  return (
    <LessonContainer layoutType="three-panel">
      <TheoryPanel topic="atomic">
        {/* Theory content */}
      </TheoryPanel>
      
      <CodePanel topic="atomic">
        <CodePlayground
          language="cpp"
          initialCode={lockFreeQueueCode}
          onExecute={executeLockFreeExample}
          topic="atomic"
        />
      </CodePanel>
      
      <VisualizationPanel topic="atomic">
        <AtomicOperationDemo
          title="Lock-Free Queue Visualization"
          operations={lockFreeOperations}
        />
      </VisualizationPanel>
    </LessonContainer>
  );
};
```

## 🚀 Advanced Lesson Components

### Undefined Behavior Demonstrations (Lessons 61-80)

```tsx
import { UndefinedBehaviorWarning } from '../design-system/components/AdvancedEducational';

// Lesson 67: Buffer Overflow UB
<UndefinedBehaviorWarning
  severity="extreme"
  title="Buffer Overflow - Undefined Behavior"
  description="Writing beyond array boundaries causes undefined behavior and security vulnerabilities."
  codeExample={`char buffer[10];
strcpy(buffer, "This string is way too long for the buffer"); // UB!`}
  consequences={[
    "Stack corruption and crashes",
    "Security vulnerabilities (buffer overflow attacks)",
    "Silent data corruption in adjacent variables",
    "Unpredictable program behavior"
  ]}
>
  <Button 
    variant="danger"
    onClick={() => demonstrateBufferOverflow()}
  >
    ⚠️ Demonstrate UB (Safe Simulation)
  </Button>
</UndefinedBehaviorWarning>
```

### Performance Benchmarking (Lessons 101-120)

```tsx
import { PerformanceComparison } from '../design-system/components/AdvancedEducational';

// Lesson 108: Cache-Friendly Data Structures
<PerformanceComparison
  title="Array of Structures vs Structure of Arrays"
  approaches={[
    {
      name: "Array of Structures (AoS)",
      code: `struct Particle {
    float x, y, z;    // position
    float vx, vy, vz; // velocity
};
std::vector<Particle> particles(10000);

// Update positions - poor cache locality
for (auto& p : particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt; 
    p.z += p.vz * dt;
}`,
      performance: "slow",
      description: "Poor cache locality - scattered memory access",
      metrics: {
        time: "45.2ms",
        memory: "240KB",
        cacheMisses: 8500
      }
    },
    {
      name: "Structure of Arrays (SoA)",
      code: `struct ParticleSystem {
    std::vector<float> x, y, z;    // positions
    std::vector<float> vx, vy, vz; // velocities
};
ParticleSystem particles;
particles.x.resize(10000);
// ... resize other vectors

// Update positions - excellent cache locality
for (size_t i = 0; i < particles.x.size(); ++i) {
    particles.x[i] += particles.vx[i] * dt;
    particles.y[i] += particles.vy[i] * dt;
    particles.z[i] += particles.vz[i] * dt;
}`,
      performance: "optimal",
      description: "Excellent cache locality - sequential memory access",
      metrics: {
        time: "12.8ms",
        memory: "240KB", 
        cacheMisses: 1200
      }
    }
  ]}
  onRunBenchmark={(index) => runCacheBenchmark(index)}
  benchmarkResults={benchmarkResults}
/>
```

### Memory Layout Analysis (Lessons 75-85)

```tsx
import { MemoryLayoutVisualizer } from '../design-system/components/AdvancedEducational';

// Lesson 79: Optimizing Struct Layout
<MemoryLayoutVisualizer
  title="Impact of Member Ordering on Memory Usage"
  structures={[
    {
      name: "UnoptimizedStruct",
      members: [
        { name: "flag", type: "bool", size: 1, offset: 0, padding: 3 },
        { name: "id", type: "int", size: 4, offset: 4, padding: 0 },
        { name: "active", type: "bool", size: 1, offset: 8, padding: 7 },
        { name: "timestamp", type: "long", size: 8, offset: 16, padding: 0 }
      ],
      totalSize: 24,
      alignment: 8
    },
    {
      name: "OptimizedStruct",
      members: [
        { name: "timestamp", type: "long", size: 8, offset: 0, padding: 0 },
        { name: "id", type: "int", size: 4, offset: 8, padding: 0 },
        { name: "flag", type: "bool", size: 1, offset: 12, padding: 0 },
        { name: "active", type: "bool", size: 1, offset: 13, padding: 2 }
      ],
      totalSize: 16,
      alignment: 8
    }
  ]}
  showPadding
  showAlignment
>
  <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(72, 187, 120, 0.1)', borderRadius: '8px' }}>
    <strong>Memory Savings:</strong> 33% reduction (24 bytes → 16 bytes)<br/>
    <strong>Cache Performance:</strong> Improved - fits in fewer cache lines<br/>
    <strong>Array Performance:</strong> 1.5x better when used in arrays
  </div>
</MemoryLayoutVisualizer>
```

## 📱 Responsive Design Patterns

### Adaptive Layout Based on Screen Size

```tsx
import { useMediaQuery } from '../design-system/utils/responsive';

export const ResponsiveLessonComponent: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  return (
    <LessonLayout
      layoutType={isMobile ? 'mobile-stack' : isTablet ? 'two-panel' : 'three-panel'}
    >
      <TheoryPanel>
        {/* Content automatically adapts */}
      </TheoryPanel>
      
      {!isMobile && (
        <VisualizationPanel>
          {/* Hide complex 3D on mobile */}
        </VisualizationPanel>
      )}
    </LessonLayout>
  );
};
```

### Responsive Grid System

```tsx
import { Grid, Container } from '../design-system/components/Layout';

<Container size="xl" padding="4">
  <Grid 
    columns={4}        // Desktop: 4 columns
    responsive         // Tablet: 2 columns, Mobile: 1 column
    gap="4"
  >
    <ConceptCard topic="basic" />
    <ConceptCard topic="smart" />
    <ConceptCard topic="memory" />
    <ConceptCard topic="advanced" />
  </Grid>
</Container>
```

## ♿ Accessibility Implementation

### WCAG 2.1 AA Compliant Components

```tsx
import { 
  AccessibleButton,
  AccessibleProgress,
  ScreenReaderOnly,
  AccessibleModal
} from '../design-system/components/AccessibleComponents';
import { generateAriaLabel } from '../design-system/utils/accessibility';

export const AccessibleLessonDemo: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <AccessibleButton
        onClick={() => executeCode()}
        ariaLabel="Execute C++ code example"
        ariaDescribedBy="code-description"
        variant="primary"
      >
        Run Code
        <ScreenReaderOnly>
          This will compile and execute the C++ code shown above
        </ScreenReaderOnly>
      </AccessibleButton>

      <AccessibleProgress
        value={progress}
        max={100}
        label="Lesson Progress"
        showPercentage
        color={theme.colors.primary[500]}
      />

      {showModal && (
        <AccessibleModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Code Execution Results"
          closeOnEscapeKey
          closeOnBackdropClick
        >
          <p>Your code executed successfully!</p>
          <pre>{executionOutput}</pre>
        </AccessibleModal>
      )}
    </div>
  );
};
```

### Keyboard Navigation Support

```tsx
import { keyboardNavigation } from '../design-system/utils/accessibility';

export const KeyboardNavigableComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Trap focus within the component
    const cleanup = keyboardNavigation.trapFocus(containerRef.current);
    
    // Handle arrow key navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        // Move to next step
        goToNextStep();
      } else if (e.key === 'ArrowLeft') {
        // Move to previous step
        goToPreviousStep();
      }
    };

    containerRef.current.addEventListener('keydown', handleKeyDown);
    
    return () => {
      cleanup();
      containerRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} role="application" aria-label="Interactive C++ lesson">
      {/* Interactive content */}
    </div>
  );
};
```

## ⚡ Performance Optimization

### Lazy Loading for Complex 3D Visualizations

```tsx
import { createLazyComponent } from '../design-system/utils/performance';
import { LoadingSpinner } from '../design-system/components/Layout';

// Lazy load expensive 3D components
const Heavy3DVisualization = createLazyComponent(
  () => import('./visualizations/ComplexMemoryVisualization3D'),
  LoadingSpinner
);

const LightweightFallback = createLazyComponent(
  () => import('./visualizations/Simple2DMemoryDiagram'),
  () => <div>Loading diagram...</div>
);

export const OptimizedVisualizationPanel: React.FC = () => {
  const [use3D, setUse3D] = useState(false);
  const deviceCapabilities = useDeviceCapabilities();

  // Automatically choose visualization based on device
  useEffect(() => {
    setUse3D(deviceCapabilities.canHandle3D);
  }, [deviceCapabilities]);

  return (
    <VisualizationPanel>
      {use3D ? (
        <Heavy3DVisualization />
      ) : (
        <LightweightFallback />
      )}
      
      <Button onClick={() => setUse3D(!use3D)}>
        Toggle {use3D ? '2D' : '3D'} View
      </Button>
    </VisualizationPanel>
  );
};
```

### Memory Management for Large Datasets

```tsx
import { MemoryManager, usePerformanceMonitor } from '../design-system/utils/performance';

export const OptimizedDataVisualization: React.FC<{ lessonNumber: number }> = ({ 
  lessonNumber 
}) => {
  const { startTiming, endTiming } = usePerformanceMonitor('data-processing');
  const [data, setData] = useState(null);

  useEffect(() => {
    const cacheKey = `lesson-data-${lessonNumber}`;
    
    // Try to get from cache first
    let cachedData = MemoryManager.get(cacheKey);
    
    if (cachedData) {
      setData(cachedData);
    } else {
      startTiming();
      
      // Expensive data processing
      processLessonData(lessonNumber).then(processedData => {
        endTiming();
        
        // Cache for 5 minutes
        MemoryManager.set(cacheKey, processedData, 300000);
        setData(processedData);
      });
    }
  }, [lessonNumber, startTiming, endTiming]);

  return (
    <div>
      {data ? (
        <ComplexVisualization data={data} />
      ) : (
        <LoadingSpinner />
      )}
    </div>
  );
};
```

## 🎨 Theme Customization

### Topic-Based Theming

```tsx
import { theme, getTopicColors } from '../design-system/theme';

export const ThemedLessonComponent: React.FC<{ topic: LessonTopic }> = ({ topic }) => {
  const topicColors = getTopicColors(topic);
  
  return (
    <div style={{
      '--primary-color': topicColors.primary,
      '--secondary-color': topicColors.secondary,
      '--accent-color': topicColors.accent
    } as React.CSSProperties}>
      
      <StyledButton topic={topic}>
        Topic-Themed Button
      </StyledButton>
      
      <ProgressBar 
        color={topicColors.primary}
        backgroundColor={`${topicColors.primary}20`}
      />
    </div>
  );
};

const StyledButton = styled.button<{ topic: LessonTopic }>`
  background: ${props => theme.colors.topics[props.topic].primary};
  border: 1px solid ${props => theme.colors.topics[props.topic].secondary};
  color: ${theme.colors.text.primary};
  
  &:hover {
    background: ${props => theme.colors.topics[props.topic].secondary};
    box-shadow: 0 0 10px ${props => theme.colors.topics[props.topic].primary}40;
  }
`;
```

### Custom Theme Provider

```tsx
import { ThemeProvider } from 'styled-components';
import { theme } from '../design-system/theme';

export const CustomThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customTheme, setCustomTheme] = useState(theme);
  
  const updateTheme = (updates: Partial<Theme>) => {
    setCustomTheme(prev => ({ ...prev, ...updates }));
  };

  return (
    <ThemeProvider theme={customTheme}>
      {children}
    </ThemeProvider>
  );
};
```

## 🔄 Common Patterns

### Step-by-Step Interactive Exercises

```tsx
import { StepExercise } from '../design-system/components/Interactive';

export const PointerExercise: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([
    {
      title: "Declare Variables",
      description: "Create an integer variable and a pointer",
      action: () => declareVariables(),
      actionLabel: "Declare",
      completed: false,
      disabled: false
    },
    {
      title: "Initialize Pointer", 
      description: "Point the pointer to the variable's address",
      action: () => initializePointer(),
      actionLabel: "Initialize",
      completed: false,
      disabled: true
    },
    {
      title: "Dereference",
      description: "Access the value through the pointer",
      action: () => dereferencePointer(),
      actionLabel: "Dereference", 
      completed: false,
      disabled: true
    }
  ]);

  const handleStepComplete = (stepIndex: number) => {
    setSteps(prev => prev.map((step, index) => ({
      ...step,
      completed: index === stepIndex ? true : step.completed,
      disabled: index === stepIndex + 1 ? false : step.disabled
    })));
    
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  return (
    <StepExercise
      steps={steps}
      currentStep={currentStep}
      onStepComplete={handleStepComplete}
      topic="basic"
    />
  );
};
```

### Code Comparison Patterns

```tsx
export const BeforeAfterComparison: React.FC = () => {
  return (
    <Grid columns={2} gap="4" responsive>
      <div>
        <h4 style={{ color: theme.colors.error }}>❌ Before (Problematic)</h4>
        <CodeBlockComponent
          language="cpp"
          title="Memory Leak"
        >
{`void problematicFunction() {
    int* ptr = new int(42);
    
    if (someCondition()) {
        return; // Memory leak!
    }
    
    delete ptr; // Only reached sometimes
}`}
        </CodeBlockComponent>
      </div>
      
      <div>
        <h4 style={{ color: theme.colors.success }}>✅ After (Fixed)</h4>
        <CodeBlockComponent
          language="cpp"
          title="RAII Solution"
        >
{`void betterFunction() {
    std::unique_ptr<int> ptr = std::make_unique<int>(42);
    
    if (someCondition()) {
        return; // Automatic cleanup
    }
    
    // Automatic cleanup here too
}`}
        </CodeBlockComponent>
      </div>
    </Grid>
  );
};
```

This usage guide provides comprehensive patterns for implementing the design system across all lesson types. Each pattern is optimized for educational effectiveness, accessibility, and performance.