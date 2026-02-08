import { useState, FormEvent } from 'react';
import ErrorMessage from '../shared/ErrorMessage';

interface StudentIDFormProps {
  onSubmit: (studentId: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export default function StudentIDForm({ onSubmit, isLoading = false, error = null }: StudentIDFormProps) {
  const [studentId, setStudentId] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Client-side validation: non-empty, trimmed
    const trimmedId = studentId.trim();
    
    if (!trimmedId) {
      setValidationError('Student ID is required');
      return;
    }
    
    // Clear validation error
    setValidationError(null);
    
    // Call the parent's onSubmit handler
    await onSubmit(trimmedId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentId(e.target.value);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  return (
    <div className="student-id-form-container">
      <form onSubmit={handleSubmit} className="student-id-form">
        <div className="form-group">
          <label htmlFor="studentId">Student ID</label>
          <input
            type="text"
            id="studentId"
            name="studentId"
            value={studentId}
            onChange={handleInputChange}
            disabled={isLoading}
            placeholder="Enter your student ID"
            className="student-id-input"
            autoComplete="off"
            autoFocus
          />
        </div>
        
        <ErrorMessage message={validationError || error} />
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="submit-button"
        >
          {isLoading ? 'Validating...' : 'Submit'}
        </button>
      </form>
      
      <style>{`
        .student-id-form-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 30px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .student-id-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .form-group label {
          font-weight: 600;
          font-size: 14px;
          color: #333;
        }
        
        .student-id-input {
          padding: 12px;
          font-size: 16px;
          border: 2px solid #ddd;
          border-radius: 4px;
          transition: border-color 0.2s;
        }
        
        .student-id-input:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .student-id-input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }
        
        .submit-button {
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          background-color: #667eea;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s, transform 0.1s;
        }
        
        .submit-button:hover:not(:disabled) {
          background-color: #5568d3;
        }

        .submit-button:active:not(:disabled) {
          transform: scale(0.98);
        }
        
        .submit-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
