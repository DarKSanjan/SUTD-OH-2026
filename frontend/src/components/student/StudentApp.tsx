import { useState } from 'react';
import StudentIDForm from './StudentIDForm';
import QRCodeDisplay from './QRCodeDisplay';
import EasterEgg from './EasterEgg';
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
  error?: string;
}

export default function StudentApp() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null);

  const handleSubmit = async (studentId: string) => {
    // Easter egg for student ID 1009104
    if (studentId === '1009104') {
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

  return (
    <div className="student-app">
      {showEasterEgg && <EasterEgg onComplete={handleEasterEggComplete} />}
      
      <div className="student-app-header">
        <img src="/SUTD Logo Dark.webp" alt="SUTD Logo" className="sutd-logo" />
        <h1>SUTD Open House 2026</h1>
        <p>Event Check-In System</p>
      </div>

      {!validationResult ? (
        <StudentIDForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading}
          error={error}
        />
      ) : (
        validationResult.student && validationResult.qrCode && (
          <QRCodeDisplay
            qrCode={validationResult.qrCode}
            student={validationResult.student}
            onGenerateNew={handleReset}
          />
        )
      )}

      <style>{`
        .student-app {
          min-height: 100vh;
          background: linear-gradient(135deg, #E63946 0%, #C1121F 50%, #780000 100%);
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
