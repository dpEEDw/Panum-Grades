// Minoshek built this with help from AI.
 
(function () {
  const DARK_THEME_STORAGE_KEY = 'themeEnabled_dark';
  const DEFAULT_DARK_THEME_ENABLED = true;
  const DARK_THEME_CLASS = 'panum-dark-theme';
  const GRADES_PAGE_ID = '21311';
  const THEME_TOGGLE_BUTTON_ID = 'panum-theme-toggle-btn';
  const THEME_TOGGLE_GUIDE_ID = 'panum-theme-toggle-guide';
  const THEME_TOGGLE_GUIDE_PROGRESS_KEY = 'panumThemeToggleGuideProgress';

  let themeGuideToggleCountMK = 0;
  let themeGuideRepositionHandlerMK = null;

  function getCurrentPageId() {
    try {
      return new URLSearchParams(window.location.search).get('pageid');
    } catch (error) {
      return null;
    }
  }

  function isGradesPage() {
    return getCurrentPageId() === GRADES_PAGE_ID;
  }

  function applyDarkThemeMK(enabled) {
    if (enabled) {
      document.documentElement.classList.add(DARK_THEME_CLASS);
      if (document.body) {
        document.body.classList.add(DARK_THEME_CLASS);
      }
    } else {
      document.documentElement.classList.remove(DARK_THEME_CLASS);
      if (document.body) {
        document.body.classList.remove(DARK_THEME_CLASS);
      }
    }

    updateThemeToggleButtonState(enabled);
    applyRuntimeDarkThemePatches(enabled);
  }

  function getThemeToggleButton() {
    return document.getElementById(THEME_TOGGLE_BUTTON_ID);
  }

  function updateThemeToggleButtonState(enabled) {
    const toggleButtonMK = getThemeToggleButton();
    if (!toggleButtonMK) {
      return;
    }

    toggleButtonMK.dataset.theme = enabled ? 'dark' : 'light';
    toggleButtonMK.textContent = enabled ? '☾' : '☀';
    toggleButtonMK.title = enabled ? 'Dark Mode aktiv (klicke für Light Mode)' : 'Light Mode aktiv (klicke für Dark Mode)';
    toggleButtonMK.setAttribute('aria-label', toggleButtonMK.title);
  }

  function positionThemeToggleGuide() {
    const guideElementMK = document.getElementById(THEME_TOGGLE_GUIDE_ID);
    const toggleButtonMK = getThemeToggleButton();
    if (!guideElementMK || !toggleButtonMK) {
      return;
    }

    const toggleRectMK = toggleButtonMK.getBoundingClientRect();
    const maxGuideWidthMK = 260;
    const leftMK = Math.max(10, Math.min(window.innerWidth - maxGuideWidthMK - 10, toggleRectMK.right - maxGuideWidthMK + 14));

    guideElementMK.style.top = `${Math.round(toggleRectMK.bottom + 10)}px`;
    guideElementMK.style.left = `${Math.round(leftMK)}px`;
  }

  function hideThemeToggleGuide() {
    const guideElementMK = document.getElementById(THEME_TOGGLE_GUIDE_ID);
    if (guideElementMK) {
      guideElementMK.remove();
    }

    if (themeGuideRepositionHandlerMK) {
      window.removeEventListener('resize', themeGuideRepositionHandlerMK);
      window.removeEventListener('scroll', themeGuideRepositionHandlerMK, true);
      themeGuideRepositionHandlerMK = null;
    }

    try {
      localStorage.setItem(THEME_TOGGLE_GUIDE_PROGRESS_KEY, 'done');
    } catch (error) {
      console.warn('Could not persist theme guide state:', error);
    }
  }

  function handleThemeToggleGuideProgress() {
    const guideElementMK = document.getElementById(THEME_TOGGLE_GUIDE_ID);
    if (!guideElementMK) {
      return;
    }

    themeGuideToggleCountMK += 1;
    if (themeGuideToggleCountMK < 2) {
      guideElementMK.innerHTML = '<strong>Perfekt!</strong> Noch einmal klicken, dann verschwindet dieser Hinweis.';
      return;
    }

    hideThemeToggleGuide();
  }

  function showThemeToggleGuideIfNeeded() {
    try {
      const progressMK = localStorage.getItem(THEME_TOGGLE_GUIDE_PROGRESS_KEY);
      if (progressMK === 'done') {
        return;
      }
    } catch (error) {
      console.warn('Could not read theme guide state:', error);
      return;
    }

    if (document.getElementById(THEME_TOGGLE_GUIDE_ID)) {
      return;
    }

    themeGuideToggleCountMK = 0;
    const guideElementMK = document.createElement('div');
    guideElementMK.id = THEME_TOGGLE_GUIDE_ID;
    guideElementMK.className = 'panum-theme-guide';
    guideElementMK.innerHTML = '<strong>Theme-Schalter:</strong> Klicke auf den Mond oben rechts für Light Mode. Klicke danach nochmals, um den Hinweis zu schließen.';
    document.body.appendChild(guideElementMK);
    positionThemeToggleGuide();

    themeGuideRepositionHandlerMK = () => positionThemeToggleGuide();
    window.addEventListener('resize', themeGuideRepositionHandlerMK);
    window.addEventListener('scroll', themeGuideRepositionHandlerMK, true);
  }

  function setThemePreference(enabled) {
    applyDarkThemeMK(enabled);

    try {
      localStorage.setItem(DARK_THEME_STORAGE_KEY, enabled.toString());
    } catch (error) {
      console.warn('Could not sync theme setting to localStorage:', error);
    }

    if (storage && storage.set) {
      try {
        storage.set({ [DARK_THEME_STORAGE_KEY]: enabled });
      } catch (error) {
        console.warn('Could not sync theme setting to extension storage:', error);
      }
    }
  }

  function ensureThemeToggleButton() {
    const placeToggleButtonMK = (toggleButtonMK) => {
      const menuButtonMK = document.getElementById('sn-main-menu');
      const notificationButtonMK = document.getElementById('sn-notifications');

      if (menuButtonMK && menuButtonMK.parentElement) {
        menuButtonMK.parentElement.insertBefore(toggleButtonMK, menuButtonMK);
        return true;
      }

      if (notificationButtonMK && notificationButtonMK.parentElement) {
        notificationButtonMK.insertAdjacentElement('afterend', toggleButtonMK);
        return true;
      }

      return false;
    };

    let toggleButtonMK = getThemeToggleButton();
    if (!toggleButtonMK) {
      toggleButtonMK = document.createElement('button');
      toggleButtonMK.id = THEME_TOGGLE_BUTTON_ID;
      toggleButtonMK.className = 'panum-theme-toggle mdl-button mdl-js-button mdl-button--icon';
      toggleButtonMK.type = 'button';
      toggleButtonMK.textContent = '☾';
      toggleButtonMK.setAttribute('tabindex', '0');
      toggleButtonMK.addEventListener('click', () => {
        const isDarkActiveMK = document.documentElement.classList.contains(DARK_THEME_CLASS);
        setThemePreference(!isDarkActiveMK);
        handleThemeToggleGuideProgress();
      });
    }

    if (!placeToggleButtonMK(toggleButtonMK) && !toggleButtonMK.parentElement) {
      (document.body || document.documentElement).appendChild(toggleButtonMK);
    }

    let relocationAttemptsMK = 0;
    const relocationIntervalMK = setInterval(() => {
      relocationAttemptsMK += 1;

      const wasPlacedMK = placeToggleButtonMK(toggleButtonMK);
      if (wasPlacedMK || relocationAttemptsMK >= 20) {
        clearInterval(relocationIntervalMK);
        positionThemeToggleGuide();
      }
    }, 250);

    updateThemeToggleButtonState(document.documentElement.classList.contains(DARK_THEME_CLASS));
    showThemeToggleGuideIfNeeded();
  }

  function patchTinyMceIframes(enabled) {
    const iframeNodes = document.querySelectorAll('.tox-edit-area__iframe');
    iframeNodes.forEach((iframeMK) => {
      try {
        const iframeDocMK = iframeMK.contentDocument;
        if (!iframeDocMK) {
          return;
        }

        const htmlMK = iframeDocMK.documentElement;
        const bodyMK = iframeDocMK.body;
        if (!htmlMK || !bodyMK) {
          return;
        }

        if (enabled) {
          htmlMK.style.background = '#0f151f';
          htmlMK.style.color = '#e8edf5';
          bodyMK.style.background = '#0f151f';
          bodyMK.style.color = '#e8edf5';
        } else {
          htmlMK.style.background = '';
          htmlMK.style.color = '';
          bodyMK.style.background = '';
          bodyMK.style.color = '';
        }
      } catch (error) {
        // Ignore cross-frame access errors.
      }
    });
  }

  function applyRuntimeDarkThemePatches(enabled) {
    patchTinyMceIframes(enabled);
  }

  function getThemeSettingFromLocalStorage() {
    try {
      const rawValueMK = localStorage.getItem(DARK_THEME_STORAGE_KEY);
      if (rawValueMK === null) {
        return DEFAULT_DARK_THEME_ENABLED;
      }
      return rawValueMK === 'true';
    } catch (error) {
      return DEFAULT_DARK_THEME_ENABLED;
    }
  }

  function watchRuntimeThemeTargets() {
    try {
      const targetNodeMK = document.documentElement;
      if (!targetNodeMK) {
        return;
      }

      const observerMK = new MutationObserver(() => {
        const darkEnabledMK = document.documentElement.classList.contains(DARK_THEME_CLASS);
        patchTinyMceIframes(darkEnabledMK);
      });

      observerMK.observe(targetNodeMK, { childList: true, subtree: true });
    } catch (error) {
      console.warn('Failed to watch runtime theme targets:', error);
    }
  }

  function bootstrapDarkThemeImmediately() {
    try {
      const cachedSetting = getThemeSettingFromLocalStorage();
      applyDarkThemeMK(cachedSetting);
    } catch (error) {
      // Ignore localStorage access errors and continue with normal theme loading.
    }
  }

  bootstrapDarkThemeImmediately();

  function loadThemeSetting() {
    if (storage && storage.get) {
      try {
        storage.get([DARK_THEME_STORAGE_KEY], (result) => {
          if (runtimeAPI && runtimeAPI.lastError) {
            const fallbackSetting = getThemeSettingFromLocalStorage();
            applyDarkThemeMK(fallbackSetting);
            return;
          }

          const hasStoredSettingMK = Object.prototype.hasOwnProperty.call(result, DARK_THEME_STORAGE_KEY);
          const isDarkThemeEnabled = hasStoredSettingMK ? !!result[DARK_THEME_STORAGE_KEY] : DEFAULT_DARK_THEME_ENABLED;
          applyDarkThemeMK(isDarkThemeEnabled);

          if (!hasStoredSettingMK) {
            setThemePreference(DEFAULT_DARK_THEME_ENABLED);
          }
        });
      } catch (error) {
        const fallbackSetting = getThemeSettingFromLocalStorage();
        applyDarkThemeMK(fallbackSetting);
      }
    } else {
      const fallbackSetting = getThemeSettingFromLocalStorage();
      applyDarkThemeMK(fallbackSetting);
    }
  }

  const ENABLE_ACHIEVEMENTS = true;
  
  const storage = (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local)
    ? chrome.storage.local
    : (typeof browser !== "undefined" && browser.storage && browser.storage.local)
      ? browser.storage.local
      : null;

  const runtimeAPI = (typeof browser !== "undefined" && browser.runtime) 
    ? browser.runtime 
    : (typeof chrome !== "undefined" && chrome.runtime) 
      ? chrome.runtime 
      : null;

  const buttonManager = {
    buttons: new Map(),
    
    registerButton(buttonId, element, config) {
      this.buttons.set(buttonId, {
        element: element,
        config: config
      });
    },
    
    markButtonOpening(buttonId) {
    },
    
    findFreePanelPosition(panelWidth, panelHeight, preferredLeft, preferredTop) {
      let bestLeft = Math.max(20, Math.min(preferredLeft, window.innerWidth - panelWidth - 20));
      let bestTop = Math.max(20, Math.min(preferredTop, window.innerHeight - panelHeight - 20));
      
      return { left: bestLeft, top: bestTop };
    }
  };

  let buttonInstancesMK = {};

  window.buttonInstancesMK = buttonInstancesMK;

  function createFallbackButtons() {
    const buttonsMK = [
      { id: 'pluspoints-overlay-btn', title: '+Punkte', color: '#388e3c', icon: '➕', position: { rightOffset: 20, bottomOffset: 140 } },
      { id: 'notenrechner-calc-btn', title: 'Notenrechner', color: '#1976d2', icon: '🧮', position: { rightOffset: 80, bottomOffset: 20 } },
      { id: 'notenrechner-custom-btn', title: 'Eigene Noten', color: '#b36a00', icon: '✏️', position: { rightOffset: 140, bottomOffset: 20 } },
      { id: 'improvement-overlay-btn', title: 'Chancen & Risiken', color: '#ff5722', icon: '📈', position: { rightOffset: 20, bottomOffset: 80 } }
    ];
    
    if (ENABLE_ACHIEVEMENTS) {
      buttonsMK.push({ id: 'gamification-overlay-btn', title: 'Achievements', color: '#ffb300', icon: '🏆', position: { rightOffset: 20, bottomOffset: 20 } });
    }
    
    buttonsMK.forEach((btnConfig) => {
      if (document.getElementById(btnConfig.id)) return;
      
      const buttonMK = document.createElement('button');
      buttonMK.id = btnConfig.id;
      buttonMK.title = btnConfig.title;
      
      const winWMK = window.innerWidth;
      const winHMK = window.innerHeight;
      const leftMK = winWMK - 50 - btnConfig.position.rightOffset;
      const topMK = winHMK - 50 - btnConfig.position.bottomOffset;
      
      buttonMK.style.cssText = `
        position: fixed;
        width: 50px;
        height: 50px;
        background: #fff;
        color: ${btnConfig.color};
        border: 2px solid ${btnConfig.color};
        border-radius: 10px;
        cursor: pointer;
        z-index: 10000;
        font-size: 18px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        display: flex;
        align-items: center;
        justify-content: center;
        left: ${leftMK}px;
        top: ${topMK}px;
        transition: all 0.3s ease;
      `;
      
      buttonMK.textContent = btnConfig.icon;
      
      buttonMK.addEventListener('click', () => {
        const existingMsgMK = document.getElementById('fallback-message');
        if (existingMsgMK) existingMsgMK.remove();
        
        const messageMK = document.createElement('div');
        messageMK.id = 'fallback-message';
        messageMK.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 20000;
          text-align: center;
          border: 2px solid ${btnConfig.color};
        `;
        
        messageMK.innerHTML = `
          <div style="font-size: 18px; margin-bottom: 10px;">${btnConfig.icon}</div>
          <div style="font-weight: bold; margin-bottom: 10px;">${btnConfig.title}</div>
          <div style="color: #666; margin-bottom: 15px;">Button im Fallback-Modus</div>
          <button onclick="this.parentElement.remove()" style="padding: 8px 16px; background: ${btnConfig.color}; color: white; border: none; border-radius: 4px; cursor: pointer;">OK</button>
        `;
        
        document.body.appendChild(messageMK);
        
        setTimeout(() => {
          if (messageMK.parentElement) messageMK.remove();
        }, 3000);
      });
      
      document.body.appendChild(buttonMK);
    });
  }

  function showError(msg) {
  }

  function findDetailRows() {
    return Array.from(document.querySelectorAll('tr')).filter(trMK =>
      Array.from(trMK.classList).some(cls => cls.endsWith("_detailrow"))
      && trMK.querySelector("table.clean")
    );
  }

  const subjectsByCategory = {
    naturwissenschaften: [
      "Biologie", "Bio",
      "Chemie", "Chem", 
      "Physik", "Phys",
      "Mathematik", "Mathe", "Math",
      "Informatik", "Info", "Computer",
      "Geowissenschaften", "Geo",
      "Astronomie",
      "Umweltwissenschaften",
      "Technik", "Technisches Zeichnen"
    ],
    sprache: [
      "Deutsch", "DE",
      "Englisch", "EN", "English",
      "Französisch", "FR", "Francais", 
      "Spanisch", "ES", "Español",
      "Latein", "LA", "Latin",
      "Italienisch", "IT", "Italiano",
      "Griechisch", "GR",
      "Chinesisch", "CN",
      "Russisch", "RU",
      "Englisch Konversation", "English Conversation"
    ],
    gesellschaft: [
      "Geografie", "Geographie", "GG", "Geo",
      "Geschichte", "Hist", "History",
      "Wirtschaft und Recht", "WuR", "Wirtschaft", "Recht",
      "Politik", "Pol",
      "Sozialkunde", "Sozi",
      "Religion", "Rel", "Reli",
      "Ethik", "Philosophie", "Phil"
    ],
    kunst: [
      "Bildnerisches Gestalten", "BG", "Kunst", "Art",
      "Musik", "Mus", "Music",
      "Theater", "Drama",
      "Tanz", "Dance",
      "Chor", "Choir",
      "Fotografie", "Photo",
      "Design", "Gestaltung"
    ],
    sport: [
      "Sport", "SP", "Sports",
      "Schulsport",
      "Leichtathletik",
      "Turnen", "Gymnastik",
      "Schwimmen", "Swimming"
    ],
    wahlfaecher: [
      "Projektarbeit", "Projekt",
      "Ergänzungsfach", "EF",
      "Schach", "Chess",
      "Debattieren", "Debate",
      "Robotik", "Robotics",
      "Psychologie", "Psych"
    ]
  };

  function getFachKategorie(fachName) {
    for (const [kategorie, faecher] of Object.entries(subjectsByCategory)) {
      for (const fach of faecher) {
        if (fachName.toLowerCase().includes(fach.toLowerCase())) {
          return kategorie;
        }
      }
    }
    return 'sonstige';
  }

  function extractNotenFromTable(tr) {
    let prevMK = tr.previousElementSibling;
    let fachMK = "Unbekannt";
    let fachCodeMK = "";
    let fachLangNameMK = "";
    
    if (prevMK) {
      let bMK = prevMK.querySelector("b");
      if (bMK) {
        const fullTextMK = bMK.textContent.trim();
        const linesMK = fullTextMK.split("\n");
        if (linesMK.length >= 2) {
          fachCodeMK = linesMK[0].trim();
          fachLangNameMK = linesMK[1].trim();
          fachMK = `${fachCodeMK} - ${fachLangNameMK}`;
        } else {
          fachMK = linesMK[0].trim();
          fachCodeMK = fachMK;
          fachLangNameMK = fachMK;
        }
      }
    }

    let notenMK = [], gewichtungenMK = [], datenMK = [], themenMK = [];
    let tabelleMK = tr.querySelector("table.clean");
    if (!tabelleMK) return null;

    let rowsMK = Array.from(tabelleMK.querySelectorAll("tbody > tr"));
    let foundMK = false;
    for (const rowMK of rowsMK) {
      let tdsMK = rowMK.querySelectorAll("td");
      if (tdsMK.length >= 4) {
        const dateCellMK = tdsMK[0];
        const dateTextMK = dateCellMK ? dateCellMK.textContent.trim() : '';

        const themaCellMK = tdsMK[1];
        const themaMK = themaCellMK ? themaCellMK.textContent.trim() : '';

        if (themaMK.toLowerCase().includes('aktueller durchschnitt') || 
            themaMK.toLowerCase().includes('durchschnitt') ||
            dateTextMK.toLowerCase().includes('aktueller')) {
          continue;
        }
        
        let noteTxtMK = tdsMK[2].textContent.trim().replace(",", ".").replace("*","");
        let gewTxtMK = tdsMK[3].textContent.trim().replace(",", ".");
        let noteMK = parseFloat(noteTxtMK);
        let gewMK = parseFloat(gewTxtMK);
        if (!isNaN(noteMK) && !isNaN(gewMK)) {
          notenMK.push(noteMK);
          gewichtungenMK.push(gewMK);
          datenMK.push(dateTextMK); // Store the date
          themenMK.push(themaMK);
          foundMK = true;
        }
      }
    }
    if (!foundMK) return null;
    let durchschnittMK = berechneDurchschnitt(notenMK, gewichtungenMK);
    
    const kategorieMK = getFachKategorie(fachLangNameMK);
    
    return { 
      fach: fachMK, 
      fachCode: fachCodeMK, 
      fachLangName: fachLangNameMK, 
      kategorie: kategorieMK, 
      noten: notenMK, 
      gewichtungen: gewichtungenMK, 
      daten: datenMK,
      durchschnitt: durchschnittMK 
    };
  }

  function berechneDurchschnitt(noten, gew) {
    let summeWMK = gew.reduce((a, b) => a + b, 0);
    let summeMK = noten.reduce((a, n, i) => a + n * gew[i], 0);
    return summeWMK > 0 ? +(summeMK / summeWMK).toFixed(2) : 0;
  }

  function resetAllData() {
    localStorage.clear();

    try {
      chrome.storage.sync.clear(() => {});
      chrome.storage.local.clear(() => {});
    } catch (e) {
    }

    const extensionElements = [
      'notenrechner-calc-btn',
      'notenrechner-custom-btn', 
      'pluspoints-overlay-btn',
      'improvement-overlay-btn',
      'gamification-overlay-btn',
      'notenrechner-calc-panel',
      'notenrechner-custom-panel',
      'pluspoints-overlay-panel',
      'improvement-overlay-panel', 
      'gamification-overlay-panel',
      'achievement-toast',
      'achievement-removed-toast',
      'toast-style',
      'toast-top-style'
    ];
    
    extensionElements.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.remove();
      }
    });
    
    let resetMsg = document.getElementById("notenResetMsg");
    if (resetMsg) resetMsg.remove();
    let div = document.createElement("div");
    div.id = "notenResetMsg";
    div.style.cssText = "background:#4caf50;color:#fff;z-index:99999;position:fixed;top:0;left:0;right:0;padding:15px;font-weight:bold;text-align:center;border-bottom:3px solid #388e3c;font-size:16px;";
    div.textContent = "✅ Alle Daten erfolgreich zurückgesetzt! Die Extension wird neu gestartet...";
    document.body.appendChild(div);
    
    setTimeout(() => {
      div.remove();
      window.location.reload();
    }, 4000);
  }

  function completeDataWipe() {
    try {
      localStorage.clear();

      if (storage && storage.clear) {
        storage.clear(() => {});
      }

      try {
        if (chrome && chrome.storage && chrome.storage.sync && chrome.storage.sync.clear) {
          chrome.storage.sync.clear(() => {});
        }
      } catch (e) {
      }

      const achievementKeys = [
        'achievementsShown',
        'achievementsPrevious', 
        'buttonEnabled_achievements',
        'achievementResetTimestamp',
        'lastResetTimestamp',
        'achievementSettings',
        'gamificationData',
        'achievementCache',
        'achievementState',
        'achievementHistory'
      ];
      
      achievementKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      if (window.buttonInstancesMK && buttonInstancesMK.gamification && buttonInstancesMK.gamification.clearAllAchievementData) {
        buttonInstancesMK.gamification.clearAllAchievementData();
      }

      if (window.achievementDebug && window.achievementDebug.clearAll) {
        window.achievementDebug.clearAll();
      }

      const extensionElements = [
        'notenrechner-calc-btn',
        'notenrechner-custom-btn', 
        'pluspoints-overlay-btn',
        'improvement-overlay-btn',
        'gamification-overlay-btn',
        'notenrechner-calc-panel',
        'notenrechner-custom-panel',
        'pluspoints-overlay-panel',
        'improvement-overlay-panel', 
        'gamification-overlay-panel',
        'achievement-toast',
        'achievement-removed-toast',
        'toast-style',
        'toast-top-style',
        'achievement-tooltip',
        'achievement-counter',
        'achievement-categories',
        'gamification-content'
      ];
      
      extensionElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.remove();
        }
      });
      
      if (window.buttonInstancesMK) {
        window.buttonInstancesMK = {};
      }

      if (window.achievementDebug) {
        delete window.achievementDebug;
      }

      localStorage.removeItem('notenDaten');

      let wipeMsg = document.getElementById("completeWipeMsg");
      if (wipeMsg) wipeMsg.remove();
      let div = document.createElement("div");
      div.id = "completeWipeMsg";
      div.style.cssText = "background:#4caf50;color:#fff;z-index:99999;position:fixed;top:0;left:0;right:0;padding:15px;font-weight:bold;text-align:center;border-bottom:3px solid #388e3c;";
      div.textContent = "✅ Alle Daten erfolgreich gelöscht! Die Extension ist jetzt wie neu installiert.";
      document.body.appendChild(div);
      setTimeout(() => { div.remove(); }, 5000);
      
      return true;
      
    } catch (error) {
      console.error('❌ Error during complete data wipe:', error);
      return false;
    }
  }

  function scanAndSaveAll() {
    let datenMK = [];
    let rowsMK = findDetailRows();
    if (rowsMK.length === 0) {
      return;
    }
    for (let trMK of rowsMK) {
      let infoMK = extractNotenFromTable(trMK);
      if (infoMK) datenMK.push(infoMK);
    }
    if (datenMK.length === 0) {
      const checkPreviousData = () => {
        try {
          if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
            browser.storage.local.get(['notenDaten']).then((result) => {
              const hadData = result.notenDaten && result.notenDaten.length > 0;
              if (hadData) {
                resetAllData();
              }
            }).catch((error) => {
              try {
                const savedDataMK = JSON.parse(localStorage.getItem('notenDaten') || '[]');
                if (savedDataMK.length > 0) {
                  resetAllData();
                }
              } catch (e) {
              }
            });
          } else {
            try {
              const savedDataMK = JSON.parse(localStorage.getItem('notenDaten') || '[]');
              if (savedDataMK.length > 0) {
                resetAllData();
              }
            } catch (e) {
            }
          }
        } catch (error) {
          console.warn('Extension context invalid in checkPreviousData:', error);
          try {
            const savedDataMK = JSON.parse(localStorage.getItem('notenDaten') || '[]');
            if (savedDataMK.length > 0) {
              resetAllData();
            }
          } catch (e) {
          }
        }
      };
      checkPreviousData();
    } else {
      try {
        if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
          browser.storage.local.set({ notenDaten: datenMK }).then(() => {
            let okMK = document.getElementById("notenExtractorOkMsg");
            if (okMK) okMK.remove();
            let divMK = document.createElement("div");
            divMK.id = "notenExtractorOkMsg";
            divMK.style.cssText = "background:#cfc;color:#060;z-index:99999;position:fixed;top:0;left:0;right:0;padding:10px;font-weight:bold;text-align:center;";
            divMK.textContent = `Noten für ${datenMK.length} Fächer extrahiert!`;
            document.body.appendChild(divMK);
            setTimeout(() => { divMK.remove(); }, 4000);

            setTimeout(() => {
              if (window.buttonInstancesMK && window.buttonInstancesMK.gamification && window.buttonInstancesMK.gamification.checkAndShowAchievementToasts) {
                window.buttonInstancesMK.gamification.checkAndShowAchievementToasts();
              } else if (ENABLE_ACHIEVEMENTS) {
                console.warn('🚫 Cannot trigger achievement check - gamification button not available');
              }
            }, 1000);
          }).catch((error) => {
            console.warn('Could not save to browser.storage:', error);
          });
        } else {
          throw new Error('Extension storage not available');
        }
      } catch (error) {
        console.warn('Extension context invalid in scanAndSaveAll, using localStorage:', error);
        try {
          localStorage.setItem('notenDaten', JSON.stringify(datenMK));
          let okMK = document.getElementById("notenExtractorOkMsg");
          if (okMK) okMK.remove();
          let divMK = document.createElement("div");
          divMK.id = "notenExtractorOkMsg";
          divMK.style.cssText = "background:#cfc;color:#060;z-index:99999;position:fixed;top:0;left:0;right:0;padding:10px;font-weight:bold;text-align:center;";
          divMK.textContent = `Noten für ${datenMK.length} Fächer extrahiert!`;
          document.body.appendChild(divMK);
          setTimeout(() => { divMK.remove(); }, 4000);

          setTimeout(() => {
            if (window.buttonInstancesMK && window.buttonInstancesMK.gamification && window.buttonInstancesMK.gamification.checkAndShowAchievementToasts) {
              window.buttonInstancesMK.gamification.checkAndShowAchievementToasts();
            } else if (ENABLE_ACHIEVEMENTS) {
              console.warn('🚫 Cannot trigger achievement check - gamification button not available (localStorage path)');
            }
          }, 1000);
        } catch (storageError) {
          console.error('Failed to save data to localStorage:', storageError);
        }
      }
    }
  }

  let lastCountMK = 0;
  function watchForChanges() {
    try {
      const targetMK = document.body;
      if (!targetMK) return;
      const observerMK = new MutationObserver(() => {
        let rowsMK = findDetailRows();
        if (rowsMK.length !== lastCountMK) {
          lastCountMK = rowsMK.length;
          scanAndSaveAll();
        }
      });
      observerMK.observe(targetMK, { childList: true, subtree: true });
      scanAndSaveAll();
    } catch (error) {
      console.error('Error in watchForChanges:', error);
    }
  }

  function loadButtonComponents() {
    return new Promise((resolve) => {
      try {
        if (!runtimeAPI?.id) {
          console.warn('Extension context invalid, creating fallback buttons');
          createFallbackButtons();
          resolve();
          return;
        }
      } catch (error) {
        console.warn('Extension context check failed:', error);
        createFallbackButtons();
        resolve();
        return;
      }

      const expectedClassesMK = ['PluspointsButton', 'CalculatorButton', 'CustomButton', 'ImprovementButton', 'GamificationButton'];
      const missingClassesMK = expectedClassesMK.filter(className => !window[className]);
      
      if (missingClassesMK.length > 0) {
        console.warn('❌ Missing button classes:', missingClassesMK);
        createFallbackButtons();
        resolve();
        return;
      }
      
      initializeButtonsDirectly();
      resolve();
    });
  }

  function initializeButtonsDirectly() {
    buttonInstancesMK = {};
    window.buttonInstancesMK = buttonInstancesMK;

    const constructorArgsMK = [buttonManager];
    
    try {
      if (window.PluspointsButton) {
        buttonInstancesMK.pluspoints = new window.PluspointsButton(...constructorArgsMK);
        buttonInstancesMK.pluspoints.create();
      } else {
        console.warn('⚠ PluspointsButton class not available');
      }
    } catch (e) {
      console.error('✗ Failed to create PluspointsButton:', e);
    }
    
    try {
      if (window.CalculatorButton) {
        buttonInstancesMK.calculator = new window.CalculatorButton(...constructorArgsMK);
        buttonInstancesMK.calculator.create();
      } else {
        console.warn('⚠ CalculatorButton class not available');
      }
    } catch (e) {
      console.error('✗ Failed to create CalculatorButton:', e);
    }
    
    try {
      if (window.CustomButton) {
        buttonInstancesMK.custom = new window.CustomButton(...constructorArgsMK);
        buttonInstancesMK.custom.create();
      } else {
        console.warn('⚠ CustomButton class not available');
      }
    } catch (e) {
      console.error('✗ Failed to create CustomButton:', e);
    }
    
    try {
      if (window.ImprovementButton) {
        buttonInstancesMK.improvement = new window.ImprovementButton(...constructorArgsMK);
        buttonInstancesMK.improvement.create();
      } else {
        console.warn('⚠ ImprovementButton class not available');
      }
    } catch (e) {
      console.error('✗ Failed to create ImprovementButton:', e);
    }
    
    if (ENABLE_ACHIEVEMENTS) {
      try {
        if (window.GamificationButton) {
          buttonInstancesMK.gamification = new window.GamificationButton(...constructorArgsMK);
          buttonInstancesMK.gamification.create();
        }
      } catch (e) {
        console.error('✗ Failed to create GamificationButton:', e);
      }
    }
    
    setTimeout(() => {
      try {
        loadButtonSettings();
      } catch (error) {
        console.warn('Failed to load button settings:', error);
      }
    }, 1000);
  }

  if (runtimeAPI && runtimeAPI.onMessage) {
    runtimeAPI.onMessage.addListener((message, sender, sendResponse) => {
      try {
        if (message.action === 'toggleButton') {
          const buttonMK = document.getElementById(message.buttonId);
          if (buttonMK) {
            if (message.enabled) {
              buttonMK.style.display = 'flex';
            } else {
              buttonMK.style.display = 'none';
              const panelIdMK = message.buttonId.replace('-btn', '-panel');
              const panelMK = document.getElementById(panelIdMK);
              if (panelMK) {
                panelMK.style.display = 'none';
              }
            }
          }
          
          const storageKeyMap = {
            'gamification-overlay-btn': 'buttonEnabled_achievements',
            'pluspoints-overlay-btn': 'buttonEnabled_pluspoints',
            'notenrechner-calc-btn': 'buttonEnabled_calculator',
            'notenrechner-custom-btn': 'buttonEnabled_custom',
            'improvement-overlay-btn': 'buttonEnabled_improvement'
          };
          
          const storageKeyMK = storageKeyMap[message.buttonId];
          if (storageKeyMK) {
            try {
              localStorage.setItem(storageKeyMK, message.enabled.toString());
            } catch (error) {
              console.warn('Could not sync button setting to localStorage:', error);
            }
          }
          
          sendResponse({ success: true });
        } else if (message.action === 'ping') {
          sendResponse({ success: true, loaded: true });
        } else if (message.action === 'toggleTheme') {
          setThemePreference(!!message.enabled);

          sendResponse({ success: true });
        }
      } catch (error) {
        console.error('Error handling message:', error);
        sendResponse({ success: false, error: error.message });
      }
      return true;
    });
  }

  function loadButtonSettings() {
    try {
      if (!runtimeAPI?.id) {
        console.warn('Extension context invalid, skipping button settings');
        return;
      }
    } catch (error) {
      console.warn('Extension context check failed in loadButtonSettings:', error);
      return;
    }

    const buttonSettingsMK = {
      'pluspoints-overlay-btn': 'buttonEnabled_pluspoints',
      'notenrechner-calc-btn': 'buttonEnabled_calculator', 
      'notenrechner-custom-btn': 'buttonEnabled_custom',
      'improvement-overlay-btn': 'buttonEnabled_improvement',
      'gamification-overlay-btn': 'buttonEnabled_achievements'
    };

    const storageKeysMK = Object.values(buttonSettingsMK);
    
    if (storage && storage.get) {
      try {
        storage.get(storageKeysMK, (result) => {
          if (runtimeAPI && runtimeAPI.lastError) {
            console.warn('Storage error:', runtimeAPI.lastError);
            loadButtonSettingsFromLocalStorage(buttonSettingsMK);
            return;
          }
          
          Object.entries(buttonSettingsMK).forEach(([buttonId, storageKey]) => {
            const buttonMK = document.getElementById(buttonId);
            if (buttonMK) {
              const defaultValue = true;
              const isEnabledMK = result[storageKey] !== undefined ? result[storageKey] : defaultValue;
              buttonMK.style.display = isEnabledMK ? 'flex' : 'none';
            }
          });
        });
      } catch (error) {
        console.warn('Error accessing extension storage:', error);
        loadButtonSettingsFromLocalStorage(buttonSettingsMK);
      }
    } else {
      loadButtonSettingsFromLocalStorage(buttonSettingsMK);
    }
  }

  function loadButtonSettingsFromLocalStorage(buttonSettings) {
    Object.entries(buttonSettings).forEach(([buttonId, storageKey]) => {
      const buttonMK = document.getElementById(buttonId);
      if (buttonMK) {
        try {
          const storedMK = localStorage.getItem(storageKey);
          const defaultValue = true;
          const isEnabledMK = storedMK !== null ? JSON.parse(storedMK) : defaultValue;
          buttonMK.style.display = isEnabledMK ? 'flex' : 'none';
        } catch (error) {
          console.warn(`Error loading setting ${storageKey}:`, error);
          const defaultValue = true;
          buttonMK.style.display = defaultValue ? 'flex' : 'none';
        }
      }
    });
  }

  async function initializeSystem() {
    loadThemeSetting();
    ensureThemeToggleButton();

    if (!isGradesPage()) {
      return;
    }

    try {
      if (!runtimeAPI?.id) {
        console.warn('Extension context invalid at initialization start');
        createFallbackButtons();
        return;
      }
    } catch (error) {
      console.warn('Extension context check failed:', error);
      createFallbackButtons();
      return;
    }
    
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }
    
    try {
      await loadButtonComponents();
      
      setTimeout(() => {
        try {
          watchForChanges();
        } catch (error) {
          console.error('Failed to start grade watcher:', error);
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Failed to initialize button system:', error);
      createFallbackButtons();
    }
  }

  function initWhenReady() {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      initializeSystem();
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        initializeSystem();
      });
      
      setTimeout(() => {
        if (document.readyState !== "complete") {
          console.warn('DOM not ready after timeout, initializing anyway...');
          initializeSystem();
        }
      }, 10000);
    }
  }

  watchRuntimeThemeTargets();
  initWhenReady();

  window.notenrechnerDebug = {
    resetAllData: resetAllData,
    completeDataWipe: completeDataWipe,
    scanAndSaveAll: scanAndSaveAll,
    checkStorage: () => {
      if (storage && storage.get) {
        storage.get(null, (result) => {
          console.log('Chrome storage content:', result);
        });
      }
    }
  };

})();