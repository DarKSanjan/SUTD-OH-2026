import { useState, useEffect } from 'react';
import InvolvementDisplay from '../shared/InvolvementDisplay';

interface StudentInvolvement {
  club: string;
  role: string;
}

interface StudentData {
  studentId: string;
  name: string;
  tshirtSize: string;
  mealPreference: string;
  involvements?: StudentInvolvement[];
}

interface QRCodeDisplayProps {
  qrCode: string;
  student: StudentData;
  shirtCollected?: boolean;
  mealCollected?: boolean;
  onGenerateNew?: () => void;
}

export default function QRCodeDisplay({ qrCode, student, shirtCollected: initialShirtCollected = false, mealCollected: initialMealCollected = false, onGenerateNew }: QRCodeDisplayProps) {
  const [shirtCollected, setShirtCollected] = useState(initialShirtCollected);
  const [mealCollected, setMealCollected] = useState(initialMealCollected);

  // Poll for collection status updates every 3 seconds
  useEffect(() => {
    const pollCollectionStatus = async () => {
      try {
        const response = await fetch(`/api/distribution-status/${student.studentId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.status) {
            setShirtCollected(data.status.tshirtClaimed);
            setMealCollected(data.status.mealClaimed);
          }
        }
      } catch (error) {
        console.error('Failed to fetch collection status:', error);
      }
    };

    // Poll immediately on mount
    pollCollectionStatus();

    // Then poll every 3 seconds
    const intervalId = setInterval(pollCollectionStatus, 3000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [student.studentId]);
  return (
    <div className="qr-code-display">
      <div className="success-message">
        <h2>✓ Success!</h2>
        <p>Welcome, {student.name}!</p>
      </div>

      <div className="student-info">
        <h3>Student Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Student ID:</span>
            <span className="info-value">{student.studentId}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Name:</span>
            <span className="info-value">{student.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">T-Shirt Size:</span>
            <span className="info-value">{student.tshirtSize}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Meal Preference:</span>
            <span className="info-value">{student.mealPreference}</span>
          </div>
        </div>
        
        {student.involvements && student.involvements.length > 0 && (
          <InvolvementDisplay 
            involvements={student.involvements} 
            variant="list"
          />
        )}
      </div>

      <div className="qr-code-section">
        <h3>Your QR Code</h3>
        <div className="qr-code-container">
          <img 
            src={qrCode} 
            alt="Student QR Code" 
            className="qr-code-image"
          />
        </div>
        <p className="qr-code-instructions">
          Show this QR code at the event to claim your items
        </p>
      </div>

      <div className="collection-status">
        <h3>Collection Status</h3>
        <div className="status-grid">
          <div className={`status-item ${shirtCollected ? 'collected' : 'not-collected'}`}>
            <span className="status-icon">{shirtCollected ? '✓' : '✗'}</span>
            <span className="status-label">Shirt Collected</span>
          </div>
          <div className={`status-item ${mealCollected ? 'collected' : 'not-collected'}`}>
            <span className="status-icon">{mealCollected ? '✓' : '✗'}</span>
            <span className="status-label">Meal Collected</span>
          </div>
        </div>
      </div>

      {onGenerateNew && (
        <button 
          onClick={onGenerateNew} 
          className="generate-new-button"
        >
          Start Over
        </button>
      )}

      <style>{`
        .qr-code-display {
          max-width: 500px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .success-message {
          text-align: center;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 2px solid #e0e0e0;
        }

        .success-message h2 {
          color: #4CAF50;
          font-size: 28px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .success-message p {
          color: #333;
          font-size: 18px;
          font-weight: 500;
        }

        .student-info {
          margin-bottom: 24px;
        }

        .student-info h3 {
          color: #333;
          font-size: 18px;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #f5f5f5;
          padding: 16px;
          border-radius: 4px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }

        .info-label {
          font-weight: 600;
          color: #666;
          font-size: 14px;
        }

        .info-value {
          color: #333;
          font-size: 14px;
          font-weight: 500;
        }

        .qr-code-section {
          margin-bottom: 24px;
        }

        .qr-code-section h3 {
          color: #333;
          font-size: 18px;
          margin-bottom: 16px;
          font-weight: 600;
          text-align: center;
        }

        .qr-code-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          margin-bottom: 12px;
        }

        .qr-code-image {
          max-width: 300px;
          width: 100%;
          height: auto;
          display: block;
        }

        .qr-code-instructions {
          text-align: center;
          color: #666;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        .collection-status {
          margin-bottom: 24px;
          padding: 16px;
          background: #f5f5f5;
          border-radius: 4px;
        }

        .collection-status h3 {
          color: #333;
          font-size: 18px;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .status-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
        }

        .status-icon {
          font-size: 20px;
          font-weight: bold;
          width: 24px;
          text-align: center;
        }

        .status-item.collected .status-icon {
          color: #4CAF50;
        }

        .status-item.not-collected .status-icon {
          color: #f44336;
        }

        .status-label {
          color: #333;
          font-size: 14px;
          font-weight: 500;
        }

        .generate-new-button {
          width: 100%;
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          background-color: #667eea;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s, transform 0.1s;
        }

        .generate-new-button:hover {
          background-color: #5568d3;
        }

        .generate-new-button:active {
          transform: scale(0.98);
        }

        @media (max-width: 480px) {
          .qr-code-display {
            padding: 20px;
          }

          .success-message h2 {
            font-size: 24px;
          }

          .success-message p {
            font-size: 16px;
          }

          .qr-code-image {
            max-width: 250px;
          }

          .info-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
}
