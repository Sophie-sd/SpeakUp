(function() {
  try {
    const autoMode = localStorage.getItem('speakup-theme-auto');
    const isAuto = autoMode !== 'false';
    
    let theme;
    
    if (isAuto) {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Europe/Kyiv',
          hour: '2-digit',
          hour12: false
        });
        const now = new Date();
        const kievTimeString = formatter.format(now);
        const hours = parseInt(kievTimeString.split(':')[0], 10);
        
        theme = (hours >= 7 && hours < 18) ? 'light' : 'dark';
      } catch (e) {
        theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      }
    } else {
      const storedTheme = localStorage.getItem('speakup-theme');
      if (storedTheme) {
        theme = storedTheme;
      } else {
        try {
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Europe/Kyiv',
            hour: '2-digit',
            hour12: false
          });
          const now = new Date();
          const kievTimeString = formatter.format(now);
          const hours = parseInt(kievTimeString.split(':')[0], 10);
          theme = (hours >= 7 && hours < 18) ? 'light' : 'dark';
        } catch (e) {
          theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        }
      }
    }
    
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) {
    // Ігнорувати помилки localStorage
  }
})();







