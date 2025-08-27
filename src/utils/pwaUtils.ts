/**
 * PWA Utilities for Pointer Quest
 * Handles service worker registration, updates, and PWA features
 */

import { useState, useEffect } from 'react';

export interface PWAUpdateInfo {
  isUpdateAvailable: boolean;
  isWaitingForUpdate: boolean;
  updateServiceWorker: () => void;
}

export interface PWAInstallInfo {
  canInstall: boolean;
  promptInstall: () => Promise<void>;
}

export interface PWAStatus {
  isSupported: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  serviceWorkerStatus: 'installing' | 'installed' | 'activating' | 'activated' | 'redundant' | 'none';
}

class PWAManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private updateCallbacks: ((info: PWAUpdateInfo) => void)[] = [];
  private statusCallbacks: ((status: PWAStatus) => void)[] = [];

  constructor() {
    this.initializeServiceWorker();
    this.setupInstallPrompt();
    this.setupNetworkListeners();
  }

  /**
   * Initialize and register the service worker
   */
  private async initializeServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[PWA] Service Worker not supported');
      return;
    }

    try {
      // Register the service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('[PWA] Service Worker registered:', this.swRegistration.scope);

      // Handle service worker updates
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration?.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            this.handleServiceWorkerStateChange(newWorker);
          });
        }
      });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event);
      });

      // Check for updates periodically (every 30 minutes)
      setInterval(() => {
        this.checkForUpdates();
      }, 30 * 60 * 1000);

      // Initial update check
      this.checkForUpdates();

    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  }

  /**
   * Handle service worker state changes
   */
  private handleServiceWorkerStateChange(worker: ServiceWorker): void {
    console.log('[PWA] Service Worker state changed:', worker.state);
    
    if (worker.state === 'installed' && navigator.serviceWorker.controller) {
      // New service worker installed and waiting
      this.notifyUpdateAvailable(worker);
    }

    if (worker.state === 'activated') {
      // Service worker activated
      this.notifyStatusChange();
      
      // Reload the page if this was an update
      if (!navigator.serviceWorker.controller) {
        window.location.reload();
      }
    }
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, payload } = event.data;

    switch (type) {
      case 'SW_ACTIVATED':
        console.log('[PWA] Service Worker activated with cache version:', payload.cacheVersion);
        this.notifyStatusChange();
        break;

      case 'VERSION_INFO':
        console.log('[PWA] Current cache version:', payload.version);
        break;

      case 'CACHE_CLEARED':
        console.log('[PWA] Cache cleared:', payload.success);
        break;
    }
  }

  /**
   * Check for service worker updates
   */
  public async checkForUpdates(): Promise<void> {
    if (!this.swRegistration) return;

    try {
      await this.swRegistration.update();
    } catch (error) {
      console.error('[PWA] Failed to check for updates:', error);
    }
  }

  /**
   * Install pending service worker update
   */
  public installUpdate(): void {
    if (!this.swRegistration?.waiting) return;

    // Tell the waiting service worker to activate
    this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  /**
   * Notify listeners about update availability
   */
  private notifyUpdateAvailable(worker: ServiceWorker): void {
    const updateInfo: PWAUpdateInfo = {
      isUpdateAvailable: true,
      isWaitingForUpdate: true,
      updateServiceWorker: () => {
        worker.postMessage({ type: 'SKIP_WAITING' });
      }
    };

    this.updateCallbacks.forEach(callback => callback(updateInfo));
  }

  /**
   * Notify listeners about PWA status changes
   */
  private notifyStatusChange(): void {
    const status: PWAStatus = {
      isSupported: 'serviceWorker' in navigator,
      isInstalled: this.isPWAInstalled(),
      isOnline: navigator.onLine,
      serviceWorkerStatus: this.getServiceWorkerStatus()
    };

    this.statusCallbacks.forEach(callback => callback(status));
  }

  /**
   * Setup install prompt handling
   */
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event) => {
      // Prevent the mini-infobar from appearing
      event.preventDefault();
      // Store the event for later use
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      console.log('[PWA] Install prompt available');
    });

    // Handle successful installation
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      this.deferredPrompt = null;
      this.notifyStatusChange();
    });
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('[PWA] Network status: Online');
      this.notifyStatusChange();
    });

    window.addEventListener('offline', () => {
      console.log('[PWA] Network status: Offline');
      this.notifyStatusChange();
    });
  }

  /**
   * Prompt user to install PWA
   */
  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('[PWA] Install prompt not available');
      return false;
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt();
      
      // Wait for user response
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log('[PWA] Install prompt outcome:', outcome);
      
      // Clear the deferred prompt
      this.deferredPrompt = null;
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('[PWA] Install prompt failed:', error);
      return false;
    }
  }

  /**
   * Check if PWA is installed
   */
  private isPWAInstalled(): boolean {
    // Check for iOS Safari
    if ((navigator as any).standalone) {
      return true;
    }

    // Check for Android Chrome
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // Check for other browsers
    if (document.referrer.includes('android-app://')) {
      return true;
    }

    return false;
  }

  /**
   * Get current service worker status
   */
  private getServiceWorkerStatus(): PWAStatus['serviceWorkerStatus'] {
    if (!this.swRegistration) return 'none';
    
    if (this.swRegistration.installing) return 'installing';
    if (this.swRegistration.waiting) return 'installed';
    if (this.swRegistration.active?.state === 'activating') return 'activating';
    if (this.swRegistration.active?.state === 'activated') return 'activated';
    if (this.swRegistration.active?.state === 'redundant') return 'redundant';
    
    return 'none';
  }

  /**
   * Register update callback
   */
  public onUpdateAvailable(callback: (info: PWAUpdateInfo) => void): () => void {
    this.updateCallbacks.push(callback);
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Register status callback
   */
  public onStatusChange(callback: (status: PWAStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    // Call immediately with current status
    callback({
      isSupported: 'serviceWorker' in navigator,
      isInstalled: this.isPWAInstalled(),
      isOnline: navigator.onLine,
      serviceWorkerStatus: this.getServiceWorkerStatus()
    });
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get install info
   */
  public getInstallInfo(): PWAInstallInfo {
    return {
      canInstall: !!this.deferredPrompt,
      promptInstall: () => this.promptInstall().then(() => {})
    };
  }

  /**
   * Get current PWA status
   */
  public getStatus(): PWAStatus {
    return {
      isSupported: 'serviceWorker' in navigator,
      isInstalled: this.isPWAInstalled(),
      isOnline: navigator.onLine,
      serviceWorkerStatus: this.getServiceWorkerStatus()
    };
  }

  /**
   * Clear all caches
   */
  public async clearCaches(): Promise<boolean> {
    if (!this.swRegistration) return false;

    try {
      const messageChannel = new MessageChannel();
      
      return new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.payload.success);
        };

        this.swRegistration!.active?.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      console.error('[PWA] Failed to clear caches:', error);
      return false;
    }
  }

  /**
   * Cache a lesson for offline access
   */
  public cacheLesson(lessonId: number): void {
    if (!this.swRegistration?.active) return;

    this.swRegistration.active.postMessage({
      type: 'CACHE_LESSON',
      payload: { lessonUrl: `/lessons/${lessonId}` }
    });
  }

  /**
   * Get cache version
   */
  public async getCacheVersion(): Promise<string | null> {
    if (!this.swRegistration?.active) return null;

    try {
      const messageChannel = new MessageChannel();
      
      return new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.payload.version);
        };

        this.swRegistration!.active!.postMessage(
          { type: 'GET_VERSION' },
          [messageChannel.port2]
        );

        // Timeout after 5 seconds
        setTimeout(() => resolve(null), 5000);
      });
    } catch (error) {
      console.error('[PWA] Failed to get cache version:', error);
      return null;
    }
  }
}

// Create singleton instance
export const pwaManager = new PWAManager();

// Extend the Window interface for BeforeInstallPromptEvent
declare global {
  interface Window {
    deferredPrompt: BeforeInstallPromptEvent | null;
  }
  
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
  }
}

/**
 * React hook for PWA functionality
 */
export function usePWA() {
  const [updateInfo, setUpdateInfo] = useState<PWAUpdateInfo>({
    isUpdateAvailable: false,
    isWaitingForUpdate: false,
    updateServiceWorker: () => {}
  });

  const [status, setStatus] = useState<PWAStatus>(pwaManager.getStatus());
  const [installInfo, setInstallInfo] = useState<PWAInstallInfo>(pwaManager.getInstallInfo());

  useEffect(() => {
    const unsubscribeUpdate = pwaManager.onUpdateAvailable(setUpdateInfo);
    const unsubscribeStatus = pwaManager.onStatusChange(setStatus);

    // Update install info periodically
    const updateInstallInfo = () => setInstallInfo(pwaManager.getInstallInfo());
    const intervalId = setInterval(updateInstallInfo, 1000);

    return () => {
      unsubscribeUpdate();
      unsubscribeStatus();
      clearInterval(intervalId);
    };
  }, []);

  return {
    updateInfo,
    status,
    installInfo,
    checkForUpdates: pwaManager.checkForUpdates.bind(pwaManager),
    clearCaches: pwaManager.clearCaches.bind(pwaManager),
    cacheLesson: pwaManager.cacheLesson.bind(pwaManager),
    getCacheVersion: pwaManager.getCacheVersion.bind(pwaManager)
  };
}