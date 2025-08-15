/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Background colors
        bg: {
          primary: '#101626',    // Very dark blue/black
          secondary: '#1a2332',  // Lighter dark blue for better readability
          tertiary: '#2a3441',   // Even lighter for elevated cards
        },
        // Light mode background colors
        'bg-light': {
          primary: '#f8fafc',    // Very light gray/blue
          secondary: '#f1f5f9',  // Light gray for cards
          tertiary: '#e2e8f0',   // Slightly darker for elevated cards
        },
        // Primary accent colors (Teal/Cyan)
        primary: {
          50: '#e6f7f8',
          100: '#b3e8ea',
          200: '#80d9dc',
          300: '#4dcace',
          400: '#13c4c3',    // Main neon accent
          500: '#1a6b9f',    // Primary UI
          600: '#1a5a8f',
          700: '#1a497f',
          800: '#1a386f',
          900: '#1a275f',
        },
        // Secondary accent colors (Fuchsia/Magenta)
        secondary: {
          50: '#fce6f3',
          100: '#f7b3d9',
          200: '#f280bf',
          300: '#ed4da5',
          400: '#e846a8',    // Data viz accent
          500: '#d633a8',
          600: '#c63398',
          700: '#b63388',
          800: '#a63378',
          900: '#963368',
        },
        // Neutral colors
        neutral: {
          50: '#ffffff',
          100: '#f8f9fa',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
        // Semantic colors
        success: '#00ff88',
        warning: '#ffaa00',
        error: '#ff0040',
        info: '#13c4c3',
        // Special effects colors
        glow: {
          primary: '#13c4c3',
          secondary: '#e846a8',
          white: '#ffffff',
        },
        shadow: {
          primary: '#1a6b9f',
          secondary: '#d633a8',
        }
      },
      // Custom glow effects
      boxShadow: {
        'glow-primary': '0 0 20px rgba(19, 196, 195, 0.5)',
        'glow-secondary': '0 0 20px rgba(232, 70, 168, 0.5)',
        'glow-white': '0 0 20px rgba(255, 255, 255, 0.3)',
      },
      // Custom gradients
      backgroundImage: {
        'cyberpunk-gradient': 'linear-gradient(135deg, #101626 0%, #222a7f 50%, #362350 100%)',
        'neon-gradient': 'linear-gradient(135deg, #13c4c3 0%, #e846a8 100%)',
        'light-gradient': 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      }
    },
  },
  plugins: [],
} 