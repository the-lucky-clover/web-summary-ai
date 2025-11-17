/**
 * Web Summarizer AI - Theme Management System
 * Retro Green Theme Switching with Animation Support
 * Date: November 6, 2025
 */

class RetroThemeManager {
  constructor() {
    this.themes = ['light', 'dark', 'system'];
    this.currentTheme = 'system';
    this.animations = {
      fadeInScale: 'animate-fade-in',
      materialize: 'animate-materialize',
      slideUp: 'animate-slide-up'
    };
    
    this.init();
  }

  init() {
    this.loadSavedTheme();
    this.setupEventListeners();
    this.initializeAnimations();
    this.createThemeSelector();
  }

  loadSavedTheme() {
    const savedTheme = localStorage.getItem('wb-summarizer-theme') || 'system';
    this.setTheme(savedTheme);
  }

  setTheme(theme) {
    if (!this.themes.includes(theme)) {
      theme = 'system';
    }

    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wb-summarizer-theme', theme);
    
    // Update theme selector if it exists
    this.updateThemeSelector();
    
    // Emit custom event for theme change
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: theme } 
    }));
  }

  getTheme() {
    return this.currentTheme;
  }

  cycleTheme() {
    const currentIndex = this.themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.setTheme(this.themes[nextIndex]);
  }

  setupEventListeners() {
    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.currentTheme === 'system') {
          // Force re-render when system theme changes
          this.setTheme('system');
        }
      });
    }
  }

  createThemeSelector() {
    const selector = document.createElement('div');
    selector.className = 'theme-selector animate-delay-2';
    selector.innerHTML = `
      <div class="theme-option" data-theme="light">Light</div>
      <div class="theme-option" data-theme="dark">Dark</div>
      <div class="theme-option" data-theme="system">System</div>
    `;

    // Add click event listeners
    selector.querySelectorAll('.theme-option').forEach(option => {
      option.addEventListener('click', () => {
        const theme = option.getAttribute('data-theme');
        this.setTheme(theme);
      });
    });

    return selector;
  }

  updateThemeSelector() {
    const options = document.querySelectorAll('.theme-option');
    options.forEach(option => {
      const theme = option.getAttribute('data-theme');
      option.classList.toggle('active', theme === this.currentTheme);
    });
  }

  initializeAnimations() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.applyInitialAnimations();
      });
    } else {
      this.applyInitialAnimations();
    }
  }

  applyInitialAnimations() {
    // Add animation classes to components as they load
    this.animateComponents();
    this.setupWildstyleLogo();
  }

  animateComponents() {
    // Animate main components with staggered delays
    const components = [
      { selector: 'body', animation: 'animate-fade-in', delay: 0 },
      { selector: '.extension-popup', animation: 'animate-materialize', delay: 1 },
      { selector: '.summary-panel', animation: 'animate-slide-up', delay: 2 },
      { selector: '.options-container', animation: 'animate-materialize', delay: 3 },
      { selector: '.floating-button', animation: 'animate-fade-in', delay: 4 },
      { selector: '.youtube-controls', animation: 'animate-slide-up', delay: 5 }
    ];

    components.forEach(({ selector, animation, delay }) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.classList.add(animation, `animate-delay-${delay}`);
      });
    });
  }

  setupWildstyleLogo() {
    // Wildstyle logo disabled for web extensions
    // Reserved for native mobile app loading screens
    // Use createWildstyleLogo() method in mobile apps
  }

  createWildstyleLogo() {
    const container = document.createElement('div');
    container.className = 'wildstyle-logo-container animate-materialize animate-delay-1';
    
    // Compressed one-line wildstyle version
    const logo = document.createElement('div');
    logo.className = 'wildstyle-logo';
    logo.innerHTML = `██╗    ██╗███████╗██████╗     ███████╗██╗   ██╗███╗   ███╗███╗   ███╗ █████╗ ██████╗ ██╗███████╗███████╗██████╗     █████╗ ██╗`;
    
    container.appendChild(logo);
    return container;
  }

  // Animation utilities for components
  animateElement(element, animationType = 'materialize', delay = 0) {
    if (!element) return;
    
    element.classList.add(`animate-${animationType}`);
    if (delay > 0) {
      element.classList.add(`animate-delay-${delay}`);
    }
  }

  // Utility to add theme-aware styling to new elements
  styleElement(element, styles = {}) {
    if (!element) return;
    
    Object.assign(element.style, {
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      border: '2px solid var(--border)',
      borderRadius: '4px',
      padding: '8px',
      fontFamily: '"Courier New", monospace',
      ...styles
    });
  }

  // Add retro button styling
  createRetroButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'retro-button animate-materialize';
    button.addEventListener('click', onClick);
    return button;
  }
}

// Initialize theme manager
let retroTheme;

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      retroTheme = new RetroThemeManager();
      window.retroTheme = retroTheme; // Make globally accessible
    });
  } else {
    retroTheme = new RetroThemeManager();
    window.retroTheme = retroTheme;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RetroThemeManager;
}