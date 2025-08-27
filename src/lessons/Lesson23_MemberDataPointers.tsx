import React, { useState } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { THREE } from '../utils/three';

interface MemberDataPointerState {
  selectedClass: 'PlayerStats' | 'Coordinates' | 'Database';
  selectedMember: string;
  pointerToMemberValue: string;
  objectInstance: any;
  accessingMember: boolean;
  offset: number;
  demonstration: 'basic' | 'multiple' | 'inheritance' | 'arrays';
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

function ClassVisualization({ state }: { state: MemberDataPointerState }) {
  const renderClass = () => {
    const { selectedClass, selectedMember, pointerToMemberValue, offset, accessingMember } = state;
    
    const classData = {
      PlayerStats: {
        members: [
          { name: 'health', type: 'int', offset: 0, size: 4 },
          { name: 'mana', type: 'int', offset: 4, size: 4 },
          { name: 'experience', type: 'long long', offset: 8, size: 8 },
        ]
      },
      Coordinates: {
        members: [
          { name: 'x', type: 'double', offset: 0, size: 8 },
          { name: 'y', type: 'double', offset: 8, size: 8 },
          { name: 'z', type: 'double', offset: 16, size: 8 },
        ]
      },
      Database: {
        members: [
          { name: 'connection_count', type: 'int', offset: 0, size: 4 },
          { name: 'is_connected', type: 'bool', offset: 4, size: 1 },
          { name: 'last_ping', type: 'double', offset: 8, size: 8 },
        ]
      }
    };

    const currentClass = classData[selectedClass];
    
    return (
      <>
        {/* Class layout visualization */}
        <group position={[-3, 1, 0]}>
          <Text
            position={[0, 2, 0]}
            fontSize={0.3}
            color="#00d4ff"
            anchorX="center"
          >
            {selectedClass} Layout
          </Text>
          
          {currentClass.members.map((member, index) => (
            <group key={member.name} position={[0, 1 - index * 0.8, 0]}>
              {/* Member block */}
              <Box
                args={[member.size / 2, 0.6, 0.3]}
                position={[0, 0, 0]}
              >
                <meshStandardMaterial 
                  color={selectedMember === member.name ? '#ff6b7a' : '#2ed573'}
                  transparent
                  opacity={0.7}
                />
              </Box>
              
              {/* Member info */}
              <Text
                position={[0, 0.1, 0.2]}
                fontSize={0.15}
                color="white"
                anchorX="center"
              >
                {member.name}: {member.type}
              </Text>
              
              <Text
                position={[0, -0.1, 0.2]}
                fontSize={0.12}
                color="#ffa500"
                anchorX="center"
              >
                offset: {member.offset}
              </Text>
              
              {/* Pointer visualization */}
              {selectedMember === member.name && (
                <group position={[3, 0, 0]}>
                  <Box args={[0.3, 0.3, 0.3]}>
                    <meshStandardMaterial color="#00d4ff" />
                  </Box>
                  <Text
                    position={[0, 0.4, 0]}
                    fontSize={0.12}
                    color="#00d4ff"
                    anchorX="center"
                  >
                    ptr-to-member
                  </Text>
                  <Text
                    position={[0, -0.4, 0]}
                    fontSize={0.1}
                    color="white"
                    anchorX="center"
                  >
                    {pointerToMemberValue}
                  </Text>
                  
                  {/* Arrow from pointer to member */}
                  <mesh position={[-1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <coneGeometry args={[0.1, 0.5]} />
                    <meshStandardMaterial color="#00d4ff" />
                  </mesh>
                  
                  <mesh position={[-1, 0, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 1]} />
                    <meshStandardMaterial color="#00d4ff" />
                  </mesh>
                </group>
              )}
            </group>
          ))}
        </group>
        
        {/* Object instance visualization */}
        <group position={[3, 0, 0]}>
          <Text
            position={[0, 2, 0]}
            fontSize={0.3}
            color="#ffa500"
            anchorX="center"
          >
            Object Instance
          </Text>
          
          <Box args={[2, 2.5, 0.3]} position={[0, 0.5, 0]}>
            <meshStandardMaterial color="#1a1a2e" transparent opacity={0.8} />
          </Box>
          
          {currentClass.members.map((member, index) => (
            <group key={`instance-${member.name}`} position={[0, 1.5 - index * 0.7, 0.2]}>
              <Box
                args={[1.8, 0.5, 0.1]}
                position={[0, 0, 0]}
              >
                <meshStandardMaterial 
                  color={accessingMember && selectedMember === member.name ? '#ff4757' : '#57606f'}
                  transparent
                  opacity={0.9}
                />
              </Box>
              
              <Text
                position={[0, 0, 0.1]}
                fontSize={0.12}
                color="white"
                anchorX="center"
              >
                {member.name} = {
                  member.type === 'int' ? '42' :
                  member.type === 'long long' ? '1000L' :
                  member.type === 'double' ? '3.14' :
                  member.type === 'bool' ? 'true' : '0'
                }
              </Text>
            </group>
          ))}
        </group>
        
        {/* Lights */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
      </>
    );
  };

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      {renderClass()}
    </Canvas>
  );
}

const Lesson23_MemberDataPointers: React.FC = () => {
  const [state, setState] = useState<MemberDataPointerState>({
    selectedClass: 'PlayerStats',
    selectedMember: 'health',
    pointerToMemberValue: '&PlayerStats::health',
    objectInstance: { health: 100, mana: 50, experience: 1000 },
    accessingMember: false,
    offset: 0,
    demonstration: 'basic'
  });

  const handleClassSelect = (className: 'PlayerStats' | 'Coordinates' | 'Database') => {
    const defaultMembers = {
      PlayerStats: 'health',
      Coordinates: 'x',
      Database: 'connection_count'
    };
    
    setState(prev => ({
      ...prev,
      selectedClass: className,
      selectedMember: defaultMembers[className],
      pointerToMemberValue: `&${className}::${defaultMembers[className]}`,
      accessingMember: false
    }));
  };

  const handleMemberSelect = (memberName: string) => {
    setState(prev => ({
      ...prev,
      selectedMember: memberName,
      pointerToMemberValue: `&${prev.selectedClass}::${memberName}`,
      accessingMember: false
    }));
  };

  const handleAccessMember = () => {
    setState(prev => ({
      ...prev,
      accessingMember: !prev.accessingMember
    }));
  };

  const getClassDefinition = (className: string) => {
    switch (className) {
      case 'PlayerStats':
        return `struct PlayerStats {
    int health;        // offset: 0
    int mana;          // offset: 4  
    long long experience; // offset: 8
};`;
      case 'Coordinates':
        return `struct Coordinates {
    double x;    // offset: 0
    double y;    // offset: 8
    double z;    // offset: 16
};`;
      case 'Database':
        return `struct Database {
    int connection_count;  // offset: 0
    bool is_connected;     // offset: 4
    double last_ping;      // offset: 8  
};`;
      default:
        return '';
    }
  };

  const getCurrentExample = () => {
    const { selectedClass, selectedMember } = state;
    return `// Member data pointer declaration
int ${selectedClass}::* pm = &${selectedClass}::${selectedMember};

// Usage with object instance
${selectedClass} obj;
obj.*pm = 42;        // Access via object
(&obj)->*pm = 42;    // Access via pointer to object

// Offset introspection
std::size_t offset = reinterpret_cast<std::size_t>(&(static_cast<${selectedClass}*>(nullptr)->*pm));
std::cout << "Offset: " << offset << " bytes\\n";`;
  };

  return (
    <Container>
      <Header>
        <Title>🎯 Member Data Pointers</Title>
        <Subtitle>Exploring int C::* pm = &C::m syntax and member access patterns</Subtitle>
      </Header>

      <MainContent>
        <LeftPanel>
          <h3>📚 Member Data Pointer Theory</h3>
          
          <StatusDisplay $type="info">
            <strong>Member Data Pointers (int C::* pm)</strong><br/>
            Store the offset of a member within a class, enabling indirect member access
            and runtime member selection.
          </StatusDisplay>

          <h4>🏗️ Core Concepts</h4>
          <Grid>
            <InfoCard>
              <h4>Declaration Syntax</h4>
              <CodeBlock>{`// Pattern: Type Class::* name
int PlayerStats::* pm;
pm = &PlayerStats::health;

// Direct initialization  
double Coordinates::* coord = &Coordinates::x;`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Access Patterns</h4>
              <CodeBlock>{`PlayerStats player;
int PlayerStats::* pm = &PlayerStats::health;

// Via object
player.*pm = 100;

// Via pointer to object
PlayerStats* ptr = &player;
ptr->*pm = 100;`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Offset Calculation</h4>
              <CodeBlock>{`// Get member offset
auto offset = reinterpret_cast<std::size_t>(
    &(static_cast<PlayerStats*>(nullptr)->*pm)
);
std::cout << "Offset: " << offset;`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Runtime Selection</h4>
              <CodeBlock>{`int PlayerStats::* members[] = {
    &PlayerStats::health,
    &PlayerStats::mana
};

// Select member at runtime
player.*members[0] = 100; // health
player.*members[1] = 50;  // mana`}</CodeBlock>
            </InfoCard>
          </Grid>

          <h4>⚡ Advanced Applications</h4>
          <CodeBlock>{`// Generic member access
template<typename Class, typename Member>
void set_member(Class& obj, Member Class::* pm, const Member& value) {
    obj.*pm = value;
}

// Usage
PlayerStats player;
set_member(player, &PlayerStats::health, 100);
set_member(player, &PlayerStats::mana, 50);

// Member introspection
struct MemberInfo {
    const char* name;
    int PlayerStats::* pointer;
    std::size_t offset;
};

constexpr MemberInfo members[] = {
    {"health", &PlayerStats::health, offsetof(PlayerStats, health)},
    {"mana", &PlayerStats::mana, offsetof(PlayerStats, mana)}
};`}</CodeBlock>

          <TheorySection>
            <h4>🔍 Current Class Layout</h4>
            <CodeBlock>{getClassDefinition(state.selectedClass)}</CodeBlock>
            
            <h4>💻 Generated Code Example</h4>
            <CodeBlock>{getCurrentExample()}</CodeBlock>
          </TheorySection>
        </LeftPanel>

        <RightPanel>
          <VisualizationArea>
            <ClassVisualization state={state} />
          </VisualizationArea>

          <ControlsArea>
            <h4>🎮 Interactive Controls</h4>
            
            <div>
              <strong>Select Class:</strong><br/>
              <Button 
                $variant={state.selectedClass === 'PlayerStats' ? 'primary' : 'secondary'}
                onClick={() => handleClassSelect('PlayerStats')}
              >
                PlayerStats
              </Button>
              <Button 
                $variant={state.selectedClass === 'Coordinates' ? 'primary' : 'secondary'}
                onClick={() => handleClassSelect('Coordinates')}
              >
                Coordinates  
              </Button>
              <Button 
                $variant={state.selectedClass === 'Database' ? 'primary' : 'secondary'}
                onClick={() => handleClassSelect('Database')}
              >
                Database
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Select Member for Pointer:</strong><br/>
              {state.selectedClass === 'PlayerStats' && (
                <>
                  <Button 
                    $variant={state.selectedMember === 'health' ? 'primary' : 'secondary'}
                    onClick={() => handleMemberSelect('health')}
                  >
                    health (int)
                  </Button>
                  <Button 
                    $variant={state.selectedMember === 'mana' ? 'primary' : 'secondary'}
                    onClick={() => handleMemberSelect('mana')}
                  >
                    mana (int)
                  </Button>
                  <Button 
                    $variant={state.selectedMember === 'experience' ? 'primary' : 'secondary'}
                    onClick={() => handleMemberSelect('experience')}
                  >
                    experience (long long)
                  </Button>
                </>
              )}
              
              {state.selectedClass === 'Coordinates' && (
                <>
                  <Button 
                    $variant={state.selectedMember === 'x' ? 'primary' : 'secondary'}
                    onClick={() => handleMemberSelect('x')}
                  >
                    x (double)
                  </Button>
                  <Button 
                    $variant={state.selectedMember === 'y' ? 'primary' : 'secondary'}
                    onClick={() => handleMemberSelect('y')}
                  >
                    y (double)
                  </Button>
                  <Button 
                    $variant={state.selectedMember === 'z' ? 'primary' : 'secondary'}
                    onClick={() => handleMemberSelect('z')}
                  >
                    z (double)
                  </Button>
                </>
              )}
              
              {state.selectedClass === 'Database' && (
                <>
                  <Button 
                    $variant={state.selectedMember === 'connection_count' ? 'primary' : 'secondary'}
                    onClick={() => handleMemberSelect('connection_count')}
                  >
                    connection_count (int)
                  </Button>
                  <Button 
                    $variant={state.selectedMember === 'is_connected' ? 'primary' : 'secondary'}
                    onClick={() => handleMemberSelect('is_connected')}
                  >
                    is_connected (bool)
                  </Button>
                  <Button 
                    $variant={state.selectedMember === 'last_ping' ? 'primary' : 'secondary'}
                    onClick={() => handleMemberSelect('last_ping')}
                  >
                    last_ping (double)
                  </Button>
                </>
              )}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <Button onClick={handleAccessMember}>
                {state.accessingMember ? '⏹️ Stop Access' : '▶️ Access Member via obj.*pm'}
              </Button>
            </div>

            <StatusDisplay $type="info">
              <strong>Current Pointer:</strong><br/>
              <Highlight>{state.pointerToMemberValue}</Highlight>
              <br/><br/>
              <strong>Access Syntax:</strong><br/>
              <code>obj.*pm = value;</code> (via object)<br/>
              <code>ptr-&gt;*pm = value;</code> (via pointer to object)
            </StatusDisplay>
          </ControlsArea>
        </RightPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson23_MemberDataPointers;