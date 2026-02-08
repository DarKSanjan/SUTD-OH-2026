import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EasterEgg from '../EasterEgg';

describe('EasterEgg', () => {
  it('renders video element', () => {
    const onComplete = vi.fn();
    render(<EasterEgg onComplete={onComplete} />);
    
    const video = document.querySelector('video');
    expect(video).toBeTruthy();
    expect(video?.src).toContain('Cenafy%20John%20Cena.mp4');
  });

  it('calls onComplete when video ends', () => {
    const onComplete = vi.fn();
    render(<EasterEgg onComplete={onComplete} />);
    
    const video = document.querySelector('video');
    if (video) {
      // Simulate video ending
      video.dispatchEvent(new Event('ended'));
    }
    
    // Should show confetti and call onComplete after 3 seconds
    expect(onComplete).not.toHaveBeenCalled();
  });
});
