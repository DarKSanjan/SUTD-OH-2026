import { useState } from 'react';
import ErrorMessage from '../shared/ErrorMessage';
import { apiPost, getErrorMessage } from '../../services/api';

interface PDPAConsentProps {
  studentId: string;
  onConsentGiven: () => void;
  onBack?: () => void;
}

interface ConsentResponse {
  success: boolean;
  message: string;
}

export default function PDPAConsent({ studentId, onConsentGiven, onBack }: PDPAConsentProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckboxChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    setError(null);

    // If checkbox is checked, record consent immediately
    if (checked) {
      setIsSubmitting(true);
      
      try {
        await apiPost<ConsentResponse>('/api/consent', {
          studentId,
          consented: true
        });
        
        // Emit event when consent is successfully recorded
        onConsentGiven();
      } catch (err) {
        console.error('Consent recording error:', err);
        setError(getErrorMessage(err));
        // Uncheck the checkbox if API call fails
        setIsChecked(false);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="pdpa-consent-container">
      <div className="pdpa-consent-card">
        <h2>Privacy Consent</h2>
        <p className="consent-intro">
          Before we proceed, we need your consent to collect and use your information.
        </p>

        <div className="consent-checkbox-wrapper">
          <label className="consent-label">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
              disabled={isSubmitting}
              className="consent-checkbox"
            />
            <span className="consent-text">
              I consent to my information being used properly and it will be properly disposed after the event
            </span>
          </label>
        </div>

        <ErrorMessage message={error} />

        {onBack && (
          <button 
            onClick={onBack}
            className="back-button"
            disabled={isSubmitting}
          >
            Back
          </button>
        )}

        {isSubmitting && (
          <div className="submitting-message">
            Recording consent...
          </div>
        )}
      </div>

      <style>{`
        .pdpa-consent-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
        }

        .pdpa-consent-card {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .pdpa-consent-card h2 {
          color: #333;
          font-size: 24px;
          margin-bottom: 16px;
          font-weight: 600;
          text-align: center;
        }

        .consent-intro {
          color: #666;
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 24px;
          text-align: center;
        }

        .consent-checkbox-wrapper {
          margin-bottom: 20px;
          padding: 20px;
          background: #f5f5f5;
          border-radius: 4px;
          border: 2px solid #e0e0e0;
          transition: border-color 0.2s;
        }

        .consent-checkbox-wrapper:has(.consent-checkbox:checked) {
          border-color: #4CAF50;
          background: #f1f8f4;
        }

        .consent-label {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          user-select: none;
        }

        .consent-checkbox {
          margin-top: 2px;
          width: 20px;
          height: 20px;
          cursor: pointer;
          flex-shrink: 0;
          accent-color: #4CAF50;
        }

        .consent-checkbox:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .consent-text {
          color: #333;
          font-size: 14px;
          line-height: 1.6;
          flex: 1;
        }

        .back-button {
          width: 100%;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          color: #666;
          background-color: #f5f5f5;
          border: 2px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s, border-color 0.2s, transform 0.1s;
          margin-top: 16px;
        }

        .back-button:hover:not(:disabled) {
          background-color: #e0e0e0;
          border-color: #ccc;
        }

        .back-button:active:not(:disabled) {
          transform: scale(0.98);
        }

        .back-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .submitting-message {
          text-align: center;
          color: #667eea;
          font-size: 14px;
          font-weight: 500;
          margin-top: 16px;
          padding: 12px;
          background: #f0f4ff;
          border-radius: 4px;
        }

        @media (max-width: 480px) {
          .pdpa-consent-container {
            padding: 15px;
          }

          .pdpa-consent-card {
            padding: 20px;
          }

          .pdpa-consent-card h2 {
            font-size: 20px;
          }

          .consent-intro {
            font-size: 14px;
          }

          .consent-text {
            font-size: 13px;
          }

          .consent-checkbox {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </div>
  );
}
