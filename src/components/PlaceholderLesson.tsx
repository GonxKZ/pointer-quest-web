import React from 'react';
import styled from 'styled-components';

const PlaceholderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f172a 100%);
  border-radius: 12px;
  border: 1px solid rgba(64, 224, 208, 0.3);
  margin: 1rem;
  text-align: center;
`;

const PlaceholderTitle = styled.h2`
  color: #40e0d0;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const PlaceholderMessage = styled.p`
  color: #a0a0a0;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const PlaceholderIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
`;

interface PlaceholderLessonProps {
  lessonNumber?: number;
  error?: string;
}

const PlaceholderLesson: React.FC<PlaceholderLessonProps> = ({ 
  lessonNumber, 
  error 
}) => {
  return (
    <PlaceholderContainer>
      <PlaceholderIcon>📚</PlaceholderIcon>
      <PlaceholderTitle>
        {lessonNumber ? `Lesson ${lessonNumber}` : 'Lesson'} - Under Development
      </PlaceholderTitle>
      <PlaceholderMessage>
        This lesson is currently being prepared or couldn't be loaded.
        {error && (
          <>
            <br />
            <br />
            <strong>Error:</strong> {error}
          </>
        )}
      </PlaceholderMessage>
      <PlaceholderMessage>
        Please check back later or try refreshing the page.
      </PlaceholderMessage>
    </PlaceholderContainer>
  );
};

export default PlaceholderLesson;
