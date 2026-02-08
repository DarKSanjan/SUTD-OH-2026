import ClaimStatusDisplay from './ClaimStatusDisplay';

/**
 * Example usage of ClaimStatusDisplay component
 * 
 * This file demonstrates different states of the ClaimStatusDisplay component
 * for documentation and testing purposes.
 */

// Example 1: Both items available (not claimed)
export function BothAvailableExample() {
  const claims = {
    tshirtClaimed: false,
    mealClaimed: false,
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2>Example 1: Both Items Available</h2>
      <ClaimStatusDisplay claims={claims} />
    </div>
  );
}

// Example 2: T-shirt claimed, meal available
export function TShirtClaimedExample() {
  const claims = {
    tshirtClaimed: true,
    mealClaimed: false,
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2>Example 2: T-Shirt Claimed</h2>
      <ClaimStatusDisplay claims={claims} />
    </div>
  );
}

// Example 3: Meal claimed, t-shirt available
export function MealClaimedExample() {
  const claims = {
    tshirtClaimed: false,
    mealClaimed: true,
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2>Example 3: Meal Coupon Claimed</h2>
      <ClaimStatusDisplay claims={claims} />
    </div>
  );
}

// Example 4: Both items claimed
export function BothClaimedExample() {
  const claims = {
    tshirtClaimed: true,
    mealClaimed: true,
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2>Example 4: Both Items Claimed</h2>
      <ClaimStatusDisplay claims={claims} />
    </div>
  );
}

// Example 5: Integrated with student card
export function IntegratedExample() {
  const claims = {
    tshirtClaimed: true,
    mealClaimed: false,
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2>Example 5: Integrated View</h2>
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 8px 0' }}>John Doe</h3>
          <p style={{ margin: '0', color: '#666' }}>Student ID: S12345</p>
        </div>
        <ClaimStatusDisplay claims={claims} />
      </div>
    </div>
  );
}

// Example 6: Mobile view simulation
export function MobileViewExample() {
  const claims = {
    tshirtClaimed: false,
    mealClaimed: true,
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '375px', 
      margin: '0 auto',
      background: '#f5f5f5'
    }}>
      <h2 style={{ fontSize: '16px' }}>Example 6: Mobile View</h2>
      <ClaimStatusDisplay claims={claims} />
    </div>
  );
}

// Default export showing all examples
export default function ClaimStatusDisplayExamples() {
  return (
    <div style={{ padding: '40px', background: '#f8f9fa' }}>
      <h1>ClaimStatusDisplay Component Examples</h1>
      
      <div style={{ display: 'grid', gap: '40px', marginTop: '40px' }}>
        <BothAvailableExample />
        <TShirtClaimedExample />
        <MealClaimedExample />
        <BothClaimedExample />
        <IntegratedExample />
        <MobileViewExample />
      </div>
    </div>
  );
}
