import React, { useState } from 'react';
import styled from 'styled-components';
import { useDataManagement, useStudentProgress } from '../hooks/useStudentProgress';
import { Card, Button, Progress } from '../design-system';

const DataManagementContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  
  h1 {
    color: #00d4ff;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    text-shadow: 0 0 20px #00d4ff;
  }
  
  h2 {
    color: #00d4ff;
    margin-bottom: 1rem;
  }
`;

const ActionSection = styled.div`
  margin-bottom: 2rem;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`;

const ActionCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: #00d4ff;
    font-size: 1.2rem;
  }
  
  p {
    margin: 0;
    color: #b8c5d6;
    font-size: 0.9rem;
    flex: 1;
  }
`;

const BackupList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
`;

const BackupItem = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  .backup-info {
    flex: 1;
    
    .backup-name {
      color: #00d4ff;
      font-weight: bold;
      margin-bottom: 0.25rem;
    }
    
    .backup-details {
      color: #b8c5d6;
      font-size: 0.8rem;
    }
  }
  
  .backup-actions {
    display: flex;
    gap: 0.5rem;
  }
`;

const FileDropZone = styled.div<{ isDragOver: boolean }>`
  border: 2px dashed ${props => props.isDragOver ? '#00d4ff' : 'rgba(0, 212, 255, 0.3)'};
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  background: ${props => props.isDragOver ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)'};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #00d4ff;
    background: rgba(0, 212, 255, 0.05);
  }
  
  input {
    display: none;
  }
`;

const WarningCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(204, 68, 68, 0.2));
  border: 1px solid #ff6b6b;
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1rem 0;
  
  h3 {
    color: #ff6b6b;
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &::before {
      content: '⚠️';
    }
  }
  
  p {
    margin: 0;
    color: #ffaaaa;
  }
`;

const ConfirmationModal = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  backdrop-filter: blur(10px);
  
  h3 {
    color: #ff6b6b;
    margin: 0 0 1rem 0;
  }
  
  p {
    color: #b8c5d6;
    margin-bottom: 2rem;
  }
  
  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  background: ${props => 
    props.type === 'success' ? 'rgba(0, 255, 136, 0.2)' :
    props.type === 'error' ? 'rgba(255, 107, 107, 0.2)' :
    'rgba(0, 212, 255, 0.2)'};
  border: 1px solid ${props => 
    props.type === 'success' ? '#00ff88' :
    props.type === 'error' ? '#ff6b6b' :
    '#00d4ff'};
  color: ${props => 
    props.type === 'success' ? '#00ff88' :
    props.type === 'error' ? '#ff6b6b' :
    '#00d4ff'};
`;

interface DataManagementProps {
  className?: string;
}

export function DataManagement({ className }: DataManagementProps) {
  const {
    exportToFile,
    importFromFile,
    createBackup,
    restoreFromBackup,
    listBackups,
    clearAllProgress
  } = useDataManagement();

  const { profile } = useStudentProgress();
  
  const [backups, setBackups] = useState(listBackups());
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

  const showStatus = (type: 'success' | 'error' | 'info', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleExport = async () => {
    try {
      exportToFile();
      showStatus('success', 'Progreso exportado exitosamente');
    } catch (error) {
      showStatus('error', 'Error al exportar el progreso');
    }
  };

  const handleImportFile = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      showStatus('error', 'Por favor selecciona un archivo JSON válido');
      return;
    }

    setIsLoading(true);
    try {
      await importFromFile(file);
      showStatus('success', 'Progreso importado exitosamente');
    } catch (error) {
      showStatus('error', `Error al importar: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (files[0]) handleImportFile(files[0]);
    }
  };

  const handleCreateBackup = async () => {
    try {
      createBackup();
      setBackups(listBackups());
      showStatus('success', 'Copia de seguridad creada exitosamente');
    } catch (error) {
      showStatus('error', `Error al crear copia: ${(error as Error).message}`);
    }
  };

  const handleRestoreBackup = async (backupKey: string) => {
    setIsLoading(true);
    try {
      await restoreFromBackup(backupKey);
      showStatus('success', 'Progreso restaurado exitosamente');
    } catch (error) {
      showStatus('error', `Error al restaurar: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearProgress = async () => {
    setIsLoading(true);
    try {
      await clearAllProgress();
      setBackups(listBackups());
      showStatus('success', 'Todo el progreso ha sido eliminado');
    } catch (error) {
      showStatus('error', 'Error al eliminar el progreso');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmAndExecute = (action: () => void, _message: string) => {
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  return (
    <div className={className}>
      <DataManagementContainer>
        <h1>🔧 Gestión de Datos</h1>
        <p style={{ color: '#b8c5d6', marginBottom: '2rem' }}>
          Gestiona tu progreso con herramientas de exportación, importación y respaldo
        </p>

        {statusMessage && (
          <StatusMessage type={statusMessage.type}>
            {statusMessage.message}
          </StatusMessage>
        )}

        <ActionSection>
          <h2>📤 Exportar e Importar</h2>
          <ActionGrid>
            <ActionCard>
              <h3>Exportar Progreso</h3>
              <p>Descarga tu progreso completo en formato JSON para respaldarlo o transferirlo a otro dispositivo.</p>
              <Button variant="primary" onClick={handleExport} disabled={isLoading}>
                📤 Exportar Datos
              </Button>
            </ActionCard>

            <ActionCard>
              <h3>Importar Progreso</h3>
              <p>Carga un archivo de progreso previo para restaurar tu avance.</p>
              
              <FileDropZone
                isDragOver={isDragOver}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('import-file')?.click()}
              >
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportFile(file);
                  }}
                />
                {isLoading ? (
                  <>
                    <div style={{ color: '#00d4ff', marginBottom: '1rem' }}>⏳ Importando...</div>
                    <Progress value={50} max={100} variant="primary" />
                  </>
                ) : (
                  <>
                    <div style={{ color: '#00d4ff', marginBottom: '1rem' }}>
                      {isDragOver ? '📁 Suelta el archivo aquí' : '📁 Arrastra o haz clic para subir'}
                    </div>
                    <div style={{ color: '#b8c5d6', fontSize: '0.9rem' }}>
                      Formatos aceptados: JSON
                    </div>
                  </>
                )}
              </FileDropZone>
            </ActionCard>
          </ActionGrid>
        </ActionSection>

        <ActionSection>
          <h2>💾 Copias de Seguridad Locales</h2>
          <p style={{ color: '#b8c5d6', marginBottom: '1rem' }}>
            Las copias se almacenan localmente en tu navegador y se pueden usar para restaurar tu progreso rápidamente.
          </p>
          
          <div style={{ marginBottom: '1rem' }}>
            <Button variant="secondary" onClick={handleCreateBackup} disabled={isLoading}>
              💾 Crear Copia de Seguridad
            </Button>
          </div>

          {backups.length > 0 ? (
            <Card title={`📦 Copias Disponibles (${backups.length})`}>
              <BackupList>
                {backups.map((backup) => (
                  <BackupItem key={backup.key}>
                    <div className="backup-info">
                      <div className="backup-name">
                        Respaldo - {backup.date.toLocaleDateString()}
                      </div>
                      <div className="backup-details">
                        Creado: {backup.date.toLocaleString()} • 
                        Perfil: {backup.profile || 'Sin nombre'}
                      </div>
                    </div>
                    <div className="backup-actions">
                      <Button 
                        variant="success" 
                        size="small"
                        onClick={() => handleRestoreBackup(backup.key)}
                        disabled={isLoading}
                      >
                        Restaurar
                      </Button>
                      <Button 
                        variant="danger" 
                        size="small"
                        onClick={() => confirmAndExecute(
                          () => {
                            localStorage.removeItem(backup.key);
                            setBackups(listBackups());
                            showStatus('success', 'Copia de seguridad eliminada');
                          },
                          '¿Estás seguro de que quieres eliminar esta copia de seguridad?'
                        )}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </BackupItem>
                ))}
              </BackupList>
            </Card>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: '#666', 
              padding: '2rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              No hay copias de seguridad disponibles
            </div>
          )}
        </ActionSection>

        <ActionSection>
          <h2>⚠️ Zona Peligrosa</h2>
          <WarningCard>
            <h3>Eliminar Todo el Progreso</h3>
            <p>
              Esta acción eliminará permanentemente todo tu progreso, incluyendo lecciones completadas, 
              logros, estadísticas y configuraciones. Esta acción no se puede deshacer.
            </p>
            <div style={{ marginTop: '1rem' }}>
              <Button 
                variant="danger"
                onClick={() => confirmAndExecute(
                  handleClearProgress,
                  '¿Estás COMPLETAMENTE seguro de que quieres eliminar TODO tu progreso? Esta acción no se puede deshacer.'
                )}
                disabled={isLoading}
              >
                🗑️ Eliminar Todo el Progreso
              </Button>
            </div>
          </WarningCard>
        </ActionSection>

        {/* Summary Card */}
        {profile && (
          <Card title="📊 Resumen de Datos">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <strong style={{ color: '#00d4ff' }}>Perfil:</strong>
                <div style={{ color: '#b8c5d6' }}>{profile.name}</div>
              </div>
              <div>
                <strong style={{ color: '#00d4ff' }}>Creado:</strong>
                <div style={{ color: '#b8c5d6' }}>{profile.createdAt.toLocaleDateString()}</div>
              </div>
              <div>
                <strong style={{ color: '#00d4ff' }}>Lecciones:</strong>
                <div style={{ color: '#b8c5d6' }}>{profile.lessonsCompleted}</div>
              </div>
              <div>
                <strong style={{ color: '#00d4ff' }}>Tiempo:</strong>
                <div style={{ color: '#b8c5d6' }}>{Math.floor(profile.totalTimeSpent / 3600)}h</div>
              </div>
              <div>
                <strong style={{ color: '#00d4ff' }}>Logros:</strong>
                <div style={{ color: '#b8c5d6' }}>{profile.achievements.length}</div>
              </div>
              <div>
                <strong style={{ color: '#00d4ff' }}>Racha:</strong>
                <div style={{ color: '#b8c5d6' }}>{profile.currentStreak} días</div>
              </div>
            </div>
          </Card>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal show={showConfirmModal}>
          <ModalContent>
            <h3>Confirmar Acción</h3>
            <p>
              ¿Estás seguro de que quieres realizar esta acción? 
              Algunos cambios no se pueden deshacer.
            </p>
            <div className="modal-actions">
              <Button 
                variant="secondary" 
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="danger"
                onClick={() => {
                  confirmAction();
                  setShowConfirmModal(false);
                }}
              >
                Confirmar
              </Button>
            </div>
          </ModalContent>
        </ConfirmationModal>
      </DataManagementContainer>
    </div>
  );
}

export default DataManagement;