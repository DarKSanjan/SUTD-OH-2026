import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TableHeader from '../TableHeader';
import { SortableColumn, SortDirection } from '../../../utils/types';

describe('TableHeader', () => {
  const mockOnSort = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all column headers', () => {
      render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      expect(screen.getByRole('button', { name: /Sort by Student ID/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Sort by Name/i })).toBeDefined();
      expect(screen.getByText('Clubs')).toBeDefined();
      expect(screen.getByText('Involvement')).toBeDefined();
      expect(screen.getByRole('button', { name: /Sort by T-shirt Size/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Sort by Meal Preference/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Sort by Shirt Collected/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Sort by Meal Collected/i })).toBeDefined();
      expect(screen.getByText('Consent')).toBeDefined();
    });

    it('should render sortable headers as buttons', () => {
      render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      const sortButtons = screen.getAllByRole('button');
      expect(sortButtons.length).toBe(6); // 6 sortable columns
    });

    it('should render non-sortable header (Consent) as plain text', () => {
      const { container } = render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      const consentHeader = screen.getByText('Consent');
      expect(consentHeader.tagName).toBe('TH');
      
      // Consent header should not have a button
      const consentTh = consentHeader.closest('th');
      const button = consentTh?.querySelector('button');
      expect(button).toBeNull();
    });

    it('should have correct column labels', () => {
      const { container } = render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      expect(container.textContent).toContain('Student ID');
      expect(container.textContent).toContain('Name');
      expect(container.textContent).toContain('Clubs');
      expect(container.textContent).toContain('Involvement');
      expect(container.textContent).toContain('T-shirt Size');
      expect(container.textContent).toContain('Meal Preference');
      expect(container.textContent).toContain('Shirt Collected');
      expect(container.textContent).toContain('Meal Collected');
      expect(container.textContent).toContain('Consent');
    });
  });

  describe('Sort Button Click Handling', () => {
    it('should call onSort when Student ID header is clicked', () => {
      render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      const studentIdButton = screen.getByRole('button', { name: /Sort by Student ID/i });
      fireEvent.click(studentIdButton);

      expect(mockOnSort).toHaveBeenCalledWith('studentId');
      expect(mockOnSort).toHaveBeenCalledTimes(1);
    });

    it('should call onSort when Name header is clicked', () => {
      render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      const nameButton = screen.getByRole('button', { name: /Sort by Name/i });
      fireEvent.click(nameButton);

      expect(mockOnSort).toHaveBeenCalledWith('name');
      expect(mockOnSort).toHaveBeenCalledTimes(1);
    });

    it('should call onSort when Shirt header is clicked', () => {
      render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      const shirtButton = screen.getByRole('button', { name: /Sort by Shirt Collected/i });
      fireEvent.click(shirtButton);

      expect(mockOnSort).toHaveBeenCalledWith('shirtCollected');
      expect(mockOnSort).toHaveBeenCalledTimes(1);
    });

    it('should call onSort when Meal header is clicked', () => {
      render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      const mealButton = screen.getByRole('button', { name: /Sort by Meal Collected/i });
      fireEvent.click(mealButton);

      expect(mockOnSort).toHaveBeenCalledWith('mealCollected');
      expect(mockOnSort).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple clicks on the same column', () => {
      render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      const nameButton = screen.getByRole('button', { name: /Sort by Name/i });
      
      fireEvent.click(nameButton);
      fireEvent.click(nameButton);
      fireEvent.click(nameButton);

      expect(mockOnSort).toHaveBeenCalledTimes(3);
      expect(mockOnSort).toHaveBeenNthCalledWith(1, 'name');
      expect(mockOnSort).toHaveBeenNthCalledWith(2, 'name');
      expect(mockOnSort).toHaveBeenNthCalledWith(3, 'name');
    });

    it('should handle clicks on different columns', () => {
      render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      const studentIdButton = screen.getByRole('button', { name: /Sort by Student ID/i });
      const nameButton = screen.getByRole('button', { name: /Sort by Name/i });
      
      fireEvent.click(studentIdButton);
      fireEvent.click(nameButton);

      expect(mockOnSort).toHaveBeenCalledTimes(2);
      expect(mockOnSort).toHaveBeenNthCalledWith(1, 'studentId');
      expect(mockOnSort).toHaveBeenNthCalledWith(2, 'name');
    });
  });

  describe('Sort Indicator Display', () => {
    it('should not show sort indicator when no column is sorted', () => {
      const { container } = render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      const indicators = container.querySelectorAll('.sort-indicator');
      expect(indicators.length).toBe(0);
    });

    it('should show ascending indicator (↑) when column is sorted ascending', () => {
      const { container } = render(
        <table>
          <TableHeader sortColumn="name" sortDirection="asc" onSort={mockOnSort} />
        </table>
      );

      const indicator = container.querySelector('.sort-indicator');
      expect(indicator).toBeDefined();
      expect(indicator?.textContent).toBe('↑');
    });

    it('should show descending indicator (↓) when column is sorted descending', () => {
      const { container } = render(
        <table>
          <TableHeader sortColumn="name" sortDirection="desc" onSort={mockOnSort} />
        </table>
      );

      const indicator = container.querySelector('.sort-indicator');
      expect(indicator).toBeDefined();
      expect(indicator?.textContent).toBe('↓');
    });

    it('should show indicator only on the sorted column', () => {
      const { container } = render(
        <table>
          <TableHeader sortColumn="studentId" sortDirection="asc" onSort={mockOnSort} />
        </table>
      );

      const indicators = container.querySelectorAll('.sort-indicator');
      expect(indicators.length).toBe(1);
      
      // Verify it's on the Student ID button
      const studentIdButton = screen.getByRole('button', { name: /Sort by Student ID ascending/i });
      const indicatorInButton = studentIdButton.querySelector('.sort-indicator');
      expect(indicatorInButton).toBeDefined();
    });

    it('should update indicator when sort column changes', () => {
      const { container, rerender } = render(
        <table>
          <TableHeader sortColumn="name" sortDirection="asc" onSort={mockOnSort} />
        </table>
      );

      let indicator = container.querySelector('.sort-indicator');
      expect(indicator?.textContent).toBe('↑');

      rerender(
        <table>
          <TableHeader sortColumn="studentId" sortDirection="desc" onSort={mockOnSort} />
        </table>
      );

      indicator = container.querySelector('.sort-indicator');
      expect(indicator?.textContent).toBe('↓');
    });

    it('should hide indicator when sort is removed', () => {
      const { container, rerender } = render(
        <table>
          <TableHeader sortColumn="name" sortDirection="asc" onSort={mockOnSort} />
        </table>
      );

      let indicators = container.querySelectorAll('.sort-indicator');
      expect(indicators.length).toBe(1);

      rerender(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      indicators = container.querySelectorAll('.sort-indicator');
      expect(indicators.length).toBe(0);
    });

    it('should hide sort indicator from screen readers with aria-hidden', () => {
      const { container } = render(
        <table>
          <TableHeader sortColumn="name" sortDirection="asc" onSort={mockOnSort} />
        </table>
      );

      const indicator = container.querySelector('.sort-indicator');
      expect(indicator?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should trigger sort on Enter key press', () => {
      render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      const nameButton = screen.getByRole('button', { name: /Sort by Name/i });
      fireEvent.keyDown(nameButton, { key: 'Enter', code: 'Enter' });

      expect(mockOnSort).toHaveBeenCalledWith('name');
      expect(mockOnSort).toHaveBeenCalledTimes(1);
    });

    it('should trigger sort on Space key press', () => {
      render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      const nameButton = screen.getByRole('button', { name: /Sort by Name/i });
      fireEvent.keyDown(nameButton, { key: ' ', code: 'Space' });

      expect(mockOnSort).toHaveBeenCalledWith('name');
      expect(mockOnSort).toHaveBeenCalledTimes(1);
    });

    it('should not trigger sort on other key presses', () => {
      render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      const nameButton = screen.getByRole('button', { name: /Sort by Name/i });
      
      fireEvent.keyDown(nameButton, { key: 'a', code: 'KeyA' });
      fireEvent.keyDown(nameButton, { key: 'Escape', code: 'Escape' });
      fireEvent.keyDown(nameButton, { key: 'Tab', code: 'Tab' });

      expect(mockOnSort).not.toHaveBeenCalled();
    });

    it('should prevent default behavior on Enter key', () => {
      render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      const nameButton = screen.getByRole('button', { name: /Sort by Name/i });
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
      nameButton.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should prevent default behavior on Space key', () => {
      render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      const nameButton = screen.getByRole('button', { name: /Sort by Name/i });
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
      nameButton.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should support keyboard navigation for all sortable columns', () => {
      render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      const columns: Array<{ name: RegExp; value: SortableColumn }> = [
        { name: /Sort by Student ID/i, value: 'studentId' },
        { name: /Sort by Name/i, value: 'name' },
        { name: /Sort by T-shirt Size/i, value: 'tshirtSize' },
        { name: /Sort by Meal Preference/i, value: 'mealPreference' },
        { name: /Sort by Shirt Collected/i, value: 'shirtCollected' },
        { name: /Sort by Meal Collected/i, value: 'mealCollected' }
      ];

      columns.forEach(({ name, value }) => {
        const button = screen.getByRole('button', { name });
        fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      });

      expect(mockOnSort).toHaveBeenCalledTimes(6);
      expect(mockOnSort).toHaveBeenNthCalledWith(1, 'studentId');
      expect(mockOnSort).toHaveBeenNthCalledWith(2, 'name');
      expect(mockOnSort).toHaveBeenNthCalledWith(3, 'tshirtSize');
      expect(mockOnSort).toHaveBeenNthCalledWith(4, 'mealPreference');
      expect(mockOnSort).toHaveBeenNthCalledWith(5, 'shirtCollected');
      expect(mockOnSort).toHaveBeenNthCalledWith(6, 'mealCollected');
    });

    it('should have tabIndex=0 on all sort buttons', () => {
      render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      const sortButtons = screen.getAllByRole('button');
      sortButtons.forEach(button => {
        expect(button.getAttribute('tabIndex')).toBe('0');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have correct aria-label for unsorted column', () => {
      render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      const nameButton = screen.getByRole('button', { name: 'Sort by Name' });
      expect(nameButton.getAttribute('aria-label')).toBe('Sort by Name');
    });

    it('should have correct aria-label for ascending sorted column', () => {
      render(
        <table>
          <TableHeader sortColumn="name" sortDirection="asc" onSort={mockOnSort} />
        </table>
      );

      const nameButton = screen.getByRole('button', { name: 'Sort by Name ascending' });
      expect(nameButton.getAttribute('aria-label')).toBe('Sort by Name ascending');
    });

    it('should have correct aria-label for descending sorted column', () => {
      render(
        <table>
          <TableHeader sortColumn="name" sortDirection="desc" onSort={mockOnSort} />
        </table>
      );

      const nameButton = screen.getByRole('button', { name: 'Sort by Name descending' });
      expect(nameButton.getAttribute('aria-label')).toBe('Sort by Name descending');
    });

    it('should have aria-sort="none" for unsorted columns', () => {
      const { container } = render(
        <table>
          <TableHeader sortColumn="name" sortDirection="asc" onSort={mockOnSort} />
        </table>
      );

      const headers = container.querySelectorAll('th');
      const studentIdHeader = headers[0]; // Student ID column
      
      expect(studentIdHeader.getAttribute('aria-sort')).toBe('none');
    });

    it('should have aria-sort="ascending" for ascending sorted column', () => {
      const { container } = render(
        <table>
          <TableHeader sortColumn="name" sortDirection="asc" onSort={mockOnSort} />
        </table>
      );

      const headers = container.querySelectorAll('th');
      const nameHeader = headers[1]; // Name column
      
      expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
    });

    it('should have aria-sort="descending" for descending sorted column', () => {
      const { container } = render(
        <table>
          <TableHeader sortColumn="name" sortDirection="desc" onSort={mockOnSort} />
        </table>
      );

      const headers = container.querySelectorAll('th');
      const nameHeader = headers[1]; // Name column
      
      expect(nameHeader.getAttribute('aria-sort')).toBe('descending');
    });

    it('should update aria-sort when sort changes', () => {
      const { container, rerender } = render(
        <table>
          <TableHeader sortColumn="name" sortDirection="asc" onSort={mockOnSort} />
        </table>
      );

      let headers = container.querySelectorAll('th');
      let nameHeader = headers[1];
      expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');

      rerender(
        <table>
          <TableHeader sortColumn="name" sortDirection="desc" onSort={mockOnSort} />
        </table>
      );

      headers = container.querySelectorAll('th');
      nameHeader = headers[1];
      expect(nameHeader.getAttribute('aria-sort')).toBe('descending');
    });

    it('should have correct aria-sort for all columns', () => {
      const { container } = render(
        <table>
          <TableHeader sortColumn="shirtCollected" sortDirection="asc" onSort={mockOnSort} />
        </table>
      );

      const headers = container.querySelectorAll('th');
      
      expect(headers[0].getAttribute('aria-sort')).toBe('none'); // Student ID
      expect(headers[1].getAttribute('aria-sort')).toBe('none'); // Name
      // headers[2] is Clubs (non-sortable, no aria-sort)
      // headers[3] is Involvement (non-sortable, no aria-sort)
      expect(headers[4].getAttribute('aria-sort')).toBe('none'); // T-shirt Size
      expect(headers[5].getAttribute('aria-sort')).toBe('none'); // Meal Preference
      expect(headers[6].getAttribute('aria-sort')).toBe('ascending'); // Shirt Collected (sorted)
      expect(headers[7].getAttribute('aria-sort')).toBe('none'); // Meal Collected
      // headers[8] is Consent (non-sortable, no aria-sort)
    });
  });

  describe('Active State', () => {
    it('should apply active class to sorted column button', () => {
      const { container } = render(
        <table>
          <TableHeader sortColumn="name" sortDirection="asc" onSort={mockOnSort} />
        </table>
      );

      const nameButton = screen.getByRole('button', { name: /Sort by Name ascending/i });
      expect(nameButton.classList.contains('active')).toBe(true);
    });

    it('should not apply active class to unsorted column buttons', () => {
      render(
        <table>
          <TableHeader sortColumn="name" sortDirection="asc" onSort={mockOnSort} />
        </table>
      );

      const studentIdButton = screen.getByRole('button', { name: /Sort by Student ID/i });
      const shirtButton = screen.getByRole('button', { name: /Sort by Shirt Collected/i });
      
      expect(studentIdButton.classList.contains('active')).toBe(false);
      expect(shirtButton.classList.contains('active')).toBe(false);
    });

    it('should update active class when sort column changes', () => {
      const { rerender } = render(
        <table>
          <TableHeader sortColumn="name" sortDirection="asc" onSort={mockOnSort} />
        </table>
      );

      let nameButton = screen.getByRole('button', { name: /Sort by Name ascending/i });
      expect(nameButton.classList.contains('active')).toBe(true);

      rerender(
        <table>
          <TableHeader sortColumn="studentId" sortDirection="asc" onSort={mockOnSort} />
        </table>
      );

      nameButton = screen.getByRole('button', { name: /Sort by Name/i });
      const studentIdButton = screen.getByRole('button', { name: /Sort by Student ID ascending/i });
      
      expect(nameButton.classList.contains('active')).toBe(false);
      expect(studentIdButton.classList.contains('active')).toBe(true);
    });

    it('should remove active class when sort is cleared', () => {
      const { rerender } = render(
        <table>
          <TableHeader sortColumn="name" sortDirection="asc" onSort={mockOnSort} />
        </table>
      );

      let nameButton = screen.getByRole('button', { name: /Sort by Name ascending/i });
      expect(nameButton.classList.contains('active')).toBe(true);

      rerender(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      nameButton = screen.getByRole('button', { name: /Sort by Name/i });
      expect(nameButton.classList.contains('active')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null sortColumn and sortDirection', () => {
      render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      const sortButtons = screen.getAllByRole('button');
      expect(sortButtons.length).toBe(6);
      
      sortButtons.forEach(button => {
        expect(button.classList.contains('active')).toBe(false);
      });
    });

    it('should handle rapid clicks on sort buttons', () => {
      render(
        <table>
          <TableHeader sortColumn={null} sortDirection={null} onSort={mockOnSort} />
        </table>
      );

      const nameButton = screen.getByRole('button', { name: /Sort by Name/i });
      
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nameButton);
      }

      expect(mockOnSort).toHaveBeenCalledTimes(10);
    });

    it('should handle all possible sort directions', () => {
      const directions: SortDirection[] = ['asc', 'desc', null];
      
      directions.forEach(direction => {
        const { container } = render(
          <table>
            <TableHeader sortColumn="name" sortDirection={direction} onSort={mockOnSort} />
          </table>
        );

        const indicator = container.querySelector('.sort-indicator');
        
        if (direction === 'asc') {
          expect(indicator?.textContent).toBe('↑');
        } else if (direction === 'desc') {
          expect(indicator?.textContent).toBe('↓');
        } else {
          expect(indicator).toBeNull();
        }
      });
    });

    it('should handle all sortable columns', () => {
      const columns: SortableColumn[] = ['studentId', 'name', 'tshirtSize', 'mealPreference', 'shirtCollected', 'mealCollected'];
      
      columns.forEach(column => {
        const { container } = render(
          <table>
            <TableHeader sortColumn={column} sortDirection="asc" onSort={mockOnSort} />
          </table>
        );

        const indicators = container.querySelectorAll('.sort-indicator');
        expect(indicators.length).toBe(1);
      });
    });
  });
});
