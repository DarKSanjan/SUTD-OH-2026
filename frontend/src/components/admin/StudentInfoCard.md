# StudentInfoCard Component

## Overview

The `StudentInfoCard` component displays student information in a visually appealing card format optimized for mobile devices. It shows the student's name, ID, t-shirt size, and meal preference with clear typography and spacing.

## Purpose

This component is used in the Admin App to display student information after a QR code has been successfully scanned. It provides administrators with a quick, easy-to-read view of the student's details.

## Props

```typescript
interface StudentData {
  studentId: string;
  name: string;
  tshirtSize: string;
  mealPreference: string;
}

interface StudentInfoCardProps {
  student: StudentData;
}
```

### `student` (required)
- **Type**: `StudentData`
- **Description**: Object containing the student's information
  - `studentId`: The student's unique identifier
  - `name`: The student's full name
  - `tshirtSize`: The student's t-shirt size (e.g., "S", "M", "L", "XL")
  - `mealPreference`: The student's meal preference (e.g., "Vegetarian", "Non-Vegetarian")

## Usage

```tsx
import { StudentInfoCard } from '@/components/admin';

function AdminApp() {
  const student = {
    studentId: 'S12345',
    name: 'John Doe',
    tshirtSize: 'L',
    mealPreference: 'Vegetarian',
  };

  return <StudentInfoCard student={student} />;
}
```

## Features

### Visual Design
- **Gradient Header**: Eye-catching purple gradient header displaying the student's name and ID
- **Clear Layout**: Information organized in easy-to-scan rows
- **Mobile-First**: Optimized for mobile devices with responsive design
- **High Contrast**: Clear typography with good color contrast for readability

### Mobile Optimization
- **Responsive Typography**: Font sizes adjust for different screen sizes
- **Touch-Friendly**: Adequate spacing and sizing for mobile interaction
- **Flexible Layout**: Adapts to various screen widths (320px to 768px+)
- **Large Touch Targets**: Minimum 44px height for interactive elements

### Accessibility
- **Semantic HTML**: Proper heading hierarchy and structure
- **Word Breaking**: Long names and IDs wrap appropriately
- **Readable Text**: Clear font sizes and weights for easy reading

## Design Specifications

### Colors
- **Header Background**: Linear gradient from #667eea to #764ba2
- **Header Text**: White (#ffffff)
- **Student ID Badge**: White with 20% opacity background
- **Labels**: Medium gray (#666)
- **Values**: Dark gray (#333)
- **Borders**: Light gray (#e0e0e0)

### Typography
- **Student Name**: 24px (mobile: 20-22px), bold (700)
- **Student ID**: 14px (mobile: 12-13px), semi-bold (600)
- **Info Labels**: 16px (mobile: 14-15px), semi-bold (600)
- **Info Values**: 18px (mobile: 16-17px), bold (700)

### Spacing
- **Card Padding**: 20-24px (mobile: 14-18px)
- **Info Row Padding**: 16px vertical (mobile: 12-14px)
- **Border Radius**: 12px (mobile: 8px)

## Requirements Validation

This component satisfies the following requirements:

- **Requirement 4.4**: Displays student information (name, Student_ID, t-shirt size, meal preference) after QR code validation
- **Requirement 8.4**: Admin App is optimized for mobile device screens with clear typography and spacing

## Testing

The component includes comprehensive unit tests covering:
- Rendering of all student information fields
- Handling of long names and special characters
- Different t-shirt sizes and meal preferences
- Edge cases with various student ID formats

Run tests with:
```bash
npm test -- StudentInfoCard.test.tsx
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design works on screens from 320px to 1920px+

## Related Components

- **QRScanner**: Scans QR codes and retrieves student information
- **ClaimStatusDisplay**: Shows claim status for items
- **ClaimCheckboxes**: Allows marking items as claimed
