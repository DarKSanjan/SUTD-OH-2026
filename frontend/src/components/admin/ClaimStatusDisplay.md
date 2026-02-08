# ClaimStatusDisplay Component

## Overview

The `ClaimStatusDisplay` component displays the claim status for t-shirt and meal coupon items in a visually clear and mobile-friendly format. It uses color coding and icons to distinguish between claimed and unclaimed items, making it easy for administrators to see at a glance what items a student has already received.

## Purpose

This component is used in the Admin App to show administrators which items (t-shirt and meal coupon) a student has already claimed. This helps prevent duplicate distributions and ensures accurate tracking of item distribution at the event.

## Props

```typescript
interface ClaimStatus {
  tshirtClaimed: boolean;
  mealClaimed: boolean;
}

interface ClaimStatusDisplayProps {
  claims: ClaimStatus;
}
```

### `claims` (required)
- **Type**: `ClaimStatus`
- **Description**: Object containing the claim status for both items
  - `tshirtClaimed`: Boolean indicating if the t-shirt has been claimed
  - `mealClaimed`: Boolean indicating if the meal coupon has been claimed

## Usage

```tsx
import { ClaimStatusDisplay } from '@/components/admin';

function AdminApp() {
  const claims = {
    tshirtClaimed: true,
    mealClaimed: false,
  };

  return <ClaimStatusDisplay claims={claims} />;
}
```

## Features

### Visual Indicators

**Unclaimed Items**:
- Gray color scheme
- Empty circle icon
- "Available" status text
- Subtle gray background

**Claimed Items**:
- Green color scheme
- Checkmark icon with animation
- "Claimed" status text
- Green gradient background

### All Items Claimed Message
When both items are claimed, a special message appears: "✓ All items have been claimed"

### Mobile Optimization
- **Responsive Design**: Adapts to different screen sizes (320px to 768px+)
- **Touch-Friendly**: Minimum 60px height for status items on touch devices
- **Clear Typography**: Font sizes adjust for readability on mobile
- **Smooth Animations**: Checkmark appears with a subtle scale animation

### Accessibility
- **High Contrast**: Clear color distinction between claimed and unclaimed states
- **Semantic Structure**: Proper heading hierarchy
- **Icon + Text**: Both visual and textual indicators for status
- **Readable Text**: Clear font sizes and weights

## Design Specifications

### Colors

**Unclaimed State**:
- Background: Linear gradient from #f8f9fa to #e9ecef
- Border: #dee2e6
- Icon: #6c757d (gray)
- Text: #6c757d (gray)
- Badge Background: rgba(108, 117, 125, 0.1)

**Claimed State**:
- Background: Linear gradient from #d4edda to #c3e6cb
- Border: #28a745 (green)
- Icon: #28a745 (green)
- Text: #28a745 (green)
- Badge Background: rgba(40, 167, 69, 0.15)

**All Claimed Message**:
- Background: Linear gradient from #d4edda to #c3e6cb
- Border: #28a745 (green)
- Text: #155724 (dark green)

### Typography
- **Title**: 18px (mobile: 16px), bold (700)
- **Status Label**: 16px (mobile: 14px), semi-bold (600)
- **Status Value**: 15px (mobile: 13px), bold (700)
- **All Claimed Message**: 15px (mobile: 13px), bold (700)

### Spacing
- **Container Gap**: 12px between status items
- **Item Padding**: 16px (mobile: 12px)
- **Icon Size**: 40px (mobile: 32px)
- **Icon Margin**: 16px right (mobile: 12px)
- **Border Radius**: 8px for items, 6px for badges

### Animations
- **Checkmark Appear**: Scale animation from 0 to 1.2 to 1 over 0.3s
- **Hover Effect** (desktop): Translate up 2px with shadow on hover

## Requirements Validation

This component satisfies the following requirements:

- **Requirement 5.1**: Displays current claim status for t-shirt and meal coupon after QR scan
- **Requirement 5.3**: Displays items as available when not claimed
- **Requirement 5.4**: Displays items as already claimed when claimed
- **Requirement 5.5**: Visually distinguishes between claimed and unclaimed items using colors, icons, and text

## Visual States

### State 1: Both Items Available
```
┌─────────────────────────────────┐
│      Claim Status               │
├─────────────────────────────────┤
│ ○  T-Shirt        [Available]   │
│ ○  Meal Coupon    [Available]   │
└─────────────────────────────────┘
```

### State 2: T-Shirt Claimed, Meal Available
```
┌─────────────────────────────────┐
│      Claim Status               │
├─────────────────────────────────┤
│ ✓  T-Shirt        [Claimed]     │
│ ○  Meal Coupon    [Available]   │
└─────────────────────────────────┘
```

### State 3: Both Items Claimed
```
┌─────────────────────────────────┐
│      Claim Status               │
├─────────────────────────────────┤
│ ✓  T-Shirt        [Claimed]     │
│ ✓  Meal Coupon    [Claimed]     │
├─────────────────────────────────┤
│ ✓ All items have been claimed   │
└─────────────────────────────────┘
```

## Testing

The component includes comprehensive unit tests covering:
- Rendering of both claim statuses
- Visual distinction between claimed and unclaimed states
- Display of "all claimed" message when both items are claimed
- Proper icon rendering (checkmark vs circle)
- Correct status text ("Claimed" vs "Available")

Run tests with:
```bash
npm test -- ClaimStatusDisplay.test.tsx
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design works on screens from 320px to 1920px+
- CSS animations supported in all modern browsers

## Related Components

- **StudentInfoCard**: Displays student information and can include this component
- **ClaimCheckboxes**: Allows administrators to mark items as claimed
- **QRScanner**: Scans QR codes and retrieves claim status

## Integration Example

```tsx
import { StudentInfoCard, ClaimStatusDisplay } from '@/components/admin';

function AdminView({ student, claims }) {
  return (
    <div>
      <StudentInfoCard student={student} />
      <ClaimStatusDisplay claims={claims} />
    </div>
  );
}
```

## Performance Considerations

- **Lightweight**: No external dependencies
- **CSS-in-JS**: Scoped styles prevent conflicts
- **Smooth Animations**: Hardware-accelerated transforms
- **Minimal Re-renders**: Pure component with simple props
