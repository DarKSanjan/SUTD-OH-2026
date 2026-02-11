/**
 * FilterPanel Component
 * 
 * Provides filter controls in a collapsible panel for the admin table view.
 * Displays active filter badges and provides a clear all button.
 * 
 * Features:
 * - Collapsible panel for filter controls
 * - Multi-select club filter
 * - Boolean filters for involvement (performance, booth)
 * - Boolean filters for collection status (shirt, meal)
 * - Active filter badges
 * - Clear all filters button
 * - Accessible labels and ARIA attributes
 * - Keyboard navigation support
 * 
 * Requirements: 3.1, 3.8, 8.1
 */

import { useState } from 'react';
import { FilterCriteria } from '../../utils/types';

export interface FilterPanelProps {
  /** Current filter criteria */
  filters: FilterCriteria;
  /** Callback when a filter changes */
  onFilterChange: <K extends keyof FilterCriteria>(
    key: K,
    value: FilterCriteria[K]
  ) => void;
  /** Callback when clear all filters is clicked */
  onClearFilters: () => void;
  /** List of available clubs for the club filter */
  availableClubs: string[];
  /** Number of active filters */
  activeFilterCount: number;
  /** Optional CSS class name */
  className?: string;
}

/**
 * FilterPanel - Collapsible panel with filter controls and active filter badges
 * 
 * @example
 * ```tsx
 * <FilterPanel
 *   filters={filters}
 *   onFilterChange={setFilter}
 *   onClearFilters={clearFilters}
 *   availableClubs={['Chess Club', 'Drama Club']}
 *   activeFilterCount={activeFilterCount}
 * />
 * ```
 */
export default function FilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
  availableClubs,
  activeFilterCount,
  className = '',
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpanded();
    }
  };

  const handleClubChange = (club: string) => {
    const newClubs = filters.clubs.includes(club)
      ? filters.clubs.filter(c => c !== club)
      : [...filters.clubs, club];
    onFilterChange('clubs', newClubs);
  };

  const handleBooleanFilterChange = (
    key: 'hasPerformance' | 'hasBooth' | 'shirtCollected' | 'mealCollected',
    value: boolean | null
  ) => {
    onFilterChange(key, value);
  };

  // Generate active filter badges
  const getActiveFilterBadges = () => {
    const badges: Array<{ label: string; onRemove: () => void }> = [];

    // Club filters
    filters.clubs.forEach(club => {
      badges.push({
        label: `Club: ${club}`,
        onRemove: () => handleClubChange(club),
      });
    });

    // Performance filter
    if (filters.hasPerformance !== null) {
      badges.push({
        label: `Performance: ${filters.hasPerformance ? 'Yes' : 'No'}`,
        onRemove: () => onFilterChange('hasPerformance', null),
      });
    }

    // Booth filter
    if (filters.hasBooth !== null) {
      badges.push({
        label: `Booth: ${filters.hasBooth ? 'Yes' : 'No'}`,
        onRemove: () => onFilterChange('hasBooth', null),
      });
    }

    // Shirt collected filter
    if (filters.shirtCollected !== null) {
      badges.push({
        label: `Shirt: ${filters.shirtCollected ? 'Collected' : 'Not Collected'}`,
        onRemove: () => onFilterChange('shirtCollected', null),
      });
    }

    // Meal collected filter
    if (filters.mealCollected !== null) {
      badges.push({
        label: `Meal: ${filters.mealCollected ? 'Collected' : 'Not Collected'}`,
        onRemove: () => onFilterChange('mealCollected', null),
      });
    }

    return badges;
  };

  const activeBadges = getActiveFilterBadges();

  return (
    <div className={`filter-panel ${className}`}>
      <div className="filter-header">
        <button
          type="button"
          className="filter-toggle"
          onClick={toggleExpanded}
          onKeyDown={handleKeyDown}
          aria-expanded={isExpanded}
          aria-controls="filter-controls"
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} filters`}
        >
          <span className="filter-icon" aria-hidden="true">
            {isExpanded ? '▼' : '▶'}
          </span>
          <span className="filter-title">
            Filters
            {activeFilterCount > 0 && (
              <span className="filter-count" aria-label={`${activeFilterCount} active filters`}>
                ({activeFilterCount})
              </span>
            )}
          </span>
        </button>

        {activeFilterCount > 0 && (
          <button
            type="button"
            className="clear-all-button"
            onClick={onClearFilters}
            aria-label="Clear all filters"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active filter badges */}
      {activeBadges.length > 0 && (
        <div className="filter-badges" role="region" aria-label="Active filters">
          {activeBadges.map((badge, index) => (
            <span key={index} className="filter-badge">
              <span className="badge-label">{badge.label}</span>
              <button
                type="button"
                className="badge-remove"
                onClick={badge.onRemove}
                aria-label={`Remove ${badge.label} filter`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Filter controls */}
      {isExpanded && (
        <div id="filter-controls" className="filter-controls">
          {/* Club filter */}
          <div className="filter-group">
            <label className="filter-label">Club</label>
            <div className="filter-options">
              {availableClubs.length > 0 ? (
                availableClubs.map(club => (
                  <label key={club} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.clubs.includes(club)}
                      onChange={() => handleClubChange(club)}
                      aria-label={`Filter by ${club}`}
                    />
                    <span>{club}</span>
                  </label>
                ))
              ) : (
                <span className="no-options">No clubs available</span>
              )}
            </div>
          </div>

          {/* Performance filter */}
          <div className="filter-group">
            <label className="filter-label">Performance</label>
            <div className="filter-options">
              <label className="radio-label">
                <input
                  type="radio"
                  name="performance"
                  checked={filters.hasPerformance === null}
                  onChange={() => handleBooleanFilterChange('hasPerformance', null)}
                  aria-label="Performance: All"
                />
                <span>All</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="performance"
                  checked={filters.hasPerformance === true}
                  onChange={() => handleBooleanFilterChange('hasPerformance', true)}
                  aria-label="Performance: Yes"
                />
                <span>Yes</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="performance"
                  checked={filters.hasPerformance === false}
                  onChange={() => handleBooleanFilterChange('hasPerformance', false)}
                  aria-label="Performance: No"
                />
                <span>No</span>
              </label>
            </div>
          </div>

          {/* Booth filter */}
          <div className="filter-group">
            <label className="filter-label">Booth</label>
            <div className="filter-options">
              <label className="radio-label">
                <input
                  type="radio"
                  name="booth"
                  checked={filters.hasBooth === null}
                  onChange={() => handleBooleanFilterChange('hasBooth', null)}
                  aria-label="Booth: All"
                />
                <span>All</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="booth"
                  checked={filters.hasBooth === true}
                  onChange={() => handleBooleanFilterChange('hasBooth', true)}
                  aria-label="Booth: Yes"
                />
                <span>Yes</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="booth"
                  checked={filters.hasBooth === false}
                  onChange={() => handleBooleanFilterChange('hasBooth', false)}
                  aria-label="Booth: No"
                />
                <span>No</span>
              </label>
            </div>
          </div>

          {/* Shirt collection filter */}
          <div className="filter-group">
            <label className="filter-label">Shirt Collection</label>
            <div className="filter-options">
              <label className="radio-label">
                <input
                  type="radio"
                  name="shirt"
                  checked={filters.shirtCollected === null}
                  onChange={() => handleBooleanFilterChange('shirtCollected', null)}
                  aria-label="Shirt: All"
                />
                <span>All</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="shirt"
                  checked={filters.shirtCollected === true}
                  onChange={() => handleBooleanFilterChange('shirtCollected', true)}
                  aria-label="Shirt: Collected"
                />
                <span>Collected</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="shirt"
                  checked={filters.shirtCollected === false}
                  onChange={() => handleBooleanFilterChange('shirtCollected', false)}
                  aria-label="Shirt: Not Collected"
                />
                <span>Not Collected</span>
              </label>
            </div>
          </div>

          {/* Meal collection filter */}
          <div className="filter-group">
            <label className="filter-label">Meal Collection</label>
            <div className="filter-options">
              <label className="radio-label">
                <input
                  type="radio"
                  name="meal"
                  checked={filters.mealCollected === null}
                  onChange={() => handleBooleanFilterChange('mealCollected', null)}
                  aria-label="Meal: All"
                />
                <span>All</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="meal"
                  checked={filters.mealCollected === true}
                  onChange={() => handleBooleanFilterChange('mealCollected', true)}
                  aria-label="Meal: Collected"
                />
                <span>Collected</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="meal"
                  checked={filters.mealCollected === false}
                  onChange={() => handleBooleanFilterChange('mealCollected', false)}
                  aria-label="Meal: Not Collected"
                />
                <span>Not Collected</span>
              </label>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .filter-panel {
          width: 100%;
          background: white;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          padding: 16px;
        }

        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          color: #495057;
          transition: all 0.2s ease;
          border-radius: 6px;
        }

        .filter-toggle:hover {
          background: #f8f9fa;
        }

        .filter-toggle:focus {
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }

        .filter-icon {
          font-size: 12px;
          transition: transform 0.2s ease;
        }

        .filter-title {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .filter-count {
          color: #667eea;
          font-weight: 600;
        }

        .clear-all-button {
          padding: 6px 12px;
          font-size: 14px;
          font-weight: 500;
          color: #dc3545;
          background: white;
          border: 1px solid #dc3545;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-all-button:hover {
          background: #dc3545;
          color: white;
        }

        .clear-all-button:focus {
          outline: 2px solid #dc3545;
          outline-offset: 2px;
        }

        .clear-all-button:active {
          transform: scale(0.98);
        }

        .filter-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e9ecef;
        }

        .filter-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px 4px 12px;
          background: #e7f3ff;
          border: 1px solid #667eea;
          border-radius: 16px;
          font-size: 13px;
          color: #495057;
        }

        .badge-label {
          font-weight: 500;
        }

        .badge-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          padding: 0;
          background: transparent;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 12px;
          color: #667eea;
          transition: all 0.2s ease;
        }

        .badge-remove:hover {
          background: #667eea;
          color: white;
        }

        .badge-remove:focus {
          outline: 2px solid #667eea;
          outline-offset: 1px;
        }

        .filter-controls {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e9ecef;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .filter-label {
          font-size: 14px;
          font-weight: 600;
          color: #495057;
        }

        .filter-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .checkbox-label,
        .radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.2s ease;
          font-size: 14px;
          color: #495057;
        }

        .checkbox-label:hover,
        .radio-label:hover {
          background: #f8f9fa;
        }

        .checkbox-label input,
        .radio-label input {
          cursor: pointer;
          width: 16px;
          height: 16px;
        }

        .checkbox-label input:focus,
        .radio-label input:focus {
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }

        .no-options {
          font-size: 13px;
          color: #6c757d;
          font-style: italic;
          padding: 8px;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .filter-panel {
            padding: 12px;
          }

          .filter-header {
            flex-direction: column;
            align-items: stretch;
          }

          .clear-all-button {
            width: 100%;
          }

          .filter-badges {
            gap: 6px;
          }

          .filter-badge {
            font-size: 12px;
          }
        }

        /* Ensure minimum touch target size for mobile */
        @media (hover: none) and (pointer: coarse) {
          .filter-toggle,
          .clear-all-button,
          .badge-remove {
            min-height: 44px;
          }

          .checkbox-label,
          .radio-label {
            min-height: 44px;
            padding: 10px 8px;
          }
        }
      `}</style>
    </div>
  );
}
