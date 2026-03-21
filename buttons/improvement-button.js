// Minoshek built this with help from AI.

(function() {
  'use strict';
  
  console.log('Loading ImprovementButton script...');

  class ImprovementButton {
    constructor(buttonManager) {
      this.buttonManager = buttonManager;
      this.buttonId = "improvement-overlay-btn";
      this.panelId = "improvement-overlay-panel";
    }

    isPanelOpen() {
      return !!document.getElementById(this.panelId);
    }

    getDefaultPosition() {
      return {
        right: 20, // Right edge
        bottom: 80   // Above pluspoints button
      };
    }

    startWatching() {
      const myButton = document.getElementById(this.buttonId);
      if (!myButton) return;

      if (!myButton.dataset.originalBottom) {
        myButton.dataset.originalBottom = myButton.style.bottom;
      }

      const checkAndSlide = () => {
        const pluspointsPos = 140;   // Middle of stack
        const gamePos = 200;         // Bottom of stack
        const myOriginalPos = parseInt(myButton.dataset.originalBottom);

        const targetPosition = myOriginalPos;
        
        myButton.style.transition = 'bottom 0.3s ease';
        myButton.style.bottom = `${targetPosition}px`;
      };

      checkAndSlide();
      setInterval(checkAndSlide, 100);
    }

    loadNotenDaten(cb) {
      if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
        browser.storage.local.get(['notenDaten']).then(res => {
          if (res && Array.isArray(res.notenDaten)) cb(res.notenDaten);
          else {
            try {
              const arr = JSON.parse(localStorage.getItem('notenDaten'));
              if (Array.isArray(arr)) cb(arr); else cb([]);
            } catch { cb([]); }
          }
        }).catch(() => {
          try {
            const arr = JSON.parse(localStorage.getItem('notenDaten'));
            if (Array.isArray(arr)) cb(arr); else cb([]);
          } catch { cb([]); }
        });
      } else {
        try {
          const arr = JSON.parse(localStorage.getItem('notenDaten'));
          if (Array.isArray(arr)) cb(arr); else cb([]);
        } catch { cb([]); }
      }
    }

    closeAllPanels() {
      [
        { id: "notenrechner-calc-panel", btn: document.getElementById("notenrechner-calc-btn") },
        { id: "notenrechner-custom-panel", btn: document.getElementById("notenrechner-custom-btn") },
        { id: "pluspoints-overlay-panel", btn: document.getElementById("pluspoints-overlay-btn") },
        { id: "improvement-overlay-panel", btn: document.getElementById("improvement-overlay-btn") },
        { id: "gamification-overlay-panel", btn: document.getElementById("gamification-overlay-btn") },
        { id: "game-overlay-panel", btn: document.getElementById("game-overlay-btn") }
      ].forEach(({ id, btn }) => {
        const p = document.getElementById(id);
        if (p) p.remove();
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
      
      const position = this.getDefaultPosition();
      const button = document.createElement("button");
      button.id = this.buttonId;
      button.title = "Chancen und Risiken";
      button.style.cssText = `
        position: fixed;
        width: 50px;
        height: 50px;
        background: #fff;
        color: white;
        border: 1px solid #ff5722;
        border-radius: 10px;
        cursor: pointer;
        z-index: 10000;
        font-size: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        display: flex; align-items: center; justify-content: center;
        right: ${position.right}px; bottom: ${position.bottom}px;
        overflow: visible;
        padding: 0;
        transition: box-shadow 0.25s, outline 0.25s, width 0.25s, height 0.25s;
      `;
      button.innerHTML = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="12" fill="#ff5722"/><path d="M7 12l4 4 3-3 7-7" stroke="#fff" stroke-width="2" fill="none"/><path d="M7 16l4-4 3 3 7 7" stroke="#fff" stroke-width="2" fill="none"/></svg>`;
      
      this.buttonManager.registerButton(this.buttonId, button, {});
      
      button.addEventListener("click", (e) => {
        if (this.isPanelOpen()) {
          const p = document.getElementById(this.panelId);
          if (p) p.remove();
          button.style.outline = "none";
          button.style.boxShadow = "0 2px 8px rgba(0,0,0,0.18)";
          button.style.width = "50px";
          button.style.height = "50px";
          return;
        }
        this.closeAllPanels();
        this.buttonManager.markButtonOpening(this.buttonId);
        button.style.outline = "3px solid #ff8a65";
        button.style.boxShadow = "0 0 16px 4px #ff8a65, 0 2px 8px rgba(0,0,0,0.18)";
        button.style.width = "58px";
        button.style.height = "58px";
        
        this.createPanel(button);
      });
      
      document.addEventListener("click", (e) => {
        const panel = document.getElementById(this.panelId);
        if (!panel && button.style.outline !== "none") {
          button.style.outline = "none";
          button.style.boxShadow = "0 2px 8px rgba(0,0,0,0.18)";
          button.style.width = "50px";
          button.style.height = "50px";
        }
      }, true);
      
      document.body.appendChild(button);
      
      this.startWatching();
    }

    createPanel(button) {
      const panel = document.createElement("div");
      panel.id = this.panelId;
      const panelWidth = 420, panelHeight = 480;
      const btnLeft = parseInt(button.style.left);
      const btnTop = parseInt(button.style.top);

      const panelLeft = window.innerWidth - panelWidth - 75;
      const panelTop = window.innerHeight - panelHeight - 80;
      
      panel.style.cssText = `
        position: fixed;
        left: ${panelLeft}px;
        top: ${panelTop}px;
        width: ${panelWidth}px;
        height: ${panelHeight}px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.18);
        z-index: 9999;
        padding: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      `;
      
      const closeBtn = document.createElement("button");
      closeBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 1L1 13M1 1L13 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      closeBtn.style.cssText = `
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
      closeBtn.onmouseover = () => { closeBtn.style.background = 'rgba(255, 255, 255, 0.35)'; closeBtn.style.transform = 'scale(1.05)'; };
      closeBtn.onmouseout = () => { closeBtn.style.background = 'rgba(255, 255, 255, 0.2)'; closeBtn.style.transform = 'scale(1)'; };
      closeBtn.onclick = () => {
        panel.remove();
        button.style.outline = "none";
        button.style.boxShadow = "0 2px 8px rgba(0,0,0,0.18)";
        button.style.width = "50px";
        button.style.height = "50px";
      };
      
      const content = document.createElement('div');
      content.style.cssText = 'padding: 0; overflow-y: auto; flex: 1; display: flex; flex-direction: column;';
      content.innerHTML = `
        <div style="background: linear-gradient(135deg, #ff5722, #e64a19); color: white; padding: 20px 18px 16px 18px; margin: 0;">
          <div style="font-size: 20px; font-weight: bold; margin-bottom: 6px;">📈 Chancen und Risiken</div>
          <div style="font-size: 14px; opacity: 0.9;">Erkenne Verbesserungsmöglichkeiten und Gefahren</div>
        </div>
        <div style="padding: 18px; flex: 1;" id="improvement-content"></div>
      `;
      
      panel.appendChild(content);
      panel.appendChild(closeBtn);
      document.body.appendChild(panel);

      this.renderImprovementPanel();
    }

    renderImprovementPanel() {
      this.loadNotenDaten((notenDaten) => {
        const out = document.getElementById('improvement-content');
        if (!notenDaten || !notenDaten.length) {
          out.innerHTML = '<div style="color:#888;">Keine Noten gefunden.</div>';
          return;
        }
        
        let improvementItems = [];
        let riskItems = [];
        
        const round05 = (num) => Math.round(num * 2) / 2;
        
        for (const fach of notenDaten) {
          if (!fach.noten || !fach.noten.length) continue;
          const grades = fach.noten;
          const weights = fach.gewichtung || grades.map(() => 1);
          
          const weightedSum = grades.reduce((sum, grade, idx) => sum + (grade * weights[idx]), 0);
          const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
          const currentAvg = weightedSum / totalWeight;
          const currentRounded = round05(currentAvg);
          
          const nextHigherRounded = currentRounded + 0.5;
          if (nextHigherRounded <= 6.0) {
            const targetThreshold = nextHigherRounded - 0.25;
            const distToTarget = targetThreshold - currentAvg;
            
            if (distToTarget > 0 && distToTarget <= 0.25) {
              const newWeight = 1;
              const newTotalWeight = totalWeight + newWeight;
              const requiredGrade = targetThreshold * newTotalWeight - weightedSum;
              
              if (requiredGrade <= 6.0) {
                improvementItems.push({
                  subject: fach.fach,
                  currentAvg: currentAvg,
                  currentRounded: currentRounded,
                  targetRounded: nextHigherRounded,
                  requiredGrade: requiredGrade,
                  dist: distToTarget
                });
              }
            }
          }
          
          const dropThreshold = currentRounded - 0.25;
          const distToDrop = currentAvg - dropThreshold;

          if (distToDrop >= 0 && distToDrop <= 0.25) {
            const newWeight = 1;
            const newTotalWeight = totalWeight + newWeight;
            const minSafeGrade = dropThreshold * newTotalWeight - weightedSum;

            if (minSafeGrade > 1.0) {
              riskItems.push({
                subject: fach.fach,
                currentAvg: currentAvg,
                currentRounded: currentRounded,
                dropRounded: currentRounded - 0.5,
                minSafeGrade: minSafeGrade,
                dist: distToDrop
              });
            }
          }
        }
        
        improvementItems.sort((a, b) => a.dist - b.dist);
        riskItems.sort((a, b) => a.dist - b.dist);
        
        let html = '';
        
        html += '<div style="margin-bottom: 20px;">';
        html += '<h3 style="color:#4caf50; margin: 0 0 10px 0; font-size: 16px;">🟢 Greifbare Verbesserungen</h3>';
        if (!improvementItems.length) {
          html += '<div style="color:#888; font-style: italic; font-size: 13px;">Keine nahen Aufstiegschancen.</div>';
        } else {
          html += improvementItems.map(item => `
            <div style="margin: 8px 0; padding: 10px; background-color: #e8f5e8; border-radius: 8px; border-left: 4px solid #4caf50; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <b style="font-size:15px;">${item.subject}</b>
                <span style="background:#c8e6c9; color:#2e7d32; padding:2px 6px; border-radius:4px; font-size:12px; font-weight:bold;">${item.currentRounded.toFixed(1)} → ${item.targetRounded.toFixed(1)}</span>
              </div>
              <div style="font-size:13px; color:#444;">
                Aktueller Schnitt: <b>${item.currentAvg.toFixed(3)}</b><br>
                Benötigte Note (1x): <b style="color:#2e7d32;">${item.requiredGrade.toFixed(2)}</b>
              </div>
            </div>
          `).join('');
        }
        html += '</div>';
        
        html += '<div style="margin-bottom: 20px;">';
        html += '<h3 style="color:#f44336; margin: 0 0 10px 0; font-size: 16px;">🔴 Kritische Risiken</h3>';
        if (!riskItems.length) {
          html += '<div style="color:#888; font-style: italic; font-size: 13px;">Keine akuten Abstiegsrisiken.</div>';
        } else {
          html += riskItems.map(item => `
            <div style="margin: 8px 0; padding: 10px; background-color: #ffebee; border-radius: 8px; border-left: 4px solid #f44336; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <b style="font-size:15px;">${item.subject}</b>
                <span style="background:#ffcdd2; color:#c62828; padding:2px 6px; border-radius:4px; font-size:12px; font-weight:bold;">${item.currentRounded.toFixed(1)} ↘ ${item.dropRounded.toFixed(1)}</span>
              </div>
              <div style="font-size:13px; color:#444;">
                Aktueller Schnitt: <b>${item.currentAvg.toFixed(3)}</b><br>
                Abstieg bei Note (1x) < <b style="color:#c62828;">${item.minSafeGrade.toFixed(2)}</b>
              </div>
            </div>
          `).join('');
        }
        html += '</div>';
        
        out.innerHTML = html;
      });
    }
  }

  window.ImprovementButton = ImprovementButton;
  console.log('✓ ImprovementButton class registered on window object');

})();
