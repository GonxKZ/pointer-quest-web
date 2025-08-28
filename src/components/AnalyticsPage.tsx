import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useProgressStats } from '../hooks/useStudentProgress';
import { Card, Progress, Badge, Metric } from '../design-system';

const AnalyticsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    color: #00d4ff;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    text-shadow: 0 0 20px #00d4ff;
  }
  
  p {
    color: #b8c5d6;
    font-size: 1.1rem;
    margin: 0;
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const FullWidthCard = styled.div`
  grid-column: 1 / -1;
`;


const BarChart = styled.div`
  display: flex;
  align-items: end;
  height: 200px;
  gap: 8px;
  margin: 1rem 0;
  padding: 1rem 0;
`;

const Bar = styled.div<{ height: number; color: string }>`
  flex: 1;
  background: ${props => props.color};
  height: ${props => Math.max(props.height, 2)}%;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: all 0.3s ease;
  min-height: 4px;
  
  &:hover {
    opacity: 0.8;
    transform: scale(1.02);
  }
  
  &::after {
    content: attr(data-value);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    color: #fff;
    font-size: 0.7rem;
    font-weight: bold;
    padding: 2px 4px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 3px;
    opacity: 0;
    transition: opacity 0.3s ease;
    white-space: nowrap;
  }
  
  &:hover::after {
    opacity: 1;
  }
`;

const AxisLabels = styled.div`
  display: flex;
  justify-content: space-between;
  color: #b8c5d6;
  font-size: 0.8rem;
  margin-top: 0.5rem;
`;

const HeatMapGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  gap: 2px;
  margin: 1rem 0;
`;

const HeatMapCell = styled.div<{ intensity: number }>`
  aspect-ratio: 1;
  border-radius: 2px;
  background: ${props => {
    const alpha = Math.max(0.1, props.intensity);
    return `rgba(0, 255, 136, ${alpha})`;
  }};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.2);
    box-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
  }
`;

const LineChart = styled.div`
  position: relative;
  height: 200px;
  margin: 1rem 0;
`;

const LineChartSVG = styled.svg`
  width: 100%;
  height: 100%;
`;

const LineChartPath = styled.path`
  fill: none;
  stroke: #00d4ff;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const LineChartDots = styled.circle`
  fill: #00d4ff;
  stroke: #fff;
  stroke-width: 2;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    fill: #00ff88;
    r: 6;
  }
`;

const StatsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  th {
    background: rgba(0, 212, 255, 0.1);
    color: #00d4ff;
    font-weight: bold;
    position: sticky;
    top: 0;
  }
  
  td {
    color: #b8c5d6;
  }
  
  tr:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const FilterControls = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
  align-items: center;
`;

const TimeRangeSelector = styled.select`
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #fff;
  font-size: 0.9rem;
  
  option {
    background: #1a1a2e;
    color: #fff;
  }
`;

interface AnalyticsPageProps {
  className?: string;
}

export function AnalyticsPage({ className }: AnalyticsPageProps) {
  const {
    stats,
    topicProgress,
    getStudyConsistency
  } = useProgressStats();

  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const consistency = getStudyConsistency();

  // Generate learning velocity data
  const learningVelocityData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es', { month: 'short' }),
      lessons: Math.floor(Math.random() * 15) + 5
    }));
  }, []);

  // Generate time distribution data
  const timeDistributionData = useMemo(() => {
    const topics = ['Básico', 'Smart Ptr', 'Memoria', 'Avanzado'];
    return topics.map(topic => ({
      topic,
      time: Math.floor(Math.random() * 120) + 30,
      percentage: Math.floor(Math.random() * 100)
    }));
  }, []);

  // Generate difficulty analysis
  const difficultyAnalysis = useMemo(() => {
    return topicProgress.map(topic => ({
      ...topic,
      difficulty: topic.averageScore < 70 ? 'Alta' : topic.averageScore < 85 ? 'Media' : 'Baja',
      recommendation: topic.averageScore < 70 ? 'Revisar conceptos básicos' : 
                     topic.averageScore < 85 ? 'Practicar más ejercicios' : 
                     'Continuar al siguiente nivel'
    }));
  }, [topicProgress]);

  const maxLessons = Math.max(...learningVelocityData.map(d => d.lessons));

  return (
    <div className={className}>
      <AnalyticsContainer>
        <PageHeader>
          <h1>📊 Analytics de Aprendizaje</h1>
          <p>Análisis detallado de tu progreso y patrones de estudio</p>
        </PageHeader>

        {/* Controls */}
        <FilterControls>
          <label style={{ color: '#b8c5d6' }}>
            Período de análisis:
            <TimeRangeSelector 
              value={timeRange} 
              onChange={(e) => setTimeRange(Number(e.target.value) as 7 | 30 | 90)}
            >
              <option value={7}>Últimos 7 días</option>
              <option value={30}>Últimos 30 días</option>
              <option value={90}>Últimos 90 días</option>
            </TimeRangeSelector>
          </label>
        </FilterControls>

        <ChartsGrid>
          {/* Learning Velocity */}
          <Card title="📈 Velocidad de Aprendizaje">
            <BarChart>
              {learningVelocityData.slice(-6).map((data, index) => (
                <Bar
                  key={index}
                  height={(data.lessons / maxLessons) * 100}
                  color={`hsl(${120 + (data.lessons / maxLessons) * 60}, 70%, 50%)`}
                  data-value={`${data.lessons} lecciones`}
                />
              ))}
            </BarChart>
            <AxisLabels>
              {learningVelocityData.slice(-6).map((data, index) => (
                <span key={index}>{data.month}</span>
              ))}
            </AxisLabels>
          </Card>

          {/* Study Consistency */}
          <Card title="🔥 Consistencia de Estudio">
            <div style={{ margin: '1rem 0' }}>
              <Metric
                label="Racha Actual"
                value={`${stats.currentStreak} días`}
                variant="warning"
              />
              <Metric
                label="Días Activos"
                value={`${consistency.consistency.toFixed(1)}%`}
                variant="success"
                style={{ marginTop: '1rem' }}
              />
            </div>
            
            <HeatMapGrid>
              {Array.from({ length: 100 }, (_, i) => (
                <HeatMapCell
                  key={i}
                  intensity={Math.random()}
                  title={`Día ${i + 1}: ${Math.floor(Math.random() * 5)} lecciones`}
                />
              ))}
            </HeatMapGrid>
            
            <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center', marginTop: '0.5rem' }}>
              Últimos 100 días de actividad
            </div>
          </Card>

          {/* Topic Mastery */}
          <Card title="🎯 Dominio por Tema">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topicProgress.map((topic, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#00d4ff' }}>{topic.topic}</span>
                    <Badge variant={
                      topic.percentage >= 80 ? 'success' :
                      topic.percentage >= 50 ? 'warning' : 'danger'
                    }>
                      {topic.percentage.toFixed(0)}%
                    </Badge>
                  </div>
                  <Progress value={topic.percentage} max={100} variant="primary" />
                  <div style={{ fontSize: '0.8rem', color: '#b8c5d6', marginTop: '0.25rem' }}>
                    {topic.completed}/{topic.total} lecciones • Promedio: {topic.averageScore.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Time Distribution */}
          <Card title="⏰ Distribución del Tiempo">
            <BarChart>
              {timeDistributionData.map((data, index) => (
                <Bar
                  key={index}
                  height={data.percentage}
                  color={`hsl(${index * 60}, 70%, 50%)`}
                  data-value={`${data.time} min`}
                />
              ))}
            </BarChart>
            <AxisLabels>
              {timeDistributionData.map((data, index) => (
                <span key={index}>{data.topic}</span>
              ))}
            </AxisLabels>
            
            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#b8c5d6' }}>
              <strong>Tiempo total:</strong> {timeDistributionData.reduce((sum, d) => sum + d.time, 0)} minutos
            </div>
          </Card>
        </ChartsGrid>

        {/* Detailed Analysis */}
        <FullWidthCard>
          <Card title="🔍 Análisis Detallado de Dificultades">
            <StatsTable>
              <thead>
                <tr>
                  <th>Tema</th>
                  <th>Progreso</th>
                  <th>Puntuación Promedio</th>
                  <th>Dificultad Percibida</th>
                  <th>Recomendación</th>
                </tr>
              </thead>
              <tbody>
                {difficultyAnalysis.map((topic, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{topic.topic}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        Lecciones {topic.range}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Progress 
                          value={topic.percentage} 
                          max={100} 
                          variant="primary" 
                          size="small"
                          style={{ width: '80px' }}
                        />
                        <span>{topic.percentage.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={
                        topic.averageScore >= 90 ? 'success' :
                        topic.averageScore >= 70 ? 'warning' : 'danger'
                      }>
                        {topic.averageScore.toFixed(1)}%
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={
                        topic.difficulty === 'Baja' ? 'success' :
                        topic.difficulty === 'Media' ? 'warning' : 'danger'
                      }>
                        {topic.difficulty}
                      </Badge>
                    </td>
                    <td style={{ fontSize: '0.9rem' }}>
                      {topic.recommendation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </StatsTable>
          </Card>
        </FullWidthCard>

        {/* Performance Metrics */}
        <ChartsGrid>
          <Card title="🏃 Métricas de Rendimiento">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <Metric
                label="Promedio por Día"
                value={consistency.averageLessonsPerDay.toFixed(1)}
                variant="info"
              />
              <Metric
                label="Tiempo por Lección"
                value="12.5 min"
                variant="secondary"
              />
              <Metric
                label="Mejor Racha"
                value={`${stats.longestStreak} días`}
                variant="success"
              />
              <Metric
                label="Eficiencia"
                value="87%"
                variant="primary"
              />
            </div>
            
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0, 212, 255, 0.1)', borderRadius: '8px' }}>
              <h4 style={{ color: '#00d4ff', margin: '0 0 1rem 0' }}>💡 Insights</h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#b8c5d6' }}>
                <li>Tu mejor momento para estudiar es por las tardes</li>
                <li>Tienes mejor rendimiento en temas de Smart Pointers</li>
                <li>Considera revisar conceptos básicos de memoria</li>
                <li>Tu racha actual está por encima del promedio</li>
              </ul>
            </div>
          </Card>

          <Card title="🎨 Patrones de Aprendizaje">
            <LineChart>
              <LineChartSVG viewBox="0 0 400 200">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#00d4ff', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: '#00d4ff', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                
                {/* Sample data points */}
                <LineChartPath d="M 0,180 Q 50,120 100,140 T 200,100 T 300,80 T 400,60" />
                
                {/* Data points */}
                {[0, 100, 200, 300, 400].map((x, i) => (
                  <LineChartDots
                    key={i}
                    cx={x}
                    cy={180 - (i * 30)}
                    r={4}
                  />
                ))}
                
                <path
                  d="M 0,180 Q 50,120 100,140 T 200,100 T 300,80 T 400,60 L 400,200 L 0,200 Z"
                  fill="url(#gradient)"
                />
              </LineChartSVG>
            </LineChart>
            
            <div style={{ color: '#b8c5d6', fontSize: '0.9rem', textAlign: 'center' }}>
              Evolución de puntuaciones en los últimos 30 días
            </div>
          </Card>
        </ChartsGrid>
      </AnalyticsContainer>
    </div>
  );
}

export default AnalyticsPage;