# ErrorMessage Component

A reusable error display component for showing validation errors and other error messages throughout the application.

## Features

- **Clear Visibility**: Red color scheme with warning icon for immediate attention
- **Dismissible**: Optional dismiss button for user control
- **Auto-dismiss**: Optional automatic dismissal after a configurable delay
- **Accessible**: Proper ARIA attributes for screen readers
- **Responsive**: Mobile-friendly design with appropriate sizing
- **Animated**: Smooth slide-in animation for better UX

## Usage

### Basic Usage

```tsx
import ErrorMessage from '@/components/shared/ErrorMessage';

function MyComponent() {
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <ErrorMessage message={error} />
    </div>
  );
}
```

### With Dismiss Button

```tsx
<ErrorMessage 
  message="Student ID not found" 
  onDismiss={() => setError(null)} 
/>
```

### With Auto-dismiss

```tsx
<ErrorMessage 
  message="Network error occurred" 
  onDismiss={() => setError(null)}
  autoDismiss={true}
  autoDismissDelay={3000}  // Dismiss after 3 seconds
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string \| null` | - | The error message to display. If null or empty, component won't render |
| `onDismiss` | `() => void` | `undefined` | Optional callback when dismiss button is clicked |
| `autoDismiss` | `boolean` | `false` | Whether to automatically dismiss the error after a delay |
| `autoDismissDelay` | `number` | `5000` | Delay in milliseconds before auto-dismissing (only used if autoDismiss is true) |

## Styling

The component uses inline styles with the following color scheme:
- Background: `#ffebee` (light red)
- Text: `#c62828` (dark red)
- Border: `#c62828` (dark red, 4px left border)

The component is fully self-contained with its own styles and doesn't require external CSS.

## Accessibility

- Uses `role="alert"` for screen reader announcements
- Uses `aria-live="assertive"` for immediate announcements
- Dismiss button has proper `aria-label`
- Keyboard accessible (dismiss button can be focused and activated)

## Examples

### Form Validation Error

```tsx
function StudentIDForm() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (id: string) => {
    try {
      await validateStudent(id);
    } catch (err) {
      setError('Student ID not found in database');
    }
  };

  return (
    <form>
      <input type="text" />
      <ErrorMessage message={error} onDismiss={() => setError(null)} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Network Error with Auto-dismiss

```tsx
function DataFetcher() {
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      await fetch('/api/data');
    } catch (err) {
      setError('Failed to connect to server. Please try again.');
    }
  };

  return (
    <div>
      <ErrorMessage 
        message={error} 
        onDismiss={() => setError(null)}
        autoDismiss={true}
        autoDismissDelay={5000}
      />
      <button onClick={fetchData}>Fetch Data</button>
    </div>
  );
}
```

### Multiple Error States

```tsx
function ComplexForm() {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  return (
    <form>
      {/* Show validation errors */}
      <ErrorMessage 
        message={validationError} 
        onDismiss={() => setValidationError(null)} 
      />
      
      {/* Show server errors with auto-dismiss */}
      <ErrorMessage 
        message={serverError} 
        onDismiss={() => setServerError(null)}
        autoDismiss={true}
      />
      
      <input type="text" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Design Decisions

1. **Null Safety**: Component returns null when no message is provided, avoiding unnecessary DOM elements
2. **Flexible Dismissal**: Supports both manual and automatic dismissal patterns
3. **Visual Hierarchy**: Left border and icon draw attention without being overwhelming
4. **Animation**: Subtle slide-in animation provides smooth visual feedback
5. **Self-contained Styles**: Inline styles ensure component works anywhere without CSS dependencies

## Related Components

- `StudentIDForm`: Uses ErrorMessage for validation errors
- `QRScanner`: Can use ErrorMessage for scan errors
- `ClaimCheckboxes`: Can use ErrorMessage for claim errors

## Requirements

**Validates: Requirements 8.2** - Clear error message display for validation failures
