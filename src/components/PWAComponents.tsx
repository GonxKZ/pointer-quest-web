/**
 * PWA Components for Pointer Quest
 * Includes install prompt, update notification, and offline status
 */

import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { usePWA } from '../utils/pwaUtils';

// Animations
const slideIn = keyframes`
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

// Styled components
const NotificationBar = styled.div<{ variant: 'info' | 'success' | 'warning' | 'error' }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: ${props => props.theme.zIndex.banner};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  backdrop-filter: blur(10px);
  animation: ${slideIn} ${props => props.theme.animation.duration.normal} ${props => props.theme.animation.easing.easeOut};
  
  ${props => {
    switch (props.variant) {
      case 'success':
        return css`
          background: linear-gradient(135deg, ${props.theme.colors.success}20, ${props.theme.colors.success}40);
          border-bottom: 2px solid ${props.theme.colors.success};
          color: ${props.theme.colors.success};
        `;
      case 'warning':
        return css`
          background: linear-gradient(135deg, ${props.theme.colors.warning}20, ${props.theme.colors.warning}40);
          border-bottom: 2px solid ${props.theme.colors.warning};
          color: ${props.theme.colors.warning};
        `;
      case 'error':
        return css`
          background: linear-gradient(135deg, ${props.theme.colors.error}20, ${props.theme.colors.error}40);
          border-bottom: 2px solid ${props.theme.colors.error};
          color: ${props.theme.colors.error};
        `;
      default:
        return css`
          background: linear-gradient(135deg, ${props.theme.colors.info}20, ${props.theme.colors.info}40);
          border-bottom: 2px solid ${props.theme.colors.info};
          color: ${props.theme.colors.info};
        `;
    }
  }}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const NotificationContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  flex: 1;
`;

const NotificationIcon = styled.span`
  font-size: 1.2rem;
  animation: ${pulse} 2s infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const NotificationText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

const NotificationTitle = styled.h3`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const NotificationDescription = styled.p`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.xs};
  opacity: 0.9;
`;

const NotificationActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
`;

const ActionButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border: none;
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.normal};

  ${props => props.variant === 'primary' ? css`
    background: ${props.theme.colors.primary[500]};
    color: ${props.theme.colors.text.inverse};
    
    &:hover {
      background: ${props.theme.colors.primary[600]};
      transform: translateY(-1px);
      box-shadow: ${props.theme.shadows.md};
    }
  ` : css`
    background: transparent;
    color: currentColor;
    border: 1px solid currentColor;
    
    &:hover {
      background: currentColor;
      color: ${props.theme.colors.background.primary};
    }
  `}

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary[500]}40;
  }

  &:active {
    transform: translateY(0);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: background-color ${props => props.theme.animation.duration.fast};
    
    &:hover {
      transform: none;
    }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.borderRadius.base};
  opacity: 0.7;
  transition: opacity ${props => props.theme.animation.duration.fast};

  &:hover {
    opacity: 1;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary[500]}40;
  }
`;

const StatusIndicator = styled.div<{ status: 'online' | 'offline' | 'installing' | 'updating' }>`
  position: fixed;
  bottom: ${props => props.theme.spacing[4]};
  left: ${props => props.theme.spacing[4]};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.full};
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.theme.shadows.lg};
  font-size: ${props => props.theme.typography.fontSize.xs};
  z-index: ${props => props.theme.zIndex.toast};

  ${props => {
    switch (props.status) {
      case 'offline':
        return css`
          border-color: ${props.theme.colors.error};
          color: ${props.theme.colors.error};
        `;
      case 'installing':
      case 'updating':
        return css`
          border-color: ${props.theme.colors.warning};
          color: ${props.theme.colors.warning};
        `;
      default:
        return css`
          border-color: ${props.theme.colors.success};
          color: ${props.theme.colors.success};
        `;
    }
  }}
`;

const StatusIcon = styled.span<{ isAnimated?: boolean }>`
  ${props => props.isAnimated && css`
    animation: ${pulse} 1.5s infinite;
    
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `}
`;

const InstallCard = styled.div`
  position: fixed;
  bottom: ${props => props.theme.spacing[4]};
  right: ${props => props.theme.spacing[4]};
  max-width: 300px;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  backdrop-filter: blur(10px);
  padding: ${props => props.theme.spacing[4]};
  z-index: ${props => props.theme.zIndex.toast};
  animation: ${slideIn} ${props => props.theme.animation.duration.normal} ${props => props.theme.animation.easing.easeOut};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const InstallIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(45deg, ${props => props.theme.colors.primary[500]}, ${props => props.theme.colors.secondary[500]});
  border-radius: ${props => props.theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: ${props => props.theme.spacing[3]};
  background-size: 200% 200%;
  animation: ${shimmer} 3s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const InstallContent = styled.div`
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const InstallTitle = styled.h3`
  margin: 0 0 ${props => props.theme.spacing[1]} 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const InstallDescription = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
`;

// Component interfaces
interface PWAUpdateNotificationProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

interface PWAInstallPromptProps {
  onInstall: () => Promise<void>;
  onDismiss: () => void;
}

interface PWAStatusProps {
  showWhenOnline?: boolean;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

/**
 * PWA Update Notification Component
 */
export function PWAUpdateNotification({ onUpdate, onDismiss }: PWAUpdateNotificationProps) {
  return (
    <NotificationBar variant="info" role="alert" aria-live="polite">
      <NotificationContent>
        <NotificationIcon>🔄</NotificationIcon>
        <NotificationText>
          <NotificationTitle>Update Available</NotificationTitle>
          <NotificationDescription>
            A new version of Pointer Quest is ready to install
          </NotificationDescription>
        </NotificationText>
      </NotificationContent>
      
      <NotificationActions>
        <ActionButton 
          variant="primary" 
          onClick={onUpdate}
          aria-label="Install update now"
        >
          Update Now
        </ActionButton>
        <ActionButton 
          variant="secondary" 
          onClick={onDismiss}
          aria-label="Dismiss update notification"
        >
          Later
        </ActionButton>
      </NotificationActions>
      
      <CloseButton 
        onClick={onDismiss}
        aria-label="Close notification"
      >
        ✕
      </CloseButton>
    </NotificationBar>
  );
}

/**
 * PWA Install Prompt Component
 */
export function PWAInstallPrompt({ onInstall, onDismiss }: PWAInstallPromptProps) {
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await onInstall();
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <InstallCard role="dialog" aria-labelledby="install-title" aria-describedby="install-desc">
      <InstallIcon>🚀</InstallIcon>
      
      <InstallContent>
        <InstallTitle id="install-title">Install Pointer Quest</InstallTitle>
        <InstallDescription id="install-desc">
          Install our app for a better experience with offline access, faster loading, and desktop integration.
        </InstallDescription>
      </InstallContent>
      
      <NotificationActions>
        <ActionButton 
          variant="primary" 
          onClick={handleInstall}
          disabled={isInstalling}
          aria-label="Install Pointer Quest application"
        >
          {isInstalling ? 'Installing...' : 'Install App'}
        </ActionButton>
        <ActionButton 
          variant="secondary" 
          onClick={onDismiss}
          disabled={isInstalling}
          aria-label="Dismiss install prompt"
        >
          Not Now
        </ActionButton>
      </NotificationActions>
    </InstallCard>
  );
}

/**
 * PWA Status Indicator Component
 */
export function PWAStatus({ showWhenOnline = false, position = 'bottom-left' }: PWAStatusProps) {
  const { status } = usePWA();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show status indicator based on conditions
    const shouldShow = !status.isOnline || 
                      showWhenOnline || 
                      status.serviceWorkerStatus === 'installing' ||
                      status.serviceWorkerStatus === 'activating';
    
    setIsVisible(shouldShow);
  }, [status, showWhenOnline]);

  if (!isVisible) return null;

  const getStatusInfo = () => {
    if (!status.isOnline) {
      return { icon: '🔴', text: 'Offline', status: 'offline' as const, animated: true };
    }
    
    if (status.serviceWorkerStatus === 'installing') {
      return { icon: '⬇️', text: 'Installing...', status: 'installing' as const, animated: true };
    }
    
    if (status.serviceWorkerStatus === 'activating') {
      return { icon: '🔄', text: 'Updating...', status: 'updating' as const, animated: true };
    }
    
    return { icon: '🟢', text: 'Online', status: 'online' as const, animated: false };
  };

  const statusInfo = getStatusInfo();

  return (
    <StatusIndicator status={statusInfo.status} role="status" aria-live="polite">
      <StatusIcon isAnimated={statusInfo.animated}>
        {statusInfo.icon}
      </StatusIcon>
      <span>{statusInfo.text}</span>
    </StatusIndicator>
  );
}

/**
 * Main PWA Manager Component
 * Orchestrates all PWA-related UI components
 */
export function PWAManager() {
  const { updateInfo, status, installInfo } = usePWA();
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [dismissedInstall, setDismissedInstall] = useState(false);

  // Show update notification when available
  useEffect(() => {
    if (updateInfo.isUpdateAvailable && updateInfo.isWaitingForUpdate) {
      setShowUpdateNotification(true);
    }
  }, [updateInfo.isUpdateAvailable, updateInfo.isWaitingForUpdate]);

  // Show install prompt when available (with delay to avoid interrupting UX)
  useEffect(() => {
    if (installInfo.canInstall && !status.isInstalled && !dismissedInstall) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 10000); // Show after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [installInfo.canInstall, status.isInstalled, dismissedInstall]);

  // Handle update installation
  const handleUpdate = () => {
    updateInfo.updateServiceWorker();
    setShowUpdateNotification(false);
  };

  // Handle install prompt
  const handleInstall = async () => {
    await installInfo.promptInstall();
    setShowInstallPrompt(false);
  };

  // Handle install prompt dismissal
  const handleInstallDismiss = () => {
    setShowInstallPrompt(false);
    setDismissedInstall(true);
    
    // Re-enable install prompt after 24 hours
    setTimeout(() => {
      setDismissedInstall(false);
    }, 24 * 60 * 60 * 1000);
  };

  return (
    <>
      {/* Update notification */}
      {showUpdateNotification && (
        <PWAUpdateNotification
          onUpdate={handleUpdate}
          onDismiss={() => setShowUpdateNotification(false)}
        />
      )}

      {/* Install prompt */}
      {showInstallPrompt && (
        <PWAInstallPrompt
          onInstall={handleInstall}
          onDismiss={handleInstallDismiss}
        />
      )}

      {/* Status indicator */}
      <PWAStatus showWhenOnline={false} />
    </>
  );
}

export default PWAManager;