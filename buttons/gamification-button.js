// Minoshek built this with help from AI.

(function() {
  'use strict';
  
  console.log('Loading GamificationButton script...');

  class GamificationButton {
    constructor(buttonManager) {
      this.buttonManager = buttonManager;
      this.buttonId = "gamification-overlay-btn";
      this.panelId = "gamification-overlay-panel";
      
      // Achievement system data
      this.subjectsByCategory = {
        naturwissenschaften: [
          "Biologie", "Bio", "BIO", "BI", "B",
          "Chemie", "Chem", "CHE", "CH", "C",
          "Physik", "Phys", "PHY", "PH", "P",
          "Mathematik", "Mathe", "Math", "MATH", "MAT", "MA", "M",
          "Informatik", "Info", "Computer", "ICT", "ITG", "Programmieren", "Coding",
          "Naturwissenschaft", "Naturwissenschaften", "Nawi"
        ],
        sprache: [
          "Deutsch", "DE", "D", "DEU", "GER", "German",
          "Englisch", "EN", "E", "ENG", "English",
          "Französisch", "Franzoesisch", "Franzosisch", "FR", "F", "FRA", "Francais", "French",
          "Spanisch", "ES", "SPA", "Espanol", "Español",
          "Latein", "LA", "LAT", "Latin",
          "Italienisch", "IT", "ITA", "Italian",
          "Russisch", "RU", "RUS",
          "Griechisch", "GR", "GRE",
          "Portugiesisch", "PT", "POR"
        ],
        gesellschaft: [
          "Geografie", "Geographie", "GG", "GEO", "GE",
          "Geschichte", "GS", "GES", "HIS", "HIST", "History",
          "Wirtschaft und Recht", "WuR", "Wirtschaft", "Recht", "WR",
          "Politik", "POL", "Sozialkunde", "Sozi",
          "Ethik", "Religion", "Philosophie", "Gesellschaft"
        ],
        kunst: [
          "Bildnerisches Gestalten", "BG", "BK",
          "Kunst", "KU", "ART", "Art",
          "Musik", "MU", "MUS", "Music",
          "Theater", "Drama", "Darstellen", "Design", "Gestalten"
        ],
        sport: [
          "Sport", "SP", "S", "PE", "Sports", "Schulsport",
          "Leichtathletik", "Turnen", "Gym", "Gymnastik", "Schwimmen", "Athletik"
        ],
        wahlfaecher: [
          "Projektarbeit", "Projekt", "PRJ", "PROJ",
          "Ergänzungsfach", "Erganzungsfach", "EF",
          "Wahlfach", "WPF", "WAHL", "Freifach",
          "Schach", "Chess", "Psychologie", "PS", "Debatte", "Robotik"
        ]
      };
    }

    isPanelOpen() {
      return !!document.getElementById(this.panelId);
    }

    getDefaultPosition() {
      return {
        right: 20, // Right edge
        bottom: 20   // Bottom right
      };
    }

    loadNotenDaten(cb) {
      if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
        browser.storage.local.get(['notenDaten']).then(resMK => {
          if (resMK && Array.isArray(resMK.notenDaten)) cb(resMK.notenDaten);
          else {
            try {
              const arrMK = JSON.parse(localStorage.getItem('notenDaten'));
              if (Array.isArray(arrMK)) cb(arrMK); else cb([]);
            } catch { cb([]); }
          }
        }).catch(() => {
          try {
            const arrMK = JSON.parse(localStorage.getItem('notenDaten'));
            if (Array.isArray(arrMK)) cb(arrMK); else cb([]);
          } catch { cb([]); }
        });
      } else {
        try {
          const arrMK = JSON.parse(localStorage.getItem('notenDaten'));
          if (Array.isArray(arrMK)) cb(arrMK); else cb([]);
        } catch { cb([]); }
      }
    }

    getFachKategorie(fachNameMK, fachCodeMK = '', extractedCategoryMK = '') {
      const knownCategoriesMK = new Set([
        'naturwissenschaften',
        'sprache',
        'gesellschaft',
        'kunst',
        'sport',
        'wahlfaecher',
        'sonstige'
      ]);

      const extractedNormalizedMK = this.normalizeTextMK(extractedCategoryMK);
      if (knownCategoriesMK.has(extractedNormalizedMK) && extractedNormalizedMK !== 'sonstige') {
        return extractedNormalizedMK;
      }

      const searchValuesMK = [fachNameMK, fachCodeMK].filter(Boolean);
      const normalizedValuesMK = searchValuesMK.map((valueMK) => this.normalizeTextMK(valueMK));
      const tokensMK = new Set();
      normalizedValuesMK.forEach((valueMK) => {
        this.tokenizeTextMK(valueMK).forEach((tokenMK) => tokensMK.add(tokenMK));
      });

      let primaryCodeMK = '';
      const codeSourceMK = String(fachCodeMK || fachNameMK || '').trim();
      if (codeSourceMK) {
        const firstChunkMK = codeSourceMK.split(/[\s\-_]/).find(Boolean) || '';
        const lettersMK = firstChunkMK.replace(/[^A-Za-z]/g, '');
        if (lettersMK.length >= 1 && lettersMK.length <= 6) {
          primaryCodeMK = lettersMK.toUpperCase();
        }
      }

      const categoryByCodeMK = {
        D: 'sprache',
        DE: 'sprache',
        DEU: 'sprache',
        GER: 'sprache',
        E: 'sprache',
        EN: 'sprache',
        ENG: 'sprache',
        F: 'sprache',
        FR: 'sprache',
        FRA: 'sprache',
        ES: 'sprache',
        SPA: 'sprache',
        IT: 'sprache',
        ITA: 'sprache',
        L: 'sprache',
        LA: 'sprache',
        LAT: 'sprache',
        RU: 'sprache',
        RUS: 'sprache',
        PT: 'sprache',
        POR: 'sprache',
        B: 'naturwissenschaften',
        BI: 'naturwissenschaften',
        BIO: 'naturwissenschaften',
        C: 'naturwissenschaften',
        CH: 'naturwissenschaften',
        CHE: 'naturwissenschaften',
        P: 'naturwissenschaften',
        PH: 'naturwissenschaften',
        PHY: 'naturwissenschaften',
        M: 'naturwissenschaften',
        MA: 'naturwissenschaften',
        MAT: 'naturwissenschaften',
        MATH: 'naturwissenschaften',
        IN: 'naturwissenschaften',
        INFO: 'naturwissenschaften',
        INF: 'naturwissenschaften',
        ICT: 'naturwissenschaften',
        NAWI: 'naturwissenschaften',
        NW: 'naturwissenschaften',
        G: 'gesellschaft',
        GG: 'gesellschaft',
        GE: 'gesellschaft',
        GS: 'gesellschaft',
        GES: 'gesellschaft',
        GEO: 'gesellschaft',
        HIS: 'gesellschaft',
        HIST: 'gesellschaft',
        WR: 'gesellschaft',
        WUR: 'gesellschaft',
        POL: 'gesellschaft',
        SOZ: 'gesellschaft',
        ETH: 'gesellschaft',
        REL: 'gesellschaft',
        MU: 'kunst',
        MUS: 'kunst',
        BG: 'kunst',
        BK: 'kunst',
        KU: 'kunst',
        ART: 'kunst',
        DRA: 'kunst',
        S: 'sport',
        SP: 'sport',
        PE: 'sport',
        SPORT: 'sport',
        PS: 'wahlfaecher'
      };

      if (primaryCodeMK) {
        const codeCandidatesMK = [
          primaryCodeMK,
          primaryCodeMK.slice(0, 3),
          primaryCodeMK.slice(0, 2),
          primaryCodeMK.slice(0, 1)
        ].filter(Boolean);

        for (const candidateMK of codeCandidatesMK) {
          if (categoryByCodeMK[candidateMK]) {
            return categoryByCodeMK[candidateMK];
          }
        }
      }

      for (const [kategorieMK, faecherMK] of Object.entries(this.subjectsByCategory)) {
        for (const fachMK of faecherMK) {
          const normalizedHintMK = this.normalizeTextMK(fachMK);
          if (!normalizedHintMK) continue;

          // Short hints (like DE, EN, MA) are matched as tokens only.
          if (normalizedHintMK.length <= 3) {
            if (tokensMK.has(normalizedHintMK)) {
              return kategorieMK;
            }
            continue;
          }

          if (normalizedValuesMK.some((valueMK) => valueMK.includes(normalizedHintMK))) {
            return kategorieMK;
          }
        }
      }

      if (knownCategoriesMK.has(extractedNormalizedMK)) {
        return extractedNormalizedMK;
      }

      return 'sonstige';
    }

    closeAllPanels() {
      [
        { id: "notenrechner-calc-panel", btn: document.getElementById("notenrechner-calc-btn") },
        { id: "notenrechner-custom-panel", btn: document.getElementById("notenrechner-custom-btn") },
        { id: "pluspoints-overlay-panel", btn: document.getElementById("pluspoints-overlay-btn") },
        { id: "improvement-overlay-panel", btn: document.getElementById("improvement-overlay-btn") },
        { id: "gamification-overlay-panel", btn: document.getElementById("gamification-overlay-btn") }
      ].forEach(({ id, btn }) => {
        const pMK = document.getElementById(id);
        if (pMK) pMK.remove();
        if (btn) {
          btn.style.outline = "none";
          btn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.18)";
          btn.style.width = "50px";
          btn.style.height = "50px";
        }
      });
    }

    create() {
      if (document.getElementById(this.buttonId)) return;
      
      const positionMK = this.getDefaultPosition();
      const buttonMK = document.createElement("button");
      buttonMK.id = this.buttonId;
      buttonMK.title = "Achievements";
      buttonMK.style.cssText = `
        position: fixed;
        width: 50px;
        height: 50px;
        background: #fff;
        color: white;
        border: 1px solid #ffb300;
        border-radius: 10px;
        cursor: pointer;
        z-index: 10000;
        font-size: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        display: flex; align-items: center; justify-content: center;
        right: ${positionMK.right}px; bottom: ${positionMK.bottom}px;
        overflow: visible;
        padding: 0;
        transition: box-shadow 0.25s, outline 0.25s, width 0.25s, height 0.25s;
      `;
      buttonMK.innerHTML = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="14" fill="#ffb300"/><path d="M9 8h10v3a5 5 0 01-10 0V8z" fill="#fff"/><rect x="12" y="18" width="4" height="4" rx="2" fill="#fff"/></svg>`;
      
      this.buttonManager.registerButton(this.buttonId, buttonMK, {});
      
      buttonMK.addEventListener("click", (eMK) => {
        if (this.isPanelOpen()) {
          const pMK = document.getElementById(this.panelId);
          if (pMK) pMK.remove();
          buttonMK.style.outline = "none";
          buttonMK.style.boxShadow = "0 2px 8px rgba(0,0,0,0.18)";
          buttonMK.style.width = "50px";
          buttonMK.style.height = "50px";
          return;
        }
        this.closeAllPanels();
        this.buttonManager.markButtonOpening(this.buttonId);
        buttonMK.style.outline = "3px solid #ffe082";
        buttonMK.style.boxShadow = "0 0 16px 4px #ffe082, 0 2px 8px rgba(0,0,0,0.18)";
        buttonMK.style.width = "58px";
        buttonMK.style.height = "58px";
        
        this.createPanel(buttonMK);
      });
      
      document.addEventListener("click", (eMK) => {
        const panelMK = document.getElementById(this.panelId);
        if (!panelMK && buttonMK.style.outline !== "none") {
          buttonMK.style.outline = "none";
          buttonMK.style.boxShadow = "0 2px 8px rgba(0,0,0,0.18)";
          buttonMK.style.width = "50px";
          buttonMK.style.height = "50px";
        }
      }, true);
      
      document.body.appendChild(buttonMK);
    }

    createPanel(buttonMK) {
      const panelMK = document.createElement("div");
      panelMK.id = this.panelId;
      const panelWidthMK = 520, panelHeightMK = 580;
      const btnLeftMK = parseInt(buttonMK.style.left);
      const btnTopMK = parseInt(buttonMK.style.top);

      const panelLeft = window.innerWidth - panelWidthMK - 75;
      const panelTop = window.innerHeight - panelHeightMK - 80;
      
      panelMK.style.cssText = `
        position: fixed;
        left: ${panelLeft}px;
        top: ${panelTop}px;
        width: ${panelWidthMK}px;
        height: ${panelHeightMK}px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.18);
        z-index: 9999;
        padding: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      `;
      
      const closeBtnMK = document.createElement("button");
      closeBtnMK.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 1L1 13M1 1L13 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      closeBtnMK.style.cssText = `
        position: absolute;
        top: 16px;
        right: 16px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 12px;
        width: 32px; height: 32px;
        cursor: pointer;
        z-index: 10002;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.2s ease;
        backdrop-filter: blur(5px);
      `;
      closeBtnMK.onmouseover = () => { closeBtnMK.style.background = 'rgba(255, 255, 255, 0.35)'; closeBtnMK.style.transform = 'scale(1.05)'; };
      closeBtnMK.onmouseout = () => { closeBtnMK.style.background = 'rgba(255, 255, 255, 0.2)'; closeBtnMK.style.transform = 'scale(1)'; };
      closeBtnMK.onclick = () => {
        panelMK.remove();
        buttonMK.style.outline = "none";
        buttonMK.style.boxShadow = "0 2px 8px rgba(0,0,0,0.18)";
        buttonMK.style.width = "50px";
        buttonMK.style.height = "50px";
      };
      
      const contentMK = document.createElement('div');
      contentMK.style.cssText = 'padding: 0; overflow-y: auto; flex: 1; display: flex; flex-direction: column;';
      contentMK.innerHTML = `
        <div style="background: linear-gradient(135deg, #ffb300, #ffa000); color: white; padding: 20px 18px 16px 18px; margin: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding-right: 40px;">
            <div>
              <div style="font-size: 20px; font-weight: bold; margin-bottom: 6px;">🏆 Achievements</div>
              <div style="font-size: 14px; opacity: 0.9;">Sammle Erfolge für deine Leistungen</div>
            </div>
            <div id="achievement-counter" style="font-size:14px;color:#b36a00;background:rgba(255,255,255,0.9);padding:4px 10px;border-radius:12px;font-weight:bold;box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              0 / 0
            </div>
          </div>
        </div>
        
        <div style="padding: 18px; flex: 1; overflow-y: auto;">
            <div style="font-size: 12px; color: #888; margin-bottom: 10px; padding: 8px; background: #fff8e1; border-radius: 6px; border-left: 3px solid #ffb300;">
            💡 <strong>Tipp:</strong> Bewege die Maus über ein Achievement oder klicke darauf, um zu erfahren, wie du es erreicht hast!
            </div>
            
            <div id="achievement-categories" style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 15px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">
            <button class="category-tab active" data-category="all" style="padding: 6px 12px; border: 1px solid #ffb300; background: #ffb300; color: white; border-radius: 15px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                Alle
            </button>
            <button class="category-tab" data-category="erste_schritte" style="padding: 6px 12px; border: 1px solid #ffb300; background: white; color: #ffb300; border-radius: 15px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                🚀 Start
            </button>
            <button class="category-tab" data-category="noten" style="padding: 6px 12px; border: 1px solid #ffb300; background: white; color: #ffb300; border-radius: 15px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                📝 Noten
            </button>
            <button class="category-tab" data-category="bestehen" style="padding: 6px 12px; border: 1px solid #ffb300; background: white; color: #ffb300; border-radius: 15px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                ✅ Bestehen
            </button>
            <button class="category-tab" data-category="verbesserung" style="padding: 6px 12px; border: 1px solid #ffb300; background: white; color: #ffb300; border-radius: 15px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                📈 Progress
            </button>
            <button class="category-tab" data-category="durchschnitt" style="padding: 6px 12px; border: 1px solid #ffb300; background: white; color: #ffb300; border-radius: 15px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                📊 Schnitt
            </button>
            <button class="category-tab" data-category="perfektion" style="padding: 6px 12px; border: 1px solid #ffb300; background: white; color: #ffb300; border-radius: 15px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                💎 Perfektion
            </button>
            <button class="category-tab" data-category="faecher" style="padding: 6px 12px; border: 1px solid #ffb300; background: white; color: #ffb300; border-radius: 15px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                📚 Fächer
            </button>
            <button class="category-tab" data-category="kategorien" style="padding: 6px 12px; border: 1px solid #ffb300; background: white; color: #ffb300; border-radius: 15px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                🌈 Kategorien
            </button>
            <button class="category-tab" data-category="genie" style="padding: 6px 12px; border: 1px solid #ffb300; background: white; color: #ffb300; border-radius: 15px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                🧠 Genie
            </button>
            <button class="category-tab" data-category="besondere" style="padding: 6px 12px; border: 1px solid #ffb300; background: white; color: #ffb300; border-radius: 15px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                🌟 Besondere
            </button>
            <button class="category-tab" data-category="motivation" style="padding: 6px 12px; border: 1px solid #ffb300; background: white; color: #ffb300; border-radius: 15px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                💪 Motivation
            </button>
            <button class="category-tab" data-category="spezial" style="padding: 6px 12px; border: 1px solid #ffb300; background: white; color: #ffb300; border-radius: 15px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                🎉 Spezial
            </button>
            <button class="category-tab" data-category="secret" style="padding: 6px 12px; border: 1px solid #ffb300; background: white; color: #ffb300; border-radius: 15px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                🔒 Secret
            </button>
            </div>
            
            <div id="gamification-content">
            </div>
        </div>
      `;
      
      panelMK.appendChild(contentMK);
      panelMK.appendChild(closeBtnMK);
      document.body.appendChild(panelMK);

      this.initializeAchievements();
    }

    initializeAchievements() {
      this.loadNotenDaten((notenDatenMK) => {
        this.renderAchievements(notenDatenMK);
      });
    }

    getAchievementDefinitions() {
      return [
        { id: "firstTest", icon: "📝", text: () => "Aller Anfang - Erste Note eingetragen!", difficulty: "easy", category: "erste_schritte" },
        { id: "highFive", icon: "🖐️", text: () => "High Five - 5 Noten gesammelt!", difficulty: "easy", category: "erste_schritte" },
        { id: "tenGrades", icon: "📚", text: () => "Sammler - 10 Noten erreicht!", difficulty: "easy", category: "erste_schritte" },
        { id: "fifteenGrades", icon: "📚", text: () => "Streber? - 15 Noten erreicht!", difficulty: "medium", category: "erste_schritte" },
        { id: "quarterCentury", icon: "🏛️", text: () => "Vierteljahrhundert - 25 Noten!", difficulty: "medium", category: "erste_schritte" },
        { id: "thirtyGrades", icon: "📚", text: () => "Bibliothek - 30 Noten erreicht!", difficulty: "medium", category: "erste_schritte" },
        { id: "halfCentury", icon: "💾", text: () => "Datenbank - 50 Noten!", difficulty: "hard", category: "erste_schritte" },
        { id: "centurion", icon: "💯", text: () => "Centurion - 100 Noten gesammelt!", difficulty: "hard", category: "erste_schritte" },
        { id: "survival", icon: "⛺", text: () => "Überlebenskünstler - 5 Fächer gleichzeitig!", difficulty: "easy", category: "erste_schritte" },
        { id: "subjectHoarder", icon: "🎒", text: () => "Fächersammler - Noten in 10 Fächern!", difficulty: "medium", category: "erste_schritte" },

        { id: "first6", icon: "🏆", text: (fach) => `Perfektion - Erste 6.0${fach ? " in " + fach : ""}!`, difficulty: "medium", category: "noten" },
        { id: "first55", icon: "🌟", text: (fach) => `Fast Perfekt - Erste 5.5${fach ? " in " + fach : ""}!`, difficulty: "easy", category: "noten" },
        { id: "first5", icon: "👍", text: (fach) => `Gut gemacht - Erste 5.0${fach ? " in " + fach : ""}!`, difficulty: "easy", category: "noten" },
        { id: "first45", icon: "🆗", text: (fach) => `Solide - Erste 4.5${fach ? " in " + fach : ""}!`, difficulty: "easy", category: "noten" },
        { id: "first4", icon: "🛡️", text: (fach) => `Gerettet - Erste 4.0${fach ? " in " + fach : ""}!`, difficulty: "easy", category: "noten" },
        { id: "firstFail", icon: "⚠️", text: (fach) => `Ups - Erste ungenügende Note${fach ? " in " + fach : ""}!`, difficulty: "easy", category: "noten" },
        { id: "first3", icon: "📉", text: (fach) => `Tiefpunkt - Erste 3.0${fach ? " in " + fach : ""}!`, difficulty: "medium", category: "noten" },
        { id: "first2", icon: "📉", text: (fach) => `Absturz - Erste 2.0${fach ? " in " + fach : ""}!`, difficulty: "hard", category: "noten" },
        { id: "bottomBarrel", icon: "💀", text: (fach) => `Autsch - Eine 1.0 kassiert${fach ? " in " + fach : ""}!`, difficulty: "hard", category: "noten" },
        { id: "overSix", icon: "🚀", text: (fach) => `Hacker - Note über 6.0${fach ? " in " + fach : ""}!`, difficulty: "hard", category: "noten" },
        
        { id: "doubleSix", icon: "🎲", text: () => "Pasch - Zwei 6.0er gesammelt!", difficulty: "medium", category: "perfektion" },
        { id: "hatTrick", icon: "🎩", text: () => "Hattrick - Drei 6.0er gesammelt!", difficulty: "medium", category: "perfektion" },
        { id: "handfulSixes", icon: "🤚", text: () => "Eine Handvoll Sechser - 5x Note 6.0!", difficulty: "hard", category: "perfektion" },
        { id: "perfectTen", icon: "👑", text: () => "Königsklasse - 10x Note 6.0!", difficulty: "hard", category: "perfektion" },
        { id: "streak", icon: "🔥", text: () => "On Fire - 3x Note 6.0 in Folge!", difficulty: "hard", category: "perfektion" },
        { id: "winningStreak", icon: "📈", text: () => "Lauf - 5 gute Noten (>=5.0) in Folge!", difficulty: "medium", category: "perfektion" },

        { id: "survivorAvg", icon: "🏊", text: () => "Schwimmer - Schnitt über 4.0!", difficulty: "easy", category: "durchschnitt" },
        { id: "solidAvg", icon: "🧱", text: () => "Stabil - Schnitt über 4.5!", difficulty: "medium", category: "durchschnitt" },
        { id: "goodAvg", icon: "⭐", text: () => "Vorbild - Schnitt über 5.0!", difficulty: "medium", category: "durchschnitt" },
        { id: "highPerformer", icon: "💎", text: () => "Überflieger - Schnitt über 5.5!", difficulty: "hard", category: "durchschnitt" },
        { id: "geniusAvg", icon: "🧠", text: () => "Genie - Schnitt über 5.75!", difficulty: "hard", category: "durchschnitt" },
        { id: "onTheEdge", icon: "🧗", text: () => "Klippenhänger - Schnitt exakt 4.0!", difficulty: "hard", category: "durchschnitt" },
        { id: "closeCall", icon: "😅", text: () => "Knapp vorbei - Schnitt zwischen 3.9 und 3.99!", difficulty: "medium", category: "durchschnitt" },
        { id: "allPassed", icon: "🛡️", text: () => "Weiße Weste - Keine ungenügende Note!", difficulty: "medium", category: "durchschnitt" },

        { id: "germanPoet", icon: "✒️", text: () => "Dichter - Deutsch Schnitt > 5.0!", difficulty: "medium", category: "faecher" },
        { id: "germanGoethe", icon: "📖", text: () => "Goethe - Deutsch Schnitt > 5.5!", difficulty: "hard", category: "faecher" },
        { id: "englishSpeaker", icon: "🇬🇧", text: () => "Speaker - Englisch Schnitt > 5.0!", difficulty: "medium", category: "faecher" },
        { id: "englishNative", icon: "💂", text: () => "Native - Englisch Schnitt > 5.5!", difficulty: "hard", category: "faecher" },
        { id: "frenchBonjour", icon: "🥐", text: () => "Bonjour - Französisch Schnitt > 4.0!", difficulty: "easy", category: "faecher" },
        { id: "frenchBaguette", icon: "🥖", text: () => "Baguette - Französisch Schnitt > 5.0!", difficulty: "medium", category: "faecher" },
        { id: "frenchEiffel", icon: "🗼", text: () => "Eiffel - Französisch Schnitt > 5.5!", difficulty: "hard", category: "faecher" },
        { id: "polyglot", icon: "🗣️", text: () => "Sprachtalent - 2 Sprachen über 5.0!", difficulty: "medium", category: "faecher" },

        { id: "mathStart", icon: "📐", text: () => "Rechner - Mathe Schnitt > 4.0!", difficulty: "easy", category: "faecher" },
        { id: "mathPro", icon: "🧮", text: () => "Mathematiker - Mathe Schnitt > 5.0!", difficulty: "medium", category: "faecher" },
        { id: "mathGenius", icon: "👽", text: () => "Alien - Mathe Schnitt > 5.5!", difficulty: "hard", category: "faecher" },
        { id: "labRat", icon: "🔬", text: () => "Laborratte - Naturwiss. Schnitt > 4.5!", difficulty: "easy", category: "faecher" },
        { id: "scientist", icon: "🧪", text: () => "Wissenschaftler - Naturwiss. Schnitt > 5.0!", difficulty: "medium", category: "faecher" },
        { id: "nobelPrize", icon: "⚛️", text: () => "Nobelpreis - Naturwiss. Schnitt > 5.5!", difficulty: "hard", category: "faecher" },
        { id: "bioFan", icon: "🧬", text: () => "Biologe - Bio Schnitt > 5.0!", difficulty: "medium", category: "faecher" },
        { id: "chemPro", icon: "🧪", text: () => "Chemiker - Chemie Schnitt > 5.0!", difficulty: "medium", category: "faecher" },
        { id: "physEinstein", icon: "🍎", text: () => "Physiker - Physik Schnitt > 5.0!", difficulty: "medium", category: "faecher" },
        { id: "hacker", icon: "💻", text: () => "Hacker - Informatik Schnitt > 5.5!", difficulty: "hard", category: "faecher" },

        { id: "explorer", icon: "🌍", text: () => "Entdecker - Geo/Geschichte Schnitt > 4.5!", difficulty: "easy", category: "faecher" },
        { id: "geoWorld", icon: "🗺️", text: () => "Weltenbummler - Geografie Schnitt > 5.0!", difficulty: "medium", category: "faecher" },
        { id: "historian", icon: "📜", text: () => "Historiker - Geschichte Schnitt > 5.0!", difficulty: "medium", category: "faecher" },
        { id: "timeTraveler", icon: "⏳", text: () => "Zeitreisender - Geschichte Schnitt > 5.5!", difficulty: "hard", category: "faecher" },
        { id: "creative", icon: "🎨", text: () => "Kreativ - Kunst/Musik Schnitt > 5.0!", difficulty: "medium", category: "faecher" },
        { id: "artPicasso", icon: "🖌️", text: () => "Picasso - BG Schnitt > 5.0!", difficulty: "medium", category: "faecher" },
        { id: "musicMozart", icon: "🎼", text: () => "Mozart - Musik Schnitt > 5.0!", difficulty: "medium", category: "faecher" },
        { id: "virtuoso", icon: "🎻", text: () => "Virtuose - Kunst/Musik Schnitt > 5.5!", difficulty: "hard", category: "faecher" },
        { id: "athlete", icon: "🏃", text: () => "Athlet - Sport Schnitt > 5.0!", difficulty: "medium", category: "faecher" },
        { id: "olympian", icon: "🥇", text: () => "Olympionike - Sport Schnitt > 5.5!", difficulty: "hard", category: "faecher" },

        { id: "comeback", icon: "📈", text: (fach) => `Comeback - Starke Verbesserung${fach ? " in " + fach : ""}!`, difficulty: "medium", category: "verbesserung" },
        { id: "risingStar", icon: "🚀", text: (fach) => `Aufsteiger - 3x verbessert${fach ? " in " + fach : ""}!`, difficulty: "medium", category: "verbesserung" },
        { id: "phoenixRise", icon: "🦅", text: (fach) => `Phönix - Von <4.0 auf >=5.0${fach ? " in " + fach : ""}!`, difficulty: "hard", category: "verbesserung" },
        { id: "safeRun", icon: "🛡️", text: () => "Nerven aus Stahl - 10 bestandene Noten in Folge!", difficulty: "hard", category: "bestehen" },
        { id: "monthRunner", icon: "📅", text: (monat) => `Monatsmaschine - 5 Noten in ${monat || "einem Monat"}!`, difficulty: "medium", category: "motivation" },
        { id: "heavyLifter", icon: "🏋️", text: (fach) => `Schwergewicht - Gewichtung >=2 mit Note >=5.0${fach ? " in " + fach : ""}!`, difficulty: "medium", category: "spezial" },
        { id: "categoryChampion", icon: "🌈", text: () => "Kategorien-Meister - 3 Kategorien mit Schnitt >=5.0!", difficulty: "hard", category: "kategorien" },
        { id: "subjectElite", icon: "🎓", text: () => "Fach-Elite - 4 Fächer mit Schnitt >=5.0!", difficulty: "medium", category: "genie" },
        { id: "rollercoaster", icon: "🎢", text: (fach) => `Achterbahn - Notenunterschied > 2.5${fach ? " in " + fach : ""}!`, difficulty: "medium", category: "spezial" },
        { id: "mixedBag", icon: "🎭", text: (fach) => `Alles dabei - 6.0 und <4.0${fach ? " in " + fach : ""}!`, difficulty: "medium", category: "spezial" },
        { id: "balanced", icon: "⚖️", text: () => "Perfekte Balance - Schnitt genau .0 oder .5!", difficulty: "medium", category: "spezial" },
        { id: "consistency", icon: "🤖", text: (fach) => `Roboter - Alle Noten gleich${fach ? " in " + fach : ""}!`, difficulty: "hard", category: "spezial" },

        { id: "mondayMotivation", icon: "☕", text: (fach) => `Montags-Motivation - 6.0 am Montag${fach ? " in " + fach : ""}!`, difficulty: "medium", category: "motivation" },
        { id: "fridayFeeling", icon: "🎉", text: (fach) => `Hoch die Hände - 6.0 am Freitag${fach ? " in " + fach : ""}!`, difficulty: "medium", category: "motivation" },
        { id: "weekendWarrior", icon: "⚔️", text: (fach) => `Wochenend-Krieger - Prüfung am Wochenende${fach ? " in " + fach : ""}!`, difficulty: "easy", category: "spezial" },
        { id: "luckyDay", icon: "🍀", text: (fach) => `Glückstag - Gute Note am Freitag den 13.${fach ? " in " + fach : ""}!`, difficulty: "hard", category: "spezial" },
        { id: "badLuck", icon: "🐈‍⬛", text: (fach) => `Pechvogel - Ungenügend am Freitag den 13.${fach ? " in " + fach : ""}!`, difficulty: "medium", category: "spezial" },
        { id: "summerVibes", icon: "☀️", text: (fach) => `Sommergefühle - Gute Note im Sommer${fach ? " in " + fach : ""}!`, difficulty: "easy", category: "spezial" },
        { id: "winterWonder", icon: "❄️", text: (fach) => `Eiskalt - Gute Note im Winter${fach ? " in " + fach : ""}!`, difficulty: "easy", category: "spezial" },

        { id: "answer42", icon: "🌌", text: () => "Die Antwort - Schnitt ist exakt 4.2!", difficulty: "hard", category: "secret" },
        { id: "sniper", icon: "🎯", text: (fach) => `Scharfschütze - 3x exakt 4.0${fach ? " in " + fach : ""}!`, difficulty: "hard", category: "secret" },
        { id: "scrapedBy", icon: "🐌", text: () => "Gerade so - Schnitt zwischen 4.0 und 4.1!", difficulty: "medium", category: "secret" },
        { id: "averageJoe", icon: "😐", text: () => "Durchschnittstyp - Schnitt zwischen 4.0 und 5.0!", difficulty: "easy", category: "secret" },
        { id: "allRounder", icon: "🤹", text: () => "Allrounder - In jeder Kategorie bestanden!", difficulty: "hard", category: "secret" },
        { id: "specialist", icon: "🤓", text: () => "Fachidiot - Eine 6.0 und eine <3.5!", difficulty: "medium", category: "secret" }
      ];
    }

    getAchievementRequirements(achievementId) {
      return "Finde es heraus!";
    }

    getAchievementExplanation(achievementIdMK, detailMK) {
      const def = this.getAchievementDefinitions().find(d => d.id === achievementIdMK);
      if (def && typeof def.text === 'function') {
        return def.text(detailMK);
      }
      return "Achievement freigeschaltet!";
    }

    normalizeTextMK(valueMK) {
      return String(valueMK || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    }

    tokenizeTextMK(valueMK) {
      return this.normalizeTextMK(valueMK)
        .split(/[^a-z0-9]+/g)
        .filter(Boolean);
    }

    parseGradeValueMK(valueMK) {
      if (typeof valueMK === 'number') {
        return Number.isFinite(valueMK) ? valueMK : NaN;
      }

      if (typeof valueMK === 'string') {
        const parsedMK = parseFloat(valueMK.replace(',', '.').trim());
        return Number.isFinite(parsedMK) ? parsedMK : NaN;
      }

      return NaN;
    }

    parseDateStringMK(dateTextMK) {
      if (typeof dateTextMK !== 'string') {
        return null;
      }

      const trimmedDateMK = dateTextMK.trim();
      const matchMK = trimmedDateMK.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
      if (!matchMK) {
        return null;
      }

      const dayMK = parseInt(matchMK[1], 10);
      const monthMK = parseInt(matchMK[2], 10);
      const yearMK = parseInt(matchMK[3], 10);
      const parsedDateMK = new Date(yearMK, monthMK - 1, dayMK);

      if (
        Number.isNaN(parsedDateMK.getTime()) ||
        parsedDateMK.getFullYear() !== yearMK ||
        parsedDateMK.getMonth() !== monthMK - 1 ||
        parsedDateMK.getDate() !== dayMK
      ) {
        return null;
      }

      return parsedDateMK;
    }

    buildSubjectMetaMK(fachMK, fallbackIndexMK = 0) {
      const fachCodeMK = String((fachMK && fachMK.fachCode) || '').trim();
      const fachLangNameMK = String((fachMK && fachMK.fachLangName) || '').trim();
      const fachNameMK = String((fachMK && fachMK.fach) || '').trim();
      const displayNameMK = fachLangNameMK || fachNameMK || fachCodeMK || `Fach ${fallbackIndexMK + 1}`;

      const rawValuesMK = [fachLangNameMK, fachNameMK, fachCodeMK].filter(Boolean);
      const normalizedValuesMK = rawValuesMK.map((valueMK) => this.normalizeTextMK(valueMK));
      const tokenSetMK = new Set();
      normalizedValuesMK.forEach((valueMK) => {
        this.tokenizeTextMK(valueMK).forEach((tokenMK) => tokenSetMK.add(tokenMK));
      });

      let primaryCodeMK = '';
      const codeSourceMK = fachCodeMK || fachLangNameMK || fachNameMK;
      if (codeSourceMK) {
        const firstChunkMK = codeSourceMK.split(/[\s\-_]/).find(Boolean) || '';
        const lettersOnlyMK = firstChunkMK.replace(/[^A-Za-z]/g, '');
        if (lettersOnlyMK.length >= 1 && lettersOnlyMK.length <= 6) {
          primaryCodeMK = lettersOnlyMK.toUpperCase();
          tokenSetMK.add(primaryCodeMK.toLowerCase());
        }
      }

      return {
        displayName: displayNameMK,
        code: fachCodeMK,
        normalizedValues: normalizedValuesMK,
        tokenSet: tokenSetMK,
        primaryCode: primaryCodeMK
      };
    }

    subjectMatchesMK(subjectMetaMK, configMK = {}) {
      if (!subjectMetaMK) {
        return false;
      }

      const codesMK = Array.isArray(configMK.codes) ? configMK.codes : [];
      const tokensMK = Array.isArray(configMK.tokens) ? configMK.tokens : [];
      const containsMK = Array.isArray(configMK.contains) ? configMK.contains : [];

      if (codesMK.length > 0 && subjectMetaMK.primaryCode) {
        const matchedByCodeMK = codesMK.some((codeMK) => String(codeMK || '').toUpperCase() === subjectMetaMK.primaryCode);
        if (matchedByCodeMK) {
          return true;
        }
      }

      if (tokensMK.length > 0) {
        const matchedByTokenMK = tokensMK.some((tokenMK) => {
          const normalizedTokenMK = this.normalizeTextMK(tokenMK);
          return normalizedTokenMK && subjectMetaMK.tokenSet.has(normalizedTokenMK);
        });

        if (matchedByTokenMK) {
          return true;
        }
      }

      if (containsMK.length > 0) {
        const matchedByContainsMK = containsMK.some((containsTextMK) => {
          const normalizedContainsMK = this.normalizeTextMK(containsTextMK);
          return normalizedContainsMK && subjectMetaMK.normalizedValues.some((valueMK) => valueMK.includes(normalizedContainsMK));
        });

        if (matchedByContainsMK) {
          return true;
        }
      }

      return false;
    }

    sortGradeEntriesMK(entriesMK) {
      return [...entriesMK].sort((aMK, bMK) => {
        const hasDateAMK = !!aMK.dateObj;
        const hasDateBMK = !!bMK.dateObj;

        if (hasDateAMK && hasDateBMK) {
          const timeDiffMK = aMK.dateObj.getTime() - bMK.dateObj.getTime();
          if (timeDiffMK !== 0) {
            return timeDiffMK;
          }
        } else if (hasDateAMK !== hasDateBMK) {
          return hasDateAMK ? -1 : 1;
        }

        return aMK.order - bMK.order;
      });
    }

    isApproxGradeMK(valueMK, targetMK, toleranceMK = 0.05) {
      return Math.abs(valueMK - targetMK) <= toleranceMK;
    }

    processAchievements(notenDatenMK) {
      const achievedMK = {};
      const detailsMK = {};
      
      if (!Array.isArray(notenDatenMK) || notenDatenMK.length === 0) {
        return { achieved: achievedMK, details: detailsMK };
      }

      let totalGradesMK = 0;
      let totalSumMK = 0;
      let totalWeightMK = 0;
      let validSubjectCountMK = 0;
      let allPassedMK = true;
      let count6MK = 0;
      let hasBelowThreeFiveMK = false;
      let languageSubjectsOverFiveMK = 0;
      let subjectsOverFiveMK = 0;
      let sequenceMK = 0;
      const monthGradeCountMK = new Map();

      const allGradesMK = [];
      const categoryKeysMK = ['naturwissenschaften', 'sprache', 'gesellschaft', 'kunst', 'sport', 'wahlfaecher', 'sonstige'];
      const catStatsMK = {};
      categoryKeysMK.forEach((categoryMK) => {
        catStatsMK[categoryMK] = { sum: 0, weight: 0, count: 0, passed: true };
      });

      notenDatenMK.forEach((fachMK, fachIndexMK) => {
        if (!fachMK || !Array.isArray(fachMK.noten) || fachMK.noten.length === 0) {
          return;
        }

        const subjectMetaMK = this.buildSubjectMetaMK(fachMK, fachIndexMK);
        const categoryMK = this.getFachKategorie(subjectMetaMK.displayName, subjectMetaMK.code, fachMK.kategorie);
        const rawWeightsMK = Array.isArray(fachMK.gewichtungen)
          ? fachMK.gewichtungen
          : Array.isArray(fachMK.gewichtung)
            ? fachMK.gewichtung
            : [];
        const rawDatesMK = Array.isArray(fachMK.daten) ? fachMK.daten : [];
        const gradeEntriesMK = [];

        fachMK.noten.forEach((rawGradeMK, gradeIndexMK) => {
          const gradeMK = this.parseGradeValueMK(rawGradeMK);
          if (!Number.isFinite(gradeMK)) {
            return;
          }

          let weightMK = this.parseGradeValueMK(rawWeightsMK[gradeIndexMK]);
          if (!Number.isFinite(weightMK) || weightMK <= 0) {
            weightMK = 1;
          }

          const dateTextMK = typeof rawDatesMK[gradeIndexMK] === 'string' ? rawDatesMK[gradeIndexMK].trim() : '';
          const dateObjMK = this.parseDateStringMK(dateTextMK);

          gradeEntriesMK.push({
            note: gradeMK,
            weight: weightMK,
            date: dateTextMK,
            dateObj: dateObjMK,
            order: sequenceMK++
          });
        });

        if (gradeEntriesMK.length === 0) {
          return;
        }

        validSubjectCountMK += 1;
        totalGradesMK += gradeEntriesMK.length;

        const weightedSumMK = gradeEntriesMK.reduce((sumMK, entryMK) => sumMK + entryMK.note * entryMK.weight, 0);
        const subjectWeightMK = gradeEntriesMK.reduce((sumMK, entryMK) => sumMK + entryMK.weight, 0);
        const subjectAvgMK = subjectWeightMK > 0 ? weightedSumMK / subjectWeightMK : 0;

        totalSumMK += weightedSumMK;
        totalWeightMK += subjectWeightMK;

        if (subjectAvgMK >= 5.0) {
          subjectsOverFiveMK += 1;
        }

        if (!catStatsMK[categoryMK]) {
          catStatsMK[categoryMK] = { sum: 0, weight: 0, count: 0, passed: true };
        }
        catStatsMK[categoryMK].sum += weightedSumMK;
        catStatsMK[categoryMK].weight += subjectWeightMK;
        catStatsMK[categoryMK].count += 1;
        if (subjectAvgMK < 4.0) {
          catStatsMK[categoryMK].passed = false;
        }

        if (gradeEntriesMK.some((entryMK) => entryMK.note < 4.0)) {
          allPassedMK = false;
        }
        if (gradeEntriesMK.some((entryMK) => entryMK.note < 3.5)) {
          hasBelowThreeFiveMK = true;
        }

        const orderedSubjectEntriesMK = this.sortGradeEntriesMK(gradeEntriesMK);

        if (orderedSubjectEntriesMK.length >= 2) {
          for (let gradeIndexMK = 1; gradeIndexMK < orderedSubjectEntriesMK.length; gradeIndexMK++) {
            const diffMK = orderedSubjectEntriesMK[gradeIndexMK].note - orderedSubjectEntriesMK[gradeIndexMK - 1].note;
            if (diffMK >= 1.5) {
              achievedMK.comeback = true;
              detailsMK.comeback = subjectMetaMK.displayName;
              break;
            }
          }

          let improveStreakMK = 0;
          for (let gradeIndexMK = 1; gradeIndexMK < orderedSubjectEntriesMK.length; gradeIndexMK++) {
            if (orderedSubjectEntriesMK[gradeIndexMK].note > orderedSubjectEntriesMK[gradeIndexMK - 1].note) {
              improveStreakMK += 1;
            } else {
              improveStreakMK = 0;
            }

            if (improveStreakMK >= 3) {
              achievedMK.risingStar = true;
              detailsMK.risingStar = subjectMetaMK.displayName;
              break;
            }
          }

          let hadLowGradeBeforeMK = false;
          for (const entryMK of orderedSubjectEntriesMK) {
            if (entryMK.note < 4.0) {
              hadLowGradeBeforeMK = true;
              continue;
            }

            if (hadLowGradeBeforeMK && entryMK.note >= 5.0) {
              achievedMK.phoenixRise = true;
              detailsMK.phoenixRise = subjectMetaMK.displayName;
              break;
            }
          }
        }

        const subjectNotesMK = gradeEntriesMK.map((entryMK) => entryMK.note);
        const minGradeMK = Math.min(...subjectNotesMK);
        const maxGradeMK = Math.max(...subjectNotesMK);

        if (maxGradeMK - minGradeMK > 2.5) {
          achievedMK.rollercoaster = true;
          detailsMK.rollercoaster = subjectMetaMK.displayName;
        }

        if (subjectNotesMK.length >= 3 && Math.abs(maxGradeMK - minGradeMK) < 0.001) {
          achievedMK.consistency = true;
          detailsMK.consistency = subjectMetaMK.displayName;
        }

        if (subjectNotesMK.some((gradeMK) => this.isApproxGradeMK(gradeMK, 6.0)) && subjectNotesMK.some((gradeMK) => gradeMK < 4.0)) {
          achievedMK.mixedBag = true;
          detailsMK.mixedBag = subjectMetaMK.displayName;
        }

        if (subjectNotesMK.filter((gradeMK) => this.isApproxGradeMK(gradeMK, 4.0, 0.01)).length >= 3) {
          achievedMK.sniper = true;
          detailsMK.sniper = subjectMetaMK.displayName;
        }

        const isGermanMK = this.subjectMatchesMK(subjectMetaMK, {
          codes: ['DE', 'D', 'DEU', 'GER'],
          tokens: ['deutsch', 'german'],
          contains: ['deutsch', 'german']
        });
        const isEnglishMK = this.subjectMatchesMK(subjectMetaMK, {
          codes: ['EN', 'ENG'],
          tokens: ['englisch', 'english'],
          contains: ['englisch', 'english']
        });
        const isFrenchMK = this.subjectMatchesMK(subjectMetaMK, {
          codes: ['FR', 'FRA'],
          tokens: ['franzosisch', 'franzoesisch', 'francais', 'french'],
          contains: ['franz', 'french']
        });
        const isMathMK = this.subjectMatchesMK(subjectMetaMK, {
          codes: ['MA', 'M', 'MAT', 'MATH'],
          tokens: ['mathe', 'mathematik', 'math'],
          contains: ['mathe', 'math']
        });
        const isBiologyMK = this.subjectMatchesMK(subjectMetaMK, {
          codes: ['BI', 'B', 'BIO'],
          tokens: ['biologie', 'biology', 'bio'],
          contains: ['bio']
        });
        const isChemistryMK = this.subjectMatchesMK(subjectMetaMK, {
          codes: ['CH', 'C', 'CHE', 'CHEM'],
          tokens: ['chemie', 'chemistry', 'chem'],
          contains: ['chem']
        });
        const isPhysicsMK = this.subjectMatchesMK(subjectMetaMK, {
          codes: ['PH', 'PHY'],
          tokens: ['physik', 'physics', 'phys'],
          contains: ['phys']
        });
        const isInformatikMK = this.subjectMatchesMK(subjectMetaMK, {
          codes: ['IN', 'INF', 'INFO', 'ICT', 'CS'],
          tokens: ['informatik', 'info', 'computer', 'programmieren', 'coding'],
          contains: ['info', 'inform', 'computer']
        });
        const isGeoMK = this.subjectMatchesMK(subjectMetaMK, {
          codes: ['GG', 'GEO', 'GE'],
          tokens: ['geo', 'geografie', 'geographie'],
          contains: ['geo', 'geogra']
        });
        const isHistoryMK = this.subjectMatchesMK(subjectMetaMK, {
          codes: ['GS', 'GES', 'HIS', 'HIST'],
          tokens: ['geschichte', 'history', 'histor'],
          contains: ['geschicht', 'histor']
        });
        const isMusicMK = this.subjectMatchesMK(subjectMetaMK, {
          codes: ['MU', 'MUS'],
          tokens: ['musik', 'music'],
          contains: ['musik', 'music']
        });
        const isArtMK = this.subjectMatchesMK(subjectMetaMK, {
          codes: ['BG', 'BK', 'KU', 'ART'],
          tokens: ['kunst', 'bildnerisch', 'gestaltung', 'zeichnen', 'art'],
          contains: ['kunst', 'art', 'bildner']
        });

        if (isMathMK) {
          if (subjectAvgMK > 4.0) achievedMK.mathStart = true;
          if (subjectAvgMK > 5.0) achievedMK.mathPro = true;
          if (subjectAvgMK > 5.5) achievedMK.mathGenius = true;
        }

        if (isGermanMK) {
          if (subjectAvgMK > 5.0) achievedMK.germanPoet = true;
          if (subjectAvgMK > 5.5) achievedMK.germanGoethe = true;
        }

        if (isEnglishMK) {
          if (subjectAvgMK > 5.0) achievedMK.englishSpeaker = true;
          if (subjectAvgMK > 5.5) achievedMK.englishNative = true;
        }

        if (isFrenchMK) {
          if (subjectAvgMK > 4.0) achievedMK.frenchBonjour = true;
          if (subjectAvgMK > 5.0) achievedMK.frenchBaguette = true;
          if (subjectAvgMK > 5.5) achievedMK.frenchEiffel = true;
        }

        if (isInformatikMK && subjectAvgMK > 5.5) {
          achievedMK.hacker = true;
        }

        if ((isGeoMK || isHistoryMK) && subjectAvgMK > 4.5) {
          achievedMK.explorer = true;
        }
        if (isGeoMK && subjectAvgMK > 5.0) {
          achievedMK.geoWorld = true;
        }
        if (isHistoryMK && subjectAvgMK > 5.0) {
          achievedMK.historian = true;
        }
        if (isHistoryMK && subjectAvgMK > 5.5) {
          achievedMK.timeTraveler = true;
        }

        if (categoryMK === 'naturwissenschaften') {
          if (subjectAvgMK > 4.5) achievedMK.labRat = true;
          if (isBiologyMK && subjectAvgMK > 5.0) achievedMK.bioFan = true;
          if (isChemistryMK && subjectAvgMK > 5.0) achievedMK.chemPro = true;
          if (isPhysicsMK && subjectAvgMK > 5.0) achievedMK.physEinstein = true;
        }

        if (categoryMK === 'kunst') {
          if (subjectAvgMK > 5.0) achievedMK.creative = true;
          if (subjectAvgMK > 5.5) achievedMK.virtuoso = true;
          if (isMusicMK && subjectAvgMK > 5.0) achievedMK.musicMozart = true;
          if (isArtMK && subjectAvgMK > 5.0) achievedMK.artPicasso = true;
        }

        if (categoryMK === 'sport') {
          if (subjectAvgMK > 5.0) achievedMK.athlete = true;
          if (subjectAvgMK > 5.5) achievedMK.olympian = true;
        }

        if (categoryMK === 'sprache' && subjectAvgMK >= 5.0) {
          languageSubjectsOverFiveMK += 1;
        }

        gradeEntriesMK.forEach((entryMK) => {
          if (!achievedMK.heavyLifter && entryMK.weight >= 2 && entryMK.note >= 5.0) {
            achievedMK.heavyLifter = true;
            detailsMK.heavyLifter = subjectMetaMK.displayName;
          }

          if (entryMK.dateObj) {
            const monthLabelMK = `${String(entryMK.dateObj.getMonth() + 1).padStart(2, '0')}.${entryMK.dateObj.getFullYear()}`;
            const monthKeyMK = `${entryMK.dateObj.getFullYear()}-${String(entryMK.dateObj.getMonth() + 1).padStart(2, '0')}`;
            const monthCountMK = (monthGradeCountMK.get(monthKeyMK) || 0) + 1;
            monthGradeCountMK.set(monthKeyMK, monthCountMK);

            if (monthCountMK >= 5 && !achievedMK.monthRunner) {
              achievedMK.monthRunner = true;
              detailsMK.monthRunner = monthLabelMK;
            }
          }

          allGradesMK.push({
            note: entryMK.note,
            fach: subjectMetaMK.displayName,
            date: entryMK.date,
            dateObj: entryMK.dateObj,
            weight: entryMK.weight,
            order: entryMK.order
          });
        });
      });

      if (totalGradesMK === 0) {
        return { achieved: achievedMK, details: detailsMK };
      }

      const orderedAllGradesMK = this.sortGradeEntriesMK(allGradesMK);
      let globalStreak6MK = 0;
      let globalStreakGoodMK = 0;
      let passingStreakMK = 0;

      orderedAllGradesMK.forEach((entryMK) => {
        const noteMK = entryMK.note;
        const fachNameMK = entryMK.fach;
        const isSixMK = this.isApproxGradeMK(noteMK, 6.0);

        if (isSixMK) {
          count6MK += 1;
        }

        if (isSixMK && !achievedMK.first6) {
          achievedMK.first6 = true;
          detailsMK.first6 = fachNameMK;
        }
        if (noteMK >= 5.5 && !isSixMK && !achievedMK.first55) {
          achievedMK.first55 = true;
          detailsMK.first55 = fachNameMK;
        }
        if (noteMK >= 5.0 && noteMK < 5.5 && !achievedMK.first5) {
          achievedMK.first5 = true;
          detailsMK.first5 = fachNameMK;
        }
        if (noteMK >= 4.5 && noteMK < 5.0 && !achievedMK.first45) {
          achievedMK.first45 = true;
          detailsMK.first45 = fachNameMK;
        }
        if (noteMK >= 4.0 && noteMK < 4.5 && !achievedMK.first4) {
          achievedMK.first4 = true;
          detailsMK.first4 = fachNameMK;
        }
        if (noteMK < 4.0 && !achievedMK.firstFail) {
          achievedMK.firstFail = true;
          detailsMK.firstFail = fachNameMK;
        }
        if (noteMK <= 3.0 && !achievedMK.first3) {
          achievedMK.first3 = true;
          detailsMK.first3 = fachNameMK;
        }
        if (noteMK <= 2.0 && !achievedMK.first2) {
          achievedMK.first2 = true;
          detailsMK.first2 = fachNameMK;
        }
        if (this.isApproxGradeMK(noteMK, 1.0) && !achievedMK.bottomBarrel) {
          achievedMK.bottomBarrel = true;
          detailsMK.bottomBarrel = fachNameMK;
        }
        if (noteMK > 6.0 && !achievedMK.overSix) {
          achievedMK.overSix = true;
          detailsMK.overSix = fachNameMK;
        }

        globalStreak6MK = isSixMK ? globalStreak6MK + 1 : 0;
        globalStreakGoodMK = noteMK >= 5.0 ? globalStreakGoodMK + 1 : 0;
        passingStreakMK = noteMK >= 4.0 ? passingStreakMK + 1 : 0;

        if (globalStreak6MK >= 3) {
          achievedMK.streak = true;
        }
        if (globalStreakGoodMK >= 5) {
          achievedMK.winningStreak = true;
        }
        if (passingStreakMK >= 10) {
          achievedMK.safeRun = true;
        }

        if (entryMK.dateObj) {
          const dayMK = entryMK.dateObj.getDay();
          const monthMK = entryMK.dateObj.getMonth();
          const dayOfMonthMK = entryMK.dateObj.getDate();

          if (dayMK === 1 && isSixMK) {
            achievedMK.mondayMotivation = true;
            detailsMK.mondayMotivation = fachNameMK;
          }
          if (dayMK === 5 && isSixMK) {
            achievedMK.fridayFeeling = true;
            detailsMK.fridayFeeling = fachNameMK;
          }
          if (dayMK === 0 || dayMK === 6) {
            achievedMK.weekendWarrior = true;
            detailsMK.weekendWarrior = fachNameMK;
          }

          if (dayMK === 5 && dayOfMonthMK === 13) {
            if (noteMK >= 5.0) {
              achievedMK.luckyDay = true;
              detailsMK.luckyDay = fachNameMK;
            }
            if (noteMK < 4.0) {
              achievedMK.badLuck = true;
              detailsMK.badLuck = fachNameMK;
            }
          }

          if (monthMK >= 5 && monthMK <= 7 && noteMK >= 5.0) {
            achievedMK.summerVibes = true;
            detailsMK.summerVibes = fachNameMK;
          }
          if ((monthMK === 11 || monthMK <= 1) && noteMK >= 5.0) {
            achievedMK.winterWonder = true;
            detailsMK.winterWonder = fachNameMK;
          }
        }
      });

      const overallAvgMK = totalWeightMK > 0 ? totalSumMK / totalWeightMK : 0;

      if (totalGradesMK >= 1) achievedMK.firstTest = true;
      if (totalGradesMK >= 5) achievedMK.highFive = true;
      if (totalGradesMK >= 10) achievedMK.tenGrades = true;
      if (totalGradesMK >= 15) achievedMK.fifteenGrades = true;
      if (totalGradesMK >= 25) achievedMK.quarterCentury = true;
      if (totalGradesMK >= 30) achievedMK.thirtyGrades = true;
      if (totalGradesMK >= 50) achievedMK.halfCentury = true;
      if (totalGradesMK >= 100) achievedMK.centurion = true;
      if (validSubjectCountMK >= 5) achievedMK.survival = true;
      if (validSubjectCountMK >= 10) achievedMK.subjectHoarder = true;

      if (count6MK >= 2) achievedMK.doubleSix = true;
      if (count6MK >= 3) achievedMK.hatTrick = true;
      if (count6MK >= 5) achievedMK.handfulSixes = true;
      if (count6MK >= 10) achievedMK.perfectTen = true;

      if (overallAvgMK >= 4.0) achievedMK.survivorAvg = true;
      if (overallAvgMK >= 4.5) achievedMK.solidAvg = true;
      if (overallAvgMK >= 5.0) achievedMK.goodAvg = true;
      if (overallAvgMK >= 5.5) achievedMK.highPerformer = true;
      if (overallAvgMK >= 5.75) achievedMK.geniusAvg = true;

      if (Math.abs(overallAvgMK - 4.0) < 0.001) achievedMK.onTheEdge = true;
      if (overallAvgMK >= 3.9 && overallAvgMK < 4.0) achievedMK.closeCall = true;
      if (Math.abs(overallAvgMK - 4.2) < 0.01) achievedMK.answer42 = true;
      if (overallAvgMK >= 4.0 && overallAvgMK <= 4.1) achievedMK.scrapedBy = true;
      if (overallAvgMK >= 4.0 && overallAvgMK <= 5.0) achievedMK.averageJoe = true;

      const nearestHalfStepMK = Math.round(overallAvgMK * 2) / 2;
      if (Math.abs(overallAvgMK - nearestHalfStepMK) < 0.001) {
        achievedMK.balanced = true;
      }

      if (allPassedMK && totalGradesMK >= 5) {
        achievedMK.allPassed = true;
      }

      const scienceAvgMK = catStatsMK.naturwissenschaften.weight > 0
        ? catStatsMK.naturwissenschaften.sum / catStatsMK.naturwissenschaften.weight
        : 0;
      if (catStatsMK.naturwissenschaften.count >= 2 && scienceAvgMK >= 5.0) achievedMK.scientist = true;
      if (catStatsMK.naturwissenschaften.count >= 2 && scienceAvgMK >= 5.5) achievedMK.nobelPrize = true;

      if (languageSubjectsOverFiveMK >= 2) {
        achievedMK.polyglot = true;
      }

      if (subjectsOverFiveMK >= 4) {
        achievedMK.subjectElite = true;
      }

      const trackedCategoriesMK = ['naturwissenschaften', 'sprache', 'gesellschaft', 'kunst', 'sport', 'wahlfaecher'];
      const activeTrackedCategoriesMK = trackedCategoriesMK.filter((categoryMK) => catStatsMK[categoryMK] && catStatsMK[categoryMK].count > 0);

      const strongCategoryCountMK = activeTrackedCategoriesMK.filter((categoryMK) => {
        const categoryStatsMK = catStatsMK[categoryMK];
        if (!categoryStatsMK || categoryStatsMK.weight <= 0) {
          return false;
        }
        return (categoryStatsMK.sum / categoryStatsMK.weight) >= 5.0;
      }).length;

      if (strongCategoryCountMK >= 3) {
        achievedMK.categoryChampion = true;
      }

      if (
        activeTrackedCategoriesMK.length >= 3 &&
        activeTrackedCategoriesMK.every((categoryMK) => catStatsMK[categoryMK].passed)
      ) {
        achievedMK.allRounder = true;
      }

      if (count6MK >= 1 && hasBelowThreeFiveMK) {
        achievedMK.specialist = true;
      }

      return { achieved: achievedMK, details: detailsMK };
    }

    showAchievementToast(messageMK) {
      if (!messageMK) {
        console.warn("showAchievementToast called with empty message");
        return;
      }
      
      if (!this.areAchievementsEnabled()) {
        console.log("Achievement toasts are disabled, skipping:", messageMK);
        return;
      }
      
      const existingToastMK = document.getElementById("achievement-toast");
      if (existingToastMK) existingToastMK.remove();
      
      const toastMK = document.createElement("div");
      toastMK.id = "achievement-toast";
      toastMK.className = "panum-achievement-toast";
      toastMK.setAttribute("role", "status");
      toastMK.style.cssText = `
        position:fixed;top:64px;left:50%;right:auto;
        transform:translate(-50%, -16px) scale(0.95);
        background:linear-gradient(135deg, #fff7dc, #ffefb6);
        color:#7d4300;border:1px solid #f3c24f;border-left:4px solid #ff9800;
        border-radius:16px;padding:13px 16px;font-size:15px;font-weight:700;
        box-shadow:0 14px 34px rgba(0,0,0,0.24), 0 0 0 1px rgba(255, 152, 0, 0.2), 0 0 24px rgba(255, 193, 7, 0.35);z-index:999999;
        animation: panum-achievement-toast-in 0.46s cubic-bezier(0.16, 1, 0.3, 1) forwards, panum-achievement-toast-glow 1.8s ease-in-out infinite;
        width:min(92vw, 460px);text-align:left;
        font-family:system-ui,-apple-system,sans-serif;
        display:grid;grid-template-columns:auto 1fr;align-items:center;gap:12px;
        line-height:1.35;
        letter-spacing:0.01em;
        overflow: visible;
        pointer-events: none;
        backdrop-filter: blur(6px);
      `;
      toastMK.innerHTML = `<span class="panum-achievement-toast-icon" aria-hidden="true">🏆</span><span class="panum-achievement-toast-text">${messageMK}</span>`;
      
      let styleMK = document.getElementById("toast-style");
      if (!styleMK) {
        styleMK = document.createElement("style");
        styleMK.id = "toast-style";
        document.head.appendChild(styleMK);
      }
      styleMK.innerHTML = `
        @keyframes panum-achievement-toast-in { 
          0% { opacity:0; transform:translate(-50%, -18px) scale(0.95);} 
          65% { opacity:1; transform:translate(-50%, 2px) scale(1.01);} 
          100% { opacity:1; transform:translate(-50%, 0) scale(1);} 
        }

        @keyframes panum-achievement-toast-glow {
          0%, 100% { box-shadow: 0 14px 34px rgba(0,0,0,0.24), 0 0 0 1px rgba(255, 152, 0, 0.2), 0 0 18px rgba(255, 193, 7, 0.32); }
          50% { box-shadow: 0 16px 36px rgba(0,0,0,0.25), 0 0 0 1px rgba(255, 152, 0, 0.28), 0 0 34px rgba(255, 193, 7, 0.5); }
        }

        #achievement-toast.panum-achievement-toast,
        #achievement-toast.panum-achievement-toast * {
          color: inherit !important;
        }

        #achievement-toast.panum-achievement-toast::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(120deg, rgba(255,255,255,0.24), rgba(255,255,255,0) 55%);
          pointer-events: none;
        }

        #achievement-toast.panum-achievement-toast::after {
          content: "NEU";
          position: absolute;
          top: 10px;
          right: 12px;
          background: #ff9800;
          color: #ffffff;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 4px 8px;
          box-shadow: 0 3px 9px rgba(0,0,0,0.2);
        }

        #achievement-toast .panum-achievement-toast-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          line-height: 1;
          color: #6e3a00 !important;
          background: linear-gradient(135deg, #ffd66a, #ffb300);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.55), 0 3px 8px rgba(255,152,0,0.35);
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));
        }

        #achievement-toast .panum-achievement-toast-text {
          font-size: 15px;
          font-weight: 750;
          letter-spacing: 0.01em;
          word-break: break-word;
          position: relative;
          z-index: 1;
        }

        html.panum-dark-theme #achievement-toast.panum-achievement-toast {
          background: linear-gradient(135deg, #35290f, #241c0b) !important;
          color: #ffe2ab !important;
          border-color: #b8872c !important;
          border-left-color: #f0b745 !important;
          box-shadow: 0 16px 36px rgba(0,0,0,0.55), 0 0 0 1px rgba(255, 196, 98, 0.22), 0 0 28px rgba(255, 179, 0, 0.35) !important;
        }

        html.panum-dark-theme #achievement-toast.panum-achievement-toast::before {
          background: linear-gradient(120deg, rgba(255,214,122,0.12), rgba(255,214,122,0) 60%);
        }

        html.panum-dark-theme #achievement-toast .panum-achievement-toast-icon {
          color: #fff2d0 !important;
          background: linear-gradient(135deg, #9a6f24, #7f5c1e);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 3px 8px rgba(0,0,0,0.45);
        }
      `;
      
      document.body.appendChild(toastMK);
      setTimeout(() => {
        toastMK.style.transition = "opacity 0.35s ease, transform 0.35s ease";
        toastMK.style.opacity = "0";
        toastMK.style.transform = "translate(-50%, -14px) scale(0.96)";
        setTimeout(() => {
          if (toastMK.parentNode) toastMK.remove();
        }, 500);
      }, 3200);
    }

    renderAchievements(notenDatenMK) {
      const outMK = document.getElementById('gamification-content');
      if (!outMK) return;
      
      if (!notenDatenMK || !notenDatenMK.length) {
        outMK.innerHTML = '<div style="color:#888;text-align:center;padding:20px;">Keine Noten gefunden.</div>';
        return;
      }

      const achievementDefsMK = this.getAchievementDefinitions();
      const { achieved, details } = this.processAchievements(notenDatenMK);
      
      let shownMK = {};
      let previousAchievedMK = {};
      try {
        shownMK = JSON.parse(localStorage.getItem("achievementsShown") || "{}");
        previousAchievedMK = JSON.parse(localStorage.getItem("achievementsPrevious") || "{}");
      } catch (eMK) {
        shownMK = {};
        previousAchievedMK = {};
      }
      
      let newAchievementsMK = [];
      for (const defMK of achievementDefsMK) {
        if (achieved[defMK.id] && !shownMK[defMK.id]) {
          newAchievementsMK.push(defMK);
          shownMK[defMK.id] = true;
        }
      }
      
      const currentAchievedMK = {};
      for (const achievementIdMK in achieved) {
        if (achieved[achievementIdMK]) {
          currentAchievedMK[achievementIdMK] = {
            achieved: true,
            detail: details[achievementIdMK]
          };
        }
      }
      
      try {
        localStorage.setItem("achievementsShown", JSON.stringify(shownMK));
        localStorage.setItem("achievementsPrevious", JSON.stringify(currentAchievedMK));
      } catch (eMK) {
        console.warn("Could not save achievements to localStorage");
      }
      
      if (newAchievementsMK.length > 0) {
        const defMK = newAchievementsMK[0];
        const detailMK = details[defMK.id];
        const messageMK = defMK.icon + " Achievement freigeschaltet: " + 
          (typeof defMK.text === "function" ? defMK.text(detailMK) : defMK.text);
        console.log("Showing achievement toast:", messageMK);
        this.showAchievementToast(messageMK);
      }

      const achievedCountMK = Object.keys(achieved).length;
      const totalCountMK = achievementDefsMK.length;
      const counterMK = document.getElementById('achievement-counter');
      if (counterMK) {
        counterMK.textContent = `${achievedCountMK} / ${totalCountMK}`;
        const progressMK = achievedCountMK / totalCountMK;
        if (progressMK >= 0.8) {
          counterMK.style.background = '#e8f5e8';
          counterMK.style.color = '#4caf50';
        } else if (progressMK >= 0.5) {
          counterMK.style.background = '#fff3e0';
          counterMK.style.color = '#ff9800';
        } else {
          counterMK.style.background = '#f5f5f5';
          counterMK.style.color = '#666';
        }
      }

      this.renderAchievementsByCategory(achievementDefsMK, achieved, details, 'all', '');
      this.initializeCategorySystem(achievementDefsMK, achieved, details);
    }

    renderAchievementsByCategory(achievementDefsMK, achievedMK, detailsMK, categoryFilterMK = 'all', searchTermMK = '') {
      const outMK = document.getElementById('gamification-content');
      if (!outMK) return;

      let filteredDefsMK = achievementDefsMK;
      if (categoryFilterMK !== 'all') {
        filteredDefsMK = achievementDefsMK.filter(defMK => defMK.category === categoryFilterMK);
      }
      if (searchTermMK) {
        const searchLowerMK = searchTermMK.toLowerCase();
        filteredDefsMK = filteredDefsMK.filter(defMK => {
          const detailMK = detailsMK[defMK.id];
          let txtMK;
          try {
            txtMK = typeof defMK.text === "function" ? defMK.text(detailMK) : defMK.text;
          } catch (e) {
            txtMK = "Achievement text error";
          }
          return txtMK.toLowerCase().includes(searchLowerMK) || defMK.icon.includes(searchTermMK);
        });
      }

      function diffRankMK(dMK) { return dMK === "hard" ? 0 : dMK === "medium" ? 1 : 2; }
      const reachedMK = filteredDefsMK.filter(defMK => achievedMK[defMK.id]).sort((aMK, bMK) => diffRankMK(aMK.difficulty) - diffRankMK(bMK.difficulty));
      const notReachedMK = filteredDefsMK.filter(defMK => !achievedMK[defMK.id]).sort((aMK, bMK) => diffRankMK(aMK.difficulty) - diffRankMK(bMK.difficulty));

      function diffColorMK(dMK) {
        if (dMK === "hard") return "#e53935";
        if (dMK === "medium") return "#fb8c00";
        return "#43a047";
      }

      let htmlMK = '';

      if (reachedMK.length > 0) {
        htmlMK += `<div style="margin-bottom:15px;">
          <div style="font-weight: bold; color: #4caf50; margin-bottom: 8px; border-bottom: 2px solid #4caf50; padding-bottom: 4px;">
            ✅ Erreichte Achievements (${reachedMK.length})
          </div>
        </div>`;
        
        htmlMK += reachedMK.map(defMK => {
          const detailMK = detailsMK[defMK.id];
          let txtMK;
          try {
            txtMK = typeof defMK.text === "function" ? defMK.text(detailMK) : defMK.text;
          } catch (e) {
            txtMK = "Achievement text error";
          }
          const difficultyLabelMK = defMK.difficulty === 'hard' ? '🔥 Schwer' : defMK.difficulty === 'medium' ? '⚡ Mittel' : '🌱 Einfach';
          const explanationMK = this.getAchievementExplanation(defMK.id, detailMK);
          
          return `<div class="achievement-item" data-explanation="${explanationMK.replace(/"/g, '&quot;')}" style="margin:8px 0;padding:12px;border-radius:8px;border:2px solid ${diffColorMK(defMK.difficulty)};background:linear-gradient(135deg, ${diffColorMK(defMK.difficulty)}22, ${diffColorMK(defMK.difficulty)}11);color:#222;position:relative;box-shadow:0 2px 8px rgba(0,0,0,0.1);cursor:pointer;transition:transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 16px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'">
            <div style="position: absolute; top: 8px; right: 8px; background: ${diffColorMK(defMK.difficulty)}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; font-weight: bold;">
              ${difficultyLabelMK}
            </div>
            <div style="margin-right: 70px;">
              <span style="font-size:24px;margin-right:12px;">${defMK.icon}</span>
              <span style="font-weight:bold;">${txtMK}</span>
            </div>
          </div>`;
        }).join('');
      }

      if (notReachedMK.length > 0) {
        htmlMK += `<div style="margin: 20px 0 15px 0;">
          <div style="font-weight: bold; color: #999; margin-bottom: 8px; border-bottom: 2px solid #ddd; padding-bottom: 4px;">
            ⏳ Unerreichte Achievements (${notReachedMK.length})
          </div>
        </div>`;
        
        htmlMK += notReachedMK.map(defMK => {
          const detailMK = detailsMK[defMK.id];
          let txtMK, iconMK;
          
          if (defMK.category === 'secret') {
            txtMK = "???";
            iconMK = "🔒";
          } else {
            try {
              txtMK = typeof defMK.text === "function" ? defMK.text(detailMK) : defMK.text;
              iconMK = defMK.icon;
            } catch (e) {
              txtMK = "Achievement text error";
              iconMK = defMK.icon;
            }
          }
          
          const difficultyLabelMK = defMK.difficulty === 'hard' ? '🔥 Schwer' : defMK.difficulty === 'medium' ? '⚡ Mittel' : '🌱 Einfach';
          const explanationMK = defMK.category === 'secret' ? "🔒 Geheimes Achievement - freigeschaltet wenn du es erreichst!" : this.getAchievementExplanation(defMK.id, detailMK);
          
          return `<div class="achievement-item" data-explanation="${explanationMK.replace(/"/g, '&quot;')}" style="margin:8px 0;padding:12px;border-radius:8px;border:2px dashed ${diffColorMK(defMK.difficulty)};background:#f9f9f9;color:#666;opacity:0.7;position:relative;cursor:pointer;transition:opacity 0.2s, transform 0.2s;" onmouseover="this.style.opacity='0.9';this.style.transform='translateY(-1px)'" onmouseout="this.style.opacity='0.7';this.style.transform='translateY(0)'">
            <div style="position: absolute; top: 8px; right: 8px; background: #ccc; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; font-weight: bold;">
              ${difficultyLabelMK}
            </div>
            <div style="margin-right: 70px;">
              <span style="font-size:24px;margin-right:12px;filter:grayscale(1);">${iconMK}</span>
              <span>${txtMK}</span>
            </div>
          </div>`;
        }).join('');
      }

      if (!reachedMK.length && !notReachedMK.length) {
        htmlMK += `<div style="text-align: center; color: #999; padding: 20px;">
          <div style="font-size: 48px; margin-bottom: 10px;">🔍</div>
          <div>Keine Achievements in dieser Kategorie gefunden.</div>
        </div>`;
      }

      outMK.innerHTML = htmlMK;
      
      this.initializeTooltips();
    }

    initializeTooltips() {
      const existingTooltipMK = document.getElementById('achievement-tooltip');
      if (existingTooltipMK) existingTooltipMK.remove();
      
      const tooltipMK = document.createElement('div');
      tooltipMK.id = 'achievement-tooltip';
      tooltipMK.style.cssText = `
        position: fixed;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        max-width: 300px;
        z-index: 10003;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        line-height: 1.4;
      `;
      document.body.appendChild(tooltipMK);
      
      const achievementItemsMK = document.querySelectorAll('.achievement-item');
      
      achievementItemsMK.forEach(itemMK => {
        const explanationMK = itemMK.dataset.explanation;
        if (!explanationMK) return;
        
        itemMK.addEventListener('mouseenter', (eMK) => {
          tooltipMK.innerHTML = explanationMK;
          tooltipMK.style.opacity = '1';
          
          const rectMK = itemMK.getBoundingClientRect();
          const tooltipRectMK = tooltipMK.getBoundingClientRect();
          const windowWidthMK = window.innerWidth;
          const windowHeightMK = window.innerHeight;
          
          let leftMK = rectMK.left + (rectMK.width / 2) - (tooltipRectMK.width / 2);
          let topMK = rectMK.top - tooltipRectMK.height - 10;
          
          if (leftMK < 10) leftMK = 10;
          if (leftMK + tooltipRectMK.width > windowWidthMK - 10) leftMK = windowWidthMK - tooltipRectMK.width - 10;
          if (topMK < 10) topMK = rectMK.bottom + 10;
          
          tooltipMK.style.left = leftMK + 'px';
          tooltipMK.style.top = topMK + 'px';
        });
        
        itemMK.addEventListener('mouseleave', () => {
          tooltipMK.style.opacity = '0';
        });
        
        itemMK.addEventListener('click', (eMK) => {
          if (tooltipMK.style.opacity === '1') {
            tooltipMK.style.opacity = '0';
          } else {
            tooltipMK.innerHTML = explanationMK;
            tooltipMK.style.opacity = '1';
            
            const rectMK = itemMK.getBoundingClientRect();
            tooltipMK.style.left = rectMK.left + 'px';
            tooltipMK.style.top = (rectMK.bottom + 10) + 'px';
          }
        });
      });
    }

    initializeCategorySystem(achievementDefsMK, achievedMK, detailsMK) {
      const tabsMK = document.querySelectorAll('.category-tab');
      
      tabsMK.forEach(tabMK => {
        tabMK.addEventListener('click', () => {
          // Update active tab
          tabsMK.forEach(tMK => {
            tMK.classList.remove('active');
            tMK.style.background = 'white';
            tMK.style.color = '#ffb300';
          });
          
          tabMK.classList.add('active');
          tabMK.style.background = '#ffb300';
          tabMK.style.color = 'white';
          
          const categoryMK = tabMK.dataset.category;
          const searchTermMK = document.getElementById('achievement-search')?.value || '';
          this.renderAchievementsByCategory(achievementDefsMK, achievedMK, detailsMK, categoryMK, searchTermMK);
        });
      });
      
      const searchBoxMK = document.getElementById('achievement-search');
      if (searchBoxMK) {
        searchBoxMK.addEventListener('input', (eMK) => {
          const activeCategoryMK = document.querySelector('.category-tab.active')?.dataset.category || 'all';
          this.renderAchievementsByCategory(achievementDefsMK, achievedMK, detailsMK, activeCategoryMK, eMK.target.value);
        });
      }
    }

    areAchievementsEnabled() {
      try {
        if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
          const enabledFromLocalStorage = localStorage.getItem('buttonEnabled_achievements');
          if (enabledFromLocalStorage !== null) {
            const isEnabled = enabledFromLocalStorage === 'true';
            console.log('🔧 Achievement setting from localStorage:', enabledFromLocalStorage, '-> enabled:', isEnabled);
            return isEnabled;
          }
        }
        
        const enabled = localStorage.getItem('buttonEnabled_achievements');
        const isEnabled = enabled !== null ? enabled === 'true' : true;
        console.log('🔧 Achievement setting fallback:', enabled, '-> enabled:', isEnabled);
        return isEnabled;
      } catch (error) {
        console.warn('Error checking achievement settings:', error);
        return true;
      }
    }

    checkAndShowAchievementToasts() {
      console.log('🏆 checkAndShowAchievementToasts() called');
      this.loadNotenDaten((notenDatenMK) => {
        console.log('🏆 Notes loaded, checking achievements with', notenDatenMK.length, 'subjects');
        this.checkAchievementChanges(notenDatenMK);
      });
    }

    checkAchievementChanges(notenDatenMK) {
      console.log('🏆 checkAchievementChanges() called');
      
      if (!this.areAchievementsEnabled()) {
        console.log('🚫 Achievements are disabled, skipping achievement check');
        return;
      }
      
      console.log('✅ Achievements are enabled, proceeding with check...');

      const achievementDefsMK = this.getAchievementDefinitions();
      const { achieved, details } = this.processAchievements(notenDatenMK);
      
      console.log('🎯 Total achievement definitions:', achievementDefsMK.length);
      console.log('🎯 Currently achieved:', Object.keys(achieved).length);
      console.log('🎯 Achieved list:', Object.keys(achieved));
      
      let shownMK = {};
      let previousAchievedMK = {};
      
      try {
        const shownDataMK = localStorage.getItem('achievementsShown');
        if (shownDataMK) {
          shownMK = JSON.parse(shownDataMK);
          console.log('📋 Loaded shown achievements:', Object.keys(shownMK).length);
        }
      } catch (e) {
        console.warn('❌ Error loading shown achievements:', e);
        shownMK = {};
      }
      
      try {
        const prevDataMK = localStorage.getItem('achievementsPrevious');
        if (prevDataMK) {
          previousAchievedMK = JSON.parse(prevDataMK);
          console.log('📋 Loaded previous achievements:', Object.keys(previousAchievedMK).length);
        }
      } catch (e) {
        console.warn('❌ Error loading previous achievements:', e);
        previousAchievedMK = {};
      }
      
      let newAchievementsMK = [];
      for (const defMK of achievementDefsMK) {
        if (achieved[defMK.id] && !shownMK[defMK.id]) {
          newAchievementsMK.push(defMK);
          shownMK[defMK.id] = true;
        }
      }
      
      const currentAchievedMK = {};
      for (const achievementIdMK in achieved) {
        if (achieved[achievementIdMK]) {
          currentAchievedMK[achievementIdMK] = {
            achieved: true,
            detail: details[achievementIdMK]
          };
        }
      }
      
      try {
        localStorage.setItem("achievementsShown", JSON.stringify(shownMK));
        localStorage.setItem("achievementsPrevious", JSON.stringify(currentAchievedMK));
      } catch (eMK) {
        console.warn("Could not save achievements to localStorage");
      }
      
      if (newAchievementsMK.length > 0) {
        const defMK = newAchievementsMK[0];
        const detailMK = details[defMK.id];
        const messageMK = defMK.icon + " Achievement freigeschaltet: " + 
          (typeof defMK.text === "function" ? defMK.text(detailMK) : defMK.text);
        console.log("🎯 Showing achievement toast:", messageMK);
        this.showAchievementToast(messageMK);
      } else if (newAchievementsMK.length === 0) {
        console.log("ℹ️ No new achievements to show");
      }
      
      console.log(`🏁 Achievement check completed. New: ${newAchievementsMK.length}`);
    }

    clearAllAchievementData() {
      console.log('🔄 Starting COMPLETE achievement data wipe...');
      
      try {
        const achievementKeys = [
          'achievementsShown',
          'achievementsPrevious', 
          'buttonEnabled_achievements',
          'achievementResetTimestamp',
          'lastResetTimestamp'
        ];
        
        achievementKeys.forEach(key => {
          localStorage.removeItem(key);
          console.log(`✅ Removed localStorage key: ${key}`);
        });
        
        if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
          browser.storage.local.remove(achievementKeys).then(() => {
            console.log('✅ Removed browser storage keys:', achievementKeys);
          });
        }
        
        console.log('🎯 Achievement data completely wiped');
        return true;
      } catch (error) {
        console.error('❌ Error wiping achievement data:', error);
        return false;
      }
    }

    resetAchievementProgress() {
      console.log('🔄 Resetting achievement progress...');
      
      try {
        const progressKeys = [
          'achievementsShown',
          'achievementsPrevious'
        ];
        
        progressKeys.forEach(key => {
          localStorage.removeItem(key);
          console.log(`✅ Reset achievement key: ${key}`);
        });
        
        if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
          browser.storage.local.remove(progressKeys).then(() => {
            console.log('✅ Reset browser storage keys:', progressKeys);
          });
        }
        
        console.log('🎯 Achievement progress reset complete');
        return true;
      } catch (error) {
        console.error('❌ Error resetting achievement progress:', error);
        return false;
      }
    }
  }

  window.GamificationButton = GamificationButton;
  console.log('✓ GamificationButton class registered on window object');

  window.achievementDebug = {
    clearAll: () => {
      if (window.buttonInstancesMK && buttonInstancesMK.gamification) {
        return buttonInstancesMK.gamification.clearAllAchievementData();
      } else {
        console.warn('GamificationButton instance not found');
        return false;
      }
    },
    resetProgress: () => {
      if (window.buttonInstancesMK && buttonInstancesMK.gamification) {
        return buttonInstancesMK.gamification.resetAchievementProgress();
      } else {
        console.warn('GamificationButton instance not found');
        return false;
      }
    },
    checkStorage: () => {
      console.log('=== ACHIEVEMENT STORAGE DEBUG ===');
      const keys = ['achievementsShown', 'achievementsPrevious', 'buttonEnabled_achievements'];
      keys.forEach(key => {
        console.log(`${key}:`, localStorage.getItem(key));
      });
      
      if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
        browser.storage.local.get(keys).then((result) => {
          console.log('Browser storage achievements:', result);
        });
      }
    },
    testToast: (message = '🏆 Test-Toast: Funktioniert!') => {
      try {
        localStorage.setItem('buttonEnabled_achievements', 'true');
      } catch (e) {
        console.warn('Could not set achievement toggle in localStorage:', e);
      }

      if (window.buttonInstancesMK && window.buttonInstancesMK.gamification) {
        const instance = window.buttonInstancesMK.gamification;
        instance.showAchievementToast(message);
        console.log('✅ Test toast triggered');
        return true;
      }

      console.warn('GamificationButton instance not found');
      return false;
    },
    forceReset: () => {
      console.log('🔄 Forcing achievement reset...');
      localStorage.removeItem('achievementsShown');
      localStorage.removeItem('achievementsPrevious');
      console.log('✅ Achievement progress cleared');
    },
    debugCurrentState: () => {
      if (window.buttonInstancesMK && window.buttonInstancesMK.gamification) {
        const instance = window.buttonInstancesMK.gamification;
        instance.loadNotenDaten((notenDaten) => {
          const { achieved, details } = instance.processAchievements(notenDaten);
          console.log('🎯 Current achievements that should be active:', Object.keys(achieved));
          console.log('🎯 Total notes found:', notenDaten.length);
          console.log('🎯 Achievement details:', achieved);
        });
      }
    }
  };

  console.log('🎯 Achievement debug functions available via window.achievementDebug');
  console.log('🎯 Use window.achievementDebug.clearAll() to wipe ALL achievement data');
  console.log('🎯 Use window.achievementDebug.resetProgress() to reset progress only');
  console.log('🎯 Use window.achievementDebug.testToast() to show a test toast');

})();
