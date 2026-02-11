import { useState } from 'react';
import StudentIDForm from './StudentIDForm';
import QRCodeDisplay from './QRCodeDisplay';
import EasterEgg from './EasterEgg';
import PDPAConsent from './PDPAConsent';
import { apiPost, getErrorMessage } from '../../services/api';

interface StudentData {
  studentId: string;
  name: string;
  tshirtSize: string;
  mealPreference: string;
  involvements?: Array<{ club: string; role: string }>;
}

interface ValidationResponse {
  success: boolean;
  student?: StudentData;
  qrCode?: string;
  token?: string;
  collectionStatus?: {
    shirtCollected: boolean;
    mealCollected: boolean;
  };
  error?: string;
}

/**
 * Determines whether to show the easter egg for a given student ID.
 * Always shows for student ID "1009104", and shows with 1/75 probability for others.
 * Randomization is per session (each call generates a new random value).
 */
function shouldShowEasterEgg(studentId: string): boolean {
  // Always show for special ID
  if (studentId === '1009104') {
    return true;
  }
  
  // 1 in 75 random chance for others
  return Math.random() < (1 / 75);
}

export default function StudentApp() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  const handleSubmit = async (studentId: string) => {
    // Check if easter egg should be shown
    if (shouldShowEasterEgg(studentId)) {
      setPendingStudentId(studentId);
      setShowEasterEgg(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Call the /api/validate endpoint with retry logic
      const data = await apiPost<ValidationResponse>('/api/validate', { studentId });

      // Handle success
      setValidationResult(data);
      setError(null);
      // Show consent screen after successful validation
      setShowConsent(true);
    } catch (err) {
      // Handle errors
      console.error('Validation error:', err);
      setError(getErrorMessage(err));
      setValidationResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setValidationResult(null);
    setError(null);
    setShowConsent(false);
    setConsentGiven(false);
  };

  const handleEasterEggComplete = async () => {
    setShowEasterEgg(false);
    
    // Now actually validate the student ID
    if (pendingStudentId) {
      setIsLoading(true);
      try {
        const data = await apiPost<ValidationResponse>('/api/validate', { studentId: pendingStudentId });
        setValidationResult(data);
        setError(null);
        // Show consent screen after successful validation
        setShowConsent(true);
      } catch (err) {
        console.error('Validation error:', err);
        setError(getErrorMessage(err));
        setValidationResult(null);
      } finally {
        setIsLoading(false);
        setPendingStudentId(null);
      }
    }
  };

  const handleConsentGiven = () => {
    setConsentGiven(true);
    setShowConsent(false);
  };

  const handleConsentBack = () => {
    setShowConsent(false);
    setValidationResult(null);
    setError(null);
  };

  return (
    <div className="student-app">
      {showEasterEgg && <EasterEgg onComplete={handleEasterEggComplete} />}
      
      <div className="student-app-header">
        <img src="/ROOT_logo_white-03.png" alt="ROOT Logo" className="sutd-logo" />
        <h1>SUTD Open House 2026</h1>
        <p>Event Check-In System</p>
      </div>

      {!validationResult ? (
        <StudentIDForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading}
          error={error}
        />
      ) : showConsent ? (
        <PDPAConsent
          studentId={validationResult.student?.studentId || ''}
          onConsentGiven={handleConsentGiven}
          onBack={handleConsentBack}
        />
      ) : consentGiven && validationResult.student && validationResult.qrCode ? (
        <QRCodeDisplay
          qrCode={validationResult.qrCode}
          student={validationResult.student}
          shirtCollected={validationResult.collectionStatus?.shirtCollected || false}
          mealCollected={validationResult.collectionStatus?.mealCollected || false}
          onGenerateNew={handleReset}
        />
      ) : null}

      <style>{`
        .student-app {
          min-height: 100vh;
          background: #53001b;
          padding: 20px;
        }
        
        .student-app-header {
          text-align: center;
          color: white;
          margin-bottom: 40px;
        }

        .sutd-logo {
          max-width: 200px;
          height: auto;
          margin-bottom: 24px;
          filter: brightness(0) invert(1);
        }
        
        .student-app-header h1 {
          font-size: 32px;
          margin-bottom: 8px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        
        .student-app-header p {
          font-size: 16px;
          opacity: 0.95;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .sutd-logo {
            max-width: 160px;
            margin-bottom: 20px;
          }

          .student-app-header h1 {
            font-size: 28px;
          }

          .student-app-header p {
            font-size: 15px;
          }
        }

        @media (max-width: 480px) {
          .sutd-logo {
            max-width: 140px;
            margin-bottom: 16px;
          }

          .student-app-header h1 {
            font-size: 24px;
          }

          .student-app-header p {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
