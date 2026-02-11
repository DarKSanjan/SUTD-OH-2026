import { SortableColumn, SortDirection } from '../../utils/types';

/**
 * Props for TableHeader component
 */
export interface TableHeaderProps {
  sortColumn: SortableColumn | null;
  sortDirection: SortDirection;
  onSort: (column: SortableColumn) => void;
}

/**
 * TableHeader component with sortable column headers
 * 
 * Renders table column headers with sort buttons that support:
 * - Click to sort ascending/descending
 * - Visual sort indicators (arrow icons)
 * - Keyboard navigation (Enter, Space)
 * - Accessible ARIA attributes
 * 
 * @param sortColumn - Currently sorted column (null if no sort active)
 * @param sortDirection - Current sort direction ('asc', 'desc', or null)
 * @param onSort - Callback function when a column header is clicked
 * 
 * @example
 * ```tsx
 * <TableHeader
 *   sortColumn={sortColumn}
 *   sortDirection={sortDirection}
 *   onSort={handleSort}
 * />
 * ```
 */
export default function TableHeader({ sortColumn, sortDirection, onSort }: TableHeaderProps) {
  /**
   * Handle keyboard navigation for sort buttons
   * Triggers sort on Enter or Space key press
   */
  const handleKeyDown = (e: React.KeyboardEvent, column: SortableColumn) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSort(column);
    }
  };

  /**
   * Get ARIA sort attribute value for a column
   */
  const getAriaSort = (column: SortableColumn): 'ascending' | 'descending' | 'none' => {
    if (sortColumn !== column) return 'none';
    if (sortDirection === 'asc') return 'ascending';
    if (sortDirection === 'desc') return 'descending';
    return 'none';
  };

  /**
   * Get sort indicator icon for a column
   */
  const getSortIndicator = (column: SortableColumn): string => {
    if (sortColumn !== column) return '';
    if (sortDirection === 'asc') return '↑';
    if (sortDirection === 'desc') return '↓';
    return '';
  };

  /**
   * Render a sortable column header
   */
  const renderSortableHeader = (column: SortableColumn, label: string) => {
    const isActive = sortColumn === column;
    const indicator = getSortIndicator(column);
    const ariaLabel = `Sort by ${label}${isActive ? ` ${sortDirection === 'asc' ? 'ascending' : 'descending'}` : ''}`;

    return (
      <th aria-sort={getAriaSort(column)}>
        <button
          className={`sort-button ${isActive ? 'active' : ''}`}
          onClick={() => onSort(column)}
          onKeyDown={(e) => handleKeyDown(e, column)}
          aria-label={ariaLabel}
          tabIndex={0}
        >
          <span className="sort-label">{label}</span>
          {indicator && (
            <span className="sort-indicator" aria-hidden="true">
              {indicator}
            </span>
          )}
        </button>
      </th>
    );
  };

  return (
    <thead>
      <tr>
        {renderSortableHeader('studentId', 'Student ID')}
        {renderSortableHeader('name', 'Name')}
        <th>Clubs</th>
        <th>Involvement</th>
        {renderSortableHeader('tshirtSize', 'T-shirt Size')}
        {renderSortableHeader('mealPreference', 'Meal Preference')}
        {renderSortableHeader('shirtCollected', 'Shirt Collected')}
        {renderSortableHeader('mealCollected', 'Meal Collected')}
        <th>Consent</th>
      </tr>
      <style>{styles}</style>
    </thead>
  );
}

const styles = `
  thead {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  thead th {
    padding: 0;
    text-align: left;
    font-weight: 700;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .sort-button {
    width: 100%;
    padding: 16px;
    background: transparent;
    border: none;
    color: white;
    font-weight: 700;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    transition: background-color 0.2s ease;
    text-align: left;
  }

  .sort-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .sort-button:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: -2px;
  }

  .sort-button:active {
    background-color: rgba(255, 255, 255, 0.15);
  }

  .sort-button.active {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .sort-label {
    flex: 1;
  }

  .sort-indicator {
    font-size: 16px;
    font-weight: 700;
    margin-left: 4px;
    display: inline-block;
    min-width: 12px;
  }

  /* Non-sortable header (Consent) */
  thead th:not(:has(.sort-button)) {
    padding: 16px;
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .sort-button {
      transition: none;
    }
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .sort-button {
      padding: 12px;
      font-size: 13px;
    }

    thead th:not(:has(.sort-button)) {
      padding: 12px;
    }

    .sort-indicator {
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    .sort-button {
      padding: 10px 8px;
      font-size: 12px;
    }

    thead th:not(:has(.sort-button)) {
      padding: 10px 8px;
    }

    .sort-indicator {
      font-size: 12px;
    }
  }
`;
