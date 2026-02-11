/**
 * SearchBar Component
 * 
 * Provides a search input field with icon, result count display, and clear button.
 * Designed for filtering student records by ID or name in the admin table view.
 * 
 * Features:
 * - Search input with icon
 * - Result count display when search is active
 * - Clear button when query exists
 * - Accessible labels and ARIA attributes
 * - Keyboard navigation support
 * 
 * Requirements: 2.1, 2.6
 */

export interface SearchBarProps {
  /** Current search query value */
  value: string;
  /** Callback when search value changes */
  onChange: (value: string) => void;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Number of results matching the search query (optional) */
  resultCount?: number;
  /** Optional CSS class name */
  className?: string;
}

/**
 * SearchBar - Search input component with result count and clear functionality
 * 
 * @example
 * ```tsx
 * <SearchBar
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   placeholder="Search by ID or name"
 *   resultCount={filteredStudents.length}
 * />
 * ```
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  resultCount,
  className = '',
}: SearchBarProps) {
  const hasQuery = value.trim().length > 0;
  const showResultCount = hasQuery && resultCount !== undefined;

  const handleClear = () => {
    onChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClear();
    }
  };

  return (
    <div className={`search-bar ${className}`}>
      <div className="search-input-wrapper">
        <span className="search-icon" aria-hidden="true">
          🔍
        </span>
        <input
          type="text"
          role="searchbox"
          className="search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search students by ID or name"
          aria-describedby={showResultCount ? 'search-results-count' : undefined}
        />
        {hasQuery && (
          <button
            type="button"
            className="clear-button"
            onClick={handleClear}
            onKeyDown={handleKeyDown}
            aria-label="Clear search"
            tabIndex={0}
          >
            ✕
          </button>
        )}
      </div>
      {showResultCount && (
        <div
          id="search-results-count"
          className="result-count"
          role="status"
          aria-live="polite"
        >
          {resultCount} {resultCount === 1 ? 'result' : 'results'} found
        </div>
      )}

      <style>{`
        .search-bar {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          max-width: 500px;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          font-size: 16px;
          color: #6c757d;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 10px 40px 10px 40px;
          font-size: 14px;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          outline: none;
          transition: all 0.2s ease;
          background: white;
        }

        .search-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-input::placeholder {
          color: #adb5bd;
        }

        .clear-button {
          position: absolute;
          right: 8px;
          width: 24px;
          height: 24px;
          padding: 0;
          border: none;
          background: #e9ecef;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #6c757d;
          transition: all 0.2s ease;
        }

        .clear-button:hover {
          background: #dee2e6;
          color: #495057;
        }

        .clear-button:focus {
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }

        .clear-button:active {
          transform: scale(0.95);
        }

        .result-count {
          font-size: 13px;
          color: #6c757d;
          padding-left: 4px;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .search-bar {
            max-width: 100%;
          }

          .search-input {
            font-size: 16px; /* Prevent zoom on iOS */
          }
        }

        /* Ensure minimum touch target size for mobile */
        @media (hover: none) and (pointer: coarse) {
          .clear-button {
            width: 32px;
            height: 32px;
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}
