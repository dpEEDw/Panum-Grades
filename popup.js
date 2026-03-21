// Minoshek built this with help from AI.

document.addEventListener("DOMContentLoaded", function() {
  const storage = browser.storage.local;
  const darkThemeSetting = {
    id: 'switch-dark-theme',
    storageKey: 'themeEnabled_dark',
    default: true
  };

  const buttonSettings = {
    pluspoints: {
      id: 'switch-pluspoints',
      storageKey: 'buttonEnabled_pluspoints',
      buttonId: 'pluspoints-overlay-btn',
      default: true
    },
    calculator: {
      id: 'switch-calculator',
      storageKey: 'buttonEnabled_calculator',
      buttonId: 'notenrechner-calc-btn',
      default: true
    },
    custom: {
      id: 'switch-custom',
      storageKey: 'buttonEnabled_custom',
      buttonId: 'notenrechner-custom-btn',
      default: true
    },
    improvement: {
      id: 'switch-improvement',
      storageKey: 'buttonEnabled_improvement',
      buttonId: 'improvement-overlay-btn',
      default: true
    },
    achievements: {
      id: 'switch-achievements',
      storageKey: 'buttonEnabled_achievements',
      buttonId: 'gamification-overlay-btn',
      default: true
    }
  };

  function loadSettings() {
    const keys = Object.values(buttonSettings).map(setting => setting.storageKey);
    keys.push(darkThemeSetting.storageKey);
    
    storage.get(keys).then((result) => {
      Object.entries(buttonSettings).forEach(([key, setting]) => {
        const switchElement = document.getElementById(setting.id);
        const isEnabled = result[setting.storageKey] !== undefined ? result[setting.storageKey] : setting.default;
        
        if (switchElement) {
          switchElement.checked = isEnabled;
          
          try {
            localStorage.setItem(setting.storageKey, isEnabled.toString());
          } catch (error) {
            console.warn('Could not sync to localStorage:', error);
          }
          
          updateButtonVisibility(setting, isEnabled);
        }
      });

      const darkThemeSwitch = document.getElementById(darkThemeSetting.id);
      if (darkThemeSwitch) {
        const isDarkThemeEnabled = result[darkThemeSetting.storageKey] !== undefined
          ? result[darkThemeSetting.storageKey]
          : darkThemeSetting.default;
        darkThemeSwitch.checked = isDarkThemeEnabled;
        applyThemeOnCurrentTab(isDarkThemeEnabled);
      }
    });
  }

  function saveThemeAndUpdatePage(isEnabled) {
    storage.set({ [darkThemeSetting.storageKey]: isEnabled });

    try {
      localStorage.setItem(darkThemeSetting.storageKey, isEnabled.toString());
    } catch (error) {
      console.warn('Could not save theme setting to localStorage:', error);
    }

    applyThemeOnCurrentTab(isEnabled);
  }

  function applyThemeOnCurrentTab(isEnabled) {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0]) {
        browser.tabs.sendMessage(tabs[0].id, {
          action: 'toggleTheme',
          enabled: isEnabled
        }).catch((error) => {
          console.warn('Could not communicate theme change to content script:', error);
        });
      }
    });
  }

  function saveSettingAndUpdateButton(setting, isEnabled) {
    storage.set({ [setting.storageKey]: isEnabled });
    
    try {
      localStorage.setItem(setting.storageKey, isEnabled.toString());
    } catch (error) {
      console.warn('Could not save to localStorage:', error);
    }
    
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0]) {
        browser.tabs.sendMessage(tabs[0].id, {
          action: 'toggleButton',
          buttonId: setting.buttonId,
          enabled: isEnabled
        }).catch((error) => {
          console.warn('Could not communicate with content script:', error);
        });
      }
    });
  }

  function updateButtonVisibility(setting, isEnabled) {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0]) {
        browser.tabs.sendMessage(tabs[0].id, {
          action: 'toggleButton',
          buttonId: setting.buttonId,
          enabled: isEnabled
        }).catch((error) => {
          console.warn('Could not communicate with content script:', error);
        });
      }
    });
  }

  Object.entries(buttonSettings).forEach(([key, setting]) => {
    const switchElement = document.getElementById(setting.id);
    
    if (switchElement) {
      if (setting.disabled) {
        switchElement.disabled = true;
        switchElement.checked = false;
        
        const buttonSetting = switchElement.closest('.button-setting');
        if (buttonSetting) {
          buttonSetting.style.cursor = 'pointer';
          buttonSetting.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
              alert('Diese Funktion ist derzeit in Arbeit und noch nicht verfügbar.');
            }
          });
        }
      }
      
      switchElement.addEventListener('change', function() {
        const isEnabled = this.checked;
        saveSettingAndUpdateButton(setting, isEnabled);
        
        const buttonSetting = this.closest('.button-setting');
        if (buttonSetting) {
          buttonSetting.style.opacity = isEnabled ? '1' : '0.6';
          buttonSetting.style.transform = isEnabled ? 'scale(1)' : 'scale(0.98)';
        }
      });
    }
  });

  const darkThemeSwitch = document.getElementById(darkThemeSetting.id);
  if (darkThemeSwitch) {
    darkThemeSwitch.addEventListener('change', function() {
      saveThemeAndUpdatePage(this.checked);
    });
  }

  loadSettings();

  initBugReport();

  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    if (tabs[0]) {
      browser.tabs.sendMessage(tabs[0].id, { action: 'ping' }).then((response) => {
        if (response && response.loaded) {
          console.log('Content Script loaded successfully');
        }
      }).catch((error) => {
        console.warn('Content Script not loaded on current page:', error);
      });
    }
  });
});

function initBugReport() {
  const bugReportBtn = document.getElementById('bugReportBtn');
  const modal = document.getElementById('bugReportModal');
  const closeBtn = document.getElementById('closeModal');
  const form = document.getElementById('bugReportForm');
  const submitBtn = document.getElementById('submitBtn');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');

  const browserInput = document.getElementById('userBrowser');
  browserInput.value = navigator.userAgent;

  bugReportBtn.addEventListener('click', () => {
    modal.classList.add('show');
    document.getElementById('bugTitle').focus();
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });

  function closeModal() {
    modal.classList.remove('show');
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    form.reset();
    browserInput.value = navigator.userAgent;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Bug Report senden';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet...';
    
    const formData = new FormData(form);
    const bugData = {
      title: formData.get('bugTitle'),
      type: formData.get('bugType'),
      description: formData.get('bugDescription'),
      steps: formData.get('bugSteps'),
      browser: formData.get('userBrowser'),
      email: formData.get('userEmail'),
      timestamp: new Date().toISOString(),
      extensionVersion: browser.runtime.getManifest().version
    };

    try {
      await submitBugReport(bugData);
      successMessage.style.display = 'block';
      errorMessage.style.display = 'none';
      form.style.display = 'none';
      
      setTimeout(() => {
        closeModal();
        form.style.display = 'block';
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting bug report:', error);
      errorMessage.style.display = 'block';
      successMessage.style.display = 'none';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Bug Report senden';
    }
  });
}

async function submitBugReport(bugData) {
  const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeM0woz7Ev2fJ8eL5Kh6sdq8aauF6A7YAn_eA9aBu-lNRX_xg/formResponse';

  const userAgent = bugData.browser;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browserName = 'Opera';
    const match = userAgent.match(/OPR\/([0-9.]+)/);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes('Edg')) {
    browserName = 'Microsoft Edge';
    const match = userAgent.match(/Edg\/([0-9.]+)/);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes('Chrome')) {
    browserName = 'Google Chrome';
    const match = userAgent.match(/Chrome\/([0-9.]+)/);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes('Firefox')) {
    browserName = 'Mozilla Firefox';
    const match = userAgent.match(/Firefox\/([0-9.]+)/);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes('Safari')) {
    browserName = 'Safari';
    const match = userAgent.match(/Version\/([0-9.]+)/);
    if (match) browserVersion = match[1];
  }
  
  const formattedBrowserInfo = browserName + ' ' + browserVersion + '\nBetriebssystem: ' + navigator.platform;
  
  const formData = new FormData();
  
  formData.append('entry.1060870630', bugData.title);                    // Problem Title
  formData.append('entry.1934190602', bugData.type);                     // Problem Type (radio button)
  formData.append('entry.1140599693', bugData.description);              // Detailed Description  
  formData.append('entry.1472756735', bugData.steps || 'Not provided');  // Steps to Reproduce
  formData.append('entry.1508442479', bugData.email || '');              // Email (optional)
  formData.append('entry.1658493229', formattedBrowserInfo + '\n\nExtension: Smart Bread Calculator v' + bugData.extensionVersion + '\nTimestamp: ' + new Date().toLocaleString('de-DE')); // Browser info with additional details

  console.log('Submitting bug report with data:', bugData);
  console.log('Form URL:', FORM_URL);
  console.log('Browser detected:', browserName, browserVersion);

  try {
    const response = await fetch(FORM_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Forms
      body: formData
    });

    console.log('Form submission completed');
    return Promise.resolve();
  } catch (error) {
    console.error('Error during form submission:', error);
    throw error;
  }
}