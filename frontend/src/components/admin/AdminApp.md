# AdminApp Component

The main Admin App component that integrates all admin functionality for the Event Check-In System.

## Purpose

Provides a complete mobile-friendly interface for event administrators to:
- Scan student QR codes
- View student information and organization involvements
- See claim status for t-shirts and meal coupons
- Mark items as distributed
- Handle errors gracefully

## Features

### QR Code Scanning
- Automatically activates camera on load
- Continuous scanning mode
- Extracts token from QR code and validates with backend
- Handles camera permission errors

### Student Information Display
- Shows student name, ID, t-shirt size, and meal preference
- Displays all organization involvements in a structured format
- Clear visual hierarchy optimized for quick scanning

### Claim Management
- Visual status indicators for claimed/unclaimed items
- Interactive checkboxes to mark items as distributed
- Prevents duplicate claims with disabled state
- Real-time updates after claim submission

### Error Handling
- Displays user-friendly error messages
- Handles invalid QR codes
- Manages duplicate claim attempts
- Provides retry options for camera permissions

### Mobile Optimization
- Responsive layout for all screen sizes
- Large touch targets (minimum 44x44 pixels)
- Optimized for portrait and landscape modes
- Smooth animations and transitions

## State Management

The component manages:
- `scannedData`: Current student information, claims, and token
- `error`: Error messages to display
- `scanCount`: Number of successful scans (for tracking)

## User Flow

1. **Initial State**: QR scanner is active and ready
2. **Scan QR Code**: Camera captures and validates QR code
3. **Display Student**: Shows student info, claim status, and checkboxes
4. **Mark Claims**: Administrator checks boxes to mark items as distributed
5. **Scan Another**: Returns to scanner for next student

## Requirements Validated

- **4.1**: Mobile-friendly QR code scanner interface
- **4.2**: QR code scanning and token extraction
- **4.4**: Display student information after validation
- **5.1**: Show claim status for items
- **6.1, 6.2, 6.3**: Checkboxes for marking distribution
- **7.3**: Disable checkboxes for already-claimed items
- **8.4**: Mobile-optimized layout
- **8.6**: Immediate scanner activation

## Usage

```tsx
import AdminApp from './components/admin/AdminApp';

// In your router
<Route path="/admin" element={<AdminApp />} />
```

## Testing

Comprehensive unit tests cover:
- Initial render and layout
- QR scanning success and error flows
- Student information display
- Claim status updates
- Error handling and dismissal
- Scan counter functionality
- Mobile-friendly structure

Run tests:
```bash
npm test -- AdminApp.test.tsx
```

## Accessibility

- Semantic HTML structure
- ARIA labels for status updates
- Keyboard navigation support
- High contrast visual indicators
- Clear error messages

## Performance

- Efficient state updates
- Debounced QR scanning to prevent duplicate processing
- Optimized re-renders with proper component structure
- Smooth animations with CSS transitions
