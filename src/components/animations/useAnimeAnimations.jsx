import { useEffect, useRef } from 'react';
import anime from 'animejs';

// Stagger fade in animation for lists
export function useStaggerFadeIn(selector, dependencies = []) {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      anime({
        targets: selector,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 300,
        delay: anime.stagger(40),
        easing: 'easeOutQuart'
      });
    }
  }, dependencies);
}

// Bounce animation for buttons
export function useBounceOnClick(ref) {
  const animate = () => {
    if (ref.current) {
      anime({
        targets: ref.current,
        scale: [1, 0.92, 1.05, 1],
        duration: 200,
        easing: 'easeInOutQuad'
      });
    }
  };
  return animate;
}

// Pulse animation for elements
export function usePulse(ref, active = false) {
  useEffect(() => {
    if (ref.current && active) {
      anime({
        targets: ref.current,
        scale: [1, 1.05, 1],
        duration: 400,
        loop: true,
        easing: 'easeInOutSine'
      });
    }
  }, [active]);
}

// Slide in from right (RTL friendly)
export function useSlideInRight(ref, show = true) {
  useEffect(() => {
    if (ref.current && show) {
      anime({
        targets: ref.current,
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 250,
        easing: 'easeOutQuart'
      });
    }
  }, [show]);
}

// Glow effect for gold elements
export function useGoldGlow(ref) {
  useEffect(() => {
    if (ref.current) {
      anime({
        targets: ref.current,
        boxShadow: [
          '0 0 10px rgba(255, 211, 106, 0.3)',
          '0 0 25px rgba(255, 211, 106, 0.6)',
          '0 0 10px rgba(255, 211, 106, 0.3)'
        ],
        duration: 1200,
        loop: true,
        easing: 'easeInOutSine'
      });
    }
  }, []);
}

// Card entrance animation
export function animateCardEntrance(selector) {
  anime({
    targets: selector,
    opacity: [0, 1],
    translateY: [40, 0],
    rotateX: [15, 0],
    duration: 350,
    delay: anime.stagger(50),
    easing: 'easeOutBack'
  });
}

// Button press animation
export function animateButtonPress(element) {
  anime({
    targets: element,
    scale: [1, 0.95, 1],
    duration: 100,
    easing: 'easeInOutQuad'
  });
}

// Success checkmark animation
export function animateSuccess(selector) {
  anime({
    targets: selector,
    scale: [0, 1.2, 1],
    opacity: [0, 1],
    rotate: ['-45deg', '0deg'],
    duration: 400,
    easing: 'easeOutElastic(1, .5)'
  });
}

// Shake animation for errors
export function animateShake(element) {
  anime({
    targets: element,
    translateX: [0, -10, 10, -10, 10, 0],
    duration: 250,
    easing: 'easeInOutQuad'
  });
}

// Floating animation
export function useFloating(ref) {
  useEffect(() => {
    if (ref.current) {
      anime({
        targets: ref.current,
        translateY: [-5, 5, -5],
        duration: 1500,
        loop: true,
        easing: 'easeInOutSine'
      });
    }
  }, []);
}

// Page transition
export function animatePageTransition(selector) {
  anime({
    targets: selector,
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 250,
    easing: 'easeOutQuart'
  });
}

// Ripple effect
export function createRipple(event, color = 'rgba(255, 211, 106, 0.4)') {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size = Math.max(rect.width, rect.height);
  
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
  ripple.style.position = 'absolute';
  ripple.style.borderRadius = '50%';
  ripple.style.backgroundColor = color;
  ripple.style.pointerEvents = 'none';
  ripple.style.transform = 'scale(0)';
  
  button.style.position = 'relative';
  button.style.overflow = 'hidden';
  button.appendChild(ripple);
  
  anime({
    targets: ripple,
    scale: [0, 2.5],
    opacity: [1, 0],
    duration: 300,
    easing: 'easeOutQuart',
    complete: () => ripple.remove()
  });
}

export default anime;