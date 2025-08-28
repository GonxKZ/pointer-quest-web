import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAchievements } from '../hooks/useStudentProgress';
import { Achievement } from '../utils/studentProgress';
import { Card, Badge } from '../design-system';

// Animations
const celebrationPulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Achievement Notification Component
const NotificationContainer = styled.div<{ show: boolean }>`
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1000;
  transform: translateX(${props => props.show ? '0' : '100%'});
  opacity: ${props => props.show ? '1' : '0'};
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  ${props => props.show && css`
    animation: ${celebrationPulse} 2s ease-in-out;
  `}
`;

const NotificationCard = styled.div`
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #000;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
  border: 2px solid #FFD700;
  max-width: 350px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
    background-size: 200% 100%;
    animation: ${shimmer} 2s ease-in-out;
    pointer-events: none;
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const AchievementIcon = styled.div`
  font-size: 2.5rem;
  animation: ${celebrationPulse} 1s ease-in-out infinite;
`;

const NotificationContent = styled.div`
  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.3rem;
    font-weight: bold;
  }
  
  p {
    margin: 0;
    opacity: 0.8;
    font-size: 1rem;
  }
`;

const DismissButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.5);
  
  &:hover {
    color: rgba(0, 0, 0, 0.8);
  }
`;

// Achievement Gallery Component
const GalleryContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
`;

const AchievementCard = styled.div<{ unlocked: boolean }>`
  background: ${props => props.unlocked 
    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2))'
    : 'rgba(255, 255, 255, 0.05)'};
  border: 2px solid ${props => props.unlocked ? '#FFD700' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 15px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  opacity: ${props => props.unlocked ? '1' : '0.6'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.unlocked 
      ? '0 10px 30px rgba(255, 215, 0, 0.2)'
      : '0 5px 15px rgba(255, 255, 255, 0.1)'};
  }
`;

const AchievementHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const LargeIcon = styled.div<{ unlocked: boolean }>`
  font-size: 2.5rem;
  filter: ${props => props.unlocked ? 'none' : 'grayscale(100%)'};
`;

const AchievementInfo = styled.div`
  flex: 1;
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: ${props => props.theme?.colors?.primary || '#00d4ff'};
    font-size: 1.2rem;
  }
  
  p {
    margin: 0;
    color: #b8c5d6;
    font-size: 0.9rem;
  }
`;

const UnlockDate = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #999;
  font-size: 0.8rem;
`;

const ProgressIndicator = styled.div`
  margin-top: 1rem;
  color: #666;
  font-style: italic;
  font-size: 0.9rem;
`;

// Statistics Component
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: #00d4ff;
    font-size: 2rem;
  }
  
  p {
    margin: 0;
    color: #b8c5d6;
    font-size: 0.9rem;
  }
`;

// Filter Component
const FilterContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid rgba(0, 212, 255, 0.3);
  background: ${props => props.active ? '#00d4ff' : 'transparent'};
  color: ${props => props.active ? '#000' : '#00d4ff'};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  &:hover {
    background: ${props => props.active ? '#00b8e6' : 'rgba(0, 212, 255, 0.1)'};
  }
`;

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export function AchievementNotification({ achievement, onDismiss }: AchievementNotificationProps): JSX.Element | null {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (achievement) {
      setShow(true);
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onDismiss, 500); // Wait for animation to complete
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <NotificationContainer show={show}>
      <NotificationCard>
        <DismissButton onClick={() => {
          setShow(false);
          setTimeout(onDismiss, 500);
        }}>
          ×
        </DismissButton>
        
        <NotificationHeader>
          <AchievementIcon>{achievement.icon}</AchievementIcon>
          <NotificationContent>
            <h3>¡Logro Desbloqueado!</h3>
            <p><strong>{achievement.name}</strong></p>
          </NotificationContent>
        </NotificationHeader>
        
        <p>{achievement.description}</p>
      </NotificationCard>
    </NotificationContainer>
  );
}

interface AchievementGalleryProps {
  className?: string;
}

export function AchievementGallery({ className }: AchievementGalleryProps) {
  const { achievements, unlockedAchievements } = useAchievements();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Define all possible achievements (including locked ones)
  const allPossibleAchievements: Achievement[] = [
    // Basic completion achievements
    {
      id: 'first-lesson',
      name: 'Primer Paso',
      description: 'Completa tu primera lección',
      icon: '🎯',
      type: 'completion',
      unlockedAt: new Date()
    },
    {
      id: 'milestone-5',
      name: '5 Lecciones',
      description: 'Completa 5 lecciones',
      icon: '🏅',
      type: 'completion',
      unlockedAt: new Date()
    },
    {
      id: 'milestone-10',
      name: '10 Lecciones',
      description: 'Completa 10 lecciones',
      icon: '🥈',
      type: 'completion',
      unlockedAt: new Date()
    },
    {
      id: 'milestone-25',
      name: '25 Lecciones',
      description: 'Completa 25 lecciones',
      icon: '🥉',
      type: 'completion',
      unlockedAt: new Date()
    },
    {
      id: 'milestone-50',
      name: '50 Lecciones',
      description: 'Completa 50 lecciones',
      icon: '🏆',
      type: 'completion',
      unlockedAt: new Date()
    },
    {
      id: 'milestone-100',
      name: 'Centenario',
      description: 'Completa 100 lecciones',
      icon: '💯',
      type: 'completion',
      unlockedAt: new Date()
    },
    
    // Perfect score achievements
    {
      id: 'perfect-score',
      name: 'Perfeccionista',
      description: 'Obtén una puntuación perfecta del 100%',
      icon: '⭐',
      type: 'perfect',
      unlockedAt: new Date()
    },
    {
      id: 'perfect-streak-5',
      name: 'Racha Perfecta',
      description: 'Obtén 100% en 5 lecciones consecutivas',
      icon: '🌟',
      type: 'perfect',
      unlockedAt: new Date()
    },
    
    // Streak achievements
    {
      id: 'streak-3',
      name: 'Constancia',
      description: 'Estudia durante 3 días consecutivos',
      icon: '🔥',
      type: 'streak',
      unlockedAt: new Date()
    },
    {
      id: 'week-streak',
      name: 'Guerrero de la Semana',
      description: 'Estudia durante 7 días consecutivos',
      icon: '💪',
      type: 'streak',
      unlockedAt: new Date()
    },
    {
      id: 'month-streak',
      name: 'Dedicación Total',
      description: 'Estudia durante 30 días consecutivos',
      icon: '👑',
      type: 'streak',
      unlockedAt: new Date()
    },
    
    // Speed achievements
    {
      id: 'speed-demon',
      name: 'Velocista',
      description: 'Completa una lección en menos de 5 minutos',
      icon: '⚡',
      type: 'speed',
      unlockedAt: new Date()
    },
    {
      id: 'marathon',
      name: 'Maratonista',
      description: 'Estudia durante más de 2 horas en un día',
      icon: '🏃',
      type: 'speed',
      unlockedAt: new Date()
    },
    
    // Exploration achievements
    {
      id: 'explorer',
      name: 'Explorador',
      description: 'Visita todas las categorías de lecciones',
      icon: '🧭',
      type: 'exploration',
      unlockedAt: new Date()
    },
    {
      id: 'completionist',
      name: 'Completista',
      description: 'Completa todas las lecciones disponibles',
      icon: '🏁',
      type: 'exploration',
      unlockedAt: new Date()
    }
  ];

  // Merge unlocked achievements with all possible achievements
  const displayAchievements = allPossibleAchievements.map(possible => {
    const unlocked = achievements.find(a => a.id === possible.id);
    return unlocked || { ...possible, unlocked: false };
  });

  // Apply filters
  const filteredAchievements = displayAchievements.filter(achievement => {
    const matchesStatusFilter = filter === 'all' || 
      (filter === 'unlocked' && achievements.some(a => a.id === achievement.id)) ||
      (filter === 'locked' && !achievements.some(a => a.id === achievement.id));
    
    const matchesTypeFilter = typeFilter === 'all' || achievement.type === typeFilter;
    
    return matchesStatusFilter && matchesTypeFilter;
  });

  const achievementTypes = ['all', 'completion', 'perfect', 'streak', 'speed', 'exploration'];
  const typeLabels: { [key: string]: string } = {
    all: 'Todos',
    completion: 'Completado',
    perfect: 'Perfectos',
    streak: 'Rachas',
    speed: 'Velocidad',
    exploration: 'Exploración'
  };

  return (
    <div className={className}>
      <Card title="🏆 Sistema de Logros">
        {/* Statistics */}
        <StatsContainer>
          <StatCard>
            <h3>{achievements.length}</h3>
            <p>Logros Desbloqueados</p>
          </StatCard>
          <StatCard>
            <h3>{allPossibleAchievements.length}</h3>
            <p>Total de Logros</p>
          </StatCard>
          <StatCard>
            <h3>{((achievements.length / allPossibleAchievements.length) * 100).toFixed(0)}%</h3>
            <p>Progreso Completado</p>
          </StatCard>
          <StatCard>
            <h3>{unlockedAchievements.length}</h3>
            <p>Nuevos Logros</p>
          </StatCard>
        </StatsContainer>

        {/* Filters */}
        <FilterContainer>
          <FilterButton 
            active={filter === 'all'} 
            onClick={() => setFilter('all')}
          >
            Todos ({displayAchievements.length})
          </FilterButton>
          <FilterButton 
            active={filter === 'unlocked'} 
            onClick={() => setFilter('unlocked')}
          >
            Desbloqueados ({achievements.length})
          </FilterButton>
          <FilterButton 
            active={filter === 'locked'} 
            onClick={() => setFilter('locked')}
          >
            Bloqueados ({allPossibleAchievements.length - achievements.length})
          </FilterButton>
        </FilterContainer>

        <FilterContainer>
          {achievementTypes.map(type => (
            <FilterButton
              key={type}
              active={typeFilter === type}
              onClick={() => setTypeFilter(type)}
            >
              {typeLabels[type]}
            </FilterButton>
          ))}
        </FilterContainer>

        {/* Achievement Gallery */}
        <GalleryContainer>
          {filteredAchievements.map((achievement, _index) => {
            const isUnlocked = achievements.some(a => a.id === achievement.id);
            const unlockedAchievement = achievements.find(a => a.id === achievement.id);
            
            return (
              <AchievementCard key={achievement.id} unlocked={isUnlocked}>
                <AchievementHeader>
                  <LargeIcon unlocked={isUnlocked}>
                    {achievement.icon}
                  </LargeIcon>
                  <AchievementInfo>
                    <h3>{achievement.name}</h3>
                    <Badge variant={
                      achievement.type === 'completion' ? 'primary' :
                      achievement.type === 'perfect' ? 'success' :
                      achievement.type === 'streak' ? 'warning' :
                      achievement.type === 'speed' ? 'danger' :
                      'info'
                    }>
                      {typeLabels[achievement.type]}
                    </Badge>
                  </AchievementInfo>
                </AchievementHeader>
                
                <p>{achievement.description}</p>
                
                {isUnlocked && unlockedAchievement ? (
                  <UnlockDate>
                    Desbloqueado el {unlockedAchievement.unlockedAt.toLocaleDateString()}
                  </UnlockDate>
                ) : (
                  <ProgressIndicator>
                    🔒 Logro bloqueado
                  </ProgressIndicator>
                )}
              </AchievementCard>
            );
          })}
        </GalleryContainer>
        
        {filteredAchievements.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            padding: '3rem',
            fontSize: '1.1rem'
          }}>
            No se encontraron logros con los filtros seleccionados.
          </div>
        )}
      </Card>
    </div>
  );
}

export default { AchievementNotification, AchievementGallery };