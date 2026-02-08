# Student Components

This directory contains the components for the Student App, which allows students to validate their ID and receive a QR code for event check-in.

## Components

### StudentIDForm

A form component for entering and validating student IDs.

**Props:**
- `onSubmit: (studentId: string) => Promise<void>` - Callback function called when form is submitted with a valid student ID
- `isLoading?: boolean` - Optional flag to show loading state during API calls
- `error?: string | null` - Optional error message to display

**Features:**
- Client-side validation (non-empty, trimmed input)
- Loading state with disabled inputs during submission
- Error message display
- Auto-focus on input field
- Clears validation errors when user starts typing

**Usage:**
```tsx
import StudentIDForm from './components/student/StudentIDForm';

function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (studentId: string) => {
    setIsLoading(true);
    try {
      // Call API
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
      // Handle response...
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StudentIDForm 
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
    />
  );
}
```

### StudentApp

A complete integration component that combines the StudentIDForm with API calls to `/api/validate` and displays the results.

**Features:**
- Handles form submission and API calls
- Displays student information and QR code on successful validation
- Shows error messages for validation failures
- Allows generating a new QR code after successful validation
- Responsive design with gradient background

**Usage:**
```tsx
import StudentApp from './components/student/StudentApp';

function App() {
  return <StudentApp />;
}
```

## API Integration

The components integrate with the following API endpoint:

### POST /api/validate

**Request:**
```json
{
  "studentId": "string"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "student": {
    "studentId": "string",
    "name": "string",
    "tshirtSize": "string",
    "mealPreference": "string"
  },
  "qrCode": "data:image/png;base64,...",
  "token": "string"
}
```

**Response (Not Found - 404):**
```json
{
  "success": false,
  "error": "Student ID not found"
}
```

## Testing

Tests are located in `__tests__/` directory:
- `StudentIDForm.test.tsx` - Unit tests for the form component
- `StudentApp.test.tsx` - Integration tests for the complete app

Run tests with:
```bash
npm test -- src/components/student
```

## Requirements Validation

This implementation satisfies the following requirements:
- **Requirement 2.1**: Student ID validation through the User_App
- **Requirement 8.1**: Single input field for Student_ID entry with submit button
- Client-side validation (non-empty, trimmed)
- Loading states during API calls
- Error message display
- Calls /api/validate endpoint on submit
