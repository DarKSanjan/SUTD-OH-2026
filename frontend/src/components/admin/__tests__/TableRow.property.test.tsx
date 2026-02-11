import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import TableRow from '../TableRow';
import { StudentRecord } from '../../../utils/types';

describe('TableRow - Property-Based Tests', () => {
  const mockOnCheckboxChange = vi.fn().mockResolvedValue(undefined);

  // Arbitrary for generating random student records with realistic data
  const studentArbitrary = fc.record({
    studentId: fc.stringMatching(/^[A-Z0-9]{4,10}$/),
    name: fc.stringMatching(/^[A-Za-z]+ [A-Za-z]+$/),
    shirtCollected: fc.boolean(),
    mealCollected: fc.boolean(),
    consented: fc.boolean(),
    clubs: fc.array(
      fc.stringMatching(/^[A-Za-z ]{3,20}$/),
      { maxLength: 10 }
    ),
    hasPerformance: fc.boolean(),
    hasBooth: fc.boolean(),
  });

  /**
   * Feature: admin-table-enhancements
   * Property 19: Involvement data is displayed for all students
   * 
   * For any student record, the table should display their club involvement,
   * performance status, and booth status (parsed from organization details).
   * 
   * **Validates: Requirements 6.1, 6.2, 6.3**
   */
  it('property: involvement data is displayed for all students', () => {
    fc.assert(
      fc.property(studentArbitrary, (student: StudentRecord) => {
        const { container, unmount } = render(
          <table>
            <tbody>
              <TableRow
                student={student}
                onCheckboxChange={mockOnCheckboxChange}
                isPending={false}
              />
            </tbody>
          </table>
        );

        try {
          // Verify student ID and name are displayed
          const cells = container.querySelectorAll('td');
          const studentIdCell = Array.from(cells).find(cell => 
            cell.className.includes('student-id')
          );
          const studentNameCell = Array.from(cells).find(cell => 
            cell.className.includes('student-name')
          );

          expect(studentIdCell?.textContent).toBe(student.studentId);
          expect(studentNameCell?.textContent).toBe(student.name);

          // Verify clubs are displayed
          const clubCell = Array.from(cells).find(cell => 
            cell.className.includes('clubs')
          );
          
          if (student.clubs.length > 0) {
            const clubsText = student.clubs.join(', ');
            expect(clubCell?.textContent).toBe(clubsText);
          } else {
            // Should show N/A for empty clubs
            expect(clubCell?.textContent).toBe('N/A');
          }

          // Verify involvement is displayed
          const involvementCell = Array.from(cells).find(cell => 
            cell.className.includes('involvement')
          );
          
          const involvementParts = [];
          if (student.hasPerformance) involvementParts.push('Performance');
          if (student.hasBooth) involvementParts.push('Booth');

          if (involvementParts.length > 0) {
            const involvementText = involvementParts.join(', ');
            expect(involvementCell?.textContent).toBe(involvementText);
          } else {
            // Should show N/A for no involvement
            expect(involvementCell?.textContent).toBe('N/A');
          }

          // Verify checkboxes reflect correct state
          const inputs = container.querySelectorAll('input[type="checkbox"]');
          const shirtCheckbox = Array.from(inputs).find(input => 
            input.getAttribute('aria-label')?.includes('Shirt collected')
          ) as HTMLInputElement;
          const mealCheckbox = Array.from(inputs).find(input => 
            input.getAttribute('aria-label')?.includes('Meal collected')
          ) as HTMLInputElement;

          expect(shirtCheckbox?.checked).toBe(student.shirtCollected);
          expect(mealCheckbox?.checked).toBe(student.mealCollected);
        } finally {
          // Clean up after each test
          unmount();
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: admin-table-enhancements
   * Property 20: Multiple clubs are all displayed
   * 
   * For any student with multiple club involvements, all clubs should be
   * visible in the table (not truncated or hidden).
   * 
   * **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
   */
  it('property: multiple clubs are all displayed', () => {
    fc.assert(
      fc.property(
        fc.record({
          studentId: fc.stringMatching(/^[A-Z0-9]{4,10}$/),
          name: fc.stringMatching(/^[A-Za-z]+ [A-Za-z]+$/),
          shirtCollected: fc.boolean(),
          mealCollected: fc.boolean(),
          consented: fc.boolean(),
          // Generate students with at least 2 clubs
          clubs: fc.array(
            fc.stringMatching(/^[A-Za-z ]{3,20}$/),
            { minLength: 2, maxLength: 10 }
          ),
          hasPerformance: fc.boolean(),
          hasBooth: fc.boolean(),
        }),
        (student: StudentRecord) => {
          const { container } = render(
            <table>
              <tbody>
                <TableRow
                  student={student}
                  onCheckboxChange={mockOnCheckboxChange}
                  isPending={false}
                />
              </tbody>
            </table>
          );

          // All clubs should be present in the rendered output
          const expectedClubsText = student.clubs.join(', ');
          
          // Find the clubs cell
          const cells = container.querySelectorAll('td');
          const clubCell = Array.from(cells).find(cell => 
            cell.className.includes('clubs')
          );
          
          expect(clubCell?.textContent).toBe(expectedClubsText);

          // Verify each individual club is present in the text
          student.clubs.forEach(club => {
            expect(clubCell?.textContent).toContain(club);
          });

          // Verify the number of clubs matches
          const displayedClubs = expectedClubsText.split(', ');
          expect(displayedClubs.length).toBe(student.clubs.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Involvement display is consistent
   * 
   * Verifies that the involvement display logic is consistent across
   * all possible combinations of performance and booth status.
   */
  it('property: involvement display is consistent with student data', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        (hasPerformance: boolean, hasBooth: boolean) => {
          const student: StudentRecord = {
            studentId: 'TEST001',
            name: 'Test Student',
            shirtCollected: false,
            mealCollected: false,
            consented: true,
            clubs: ['Test Club'],
            hasPerformance,
            hasBooth,
          };

          const { container } = render(
            <table>
              <tbody>
                <TableRow
                  student={student}
                  onCheckboxChange={mockOnCheckboxChange}
                  isPending={false}
                />
              </tbody>
            </table>
          );

          const cells = container.querySelectorAll('td');
          const involvementCell = Array.from(cells).find(cell => 
            cell.className.includes('involvement')
          );

          // Build expected text
          const expectedParts = [];
          if (hasPerformance) expectedParts.push('Performance');
          if (hasBooth) expectedParts.push('Booth');
          const expectedText = expectedParts.length > 0 
            ? expectedParts.join(', ') 
            : 'N/A';

          expect(involvementCell?.textContent).toBe(expectedText);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Empty clubs always show N/A
   * 
   * Verifies that students with no club involvement always display "N/A"
   * in the clubs column.
   */
  it('property: empty clubs always display N/A', () => {
    fc.assert(
      fc.property(
        fc.record({
          studentId: fc.stringMatching(/^[A-Z0-9]{4,10}$/),
          name: fc.stringMatching(/^[A-Za-z]+ [A-Za-z]+$/),
          shirtCollected: fc.boolean(),
          mealCollected: fc.boolean(),
          consented: fc.boolean(),
          clubs: fc.constant([]), // Always empty
          hasPerformance: fc.boolean(),
          hasBooth: fc.boolean(),
        }),
        (student: StudentRecord) => {
          const { container } = render(
            <table>
              <tbody>
                <TableRow
                  student={student}
                  onCheckboxChange={mockOnCheckboxChange}
                  isPending={false}
                />
              </tbody>
            </table>
          );

          const cells = container.querySelectorAll('td');
          const clubCell = Array.from(cells).find(cell => 
            cell.className.includes('clubs')
          );

          expect(clubCell?.textContent).toBe('N/A');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Checkbox state matches student data
   * 
   * Verifies that checkbox states always accurately reflect the
   * student's collection status.
   */
  it('property: checkbox state always matches student collection status', () => {
    fc.assert(
      fc.property(studentArbitrary, (student: StudentRecord) => {
        const { container } = render(
          <table>
            <tbody>
              <TableRow
                student={student}
                onCheckboxChange={mockOnCheckboxChange}
                isPending={false}
              />
            </tbody>
          </table>
        );

        // Find checkboxes by aria-label pattern
        const inputs = container.querySelectorAll('input[type="checkbox"]');
        const shirtCheckbox = Array.from(inputs).find(input => 
          input.getAttribute('aria-label')?.includes('Shirt collected')
        ) as HTMLInputElement;
        const mealCheckbox = Array.from(inputs).find(input => 
          input.getAttribute('aria-label')?.includes('Meal collected')
        ) as HTMLInputElement;

        // Checkbox checked state must match student data
        expect(shirtCheckbox?.checked).toBe(student.shirtCollected);
        expect(mealCheckbox?.checked).toBe(student.mealCollected);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Pending state disables all checkboxes
   * 
   * Verifies that when isPending is true, both checkboxes are disabled
   * regardless of other student data.
   */
  it('property: pending state disables all checkboxes', () => {
    fc.assert(
      fc.property(studentArbitrary, (student: StudentRecord) => {
        const { container } = render(
          <table>
            <tbody>
              <TableRow
                student={student}
                onCheckboxChange={mockOnCheckboxChange}
                isPending={true}
              />
            </tbody>
          </table>
        );

        // Find checkboxes by aria-label pattern
        const inputs = container.querySelectorAll('input[type="checkbox"]');
        const shirtCheckbox = Array.from(inputs).find(input => 
          input.getAttribute('aria-label')?.includes('Shirt collected')
        ) as HTMLInputElement;
        const mealCheckbox = Array.from(inputs).find(input => 
          input.getAttribute('aria-label')?.includes('Meal collected')
        ) as HTMLInputElement;

        // Both checkboxes must be disabled when pending
        expect(shirtCheckbox?.disabled).toBe(true);
        expect(mealCheckbox?.disabled).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
