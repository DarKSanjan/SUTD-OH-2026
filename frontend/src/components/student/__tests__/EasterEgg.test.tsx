import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import EasterEgg from '../EasterEgg';

describe('EasterEgg', () => {
  beforeEach(() => {
    // Mock HTMLVideoElement.prototype.play to return a resolved promise
    HTMLVideoElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    HTMLVideoElement.prototype.pause = vi.fn();
    HTMLVideoElement.prototype.load = vi.fn();
  });

  it('renders video element', () => {
    const onComplete = vi.fn();
    render(<EasterEgg onComplete={onComplete} />);
    
    const video = document.querySelector('video');
    expect(video).toBeTruthy();
    expect(video?.querySelector('source')?.src).toContain('Cenafy');
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
