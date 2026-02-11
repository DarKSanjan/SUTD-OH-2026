import { useState, FormEvent } from 'react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Hardcoded password validation
    if (password === 'Linda47$') {
      // Success - grant access
      onLoginSuccess();
    } else {
      // Failure - show error
      setError('Incorrect password. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="login-container">
        <div className="login-header">
          <img src="/ROOT_logo_white-03.png" alt="ROOT Logo" className="login-logo" />
          <h1 className="login-title">Admin Access</h1>
          <p className="login-subtitle">Enter password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter admin password"
              disabled={isSubmitting}
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="error-message" role="alert">
              <span className="error-icon">⚠</span>
              <span className="error-text">{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting || !password}
          >
            {isSubmitting ? 'Checking...' : 'Login'}
          </button>
        </form>
      </div>

      <style>{`
        .admin-login {
          min-height: 100vh;
          background: #53001b;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .login-container {
          width: 100%;
          max-width: 400px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-logo {
          max-width: 150px;
          height: auto;
          margin: 0 auto 20px;
          filter: brightness(0) invert(1);
        }

        .login-title {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 600;
          color: white;
          letter-spacing: 0.3px;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          font-size: 16px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.95);
          color: #333;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: white;
          background: white;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-input::placeholder {
          color: #999;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background-color: #ffebee;
          color: #c62828;
          border-radius: 8px;
          border-left: 4px solid #c62828;
          font-size: 14px;
          line-height: 1.5;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .error-icon {
          font-size: 18px;
          font-weight: bold;
          flex-shrink: 0;
        }

        .error-text {
          flex: 1;
        }

        .submit-button {
          width: 100%;
          padding: 16px;
          background: white;
          color: #53001b;
          border: 2px solid white;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .submit-button:hover:not(:disabled) {
          background: #fff5f5;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .login-container {
            padding: 32px 24px;
          }

          .login-logo {
            max-width: 130px;
            margin-bottom: 16px;
          }

          .login-title {
            font-size: 24px;
          }

          .login-subtitle {
            font-size: 15px;
          }

          .form-input {
            padding: 12px 14px;
            font-size: 16px;
          }

          .submit-button {
            padding: 14px;
            font-size: 17px;
          }
        }

        /* Small mobile devices */
        @media (max-width: 480px) {
          .admin-login {
            padding: 16px;
          }

          .login-container {
            padding: 28px 20px;
          }

          .login-logo {
            max-width: 120px;
          }

          .login-title {
            font-size: 22px;
          }

          .login-subtitle {
            font-size: 14px;
          }

          .login-form {
            gap: 16px;
          }

          .error-message {
            font-size: 13px;
            padding: 10px 12px;
          }
        }

        /* Large touch targets for mobile */
        @media (hover: none) and (pointer: coarse) {
          .submit-button {
            min-height: 56px;
          }

          .form-input {
            min-height: 48px;
          }
        }
      `}</style>
    </div>
  );
}
