import { useMemo, useState, useEffect } from 'react';
import ErrorMessage from '../shared/ErrorMessage';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import { useTableData } from '../../hooks/useTableData';
import { useSearch } from '../../hooks/useSearch';
import { useFilter } from '../../hooks/useFilter';
import { useSort } from '../../hooks/useSort';
import { useOptimisticUpdate } from '../../hooks/useOptimisticUpdate';
import { useVirtualization } from '../../hooks/useVirtualization';
import { applySearch, applyFilters, applySort } from '../../utils/tableUtils';
import { StudentRecord } from '../../utils/types';

interface DatabaseTableViewProps {
  // No props - fetches data internally
}

/**
 * DatabaseTableView - Enhanced admin table with search, filter, sort, and interactive features
 * 
 * This component integrates:
 * - Data fetching with useTableData hook
 * - Search functionality with useSearch hook
 * - Filter management with useFilter hook
 * - Column sorting with useSort hook
 * - Optimistic updates with useOptimisticUpdate hook
 * - Virtual scrolling with useVirtualization hook (for datasets > 100)
 * - Sub-components: SearchBar, FilterPanel, TableHeader, TableRow
 * 
 * Requirements: 1.1-1.6, 2.1-2.6, 3.1-3.9, 4.1-4.7, 5.1-5.6, 6.1-6.6
 */
export default function DatabaseTableView({}: DatabaseTableViewProps) {
  // Data fetching
  const { students, isLoading, error, refetch } = useTableData();
  
  // Local state for students (needed for optimistic updates)
  const [localStudents, setLocalStudents] = useState<StudentRecord[]>([]);
  
  // Update local students when fetched data changes
  useEffect(() => {
    setLocalStudents(students);
  }, [students]);
  
  // Search functionality
  const { searchQuery, setSearchQuery, debouncedQuery } = useSearch(300);
  
  // Filter functionality
  const { filters, setFilter, clearFilters, activeFilterCount } = useFilter();
  
  // Sort functionality
  const { sortColumn, sortDirection, handleSort } = useSort();
  
  // Optimistic updates for checkboxes
  const { updateClaimStatus, pendingUpdates, error: updateError, clearError } = useOptimisticUpdate(
    localStudents,
    setLocalStudents
  );
  
  // Data processing pipeline: search → filter → sort
  // Performance monitoring: track operation duration
  const processedStudents = useMemo(() => {
    const startTime = performance.now();
    
    let result = localStudents;
    
    // Apply search
    result = applySearch(result, debouncedQuery);
    
    // Apply filters
    result = applyFilters(result, filters);
    
    // Apply sort
    result = applySort(result, sortColumn, sortDirection);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Log warning if operation exceeds 200ms threshold (Requirement 5.3)
    if (duration > 200) {
      console.warn(
        `[Performance] Slow filter/sort operation: ${duration.toFixed(2)}ms ` +
        `(dataset size: ${localStudents.length}, filtered: ${result.length})`
      );
    }
    
    return result;
  }, [localStudents, debouncedQuery, filters, sortColumn, sortDirection]);
  
  // Extract available clubs for filter panel
  const availableClubs = useMemo(() => {
    const clubSet = new Set<string>();
    localStudents.forEach(student => {
      student.clubs.forEach(club => clubSet.add(club));
    });
    return Array.from(clubSet).sort();
  }, [localStudents]);
  
  // Virtualization for large datasets
  const ROW_HEIGHT = 50;
  const { visibleRange, totalHeight, offsetY, containerRef } = useVirtualization(
    processedStudents.length,
    ROW_HEIGHT,
    5
  );
  
  const visibleStudents = processedStudents.slice(visibleRange.start, visibleRange.end);
  const shouldVirtualize = processedStudents.length > 100;
  
  // Loading state
  if (isLoading) {
    return (
      <div className="database-table-view">
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <p>Loading student records...</p>
        </div>
        <style>{styles}</style>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="database-table-view">
        <ErrorMessage message={error} onDismiss={() => {}} />
        <button onClick={refetch} className="retry-button">
          Retry
        </button>
        <style>{styles}</style>
      </div>
    );
  }
  
  // Empty state (no students in database)
  if (localStudents.length === 0) {
    return (
      <div className="database-table-view">
        <div className="empty-state">
          <p>No student records found in the database.</p>
        </div>
        <style>{styles}</style>
      </div>
    );
  }
  
  // Main view
  return (
    <div className="database-table-view">
      <div className="table-header">
        <h2>Database View</h2>
        <p className="record-count">
          {processedStudents.length} of {localStudents.length} student{localStudents.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      {/* Update error notification */}
      {updateError && (
        <div className="error-notification">
          <ErrorMessage message={updateError} onDismiss={clearError} />
        </div>
      )}
      
      {/* Search bar */}
      <div className="search-section">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by ID or name"
          resultCount={processedStudents.length}
        />
      </div>
      
      {/* Filter panel */}
      <div className="filter-section">
        <FilterPanel
          filters={filters}
          onFilterChange={setFilter}
          onClearFilters={clearFilters}
          availableClubs={availableClubs}
          activeFilterCount={activeFilterCount}
        />
      </div>
      
      {/* Table */}
      {processedStudents.length === 0 ? (
        <div className="empty-state">
          <p>No students match your search or filter criteria.</p>
          <button onClick={clearFilters} className="clear-filters-button">
            Clear Filters
          </button>
        </div>
      ) : shouldVirtualize ? (
        <div
          ref={containerRef}
          className="table-container virtualized"
          style={{ height: '600px', overflow: 'auto' }}
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            <table className="students-table">
              <TableHeader
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </table>
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              <table className="students-table">
                <tbody>
                  {visibleStudents.map((student) => {
                    const updateKey = `${student.studentId}-tshirt`;
                    const isPending = pendingUpdates.has(updateKey) || 
                                     pendingUpdates.has(`${student.studentId}-meal`);
                    
                    return (
                      <TableRow
                        key={student.studentId}
                        student={student}
                        onCheckboxChange={updateClaimStatus}
                        isPending={isPending}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="students-table">
            <TableHeader
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <tbody>
              {processedStudents.map((student) => {
                const updateKey = `${student.studentId}-tshirt`;
                const isPending = pendingUpdates.has(updateKey) || 
                                 pendingUpdates.has(`${student.studentId}-meal`);
                
                return (
                  <TableRow
                    key={student.studentId}
                    student={student}
                    onCheckboxChange={updateClaimStatus}
                    isPending={isPending}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .database-table-view {
    width: 100%;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .table-header {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .table-header h2 {
    margin: 0;
    color: #333;
    font-size: 24px;
    font-weight: 700;
  }

  .record-count {
    margin: 0;
    color: #666;
    font-size: 14px;
    font-weight: 500;
  }

  .error-notification {
    margin-bottom: 16px;
  }

  .search-section {
    margin-bottom: 16px;
  }

  .filter-section {
    margin-bottom: 20px;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    gap: 20px;
  }

  .loading-spinner-large {
    width: 48px;
    height: 48px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-container p {
    color: #666;
    font-size: 16px;
    margin: 0;
  }

  .retry-button {
    margin-top: 16px;
    padding: 12px 24px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .retry-button:hover {
    background: #5568d3;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
  }

  .retry-button:active {
    transform: translateY(0);
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #666;
  }

  .empty-state p {
    font-size: 16px;
    margin: 0 0 16px 0;
  }

  .clear-filters-button {
    padding: 10px 20px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clear-filters-button:hover {
    background: #5568d3;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
  }

  .clear-filters-button:active {
    transform: translateY(0);
  }

  .table-container {
    overflow-x: auto;
    border-radius: 8px;
    border: 1px solid #dee2e6;
  }

  .table-container.virtualized {
    border: 1px solid #dee2e6;
  }

  .students-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
  }

  .students-table tbody tr {
    border-bottom: 1px solid #dee2e6;
    transition: background-color 0.2s ease;
  }

  .students-table tbody tr:hover {
    background-color: #f8f9ff;
  }

  .students-table tbody tr:last-child {
    border-bottom: none;
  }

  .students-table td {
    padding: 14px 16px;
    font-size: 14px;
    color: #333;
  }

  .student-id {
    font-weight: 600;
    color: #667eea;
  }

  .student-name {
    font-weight: 500;
  }

  .status-cell {
    text-align: center;
  }

  .status-icon {
    display: inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    border-radius: 50%;
    font-weight: 700;
    font-size: 16px;
  }

  .status-yes {
    background: #d4edda;
    color: #28a745;
  }

  .status-no {
    background: #f8d7da;
    color: #dc3545;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .database-table-view {
      padding: 16px;
    }

    .table-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .table-header h2 {
      font-size: 20px;
    }

    .record-count {
      font-size: 13px;
    }

    .table-container {
      overflow-x: scroll;
      -webkit-overflow-scrolling: touch;
    }

    .students-table {
      min-width: 800px;
    }

    .students-table th,
    .students-table td {
      padding: 12px;
      font-size: 13px;
    }

    .status-icon {
      width: 20px;
      height: 20px;
      line-height: 20px;
      font-size: 14px;
    }
  }

  /* Small mobile devices */
  @media (max-width: 480px) {
    .database-table-view {
      padding: 12px;
    }

    .table-header h2 {
      font-size: 18px;
    }

    .students-table th,
    .students-table td {
      padding: 10px 8px;
      font-size: 12px;
    }

    .loading-container {
      padding: 40px 20px;
    }

    .loading-spinner-large {
      width: 40px;
      height: 40px;
      border-width: 3px;
    }

    .loading-container p {
      font-size: 14px;
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .loading-spinner-large {
      animation: none;
    }

    .students-table tbody tr,
    .retry-button,
    .clear-filters-button {
      transition: none;
    }
  }

  /* Print styles */
  @media print {
    .database-table-view {
      box-shadow: none;
      padding: 0;
    }

    .retry-button,
    .clear-filters-button,
    .search-section,
    .filter-section {
      display: none;
    }

    .students-table tbody tr:hover {
      background-color: transparent;
    }
  }
`;
