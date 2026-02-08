import { useState } from 'react';
import ErrorMessage from '../shared/ErrorMessage';
import { apiPost, getErrorMessage } from '../../services/api';

interface ClaimStatus {
  tshirtClaimed: boolean;
  mealClaimed: boolean;
}

interface ClaimCheckboxesProps {
  token: string;
  claims: ClaimStatus;
  onClaimUpdate: (updatedClaims: ClaimStatus) => void;
}

interface ClaimResponse {
  success: boolean;
  claims?: ClaimStatus;
  error?: string;
}

export default function ClaimCheckboxes({ token, claims, onClaimUpdate }: ClaimCheckboxesProps) {
  const [isLoading, setIsLoading] = useState<{ tshirt: boolean; meal: boolean }>({
    tshirt: false,
    meal: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleClaimChange = async (itemType: 'tshirt' | 'meal', currentlyChecked: boolean) => {
    // Don't allow unchecking (claims are permanent)
    if (currentlyChecked) {
      return;
    }

    // Clear previous messages
    setError(null);
    setSuccessMessage(null);

    // Set loading state for this specific item
    setIsLoading(prev => ({ ...prev, [itemType]: true }));

    try {
      const data = await apiPost<ClaimResponse>('/api/claim', { token, itemType });

      if (data.success && data.claims) {
        // Update parent component with new claim status
        onClaimUpdate(data.claims);
        
        // Show success message
        const itemName = itemType === 'tshirt' ? 'T-Shirt' : 'Meal Coupon';
        setSuccessMessage(`✓ ${itemName} claimed successfully!`);
        
        // Auto-dismiss success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (err: any) {
      console.error('Error recording claim:', err);
      
      // Handle different error cases
      if (err.status === 409) {
        setError('This item has already been claimed.');
      } else if (err.status === 404) {
        setError('Invalid QR code. Please scan again.');
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      // Clear loading state
      setIsLoading(prev => ({ ...prev, [itemType]: false }));
    }
  };

  return (
    <div className="claim-checkboxes">
      <h3 className="checkboxes-title">Mark Items as Distributed</h3>

      {error && (
        <div className="message-container">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {successMessage && (
        <div className="message-container">
          <div className="success-message" role="status" aria-live="polite">
            {successMessage}
          </div>
        </div>
      )}

      <div className="checkboxes-container">
        <label 
          className={`checkbox-item ${claims.tshirtClaimed ? 'claimed' : ''} ${isLoading.tshirt ? 'loading' : ''}`}
          htmlFor="tshirt-checkbox"
        >
          <input
            type="checkbox"
            id="tshirt-checkbox"
            checked={claims.tshirtClaimed}
            disabled={claims.tshirtClaimed || isLoading.tshirt}
            onChange={() => handleClaimChange('tshirt', claims.tshirtClaimed)}
            className="checkbox-input"
          />
          <span className="checkbox-custom"></span>
          <span className="checkbox-label">
            T-Shirt
            {isLoading.tshirt && <span className="loading-spinner"></span>}
          </span>
        </label>

        <label 
          className={`checkbox-item ${claims.mealClaimed ? 'claimed' : ''} ${isLoading.meal ? 'loading' : ''}`}
          htmlFor="meal-checkbox"
        >
          <input
            type="checkbox"
            id="meal-checkbox"
            checked={claims.mealClaimed}
            disabled={claims.mealClaimed || isLoading.meal}
            onChange={() => handleClaimChange('meal', claims.mealClaimed)}
            className="checkbox-input"
          />
          <span className="checkbox-custom"></span>
          <span className="checkbox-label">
            Meal Coupon
            {isLoading.meal && <span className="loading-spinner"></span>}
          </span>
        </label>
      </div>

      <style>{`
        .claim-checkboxes {
          margin-top: 20px;
          width: 100%;
        }

        .checkboxes-title {
          color: #333;
          font-size: 18px;
          margin-bottom: 16px;
          font-weight: 700;
          text-align: center;
        }

        .message-container {
          margin-bottom: 16px;
        }

        .success-message {
          padding: 12px 16px;
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          border: 2px solid #28a745;
          border-radius: 8px;
          color: #155724;
          font-weight: 700;
          font-size: 15px;
          text-align: center;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .checkboxes-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          padding: 16px;
          background: white;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 60px;
          position: relative;
        }

        .checkbox-item:not(.claimed):not(.loading):hover {
          border-color: #667eea;
          background: #f8f9ff;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.15);
        }

        .checkbox-item.claimed {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          border-color: #28a745;
          cursor: not-allowed;
        }

        .checkbox-item.loading {
          cursor: wait;
          opacity: 0.7;
        }

        .checkbox-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .checkbox-custom {
          width: 28px;
          height: 28px;
          border: 2px solid #6c757d;
          border-radius: 6px;
          margin-right: 14px;
          flex-shrink: 0;
          position: relative;
          transition: all 0.2s ease;
          background: white;
        }

        .checkbox-item:not(.claimed):not(.loading):hover .checkbox-custom {
          border-color: #667eea;
        }

        .checkbox-input:checked + .checkbox-custom {
          background: #28a745;
          border-color: #28a745;
        }

        .checkbox-input:checked + .checkbox-custom::after {
          content: '';
          position: absolute;
          left: 8px;
          top: 4px;
          width: 6px;
          height: 12px;
          border: solid white;
          border-width: 0 3px 3px 0;
          transform: rotate(45deg);
          animation: checkmark-appear 0.3s ease-out;
        }

        @keyframes checkmark-appear {
          0% {
            transform: rotate(45deg) scale(0);
            opacity: 0;
          }
          50% {
            transform: rotate(45deg) scale(1.2);
          }
          100% {
            transform: rotate(45deg) scale(1);
            opacity: 1;
          }
        }

        .checkbox-input:disabled + .checkbox-custom {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .checkbox-label {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .checkbox-item.claimed .checkbox-label {
          color: #155724;
        }

        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .checkboxes-title {
            font-size: 17px;
            margin-bottom: 14px;
          }

          .checkbox-item {
            padding: 14px;
            min-height: 56px;
          }

          .checkbox-custom {
            width: 26px;
            height: 26px;
            margin-right: 12px;
          }

          .checkbox-input:checked + .checkbox-custom::after {
            left: 7px;
            top: 3px;
            width: 5px;
            height: 11px;
          }

          .checkbox-label {
            font-size: 15px;
          }

          .success-message {
            padding: 10px 14px;
            font-size: 14px;
          }
        }

        /* Small mobile devices */
        @media (max-width: 480px) {
          .checkboxes-title {
            font-size: 16px;
            margin-bottom: 12px;
          }

          .checkbox-item {
            padding: 12px;
            min-height: 52px;
          }

          .checkbox-custom {
            width: 24px;
            height: 24px;
            margin-right: 10px;
          }

          .checkbox-input:checked + .checkbox-custom::after {
            left: 6px;
            top: 2px;
            width: 5px;
            height: 10px;
            border-width: 0 2px 2px 0;
          }

          .checkbox-label {
            font-size: 14px;
          }

          .loading-spinner {
            width: 14px;
            height: 14px;
          }

          .success-message {
            padding: 10px 12px;
            font-size: 13px;
          }
        }

        /* Large touch targets for mobile (44x44 minimum) */
        @media (hover: none) and (pointer: coarse) {
          .checkbox-item {
            min-height: 60px;
          }

          .checkbox-custom {
            width: 28px;
            height: 28px;
          }
        }

        /* Hover effects for desktop only */
        @media (hover: hover) {
          .checkbox-item:not(.claimed):not(.loading):active {
            transform: translateY(0);
          }
        }

        /* Focus styles for accessibility */
        .checkbox-input:focus + .checkbox-custom {
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
