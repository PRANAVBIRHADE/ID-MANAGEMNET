import React, { useEffect, useState } from 'react';
import {
  Snackbar,
  Alert,
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

const PWARegistration = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showUpdateSnackbar, setShowUpdateSnackbar] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdateSnackbar(true);
              }
            });
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleUpdateClick = () => {
    window.location.reload();
  };

  const handleCloseInstallPrompt = () => {
    setShowInstallPrompt(false);
  };

  const handleCloseUpdateSnackbar = () => {
    setShowUpdateSnackbar(false);
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Install Prompt Dialog */}
      <Dialog open={showInstallPrompt} onClose={handleCloseInstallPrompt}>
        <DialogTitle>Install Student ID App</DialogTitle>
        <DialogContent>
          <Typography>
            Install our app for a better experience! You'll get:
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Offline access to your data
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Push notifications for updates
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • App-like experience
            </Typography>
            <Typography variant="body2">
              • Quick access from home screen
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInstallPrompt}>Not Now</Button>
          <Button 
            onClick={handleInstallClick} 
            variant="contained" 
            startIcon={<DownloadIcon />}
          >
            Install
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Available Snackbar */}
      <Snackbar
        open={showUpdateSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseUpdateSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseUpdateSnackbar} 
          severity="info" 
          action={
            <Button color="inherit" size="small" onClick={handleUpdateClick}>
              Update
            </Button>
          }
        >
          A new version is available!
        </Alert>
      </Snackbar>
    </>
  );
};

export default PWARegistration; 