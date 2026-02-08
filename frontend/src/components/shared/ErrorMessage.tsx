interface ErrorMessageProps {
  message: string | null;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

export default function ErrorMessage({ 
  message, 
  onDismiss, 
  autoDismiss = false,
  autoDismissDelay = 5000 
}: ErrorMessageProps) {
  // Don't render if no message
  if (!message) {
    return null;
  }

  // Auto-dismiss functionality
  if (autoDismiss && onDismiss) {
    setTimeout(() => {
      onDismiss();
    }, autoDismissDelay);
  }

  return (
    <div className="error-message" role="alert" aria-live="assertive">
      <div className="error-content">
        <span className="error-icon">⚠</span>
        <span className="error-text">{message}</span>
      </div>
      {onDismiss && (
        <button 
          className="error-dismiss" 
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}

      <style>{`
        .error-message {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background-color: #ffebee;
          color: #c62828;
          border-radius: 4px;
          border-left: 4px solid #c62828;
          font-size: 14px;
          line-height: 1.5;
          box-shadow: 0 2px 4px rgba(198, 40, 40, 0.1);
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

        .error-content {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .error-icon {
          font-size: 18px;
          font-weight: bold;
          flex-shrink: 0;
        }

        .error-text {
          flex: 1;
          word-break: break-word;
        }

        .error-dismiss {
          background: none;
          border: none;
          color: #c62828;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
          padding: 0;
          margin-left: 12px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
          flex-shrink: 0;
        }

        .error-dismiss:hover {
          background-color: rgba(198, 40, 40, 0.1);
        }

        .error-dismiss:focus {
          outline: 2px solid #c62828;
          outline-offset: 2px;
        }

        @media (max-width: 480px) {
          .error-message {
            font-size: 13px;
            padding: 10px 12px;
          }

          .error-icon {
            font-size: 16px;
          }

          .error-dismiss {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </div>
  );
}
