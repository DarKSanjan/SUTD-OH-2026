import { useState } from 'react';
import ClaimCheckboxes from './ClaimCheckboxes';

/**
 * Example 1: Unclaimed Items
 * Shows checkboxes for a student who hasn't claimed any items yet
 */
export function UnclaimedItemsExample() {
  const [claims, setClaims] = useState({
    tshirtClaimed: false,
    mealClaimed: false
  });

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px' }}>
      <h2>Example 1: Unclaimed Items</h2>
      <p>Both items are available to claim</p>
      <ClaimCheckboxes
        token="example_token_123"
        claims={claims}
        onClaimUpdate={setClaims}
      />
    </div>
  );
}

/**
 * Example 2: Partially Claimed
 * Shows checkboxes when t-shirt is claimed but meal coupon is not
 */
export function PartiallyClaimed() {
  const [claims, setClaims] = useState({
    tshirtClaimed: true,
    mealClaimed: false
  });

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px' }}>
      <h2>Example 2: Partially Claimed</h2>
      <p>T-shirt already claimed, meal coupon available</p>
      <ClaimCheckboxes
        token="example_token_456"
        claims={claims}
        onClaimUpdate={setClaims}
      />
    </div>
  );
}

/**
 * Example 3: All Items Claimed
 * Shows checkboxes when both items have been claimed
 */
export function AllItemsClaimed() {
  const [claims, setClaims] = useState({
    tshirtClaimed: true,
    mealClaimed: true
  });

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px' }}>
      <h2>Example 3: All Items Claimed</h2>
      <p>Both items have been claimed</p>
      <ClaimCheckboxes
        token="example_token_789"
        claims={claims}
        onClaimUpdate={setClaims}
      />
    </div>
  );
}

/**
 * Example 4: Interactive Demo
 * Fully interactive example with state management
 */
export function InteractiveDemo() {
  const [claims, setClaims] = useState({
    tshirtClaimed: false,
    mealClaimed: false
  });

  const handleReset = () => {
    setClaims({
      tshirtClaimed: false,
      mealClaimed: false
    });
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px' }}>
      <h2>Example 4: Interactive Demo</h2>
      <p>Try checking the boxes to claim items</p>
      
      <ClaimCheckboxes
        token="demo_token"
        claims={claims}
        onClaimUpdate={setClaims}
      />

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          onClick={handleReset}
          style={{
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Reset Claims
        </button>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <strong>Current State:</strong>
        <pre style={{ marginTop: '10px' }}>
          {JSON.stringify(claims, null, 2)}
        </pre>
      </div>
    </div>
  );
}

/**
 * Example 5: Mobile View
 * Shows how the component looks on mobile devices
 */
export function MobileViewExample() {
  const [claims, setClaims] = useState({
    tshirtClaimed: false,
    mealClaimed: true
  });

  return (
    <div style={{ 
      maxWidth: '375px', 
      margin: '20px auto', 
      padding: '16px',
      border: '2px solid #ddd',
      borderRadius: '12px'
    }}>
      <h2 style={{ fontSize: '18px' }}>Example 5: Mobile View</h2>
      <p style={{ fontSize: '14px' }}>Simulated mobile device (375px width)</p>
      <ClaimCheckboxes
        token="mobile_token"
        claims={claims}
        onClaimUpdate={setClaims}
      />
    </div>
  );
}

// Export all examples as a single component for easy viewing
export default function ClaimCheckboxesExamples() {
  return (
    <div style={{ padding: '40px 20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>
        ClaimCheckboxes Component Examples
      </h1>
      
      <UnclaimedItemsExample />
      <PartiallyClaimed />
      <AllItemsClaimed />
      <InteractiveDemo />
      <MobileViewExample />
    </div>
  );
}
