import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Paper
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  FlipCameraAndroid as FlipIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const CameraCapture = ({ onCapture, onClose, open }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' for front camera, 'environment' for back
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open, facingMode]);

  const startCamera = async () => {
    try {
      if (stream) {
        stopCamera();
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const flipCamera = () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      canvas.toBlob((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
      }, 'image/jpeg', 0.8);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
  };

  const confirmPhoto = () => {
    if (capturedImage && onCapture) {
      onCapture(capturedImage);
    }
    handleClose();
  };

  const handleClose = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    setCapturedImage(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '600px'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Take Photo</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {error ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            p: 3
          }}>
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button 
              variant="outlined" 
              onClick={startCamera}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          </Box>
        ) : capturedImage ? (
          <Box sx={{ position: 'relative', height: '100%' }}>
            <img 
              src={capturedImage} 
              alt="Captured" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }} 
            />
          </Box>
        ) : (
          <Box sx={{ position: 'relative', height: '100%' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {/* Camera overlay */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              pointerEvents: 'none'
            }} />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        {!capturedImage ? (
          <>
            <Button
              variant="outlined"
              onClick={flipCamera}
              startIcon={<FlipIcon />}
              disabled={!stream}
            >
              Flip
            </Button>
            <Button
              variant="contained"
              onClick={capturePhoto}
              startIcon={<CameraIcon />}
              disabled={!stream}
              sx={{ minWidth: '120px' }}
            >
              Capture
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={retakePhoto}
              startIcon={<RefreshIcon />}
            >
              Retake
            </Button>
            <Button
              variant="contained"
              onClick={confirmPhoto}
              startIcon={<CheckIcon />}
              sx={{ minWidth: '120px' }}
            >
              Use Photo
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CameraCapture; 