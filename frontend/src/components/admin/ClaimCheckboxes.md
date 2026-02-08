# ClaimCheckboxes Component

## Overview

The `ClaimCheckboxes` component provides an interactive interface for administrators to mark t-shirts and meal coupons as distributed to students. It handles the claim recording process, including loading states, error handling, and success feedback.

## Features

- **Two Checkboxes**: One for t-shirt distribution, one for meal coupon distribution
- **Disabled State**: Checkboxes are automatically disabled for already-claimed items
- **Loading State**: Visual loading indicator during API submission
- **Error Handling**: Displays clear error messages for various failure scenarios
- **Success Feedback**: Shows confirmation message when items are successfully claimed
- **Mobile-Optimized**: Large touch targets (minimum 44x44 pixels) for mobile devices
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## Props

```typescript
interface ClaimCheckboxesProps {
  token: string;              // QR code token for the student
  claims: ClaimStatus;        // Current claim status
  onClaimUpdate: (updatedClaims: ClaimStatus) => void;  // Callback when claims are updated
}

interface ClaimStatus {
  tshirtClaimed: boolean;
  mealClaimed: boolean;
}
```

## Usage

```tsx
import ClaimCheckboxes from './components/admin/ClaimCheckboxes';

function AdminApp() {
  const [claims, setClaims] = useState({
    tshirtClaimed: false,
    mealClaimed: false
  });

  const handleClaimUpdate = (updatedClaims) => {
    setClaims(updatedClaims);
  };

  return (
    <ClaimCheckboxes
      token="abc123..."
      claims={claims}
      onClaimUpdate={handleClaimUpdate}
    />
  );
}
```

## Behavior

### Claiming Items

1. When an unchecked checkbox is clicked, the component:
   - Shows a loading spinner on that checkbox
   - Sends a POST request to `/api/claim` with the token and item type
   - Disables the checkbox during the request

2. On success:
   - Updates the claim status via the `onClaimUpdate` callback
   - Shows a success message (auto-dismisses after 3 seconds)
   - Checkbox becomes checked and permanently disabled

3. On error:
   - Shows an error message with dismiss button
   - Checkbox returns to unchecked state
   - User can retry the operation

### Error Scenarios

- **409 Conflict**: "This item has already been claimed."
- **404 Not Found**: "Invalid QR code. Please scan again."
- **Network Error**: "Network error. Please check your connection and try again."
- **Other Errors**: Displays the error message from the API response

### Disabled State

Checkboxes are disabled when:
- The item has already been claimed (permanent)
- A claim request is in progress (temporary)

Once an item is claimed, it cannot be unclaimed (checkboxes are read-only for claimed items).

## API Integration

The component calls the `/api/claim` endpoint:

**Request:**
```json
{
  "token": "string",
  "itemType": "tshirt" | "meal"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "claims": {
    "tshirtClaimed": boolean,
    "mealClaimed": boolean
  }
}
```

**Error Response (409/404/500):**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Styling

The component uses inline styles with:
- Mobile-first responsive design
- Gradient backgrounds for claimed items
- Smooth animations for state transitions
- Large touch targets for mobile (60px minimum height)
- Hover effects on desktop only
- Focus indicators for keyboard navigation

## Accessibility

- Proper `<label>` elements associated with checkboxes
- ARIA `role="status"` for success messages
- ARIA `role="alert"` for error messages (via ErrorMessage component)
- Keyboard navigation support
- Focus indicators on checkbox elements
- Disabled state properly communicated to screen readers

## Requirements Validation

This component satisfies the following requirements:

- **6.1**: Provides checkboxes for marking t-shirt and meal coupon distribution
- **6.2**: Sends update request to backend when t-shirt checkbox is checked
- **6.3**: Sends update request to backend when meal coupon checkbox is checked
- **7.3**: Displays warning message when duplicate claim is attempted
- **7.4**: Disables checkboxes for items that are already claimed
- **7.5**: Displays message when both items are already claimed (via ClaimStatusDisplay)
- **8.5**: Uses large touch targets (minimum 44x44 pixels) for mobile devices

## Related Components

- **ClaimStatusDisplay**: Shows read-only claim status with visual indicators
- **ErrorMessage**: Reusable error display component
- **StudentInfoCard**: Displays student information alongside claim checkboxes
