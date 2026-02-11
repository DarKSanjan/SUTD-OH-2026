import { useState } from 'react';

/**
 * Props for the InteractiveCheckbox component
 */
export interface InteractiveCheckboxProps {
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Async callback when checkbox state changes */
  onChange: (checked: boolean) => Promise<void>;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Accessible label for the checkbox */
  label: string;
  /** Optional CSS class name */
  className?: string;
}

/**
 * InteractiveCheckbox - A checkbox component with loading state for async operations
 * 
 * This component provides:
 * - Visual loading indicator during async operations
 * - Accessible labels and ARIA attributes
 * - Disabled state during updates
 * - Keyboard navigation support
 * 
 * @example
 * ```tsx
 * <InteractiveCheckbox
 *   checked={student.shirtCollected}
 *   onChange={async (checked) => {
 *     await updateClaimStatus(student.id, 'tshirt', checked);
 *   }}
 *   label={`Shirt collected for ${student.id}`}
 * />
 * ```
 */
export default function InteractiveCheckbox({
  checked,
  onChange,
  disabled = false,
  label,
  className = '',
}: InteractiveCheckboxProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent handling if already disabled or loading
    if (disabled || isLoading) {
      return;
    }

    const newValue = e.target.checked;
    
    setIsLoading(true);
    try {
      await onChange(newValue);
    } catch (error) {
      // Silently catch errors - parent component should handle error display
      console.error('InteractiveCheckbox onChange error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = disabled || isLoading;

  return (
    <label className={`interactive-checkbox ${className} ${isLoading ? 'loading' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={isDisabled}
        aria-label={label}
        aria-busy={isLoading}
        className="checkbox-input"
      />
      <span className="checkbox-visual">
        {isLoading && <span className="loading-spinner" aria-hidden="true" />}
      </span>
      <span className="sr-only">{label}</span>

      <style>{`
        .interactive-checkbox {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
        }

        .interactive-checkbox.loading {
          cursor: wait;
        }

        .checkbox-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .checkbox-visual {
          width: 20px;
          height: 20px;
          border: 2px solid #6c757d;
          border-radius: 4px;
          position: relative;
          transition: all 0.2s ease;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .interactive-checkbox:hover:not(.loading) .checkbox-visual {
          border-color: #667eea;
        }

        .checkbox-input:checked + .checkbox-visual {
          background: #28a745;
          border-color: #28a745;
        }

        .checkbox-input:checked + .checkbox-visual::after {
          content: '';
          position: absolute;
          left: 5px;
          top: 1px;
          width: 4px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .checkbox-input:disabled + .checkbox-visual {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .checkbox-input:focus + .checkbox-visual {
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }

        .loading-spinner {
          position: absolute;
          width: 14px;
          height: 14px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        /* Ensure minimum touch target size for mobile */
        @media (hover: none) and (pointer: coarse) {
          .interactive-checkbox {
            min-width: 44px;
            min-height: 44px;
          }
        }
      `}</style>
    </label>
  );
}
