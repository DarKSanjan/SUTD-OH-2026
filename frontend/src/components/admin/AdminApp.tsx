import { useState } from 'react';
import QRScanner from './QRScanner';
import StudentInfoCard from './StudentInfoCard';
import ClaimCheckboxes from './ClaimCheckboxes';
import DatabaseTableView from './DatabaseTableView';
import ErrorMessage from '../shared/ErrorMessage';
import AdminLogin from './AdminLogin';

interface StudentData {
  studentId: string;
  name: string;
  tshirtSize: string;
  mealPreference: string;
  involvements?: Array<{ club: string; role: string }>;
}

interface ClaimStatus {
  tshirtClaimed: boolean;
  mealClaimed: boolean;
}

interface ScanResponse {
  success: boolean;
  student?: StudentData;
  claims?: ClaimStatus;
  error?: string;
}

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scannedData, setScannedData] = useState<{
    student: StudentData;
    claims: ClaimStatus;
    token: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'scanner' | 'database'>('scanner');

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }
  const handleScanSuccess = (data: ScanResponse, token: string) => {
    if (data.success && data.student && data.claims) {
      setScannedData({
        student: data.student,
        claims: data.claims,
        token: token,
      });
      setError(null);
      setScanCount(prev => prev + 1);
    } else {
      setError(data.error || 'Failed to scan QR code');
      setScannedData(null);
    }
  };

  const handleScanError = (errorMessage: string) => {
    setError(errorMessage);
    setScannedData(null);
  };

  const handleClaimUpdate = (updatedClaims: ClaimStatus) => {
    if (scannedData) {
      setScannedData({
        ...scannedData,
        claims: updatedClaims,
      });
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleScanAnother = () => {
    setScannedData(null);
    setError(null);
  };

  const handleTabChange = (tab: 'scanner' | 'database') => {
    setActiveTab(tab);
    // Clear scanned data when switching tabs
    if (tab === 'database') {
      setScannedData(null);
      setError(null);
    }
  };

  return (
    <div className="admin-app">
      <div className="admin-container">
        <header className="admin-header">
          <img src="/ROOT_logo_white-03.png" alt="ROOT Logo" className="sutd-logo" />
          <h1 className="admin-title">SUTD Open House 2026</h1>
          <p className="admin-subtitle">Event Check-In Station</p>
          {scanCount > 0 && (
            <div className="scan-counter">
              Scans today: <strong>{scanCount}</strong>
            </div>
          )}
        </header>

        <main className="admin-main">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'scanner' ? 'active' : ''}`}
              onClick={() => handleTabChange('scanner')}
            >
              Scanner
            </button>
            <button
              className={`tab-button ${activeTab === 'database' ? 'active' : ''}`}
              onClick={() => handleTabChange('database')}
            >
              Database View
            </button>
          </div>

          {error && (
            <div className="error-container">
              <ErrorMessage message={error} onDismiss={handleDismissError} />
            </div>
          )}

          {/* Scanner Tab */}
          {activeTab === 'scanner' && (
            <>
              {!scannedData ? (
                <div className="scanner-section">
                  <QRScanner 
                    onScanSuccess={handleScanSuccess} 
                    onScanError={handleScanError} 
                  />
                  <div className="scanner-help">
                    <p>📱 Point your camera at a student's QR code to begin check-in</p>
                  </div>
                </div>
              ) : (
                <div className="student-section">
                  <StudentInfoCard student={scannedData.student} />
                  
                  <ClaimCheckboxes 
                    studentId={scannedData.student.studentId}
                    claims={scannedData.claims}
                    onClaimUpdate={handleClaimUpdate}
                  />

                  <button 
                    onClick={handleScanAnother}
                    className="scan-another-button"
                  >
                    Scan Another Student
                  </button>
                </div>
              )}
            </>
          )}

          {/* Database View Tab */}
          {activeTab === 'database' && (
            <div className="database-section">
              <DatabaseTableView />
            </div>
          )}
        </main>

        <footer className="admin-footer">
          <p>Need help? Contact event staff</p>
        </footer>
      </div>

      <style>{`
        .admin-app {
          min-height: 100vh;
          background: #53001b;
          padding: 16px;
          padding-bottom: 40px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .admin-container {
          max-width: 600px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-bottom: 20px;
        }

        .admin-header {
          text-align: center;
          color: white;
          padding: 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .sutd-logo {
          max-width: 180px;
          height: auto;
          margin: 0 auto 16px;
          filter: brightness(0) invert(1);
        }

        .admin-title {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .admin-subtitle {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          opacity: 0.95;
        }

        .scan-counter {
          margin-top: 12px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          display: inline-block;
          font-size: 14px;
        }

        .scan-counter strong {
          font-weight: 700;
          font-size: 16px;
        }

        .admin-main {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .tab-navigation {
          display: flex;
          gap: 8px;
          background: rgba(255, 255, 255, 0.95);
          padding: 8px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .tab-button {
          flex: 1;
          padding: 12px 16px;
          background: transparent;
          color: #666;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-button:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .tab-button.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .database-section {
          animation: fadeIn 0.4s ease-out;
        }

        .error-container {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .scanner-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .scanner-help {
          background: rgba(255, 255, 255, 0.95);
          padding: 16px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .scanner-help p {
          margin: 0;
          font-size: 16px;
          color: #333;
          font-weight: 500;
        }

        .student-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: fadeIn 0.4s ease-out;
          margin-bottom: 20px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .scan-another-button {
          width: 100%;
          padding: 16px;
          background: white;
          color: #E63946;
          border: 2px solid white;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-top: 8px;
        }

        .scan-another-button:hover {
          background: #fff5f5;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .scan-another-button:active {
          transform: translateY(0);
        }

        .admin-footer {
          text-align: center;
          color: white;
          padding: 16px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          font-size: 14px;
          opacity: 0.9;
        }

        .admin-footer p {
          margin: 0;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .admin-app {
            padding: 16px;
          }

          .admin-container {
            gap: 16px;
          }

          .admin-header {
            padding: 16px;
          }

          .sutd-logo {
            max-width: 150px;
            margin-bottom: 14px;
          }

          .admin-title {
            font-size: 24px;
          }

          .admin-subtitle {
            font-size: 15px;
          }

          .scan-counter {
            font-size: 13px;
            padding: 6px 14px;
          }

          .scan-counter strong {
            font-size: 15px;
          }

          .tab-navigation {
            padding: 6px;
            gap: 6px;
          }

          .tab-button {
            padding: 10px 12px;
            font-size: 15px;
          }

          .scanner-help p {
            font-size: 15px;
          }

          .scan-another-button {
            padding: 14px;
            font-size: 17px;
          }

          .admin-footer {
            padding: 14px;
            font-size: 13px;
          }
        }

        /* Small mobile devices */
        @media (max-width: 480px) {
          .admin-app {
            padding: 12px;
          }

          .admin-container {
            gap: 14px;
          }

          .admin-header {
            padding: 14px;
          }

          .sutd-logo {
            max-width: 130px;
            margin-bottom: 12px;
          }

          .admin-title {
            font-size: 22px;
          }

          .admin-subtitle {
            font-size: 14px;
          }

          .scan-counter {
            font-size: 12px;
            padding: 5px 12px;
          }

          .scan-counter strong {
            font-size: 14px;
          }

          .tab-navigation {
            padding: 5px;
            gap: 5px;
          }

          .tab-button {
            padding: 9px 10px;
            font-size: 14px;
          }

          .scanner-help {
            padding: 14px;
          }

          .scanner-help p {
            font-size: 14px;
          }

          .scan-another-button {
            padding: 12px;
            font-size: 16px;
          }

          .admin-footer {
            padding: 12px;
            font-size: 12px;
          }
        }

        /* Large touch targets for mobile */
        @media (hover: none) and (pointer: coarse) {
          .scan-another-button {
            min-height: 56px;
          }

          .tab-button {
            min-height: 48px;
          }
        }

        /* Landscape mode adjustments */
        @media (max-height: 600px) and (orientation: landscape) {
          .admin-app {
            padding: 12px;
          }

          .admin-header {
            padding: 12px;
          }

          .admin-title {
            font-size: 24px;
          }

          .admin-subtitle {
            font-size: 14px;
          }

          .admin-main {
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
