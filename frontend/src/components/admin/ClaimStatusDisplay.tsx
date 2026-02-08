interface ClaimStatus {
  tshirtClaimed: boolean;
  mealClaimed: boolean;
}

interface ClaimStatusDisplayProps {
  claims: ClaimStatus;
}

export default function ClaimStatusDisplay({ claims }: ClaimStatusDisplayProps) {
  return (
    <div className="claim-status-display">
      <h3 className="status-title">Claim Status</h3>
      
      <div className="status-container">
        <div className={`status-item ${claims.tshirtClaimed ? 'claimed' : 'unclaimed'}`}>
          <div className="status-icon">
            {claims.tshirtClaimed ? (
              <svg className="checkmark" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className="circle" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            )}
          </div>
          <div className="status-content">
            <div className="status-label">T-Shirt</div>
            <div className="status-value">
              {claims.tshirtClaimed ? 'Claimed' : 'Available'}
            </div>
          </div>
        </div>

        <div className={`status-item ${claims.mealClaimed ? 'claimed' : 'unclaimed'}`}>
          <div className="status-icon">
            {claims.mealClaimed ? (
              <svg className="checkmark" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className="circle" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            )}
          </div>
          <div className="status-content">
            <div className="status-label">Meal Coupon</div>
            <div className="status-value">
              {claims.mealClaimed ? 'Claimed' : 'Available'}
            </div>
          </div>
        </div>
      </div>

      {claims.tshirtClaimed && claims.mealClaimed && (
        <div className="all-claimed-message">
          ✓ All items have been claimed
        </div>
      )}

      <style>{`
        .claim-status-display {
          margin-top: 20px;
          width: 100%;
        }

        .status-title {
          color: #333;
          font-size: 18px;
          margin-bottom: 16px;
          font-weight: 700;
          text-align: center;
        }

        .status-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .status-item {
          display: flex;
          align-items: center;
          padding: 16px;
          border-radius: 8px;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .status-item.unclaimed {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-color: #dee2e6;
        }

        .status-item.claimed {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          border-color: #28a745;
        }

        .status-icon {
          width: 40px;
          height: 40px;
          margin-right: 16px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-icon svg {
          width: 100%;
          height: 100%;
        }

        .status-item.unclaimed .status-icon {
          color: #6c757d;
        }

        .status-item.claimed .status-icon {
          color: #28a745;
        }

        .checkmark {
          animation: checkmark-appear 0.3s ease-out;
        }

        @keyframes checkmark-appear {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .status-content {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-label {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .status-value {
          font-size: 15px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 6px;
        }

        .status-item.unclaimed .status-value {
          color: #6c757d;
          background: rgba(108, 117, 125, 0.1);
        }

        .status-item.claimed .status-value {
          color: #28a745;
          background: rgba(40, 167, 69, 0.15);
        }

        .all-claimed-message {
          margin-top: 16px;
          padding: 14px;
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          border: 2px solid #28a745;
          border-radius: 8px;
          color: #155724;
          font-weight: 700;
          font-size: 15px;
          text-align: center;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .status-title {
            font-size: 17px;
            margin-bottom: 14px;
          }

          .status-item {
            padding: 14px;
          }

          .status-icon {
            width: 36px;
            height: 36px;
            margin-right: 14px;
          }

          .status-label {
            font-size: 15px;
          }

          .status-value {
            font-size: 14px;
            padding: 5px 10px;
          }

          .all-claimed-message {
            padding: 12px;
            font-size: 14px;
          }
        }

        /* Small mobile devices */
        @media (max-width: 480px) {
          .status-title {
            font-size: 16px;
            margin-bottom: 12px;
          }

          .status-item {
            padding: 12px;
          }

          .status-icon {
            width: 32px;
            height: 32px;
            margin-right: 12px;
          }

          .status-label {
            font-size: 14px;
          }

          .status-value {
            font-size: 13px;
            padding: 4px 8px;
          }

          .all-claimed-message {
            padding: 10px;
            font-size: 13px;
          }
        }

        /* Large touch targets for mobile */
        @media (hover: none) and (pointer: coarse) {
          .status-item {
            min-height: 60px;
          }
        }

        /* Hover effects for desktop */
        @media (hover: hover) {
          .status-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
        }
      `}</style>
    </div>
  );
}
