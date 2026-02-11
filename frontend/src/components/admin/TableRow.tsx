import React from 'react';
import InteractiveCheckbox from './InteractiveCheckbox';
import { StudentRecord } from '../../utils/types';

/**
 * Props for the TableRow component
 */
export interface TableRowProps {
  /** Student record to display */
  student: StudentRecord;
  /** Callback when checkbox state changes */
  onCheckboxChange: (
    studentId: string,
    itemType: 'tshirt' | 'meal',
    collected: boolean
  ) => Promise<void>;
  /** Whether this row has a pending update */
  isPending: boolean;
}

/**
 * TableRow - Memoized table row component for displaying student data
 * 
 * This component provides:
 * - Student information display (ID, name, involvement)
 * - Interactive checkboxes for claim status
 * - Loading state during updates
 * - Optimized re-rendering through memoization
 * 
 * @example
 * ```tsx
 * <TableRow
 *   student={studentRecord}
 *   onCheckboxChange={handleCheckboxChange}
 *   isPending={pendingUpdates.has(studentRecord.studentId)}
 * />
 * ```
 */
const TableRow = React.memo(({ student, onCheckboxChange, isPending }: TableRowProps) => {
  const handleShirtChange = async (checked: boolean) => {
    await onCheckboxChange(student.studentId, 'tshirt', checked);
  };

  const handleMealChange = async (checked: boolean) => {
    await onCheckboxChange(student.studentId, 'meal', checked);
  };

  // Format clubs for display
  const clubsDisplay = student.clubs.length > 0 
    ? student.clubs.join(', ') 
    : 'N/A';

  // Format involvement for display
  const involvementDisplay = [];
  if (student.hasPerformance) involvementDisplay.push('Performance');
  if (student.hasBooth) involvementDisplay.push('Booth');
  const involvementText = involvementDisplay.length > 0 
    ? involvementDisplay.join(', ') 
    : 'N/A';

  // Format t-shirt size for display
  const tshirtDisplay = student.tshirtSize && student.tshirtSize.trim() !== '' 
    ? student.tshirtSize 
    : 'N/A';

  // Format meal preference for display
  const mealDisplay = student.mealPreference && student.mealPreference.trim() !== '' 
    ? student.mealPreference 
    : 'N/A';

  // Format consent status for display
  const consentDisplay = student.consented ? '✓' : '✗';

  return (
    <tr className="table-row">
      <td className="student-id">{student.studentId}</td>
      <td className="student-name">{student.name}</td>
      <td className="clubs">{clubsDisplay}</td>
      <td className="involvement">{involvementText}</td>
      <td className="tshirt-size">{tshirtDisplay}</td>
      <td className="meal-preference">{mealDisplay}</td>
      <td className="shirt-checkbox">
        <InteractiveCheckbox
          checked={student.shirtCollected}
          onChange={handleShirtChange}
          disabled={isPending}
          label={`Shirt collected for ${student.studentId}`}
        />
      </td>
      <td className="meal-checkbox">
        <InteractiveCheckbox
          checked={student.mealCollected}
          onChange={handleMealChange}
          disabled={isPending}
          label={`Meal collected for ${student.studentId}`}
        />
      </td>
      <td className="consent-status">{consentDisplay}</td>

      <style>{`
        .table-row {
          border-bottom: 1px solid #e5e7eb;
          transition: background-color 0.15s ease;
        }

        .table-row:hover {
          background-color: #f9fafb;
        }

        .table-row td {
          padding: 12px 16px;
          vertical-align: middle;
        }

        .student-id {
          font-family: 'Courier New', monospace;
          font-weight: 500;
          color: #374151;
        }

        .student-name {
          font-weight: 500;
          color: #111827;
        }

        .clubs,
        .involvement,
        .tshirt-size,
        .meal-preference {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .consent-status {
          text-align: center;
          font-size: 1.25rem;
          color: #374151;
        }

        .shirt-checkbox,
        .meal-checkbox {
          text-align: center;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .table-row td {
            padding: 8px 12px;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </tr>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  // Only re-render if relevant data changes
  return (
    prevProps.student.studentId === nextProps.student.studentId &&
    prevProps.student.name === nextProps.student.name &&
    prevProps.student.tshirtSize === nextProps.student.tshirtSize &&
    prevProps.student.mealPreference === nextProps.student.mealPreference &&
    prevProps.student.shirtCollected === nextProps.student.shirtCollected &&
    prevProps.student.mealCollected === nextProps.student.mealCollected &&
    prevProps.student.consented === nextProps.student.consented &&
    prevProps.student.clubs.length === nextProps.student.clubs.length &&
    prevProps.student.clubs.every((club, i) => club === nextProps.student.clubs[i]) &&
    prevProps.student.hasPerformance === nextProps.student.hasPerformance &&
    prevProps.student.hasBooth === nextProps.student.hasBooth &&
    prevProps.isPending === nextProps.isPending
  );
});

TableRow.displayName = 'TableRow';

export default TableRow;
