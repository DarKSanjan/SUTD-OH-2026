import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { apiPost, getErrorMessage } from '../../services/api';

interface QRScanResult {
  token: string;
  studentId: string;
}

interface ScanResponse {
  success: boolean;
  student?: {
    studentId: string;
    name: string;
    tshirtSize: string;
    mealPreference: string;
    involvements?: Array<{ club: string; role: string }>;
  };
  claims?: {
    tshirtClaimed: boolean;
    mealClaimed: boolean;
  };
  error?: string;
}

interface QRScannerProps {
  onScanSuccess: (data: ScanResponse, token: string) => void;
  onScanError: (error: string) => void;
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let scanner: Html5Qrcode | null = null;

    // Initialize scanner
    const initScanner = async () => {
      try {
        // Check if already initialized
        if (scannerRef.current) {
          return;
        }

        // Request camera permissions
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the test stream
        
        if (!isMounted) return;
        
        setCameraPermission('granted');
        
        // Initialize Html5Qrcode
        scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;
        
        // Start scanning
        await startScanning(scanner);
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Camera permission error:', error);
        setCameraPermission('denied');
        onScanError('Camera permission denied. Please enable camera access to scan QR codes.');
      }
    };

    initScanner();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => {
          console.error('Error stopping scanner:', err);
        }).finally(() => {
          scannerRef.current = null;
        });
      }
    };
  }, []);

  const startScanning = async (scanner: Html5Qrcode) => {
    try {
      await scanner.start(
        { facingMode: 'environment' }, // Use back camera on mobile
        {
          fps: 10, // Frames per second
          qrbox: { width: 250, height: 250 }, // Scanning box size
        },
        async (decodedText) => {
          // Prevent multiple simultaneous processing
          if (isProcessingRef.current) {
            return;
          }
          
          isProcessingRef.current = true;
          
          try {
            // Extract token from QR code
            const qrData = JSON.parse(decodedText) as QRScanResult;
            const { token } = qrData;
            
            // Call /api/scan endpoint with retry logic
            const data = await apiPost<ScanResponse>('/api/scan', { token });
            onScanSuccess(data, token);
          } catch (error) {
            console.error('Error processing QR code:', error);
            const errorMessage = getErrorMessage(error);
            onScanError(errorMessage);
          } finally {
            // Allow processing again after a short delay
            setTimeout(() => {
              isProcessingRef.current = false;
            }, 2000);
          }
        },
        (errorMessage) => {
          // Scanning error (not critical, happens frequently)
          // Only log to console, don't show to user
          console.debug('QR scan error:', errorMessage);
        }
      );
      
      setIsScanning(true);
    } catch (error) {
      console.error('Error starting scanner:', error);
      onScanError('Failed to start camera. Please try again.');
    }
  };

  const handleRetryPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
      
      if (scannerRef.current) {
        await startScanning(scannerRef.current);
      }
    } catch (error) {
      console.error('Camera permission error:', error);
      onScanError('Camera permission denied. Please enable camera access in your browser settings.');
    }
  };

  return (
    <div className="qr-scanner">
      {cameraPermission === 'denied' ? (
        <div className="permission-denied">
          <div className="permission-icon">📷</div>
          <h3>Camera Access Required</h3>
          <p>Please enable camera access to scan QR codes.</p>
          <button onClick={handleRetryPermission} className="retry-button">
            Retry
          </button>
        </div>
      ) : (
        <>
          <div id="qr-reader" className="qr-reader-container"></div>
          <div className="scanner-overlay">
            <div className="scanner-instructions">
              {isScanning ? (
                <>
                  <div className="scanning-indicator">📱</div>
                  <p>Point camera at QR code</p>
                </>
              ) : (
                <p>Initializing camera...</p>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        .qr-scanner {
          position: relative;
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }

        .qr-reader-container {
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .scanner-overlay {
          margin-top: 20px;
          text-align: center;
        }

        .scanner-instructions {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .scanning-indicator {
          font-size: 48px;
          margin-bottom: 10px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }

        .scanner-instructions p {
          margin: 0;
          font-size: 16px;
          color: #333;
          font-weight: 500;
        }

        .permission-denied {
          background: white;
          padding: 40px 20px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .permission-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .permission-denied h3 {
          margin: 0 0 10px 0;
          font-size: 24px;
          color: #333;
        }

        .permission-denied p {
          margin: 0 0 20px 0;
          font-size: 16px;
          color: #666;
        }

        .retry-button {
          background: #667eea;
          color: white;
          border: none;
          padding: 12px 32px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .retry-button:hover {
          background: #5568d3;
        }

        .retry-button:active {
          transform: scale(0.98);
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .qr-scanner {
            max-width: 100%;
          }

          .scanner-instructions {
            padding: 16px;
          }

          .scanning-indicator {
            font-size: 40px;
          }
        }
      `}</style>
    </div>
  );
}
