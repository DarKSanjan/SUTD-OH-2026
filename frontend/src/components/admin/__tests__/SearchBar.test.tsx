import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render search input with default placeholder', () => {
      render(<SearchBar value="" onChange={mockOnChange} />);

      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toBeDefined();
      expect((searchInput as HTMLInputElement).placeholder).toBe('Search...');
    });

    it('should render search input with custom placeholder', () => {
      render(
        <SearchBar
          value=""
          onChange={mockOnChange}
          placeholder="Search by ID or name"
        />
      );

      const searchInput = screen.getByRole('searchbox');
      expect((searchInput as HTMLInputElement).placeholder).toBe('Search by ID or name');
    });

    it('should render search icon', () => {
      const { container } = render(<SearchBar value="" onChange={mockOnChange} />);

      const searchIcon = container.querySelector('.search-icon');
      expect(searchIcon).toBeDefined();
      expect(searchIcon?.textContent).toBe('🔍');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <SearchBar value="" onChange={mockOnChange} className="custom-class" />
      );

      const searchBar = container.querySelector('.search-bar');
      expect(searchBar?.classList.contains('custom-class')).toBe(true);
    });

    it('should display current value in input', () => {
      render(<SearchBar value="test query" onChange={mockOnChange} />);

      const searchInput = screen.getByRole('searchbox') as HTMLInputElement;
      expect(searchInput.value).toBe('test query');
    });
  });

  describe('Clear Button', () => {
    it('should not show clear button when query is empty', () => {
      render(<SearchBar value="" onChange={mockOnChange} />);

      const clearButton = screen.queryByRole('button', { name: 'Clear search' });
      expect(clearButton).toBeNull();
    });

    it('should show clear button when query exists', () => {
      render(<SearchBar value="test" onChange={mockOnChange} />);

      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      expect(clearButton).toBeDefined();
    });

    it('should not show clear button for whitespace-only query', () => {
      render(<SearchBar value="   " onChange={mockOnChange} />);

      const clearButton = screen.queryByRole('button', { name: 'Clear search' });
      expect(clearButton).toBeNull();
    });

    it('should call onChange with empty string when clear button is clicked', () => {
      render(<SearchBar value="test query" onChange={mockOnChange} />);

      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      fireEvent.click(clearButton);

      expect(mockOnChange).toHaveBeenCalledWith('');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should clear search on Enter key press', () => {
      render(<SearchBar value="test query" onChange={mockOnChange} />);

      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      fireEvent.keyDown(clearButton, { key: 'Enter', code: 'Enter' });

      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('should clear search on Space key press', () => {
      render(<SearchBar value="test query" onChange={mockOnChange} />);

      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      fireEvent.keyDown(clearButton, { key: ' ', code: 'Space' });

      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('should not clear search on other key presses', () => {
      render(<SearchBar value="test query" onChange={mockOnChange} />);

      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      fireEvent.keyDown(clearButton, { key: 'a', code: 'KeyA' });

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Result Count', () => {
    it('should not show result count when query is empty', () => {
      render(<SearchBar value="" onChange={mockOnChange} resultCount={10} />);

      const resultCount = screen.queryByRole('status');
      expect(resultCount).toBeNull();
    });

    it('should show result count when query exists', () => {
      render(<SearchBar value="test" onChange={mockOnChange} resultCount={5} />);

      const resultCount = screen.getByRole('status');
      expect(resultCount).toBeDefined();
      expect(resultCount.textContent).toBe('5 results found');
    });

    it('should show singular "result" for count of 1', () => {
      render(<SearchBar value="test" onChange={mockOnChange} resultCount={1} />);

      const resultCount = screen.getByRole('status');
      expect(resultCount.textContent).toBe('1 result found');
    });

    it('should show plural "results" for count of 0', () => {
      render(<SearchBar value="test" onChange={mockOnChange} resultCount={0} />);

      const resultCount = screen.getByRole('status');
      expect(resultCount.textContent).toBe('0 results found');
    });

    it('should show plural "results" for count greater than 1', () => {
      render(<SearchBar value="test" onChange={mockOnChange} resultCount={42} />);

      const resultCount = screen.getByRole('status');
      expect(resultCount.textContent).toBe('42 results found');
    });

    it('should not show result count when resultCount is undefined', () => {
      render(<SearchBar value="test" onChange={mockOnChange} />);

      const resultCount = screen.queryByRole('status');
      expect(resultCount).toBeNull();
    });

    it('should not show result count for whitespace-only query', () => {
      render(<SearchBar value="   " onChange={mockOnChange} resultCount={10} />);

      const resultCount = screen.queryByRole('status');
      expect(resultCount).toBeNull();
    });
  });

  describe('Input Handling', () => {
    it('should call onChange when input value changes', () => {
      render(<SearchBar value="" onChange={mockOnChange} />);

      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'new query' } });

      expect(mockOnChange).toHaveBeenCalledWith('new query');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should call onChange for each character typed', () => {
      render(<SearchBar value="" onChange={mockOnChange} />);

      const searchInput = screen.getByRole('searchbox');
      
      fireEvent.change(searchInput, { target: { value: 't' } });
      fireEvent.change(searchInput, { target: { value: 'te' } });
      fireEvent.change(searchInput, { target: { value: 'tes' } });
      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(mockOnChange).toHaveBeenCalledTimes(4);
      expect(mockOnChange).toHaveBeenNthCalledWith(1, 't');
      expect(mockOnChange).toHaveBeenNthCalledWith(2, 'te');
      expect(mockOnChange).toHaveBeenNthCalledWith(3, 'tes');
      expect(mockOnChange).toHaveBeenNthCalledWith(4, 'test');
    });

    it('should handle empty string input', () => {
      render(<SearchBar value="test" onChange={mockOnChange} />);

      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: '' } });

      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('should handle whitespace input', () => {
      render(<SearchBar value="" onChange={mockOnChange} />);

      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: '   ' } });

      expect(mockOnChange).toHaveBeenCalledWith('   ');
    });

    it('should handle special characters', () => {
      render(<SearchBar value="" onChange={mockOnChange} />);

      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: '!@#$%^&*()' } });

      expect(mockOnChange).toHaveBeenCalledWith('!@#$%^&*()');
    });
  });

  describe('Accessibility', () => {
    it('should have searchbox role', () => {
      render(<SearchBar value="" onChange={mockOnChange} />);

      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toBeDefined();
    });

    it('should have aria-label', () => {
      render(<SearchBar value="" onChange={mockOnChange} />);

      const searchInput = screen.getByRole('searchbox');
      expect(searchInput.getAttribute('aria-label')).toBe('Search students by ID or name');
    });

    it('should link to result count with aria-describedby when results are shown', () => {
      render(<SearchBar value="test" onChange={mockOnChange} resultCount={5} />);

      const searchInput = screen.getByRole('searchbox');
      expect(searchInput.getAttribute('aria-describedby')).toBe('search-results-count');
    });

    it('should not have aria-describedby when no results are shown', () => {
      render(<SearchBar value="" onChange={mockOnChange} />);

      const searchInput = screen.getByRole('searchbox');
      expect(searchInput.getAttribute('aria-describedby')).toBeNull();
    });

    it('should have status role on result count', () => {
      render(<SearchBar value="test" onChange={mockOnChange} resultCount={5} />);

      const resultCount = screen.getByRole('status');
      expect(resultCount).toBeDefined();
    });

    it('should have aria-live="polite" on result count', () => {
      render(<SearchBar value="test" onChange={mockOnChange} resultCount={5} />);

      const resultCount = screen.getByRole('status');
      expect(resultCount.getAttribute('aria-live')).toBe('polite');
    });

    it('should have correct id on result count for aria-describedby', () => {
      render(<SearchBar value="test" onChange={mockOnChange} resultCount={5} />);

      const resultCount = screen.getByRole('status');
      expect(resultCount.id).toBe('search-results-count');
    });

    it('should hide search icon from screen readers', () => {
      const { container } = render(<SearchBar value="" onChange={mockOnChange} />);

      const searchIcon = container.querySelector('.search-icon');
      expect(searchIcon?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have tabIndex on clear button', () => {
      render(<SearchBar value="test" onChange={mockOnChange} />);

      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      expect(clearButton.getAttribute('tabIndex')).toBe('0');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long search queries', () => {
      const longQuery = 'a'.repeat(1000);
      render(<SearchBar value={longQuery} onChange={mockOnChange} />);

      const searchInput = screen.getByRole('searchbox') as HTMLInputElement;
      expect(searchInput.value).toBe(longQuery);
    });

    it('should handle rapid input changes', () => {
      render(<SearchBar value="" onChange={mockOnChange} />);

      const searchInput = screen.getByRole('searchbox');
      
      for (let i = 0; i < 100; i++) {
        fireEvent.change(searchInput, { target: { value: `query${i}` } });
      }

      expect(mockOnChange).toHaveBeenCalledTimes(100);
    });

    it('should handle result count of 0', () => {
      render(<SearchBar value="test" onChange={mockOnChange} resultCount={0} />);

      const resultCount = screen.getByRole('status');
      expect(resultCount.textContent).toBe('0 results found');
    });

    it('should handle very large result counts', () => {
      render(<SearchBar value="test" onChange={mockOnChange} resultCount={999999} />);

      const resultCount = screen.getByRole('status');
      expect(resultCount.textContent).toBe('999999 results found');
    });

    it('should update clear button visibility when value changes', () => {
      const { rerender } = render(<SearchBar value="" onChange={mockOnChange} />);

      let clearButton = screen.queryByRole('button', { name: 'Clear search' });
      expect(clearButton).toBeNull();

      rerender(<SearchBar value="test" onChange={mockOnChange} />);

      clearButton = screen.getByRole('button', { name: 'Clear search' });
      expect(clearButton).toBeDefined();

      rerender(<SearchBar value="" onChange={mockOnChange} />);

      clearButton = screen.queryByRole('button', { name: 'Clear search' });
      expect(clearButton).toBeNull();
    });

    it('should update result count when it changes', () => {
      const { rerender } = render(
        <SearchBar value="test" onChange={mockOnChange} resultCount={5} />
      );

      let resultCount = screen.getByRole('status');
      expect(resultCount.textContent).toBe('5 results found');

      rerender(<SearchBar value="test" onChange={mockOnChange} resultCount={10} />);

      resultCount = screen.getByRole('status');
      expect(resultCount.textContent).toBe('10 results found');
    });
  });
});
