import { useState } from 'react';
import ErrorMessage from './ErrorMessage';

/**
 * Example usage of the ErrorMessage component
 * This file demonstrates various use cases and patterns
 */

export function BasicErrorExample() {
  const [error, setError] = useState<string | null>('This is a basic error message');

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h3>Basic Error Message</h3>
      <ErrorMessage message={error} />
    </div>
  );
}

export function DismissibleErrorExample() {
  const [error, setError] = useState<string | null>('Click the × button to dismiss this error');

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h3>Dismissible Error Message</h3>
      <ErrorMessage 
        message={error} 
        onDismiss={() => setError(null)} 
      />
      <button 
        onClick={() => setError('Click the × button to dismiss this error')}
        style={{ marginTop: '10px' }}
      >
        Show Error Again
      </button>
    </div>
  );
}

export function AutoDismissErrorExample() {
  const [error, setError] = useState<string | null>(null);

  const showError = () => {
    setError('This error will auto-dismiss in 3 seconds');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h3>Auto-Dismiss Error Message</h3>
      <ErrorMessage 
        message={error} 
        onDismiss={() => setError(null)}
        autoDismiss={true}
        autoDismissDelay={3000}
      />
      <button onClick={showError}>
        Show Auto-Dismiss Error
      </button>
    </div>
  );
}

export function FormValidationExample() {
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId.trim()) {
      setError('Student ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setError('Student ID not found in database');
    }, 1000);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h3>Form Validation Example</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="studentId">Student ID:</label>
          <input
            id="studentId"
            type="text"
            value={studentId}
            onChange={(e) => {
              setStudentId(e.target.value);
              setError(null); // Clear error on input change
            }}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <ErrorMessage 
          message={error} 
          onDismiss={() => setError(null)} 
        />
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            marginTop: '10px',
            padding: '10px 20px',
            fontSize: '14px'
          }}
        >
          {isLoading ? 'Validating...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

export function MultipleErrorsExample() {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h3>Multiple Error States</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <h4>Validation Error:</h4>
        <ErrorMessage 
          message={validationError} 
          onDismiss={() => setValidationError(null)} 
        />
        <button 
          onClick={() => setValidationError('Please enter a valid email address')}
          style={{ marginTop: '5px' }}
        >
          Show Validation Error
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4>Server Error (Auto-dismiss):</h4>
        <ErrorMessage 
          message={serverError} 
          onDismiss={() => setServerError(null)}
          autoDismiss={true}
          autoDismissDelay={4000}
        />
        <button 
          onClick={() => setServerError('Failed to connect to server. Please try again.')}
          style={{ marginTop: '5px' }}
        >
          Show Server Error
        </button>
      </div>
    </div>
  );
}

export function LongErrorMessageExample() {
  const longError = 'This is a very long error message that demonstrates how the ErrorMessage component handles lengthy text. It should wrap properly and remain readable even with a lot of content. The component uses word-break to ensure long words don\'t overflow the container.';
  
  const [error, setError] = useState<string | null>(longError);

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h3>Long Error Message</h3>
      <ErrorMessage 
        message={error} 
        onDismiss={() => setError(null)} 
      />
      <button 
        onClick={() => setError(longError)}
        style={{ marginTop: '10px' }}
      >
        Show Long Error Again
      </button>
    </div>
  );
}

// Demo component that shows all examples
export default function ErrorMessageExamples() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#f5f5f5' }}>
      <h1>ErrorMessage Component Examples</h1>
      <p style={{ marginBottom: '30px', color: '#666' }}>
        Various examples demonstrating the ErrorMessage component usage
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <BasicErrorExample />
        <DismissibleErrorExample />
        <AutoDismissErrorExample />
        <FormValidationExample />
        <MultipleErrorsExample />
        <LongErrorMessageExample />
      </div>
    </div>
  );
}
