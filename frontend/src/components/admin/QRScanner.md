# QRScanner Component

## Overview

The `QRScanner` component provides QR code scanning functionality for the Admin App. It uses the `html5-qrcode` library to access the device camera, scan QR codes in continuous mode, extract tokens, and validate them against the backend API.

## Features

- **Camera Permission Handling**: Requests and manages camera permissions with user-friendly error messages
- **Continuous Scanning**: Automatically scans QR codes without requiring manual triggers
- **Token Extraction**: Parses QR code data to extract the validation token
- **API Integration**: Calls `/api/scan` endpoint to validate tokens and retrieve student information
- **Mobile Optimized**: Designed for mobile devices with appropriate camera settings
- **Error Handling**: Gracefully handles camera errors, invalid QR codes, and network failures
- **Visual Feedback**: Provides clear visual indicators for scanning status

## Props

```typescript
interface QRScannerProps {
  onScanSuccess: (data: ScanResponse) => void;
  onScanError: (error: string) => void;
}
```

### `onScanSuccess`
- **Type**: `(data: ScanResponse) => void`
- **Description**: Callback function called when a QR code is successfully scanned and validated
- **Parameters**: 
  - `data`: Object containing student information and claim status

### `onScanError`
- **Type**: `(error: string) => void`
- **Description**: Callback function called when an error occurs during scanning or validation
- **Parameters**: 
  - `error`: Error message string

## Response Types

```typescript
interface ScanResponse {
  success: boolean;
  student?: {
    studentId: string;
    name: string;
    tshirtSize: string;
    mealPreference: string;
  };
  claims?: {
    tshirtClaimed: boolean;
    mealClaimed: boolean;
  };
  error?: string;
}
```

## Usage Example

```tsx
import QRScanner from './components/admin/QRScanner';

function AdminApp() {
  const handleScanSuccess = (data: ScanResponse) => {
    console.log('Student scanned:', data.student);
    console.log('Claim status:', data.claims);
    // Update UI with student information
  };

  const handleScanError = (error: string) => {
    console.error('Scan error:', error);
    // Display error message to user
  };

  return (
    <div>
      <h1>Admin Check-In</h1>
      <QRScanner 
        onScanSuccess={handleScanSuccess}
        onScanError={handleScanError}
      />
    </div>
  );
}
```

## Implementation Details

### Camera Initialization

The component automatically requests camera permissions on mount and initializes the `Html5Qrcode` scanner:

1. Requests camera access using `navigator.mediaDevices.getUserMedia()`
2. Creates an `Html5Qrcode` instance
3. Starts continuous scanning with back camera (on mobile)

### QR Code Processing

When a QR code is detected:

1. Parses the QR code data as JSON to extract the token
2. Sends a POST request to `/api/scan` with the token
3. Processes the response and calls `onScanSuccess` or `onScanError`
4. Implements a 2-second cooldown to prevent duplicate scans

### Error Handling

The component handles several error scenarios:

- **Camera Permission Denied**: Shows a permission request screen with retry button
- **Invalid QR Code**: Calls `onScanError` with appropriate message
- **Network Errors**: Catches and reports API call failures
- **Malformed QR Data**: Handles JSON parsing errors gracefully

### Mobile Optimization

- Uses `facingMode: 'environment'` to prefer back camera on mobile devices
- Responsive design that adapts to different screen sizes
- Large touch targets for accessibility (44x44 pixels minimum)
- Optimized scanning box size (250x250 pixels)

## Camera Settings

```typescript
{
  facingMode: 'environment', // Use back camera
  fps: 10,                   // 10 frames per second
  qrbox: { width: 250, height: 250 } // Scanning area
}
```

## Styling

The component includes inline styles for:
- Scanner container with rounded corners and shadow
- Scanning indicator with pulse animation
- Permission denied screen with retry button
- Mobile-responsive layout
- Visual feedback for scanning status

## Requirements Validation

This component validates the following requirements:

- **Requirement 4.1**: Provides mobile-friendly QR code scanner interface
- **Requirement 4.2**: Extracts token and sends to backend for validation
- **Requirement 8.6**: Immediately activates QR scanner when loaded

## Browser Compatibility

Requires browsers that support:
- `navigator.mediaDevices.getUserMedia()` (camera access)
- ES6+ JavaScript features
- Modern CSS (flexbox, animations)

Tested on:
- Chrome/Edge (desktop and mobile)
- Safari (iOS)
- Firefox (desktop and mobile)

## Performance Considerations

- Scanner runs at 10 FPS to balance responsiveness and battery usage
- 2-second cooldown prevents duplicate API calls
- Cleanup on unmount prevents memory leaks
- Efficient re-rendering with React hooks

## Accessibility

- Clear visual indicators for scanning status
- User-friendly error messages
- Retry mechanism for permission errors
- Large touch targets for mobile users
