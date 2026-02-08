# QRCodeDisplay Component

## Overview

The `QRCodeDisplay` component is responsible for displaying a student's QR code along with their information after successful validation. This component is part of the Student App frontend and implements requirements 3.5 and 8.3.

## Features

- **Success Message**: Displays a prominent success indicator with the student's name
- **Student Information**: Shows all relevant student details in a clean, organized layout:
  - Student ID
  - Name
  - T-Shirt Size
  - Meal Preference
- **QR Code Display**: Renders the QR code image from a base64 data URL
- **Instructions**: Provides clear guidance on how to use the QR code at the event
- **Generate New QR Code**: Optional button to allow users to generate a new QR code

## Props

```typescript
interface StudentData {
  studentId: string;
  name: string;
  tshirtSize: string;
  mealPreference: string;
}

interface QRCodeDisplayProps {
  qrCode: string;              // Base64 data URL of the QR code image
  student: StudentData;        // Student information object
  onGenerateNew?: () => void;  // Optional callback for generating a new QR code
}
```

## Usage

```tsx
import QRCodeDisplay from './QRCodeDisplay';

function MyComponent() {
  const studentData = {
    studentId: 'S12345',
    name: 'John Doe',
    tshirtSize: 'M',
    mealPreference: 'Vegetarian'
  };

  const qrCodeDataUrl = 'data:image/png;base64,...';

  const handleGenerateNew = () => {
    // Logic to generate a new QR code
  };

  return (
    <QRCodeDisplay
      qrCode={qrCodeDataUrl}
      student={studentData}
      onGenerateNew={handleGenerateNew}
    />
  );
}
```

## Styling

The component includes inline styles that provide:
- Clean, modern card-based layout
- Responsive design with mobile-friendly breakpoints
- Clear visual hierarchy with proper spacing
- Accessible color contrast
- Hover and active states for interactive elements

## Testing

The component has comprehensive unit tests covering:
- Rendering of student information
- QR code image display
- Success message display
- Conditional rendering of the "Generate New QR Code" button
- Button click handling
- Different student data scenarios

Run tests with:
```bash
npm test -- QRCodeDisplay
```

## Requirements Validation

- **Requirement 3.5**: The User_App SHALL display the QR_Code to the student immediately after validation ✓
- **Requirement 8.3**: THE User_App SHALL display the QR_Code prominently when validation succeeds ✓

## Accessibility

- Semantic HTML structure with proper headings
- Alt text for QR code image
- Clear visual hierarchy
- Keyboard accessible button
- Responsive design for various screen sizes
