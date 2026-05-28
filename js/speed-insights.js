// Vercel Speed Insights initialization
// Using inline code since this is a static site without a build process
// Based on @vercel/speed-insights package

(function() {
  // Only run in browser and production environments
  if (typeof window === 'undefined') return;
  
  // Initialize the queue
  if (!window.si) {
    window.si = function() {
      (window.siq = window.siq || []).push(arguments);
    };
  }
  
  // Inject the Speed Insights script
  const script = document.createElement('script');
  script.src = '/_vercel/speed-insights/script.js';
  script.defer = true;
  script.dataset.sdkn = '@vercel/speed-insights';
  script.dataset.sdkv = '2.0.0';
  
  script.onerror = function() {
    console.log('[Vercel Speed Insights] Failed to load script. Please check if any content blockers are enabled.');
  };
  
  document.head.appendChild(script);
})();
