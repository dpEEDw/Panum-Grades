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
        naturwissenschaften: ["Biologie", "Bio", "Chemie", "Chem", "Physik", "Phys", "Mathematik", "Mathe", "Math", "Informatik", "Info", "Computer"],
        sprache: ["Deutsch", "DE", "Englisch", "EN", "English", "Französisch", "FR", "Francais", "Spanisch", "ES", "Español", "Latein", "LA", "Latin"],
        gesellschaft: ["Geografie", "Geographie", "GG", "Geo", "Geschichte", "Hist", "History", "Wirtschaft und Recht", "WuR", "Wirtschaft", "Recht"],
        kunst: ["Bildnerisches Gestalten", "BG", "Kunst", "Art", "Musik", "Mus", "Music", "Theater", "Drama"],
        sport: ["Sport", "SP", "Sports", "Schulsport", "Leichtathletik"],
        wahlfaecher: ["Projektarbeit", "Projekt", "Ergänzungsfach", "EF", "Schach", "Chess"]
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

    getFachKategorie(fachNameMK) {
      for (const [kategorieMK, faecherMK] of Object.entries(this.subjectsByCategory)) {
        for (const fachMK of faecherMK) {
          if (fachNameMK.toLowerCase().includes(fachMK.toLowerCase())) {
            return kategorieMK;
          }
        }
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

    processAchievements(notenDatenMK) {
      const achievedMK = {};
      const detailsMK = {};
      
      if (!notenDatenMK || !notenDatenMK.length) return { achieved: achievedMK, details: detailsMK };
      
      let totalGradesMK = 0;
      let allGradesMK = [];
      let subjectCountMK = notenDatenMK.length;
      let totalSumMK = 0;
      let totalWeightMK = 0;
      let allPassedMK = true;
      let count6 = 0;
      let count5 = 0;
      let countFail = 0;
      
      const catStats = {
        naturwissenschaften: { sum: 0, weight: 0, count: 0, passed: true },
        sprache: { sum: 0, weight: 0, count: 0, count5: 0, passed: true },
        kunst: { sum: 0, weight: 0, count: 0, passed: true },
        sport: { sum: 0, weight: 0, count: 0, passed: true },
        gesellschaft: { sum: 0, weight: 0, count: 0, passed: true },
        sonstige: { sum: 0, weight: 0, count: 0, passed: true }
      };

      let globalStreak6 = 0;
      let globalStreakGood = 0;
      let maxGlobalStreak6 = 0;
      let maxGlobalStreakGood = 0;

      for (const fachMK of notenDatenMK) {
        if (!fachMK.noten || !fachMK.noten.length) continue;
        
        const fachNameMK = fachMK.fachLangName || fachMK.fach || '';
        const fachLower = fachNameMK.toLowerCase();
        const kategorieMK = this.getFachKategorie(fachNameMK);
        const gradesMK = fachMK.noten;
        const weightsMK = fachMK.gewichtung || gradesMK.map(() => 1);
        const datesMK = fachMK.daten || [];
        
        totalGradesMK += gradesMK.length;
        
        const weightedSumMK = gradesMK.reduce((sum, grade, idx) => sum + (grade * weightsMK[idx]), 0);
        const subjectWeightMK = weightsMK.reduce((sum, weight) => sum + weight, 0);
        const subjectAvgMK = subjectWeightMK > 0 ? weightedSumMK / subjectWeightMK : 0;
        
        totalSumMK += weightedSumMK;
        totalWeightMK += subjectWeightMK;
        
        if (catStats[kategorieMK]) {
          catStats[kategorieMK].sum += weightedSumMK;
          catStats[kategorieMK].weight += subjectWeightMK;
          catStats[kategorieMK].count++;
          if (subjectAvgMK >= 5.0) catStats[kategorieMK].count5++;
          if (subjectAvgMK < 4.0) catStats[kategorieMK].passed = false;
        }

        if (gradesMK.some(n => n < 4.0)) allPassedMK = false;

        if (gradesMK.length >= 2) {
            for(let i=1; i<gradesMK.length; i++) {
                if (gradesMK[i] - gradesMK[i-1] >= 1.5) {
                    achievedMK.comeback = true;
                    detailsMK.comeback = fachNameMK;
                }
            }
            
            let improveStreak = 0;
            for(let i=1; i<gradesMK.length; i++) {
                if (gradesMK[i] > gradesMK[i-1]) improveStreak++;
                else improveStreak = 0;
                if (improveStreak >= 3) {
                    achievedMK.risingStar = true;
                    detailsMK.risingStar = fachNameMK;
                }
            }
        }

        const minGrade = Math.min(...gradesMK);
        const maxGrade = Math.max(...gradesMK);
        if (maxGrade - minGrade > 2.5) {
            achievedMK.rollercoaster = true;
            detailsMK.rollercoaster = fachNameMK;
        }
        
        if (gradesMK.length >= 3 && (maxGrade - minGrade) === 0) {
            achievedMK.consistency = true;
            detailsMK.consistency = fachNameMK;
        }
        
        if (gradesMK.includes(6.0) && gradesMK.some(n => n < 4.0)) {
            achievedMK.mixedBag = true;
            detailsMK.mixedBag = fachNameMK;
        }
        
        if (gradesMK.filter(n => n === 4.0).length >= 3) {
            achievedMK.sniper = true;
            detailsMK.sniper = fachNameMK;
        }

        if (fachLower.includes('mathe') || fachLower.includes('math')) {
            if (subjectAvgMK > 4.0) achievedMK.mathStart = true;
            if (subjectAvgMK > 5.0) achievedMK.mathPro = true;
            if (subjectAvgMK > 5.5) achievedMK.mathGenius = true;
        }
        
        if (fachLower.includes('deutsch') || fachLower === 'de') {
            if (subjectAvgMK > 5.0) achievedMK.germanPoet = true;
            if (subjectAvgMK > 5.5) achievedMK.germanGoethe = true;
        }
        
        if (fachLower.includes('englisch') || fachLower.includes('english') || fachLower === 'en') {
            if (subjectAvgMK > 5.0) achievedMK.englishSpeaker = true;
            if (subjectAvgMK > 5.5) achievedMK.englishNative = true;
        }
        
        if (fachLower.includes('franz') || fachLower.includes('francais') || fachLower === 'fr') {
            if (subjectAvgMK > 4.0) achievedMK.frenchBonjour = true;
            if (subjectAvgMK > 5.0) achievedMK.frenchBaguette = true;
            if (subjectAvgMK > 5.5) achievedMK.frenchEiffel = true;
        }
        
        if (fachLower.includes('info') || fachLower.includes('computer')) {
            if (subjectAvgMK > 5.5) achievedMK.hacker = true;
        }
        
        if (fachLower.includes('geschichte') || fachLower.includes('hist') || fachLower.includes('gs') || fachLower.includes('geo')) {
            if (subjectAvgMK > 4.5) achievedMK.explorer = true;
            if (subjectAvgMK > 5.0) achievedMK.historian = true;
            if (subjectAvgMK > 5.5) achievedMK.timeTraveler = true;
        }
        
        if (kategorieMK === 'naturwissenschaften') {
            if (subjectAvgMK > 4.5) achievedMK.labRat = true;
            if (fachLower.includes('bio') && subjectAvgMK > 5.0) achievedMK.bioFan = true;
            if (fachLower.includes('chem') && subjectAvgMK > 5.0) achievedMK.chemPro = true;
            if (fachLower.includes('phys') && subjectAvgMK > 5.0) achievedMK.physEinstein = true;
        }
        
        if (kategorieMK === 'kunst') {
            if (subjectAvgMK > 5.0) achievedMK.creative = true;
            if (subjectAvgMK > 5.5) achievedMK.virtuoso = true;
            if ((fachLower.includes('musik') || fachLower.includes('music')) && subjectAvgMK > 5.0) achievedMK.musicMozart = true;
            if ((fachLower.includes('bildnerisch') || fachLower.includes('bg') || fachLower.includes('kunst') || fachLower.includes('art')) && subjectAvgMK > 5.0) achievedMK.artPicasso = true;
        }
        
        if (fachLower.includes('geo') && subjectAvgMK > 5.0) achievedMK.geoWorld = true;

        if (kategorieMK === 'sport') {
            if (subjectAvgMK > 5.0) achievedMK.athlete = true;
            if (subjectAvgMK > 5.5) achievedMK.olympian = true;
        }

        gradesMK.forEach((nMK, idxMK) => {
            allGradesMK.push({ note: nMK, fach: fachNameMK, date: datesMK[idxMK] });
            
            if (nMK === 6.0) count6++;
            if (nMK >= 5.0) count5++;
            if (nMK < 4.0) countFail++;
            
            if (nMK === 6.0 && !achievedMK.first6) { achievedMK.first6 = true; detailsMK.first6 = fachNameMK; }
            if (nMK >= 5.5 && !achievedMK.first55) { achievedMK.first55 = true; detailsMK.first55 = fachNameMK; }
            if (nMK >= 5.0 && !achievedMK.first5) { achievedMK.first5 = true; detailsMK.first5 = fachNameMK; }
            if (nMK >= 4.5 && !achievedMK.first45) { achievedMK.first45 = true; detailsMK.first45 = fachNameMK; }
            if (nMK >= 4.0 && !achievedMK.first4) { achievedMK.first4 = true; detailsMK.first4 = fachNameMK; }
            if (nMK < 4.0 && !achievedMK.firstFail) { achievedMK.firstFail = true; detailsMK.firstFail = fachNameMK; }
            if (nMK <= 3.0 && !achievedMK.first3) { achievedMK.first3 = true; detailsMK.first3 = fachNameMK; }
            if (nMK <= 2.0 && !achievedMK.first2) { achievedMK.first2 = true; detailsMK.first2 = fachNameMK; }
            if (nMK === 1.0 && !achievedMK.bottomBarrel) { achievedMK.bottomBarrel = true; detailsMK.bottomBarrel = fachNameMK; }
            if (nMK > 6.0 && !achievedMK.overSix) { achievedMK.overSix = true; detailsMK.overSix = fachNameMK; }

            if (datesMK[idxMK]) {
                const parts = datesMK[idxMK].split('.');
                if (parts.length === 3) {
                    const d = new Date(parts[2], parts[1]-1, parts[0]);
                    const day = d.getDay();
                    const month = d.getMonth();
                    
                    if (day === 1 && nMK === 6.0) { achievedMK.mondayMotivation = true; detailsMK.mondayMotivation = fachNameMK; }
                    if (day === 5 && nMK === 6.0) { achievedMK.fridayFeeling = true; detailsMK.fridayFeeling = fachNameMK; }
                    if (day === 0 || day === 6) { achievedMK.weekendWarrior = true; detailsMK.weekendWarrior = fachNameMK; }
                    
                    if (day === 5 && parseInt(parts[0]) === 13) {
                        if (nMK >= 5.0) { achievedMK.luckyDay = true; detailsMK.luckyDay = fachNameMK; }
                        if (nMK < 4.0) { achievedMK.badLuck = true; detailsMK.badLuck = fachNameMK; }
                    }
                    
                    if ((month >= 5 && month <= 7) && nMK >= 5.0) { achievedMK.summerVibes = true; detailsMK.summerVibes = fachNameMK; }
                    if ((month === 11 || month <= 1) && nMK >= 5.0) { achievedMK.winterWonder = true; detailsMK.winterWonder = fachNameMK; }
                }
            }
        });
      }
      
      for (const g of allGradesMK) {
          if (g.note === 6.0) globalStreak6++; else globalStreak6 = 0;
          if (g.note >= 5.0) globalStreakGood++; else globalStreakGood = 0;
          
          if (globalStreak6 >= 3) achievedMK.streak = true;
          if (globalStreakGood >= 5) achievedMK.winningStreak = true;
      }

      const overallAvg = totalWeightMK > 0 ? totalSumMK / totalWeightMK : 0;

      if (totalGradesMK >= 1) achievedMK.firstTest = true;
      if (totalGradesMK >= 5) achievedMK.highFive = true;
      if (totalGradesMK >= 10) achievedMK.tenGrades = true;
      if (totalGradesMK >= 15) achievedMK.fifteenGrades = true;
      if (totalGradesMK >= 25) achievedMK.quarterCentury = true;
      if (totalGradesMK >= 30) achievedMK.thirtyGrades = true;
      if (totalGradesMK >= 50) achievedMK.halfCentury = true;
      if (totalGradesMK >= 100) achievedMK.centurion = true;
      if (subjectCountMK >= 5) achievedMK.survival = true;
      if (subjectCountMK >= 10) achievedMK.subjectHoarder = true;

      if (count6 >= 2) achievedMK.doubleSix = true;
      if (count6 >= 3) achievedMK.hatTrick = true;
      if (count6 >= 5) achievedMK.handfulSixes = true;
      if (count6 >= 10) achievedMK.perfectTen = true;

      if (overallAvg >= 4.0) achievedMK.survivorAvg = true;
      if (overallAvg >= 4.5) achievedMK.solidAvg = true;
      if (overallAvg >= 5.0) achievedMK.goodAvg = true;
      if (overallAvg >= 5.5) achievedMK.highPerformer = true;
      if (overallAvg >= 5.75) achievedMK.geniusAvg = true;
      
      if (Math.abs(overallAvg - 4.0) < 0.001) achievedMK.onTheEdge = true;
      if (overallAvg >= 3.9 && overallAvg < 4.0) achievedMK.closeCall = true;
      if (Math.abs(overallAvg - 4.2) < 0.01) achievedMK.answer42 = true;
      if (overallAvg >= 4.0 && overallAvg <= 4.1) achievedMK.scrapedBy = true;
      if (overallAvg >= 4.0 && overallAvg <= 5.0) achievedMK.averageJoe = true;
      
      if ([4.0, 4.5, 5.0, 5.5].some(v => Math.abs(overallAvg - v) < 0.001)) achievedMK.balanced = true;
      
      if (allPassedMK && totalGradesMK >= 5) achievedMK.allPassed = true;

      const scienceAvg = catStats.naturwissenschaften.weight > 0 ? catStats.naturwissenschaften.sum / catStats.naturwissenschaften.weight : 0;
      if (catStats.naturwissenschaften.count >= 2 && scienceAvg >= 5.0) achievedMK.scientist = true;
      if (catStats.naturwissenschaften.count >= 2 && scienceAvg >= 5.5) achievedMK.nobelPrize = true;

      const polyglotCount = (catStats.sprache.weight > 0 && (catStats.sprache.sum / catStats.sprache.weight) >= 5.0) ? 1 : 0; 
      let langHighCount = 0;
      for (const fachMK of notenDatenMK) {
          const k = this.getFachKategorie(fachMK.fachLangName || fachMK.fach || '');
          if (k === 'sprache') {
             const w = fachMK.gewichtung || fachMK.noten.map(()=>1);
             const s = fachMK.noten.reduce((a,b,i)=>a+b*w[i],0);
             const sw = w.reduce((a,b)=>a+b,0);
             if (sw > 0 && s/sw >= 5.0) langHighCount++;
          }
      }
      if (langHighCount >= 2) achievedMK.polyglot = true;

      if (catStats.naturwissenschaften.passed && catStats.sprache.passed && catStats.gesellschaft.passed && 
          catStats.naturwissenschaften.count > 0 && catStats.sprache.count > 0 && catStats.gesellschaft.count > 0) {
          achievedMK.allRounder = true;
      }

      if (count6 >= 1 && countFail >= 1) achievedMK.specialist = true;

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
      toastMK.style.cssText = `
        position:fixed;bottom:60px;left:50%;transform:translateX(-50%);
        background:#fffbe7;color:#ff9800;border:2px solid #ff9800;
        border-radius:12px;padding:18px 32px;font-size:18px;font-weight:bold;
        box-shadow:0 4px 24px rgba(0,0,0,0.18);z-index:999999;
        animation: toast-in 0.4s ease-out;max-width:80%;text-align:center;
        font-family:system-ui,-apple-system,sans-serif;
      `;
      toastMK.innerHTML = `${messageMK}`;
      
      if (!document.getElementById("toast-style")) {
        const styleMK = document.createElement("style");
        styleMK.id = "toast-style";
        styleMK.innerHTML = `
          @keyframes toast-in { 
            0% { opacity:0; transform:translateX(-50%) translateY(30px) scale(0.9);} 
            100% { opacity:1; transform:translateX(-50%) translateY(0) scale(1);} 
          }
        `;
        document.head.appendChild(styleMK);
      }
      
      document.body.appendChild(toastMK);
      setTimeout(() => {
        toastMK.style.transition = "opacity 0.5s";
        toastMK.style.opacity = "0";
        setTimeout(() => {
          if (toastMK.parentNode) toastMK.remove();
        }, 500);
      }, 3000);
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

})();
