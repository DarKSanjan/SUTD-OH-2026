# InvolvementDisplay Component

## Overview

The `InvolvementDisplay` component displays a student's organization involvements in a structured, visually appealing format. It shows each club and role combination as a separate item with clear visual separation.

## Purpose

This component is used to display organization involvement information for students who volunteer for multiple clubs. It provides a consistent display format across both the Student App (QRCodeDisplay) and Admin App (StudentInfoCard).

## Props

```typescript
interface StudentInvolvement {
  club: string;
  role: string;
}

interface InvolvementDisplayProps {
  involvements: StudentInvolvement[];
  variant?: 'card' | 'list';
}
```

### `involvements` (required)
- **Type**: `StudentInvolvement[]`
- **Description**: Array of organization involvements, each containing a club name and role
- **Example**: 
  ```typescript
  [
    { club: 'Tech Club', role: 'Member' },
    { club: 'Science Club', role: 'Volunteer' }
  ]
  ```

### `variant` (optional)
- **Type**: `'card' | 'list'`
- **Default**: `'list'`
- **Description**: Visual style variant
  - `'list'`: More spacious layout for student view (default)
  - `'card'`: More compact layout for admin view

## Usage

### In Student App (QRCodeDisplay)

```tsx
import InvolvementDisplay from '../shared/InvolvementDisplay';

<InvolvementDisplay 
  involvements={student.involvements} 
  variant="list"
/>
```

### In Admin App (StudentInfoCard)

```tsx
import InvolvementDisplay from '../shared/InvolvementDisplay';

<InvolvementDisplay 
  involvements={student.involvements} 
  variant="card"
/>
```

## Features

- **Conditional Rendering**: Automatically hides when involvements array is empty or undefined
- **Visual Hierarchy**: Club name is bold and prominent, role is secondary
- **Color Coding**: Left border accent color for visual distinction
- **Hover Effects**: Subtle animation on hover for better interactivity
- **Responsive Design**: Adapts to mobile screens with appropriate sizing
- **Touch Targets**: Ensures minimum 44px touch targets on mobile devices
- **Accessibility**: Proper semantic structure with headings

## Visual Design

### List Variant (Student App)
- More spacious padding (14px-18px)
- Larger font sizes (16px club, 14px role)
- Better for detailed viewing

### Card Variant (Admin App)
- Compact padding (10px-14px)
- Smaller font sizes (14px club, 12px role)
- Gradient background for visual interest
- Optimized for quick scanning

## Styling

The component includes:
- Left border accent in brand color (#667eea)
- Light gray background (#f8f9fa)
- Smooth hover transitions
- Mobile-optimized responsive breakpoints
- Touch-friendly interaction areas

## Requirements Satisfied

- **Requirement 2.6**: Display all clubs the student is volunteering for and their roles in each club
- **Requirement 2.7**: Organization involvement details parsed and displayed in structured format
- **Requirement 4.7**: Show all clubs and roles in Admin App in clear, organized format
- **Requirement 4.8**: Organization involvement details parsed and displayed in structured format
- **Requirement 8.7**: Show each club and role as separate, clearly labeled items
- **Requirement 8.8**: Easy to scan visually with clear separation between different clubs

## Testing

The component has comprehensive unit tests covering:
- Rendering all involvements correctly
- Both variant styles (list and card)
- Empty and undefined involvements
- Single and multiple involvements
- Special characters in club names and roles
- Proper structure and styling

See `__tests__/InvolvementDisplay.test.tsx` for full test coverage.
