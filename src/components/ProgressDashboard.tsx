import React from 'react';
import { Progress, Card, Badge, Metric } from '../design-system';
import { useProgressStats, useAchievements, useStudySession } from '../hooks/useStudentProgress';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const TopicProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TopicItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const TopicInfo = styled.div`
  flex: 1;
  
  h4 {
    margin: 0 0 0.5rem 0;
    color: #00d4ff;
    font-size: 1rem;
  }
  
  p {
    margin: 0;
    color: #b8c5d6;
    font-size: 0.9rem;
  }
`;

const TopicProgress = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 150px;
`;

const ActivityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin: 1rem 0;
`;

const ActivityDay = styled.div<{ activity: number }>`
  width: 30px;
  height: 30px;
  border-radius: 4px;
  background: ${props => {
    if (props.activity === 0) return 'rgba(255, 255, 255, 0.1)';
    if (props.activity <= 2) return '#00ff8844';
    if (props.activity <= 4) return '#00ff88aa';
    return '#00ff88';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: ${props => props.activity > 0 ? '#000' : '#666'};
  position: relative;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.1);
    transition: transform 0.2s ease;
  }
`;

const SessionStatus = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${props => props.isActive 
    ? 'linear-gradient(45deg, #00ff88, #00cc66)' 
    : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.isActive ? '#000' : '#b8c5d6'};
  border-radius: 8px;
  font-weight: 500;
  
  &::before {
    content: ${props => props.isActive ? '"🟢"' : '"⏸️"'};
  }
`;

interface ProgressDashboardProps {
  className?: string;
}

export function ProgressDashboard({ className }: ProgressDashboardProps) {
  const { 
    stats, 
    topicProgress, 
    recentActivity, 
    getNextLessonRecommendation,
    getWeeklyGoalProgress,
    getStudyConsistency 
  } = useProgressStats();
  
  const { achievements, hasUnviewedAchievements } = useAchievements();
  const { isActive, sessionDuration, formatDuration } = useStudySession();

  const weeklyGoal = getWeeklyGoalProgress(5);
  const consistency = getStudyConsistency();
  const nextLesson = getNextLessonRecommendation();

  return (
    <div className={className}>
      <DashboardContainer>
        {/* Overview Stats */}
        <Card title="📊 Resumen de Progreso">
          <StatsGrid>
            <Metric
              label="Lecciones Completadas"
              value={`${stats.completedLessons}/120`}
              variant="primary"
            />
            <Metric
              label="Tasa de Completado"
              value={`${stats.completionRate.toFixed(1)}%`}
              variant="success"
            />
            <Metric
              label="Puntuación Promedio"
              value={`${stats.averageScore.toFixed(1)}%`}
              variant="info"
            />
            <Metric
              label="Tiempo Total"
              value={formatDuration(stats.totalTimeSpent)}
              variant="secondary"
            />
          </StatsGrid>
          
          <Progress 
            value={stats.completionRate} 
            max={100} 
            variant="primary"
            label={`${stats.completedLessons} de 120 lecciones completadas`}
          />
        </Card>

        {/* Study Session */}
        <Card title="⏱️ Sesión de Estudio">
          <SessionStatus isActive={isActive}>
            {isActive ? (
              <>
                Sesión activa: {formatDuration(sessionDuration)}
              </>
            ) : (
              'Sin sesión activa'
            )}
          </SessionStatus>
          
          <StatsGrid style={{ marginTop: '1rem' }}>
            <Metric
              label="Racha Actual"
              value={`${stats.currentStreak} días`}
              variant="warning"
            />
            <Metric
              label="Racha Más Larga"
              value={`${stats.longestStreak} días`}
              variant="info"
            />
            <Metric
              label="Consistencia"
              value={`${consistency.consistency.toFixed(1)}%`}
              variant="success"
            />
          </StatsGrid>
        </Card>

        {/* Weekly Goal */}
        <Card title="🎯 Meta Semanal">
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Progreso de la semana</span>
              <span>{weeklyGoal.completed}/5 lecciones</span>
            </div>
            <Progress 
              value={weeklyGoal.percentage} 
              max={100} 
              variant="success"
            />
          </div>
          
          {nextLesson <= 120 && (
            <div style={{ padding: '1rem', background: 'rgba(0, 212, 255, 0.1)', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#00d4ff' }}>
                📚 Próxima Lección Recomendada
              </h4>
              <p style={{ margin: 0, color: '#b8c5d6' }}>
                Lección {nextLesson}
              </p>
            </div>
          )}
        </Card>

        {/* Topic Progress */}
        <Card title="📖 Progreso por Temas" style={{ gridColumn: 'span 2' }}>
          <TopicProgressContainer>
            {topicProgress.map((topic, index) => (
              <TopicItem key={index}>
                <TopicInfo>
                  <h4>{topic.topic}</h4>
                  <p>Lecciones {topic.range}</p>
                </TopicInfo>
                <TopicProgress>
                  <Progress 
                    value={topic.percentage} 
                    max={100} 
                    variant="primary"
                    size="small"
                    style={{ width: '80px' }}
                  />
                  <div style={{ textAlign: 'right', minWidth: '60px' }}>
                    <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>
                      {topic.completed}/{topic.total}
                    </div>
                    {topic.averageScore > 0 && (
                      <div style={{ color: '#b8c5d6', fontSize: '0.8rem' }}>
                        {topic.averageScore.toFixed(1)}% avg
                      </div>
                    )}
                  </div>
                </TopicProgress>
              </TopicItem>
            ))}
          </TopicProgressContainer>
        </Card>

        {/* Recent Activity */}
        <Card title="📅 Actividad Reciente">
          <div style={{ marginBottom: '1rem', color: '#b8c5d6', fontSize: '0.9rem' }}>
            Últimos 7 días
          </div>
          <ActivityGrid>
            {recentActivity.slice(0, 7).map((day, index) => (
              <ActivityDay 
                key={index} 
                activity={day.lessonsCompleted}
                title={`${day.date.toLocaleDateString()}: ${day.lessonsCompleted} lecciones`}
              >
                {day.lessonsCompleted > 0 && day.lessonsCompleted}
              </ActivityDay>
            ))}
          </ActivityGrid>
          
          <StatsGrid style={{ marginTop: '1rem' }}>
            <Metric
              label="Promedio/Día"
              value={consistency.averageLessonsPerDay.toFixed(1)}
              variant="info"
              size="small"
            />
            <Metric
              label="Días Activos"
              value={`${recentActivity.filter(d => d.lessonsCompleted > 0).length}/7`}
              variant="success"
              size="small"
            />
          </StatsGrid>
        </Card>

        {/* Achievements */}
        <Card title="🏆 Logros">
          {hasUnviewedAchievements && (
            <Badge variant="warning" style={{ marginBottom: '1rem' }}>
              ¡Nuevos logros desbloqueados!
            </Badge>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
            {achievements.length === 0 ? (
              <div style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
                ¡Completa tu primera lección para desbloquear logros!
              </div>
            ) : (
              achievements.slice(-10).reverse().map((achievement, _index) => (
                <div 
                  key={achievement.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ fontSize: '1.5rem' }}>{achievement.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>
                      {achievement.name}
                    </div>
                    <div style={{ color: '#b8c5d6', fontSize: '0.9rem' }}>
                      {achievement.description}
                    </div>
                  </div>
                  <Badge variant="secondary" size="small">
                    {achievement.type}
                  </Badge>
                </div>
              ))
            )}
          </div>
          
          {achievements.length > 10 && (
            <div style={{ color: '#666', textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
              Mostrando los últimos 10 logros de {achievements.length}
            </div>
          )}
        </Card>
      </DashboardContainer>
    </div>
  );
}

export default ProgressDashboard;