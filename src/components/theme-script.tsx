import React from "react";

// This script component prevents flashing of wrong theme on load
export function ThemeScript() {
  const code = `
    (function() {
      try {
        // Try to get stored theme
        const theme = localStorage.getItem('theme') || 'system';
        
        // Check for system preference
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          document.documentElement.classList.add(systemTheme);
          return;
        }
        
        // Apply stored theme
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {
        // If error (like in SSR or localStorage not available), do nothing
        console.error(e);
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
} 