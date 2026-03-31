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

    parseNumericValue(value) {
      if (typeof value === 'number') {
        return Number.isFinite(value) ? value : NaN;
      }

      if (typeof value === 'string') {
        const parsedValue = parseFloat(value.replace(',', '.').replace('*', '').trim());
        return Number.isFinite(parsedValue) ? parsedValue : NaN;
      }

      return NaN;
    }

    getSubjectDisplayName(fach) {
      const fallbackName = 'Unbekanntes Fach';
      const fullName = String((fach && fach.fach) || (fach && fach.fachLangName) || '').trim();
      if (!fullName) {
        return fallbackName;
      }

      const splitName = fullName.split(' - ');
      if (splitName.length > 1 && splitName[1].trim()) {
        return splitName[1].trim();
      }

      return fullName;
    }

    buildWeightedEntries(fach) {
      if (!fach || !Array.isArray(fach.noten) || !fach.noten.length) {
        return [];
      }

      const rawWeights = Array.isArray(fach.gewichtungen)
        ? fach.gewichtungen
        : (Array.isArray(fach.gewichtung) ? fach.gewichtung : []);

      const entries = [];

      fach.noten.forEach((rawGrade, index) => {
        const grade = this.parseNumericValue(rawGrade);
        if (!Number.isFinite(grade)) {
          return;
        }

        let weight = this.parseNumericValue(rawWeights[index]);
        if (!Number.isFinite(weight) || weight <= 0) {
          weight = 1;
        }

        entries.push({ grade, weight });
      });

      return entries;
    }

    getSuggestedNextWeight(entries) {
      if (!Array.isArray(entries) || entries.length === 0) {
        return 1;
      }

      const weightCounts = new Map();
      entries.forEach((entry) => {
        const normalizedWeight = Number(entry.weight.toFixed(2));
        weightCounts.set(normalizedWeight, (weightCounts.get(normalizedWeight) || 0) + 1);
      });

      let bestWeight = 1;
      let bestCount = 0;

      weightCounts.forEach((count, weight) => {
        if (count > bestCount || (count === bestCount && weight > bestWeight)) {
          bestCount = count;
          bestWeight = weight;
        }
      });

      return bestWeight;
    }

    formatWeight(weight) {
      if (!Number.isFinite(weight)) {
        return '1';
      }
      if (Math.abs(weight - Math.round(weight)) < 0.001) {
        return String(Math.round(weight));
      }
      return weight.toFixed(2);
    }

    getActionableImprovements(items) {
      if (!Array.isArray(items) || !items.length) {
        return [];
      }

      const maxRequiredGradeMK = 5.25;
      const maxDistanceMK = 0.15;
      const maxItemsMK = 3;

      const filteredItemsMK = items
        .filter((item) => item.guaranteed || item.requiredGrade <= maxRequiredGradeMK || item.dist <= maxDistanceMK)
        .map((item) => {
          const effortPenaltyMK = item.guaranteed ? -1 : item.requiredGrade;
          const closenessPenaltyMK = Math.max(0, item.dist) * 2;
          const weightPenaltyMK = Math.max(0, item.nextWeight - 1) * 0.15;
          const priorityScoreMK = effortPenaltyMK + closenessPenaltyMK + weightPenaltyMK;

          return {
            ...item,
            priorityScore: priorityScoreMK
          };
        })
        .sort((a, b) => {
          if (a.priorityScore !== b.priorityScore) return a.priorityScore - b.priorityScore;
          if (a.requiredGrade !== b.requiredGrade) return a.requiredGrade - b.requiredGrade;
          return b.currentAvg - a.currentAvg;
        });

      return filteredItemsMK.slice(0, maxItemsMK);
    }

    getCriticalRisks(items) {
      if (!Array.isArray(items) || !items.length) {
        return [];
      }

      const minSafeGradeThresholdMK = 4.75;
      const veryCloseDistanceMK = 0.08;
      const maxItemsMK = 3;

      const filteredItemsMK = items
        .filter((item) => item.unavoidable || item.minSafeGrade >= minSafeGradeThresholdMK || item.dist <= veryCloseDistanceMK)
        .map((item) => {
          const unavoidableBonusMK = item.unavoidable ? 10 : 0;
          const riskPressureMK = Math.min(item.minSafeGrade, 6.5);
          const closenessBonusMK = Math.max(0, 0.2 - item.dist);
          const priorityScoreMK = unavoidableBonusMK + riskPressureMK + closenessBonusMK;
          return {
            ...item,
            priorityScore: priorityScoreMK
          };
        })
        .sort((a, b) => {
          if (a.priorityScore !== b.priorityScore) return b.priorityScore - a.priorityScore;
          if (a.minSafeGrade !== b.minSafeGrade) return b.minSafeGrade - a.minSafeGrade;
          return a.dist - b.dist;
        });

      return filteredItemsMK.slice(0, maxItemsMK);
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
        const epsilon = 0.000001;
        
        for (const fach of notenDaten) {
          const entries = this.buildWeightedEntries(fach);
          if (!entries.length) {
            continue;
          }

          const subjectName = this.getSubjectDisplayName(fach);
          const weightedSum = entries.reduce((sum, entry) => sum + (entry.grade * entry.weight), 0);
          const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
          if (totalWeight <= 0) {
            continue;
          }

          const currentAvg = weightedSum / totalWeight;
          const currentRounded = round05(currentAvg);
          const nextWeight = this.getSuggestedNextWeight(entries);
          
          const nextHigherRounded = currentRounded + 0.5;
          if (nextHigherRounded <= 6.0 + epsilon) {
            const targetThreshold = nextHigherRounded - 0.25 + epsilon;
            const distToTarget = targetThreshold - currentAvg;
            
            if (distToTarget > 0 && distToTarget <= 0.25 + epsilon) {
              const requiredGrade = (targetThreshold * (totalWeight + nextWeight) - weightedSum) / nextWeight;
              
              if (requiredGrade <= 6.0 + epsilon) {
                improvementItems.push({
                  subject: subjectName,
                  currentAvg: currentAvg,
                  currentRounded: currentRounded,
                  targetRounded: nextHigherRounded,
                  requiredGrade: Math.max(1, requiredGrade),
                  dist: distToTarget,
                  nextWeight: nextWeight,
                  guaranteed: requiredGrade < 1
                });
              }
            }
          }
          
          if (currentRounded > 1.0 + epsilon) {
            const dropThreshold = currentRounded - 0.25;
            const distToDrop = currentAvg - dropThreshold;

            if (distToDrop >= -epsilon && distToDrop <= 0.25 + epsilon) {
              const minSafeGrade = (dropThreshold * (totalWeight + nextWeight) - weightedSum) / nextWeight;

              if (minSafeGrade > 1.0 + epsilon) {
                riskItems.push({
                  subject: subjectName,
                  currentAvg: currentAvg,
                  currentRounded: currentRounded,
                  dropRounded: currentRounded - 0.5,
                  minSafeGrade: minSafeGrade,
                  dist: distToDrop,
                  nextWeight: nextWeight,
                  unavoidable: minSafeGrade > 6.0 + epsilon
                });
              }
            }
          }
        }
        
        improvementItems.sort((a, b) => a.dist - b.dist);
        riskItems.sort((a, b) => a.dist - b.dist);

        const topImprovements = this.getActionableImprovements(improvementItems);
        const topRisks = this.getCriticalRisks(riskItems);
        const hiddenImprovementCount = Math.max(0, improvementItems.length - topImprovements.length);
        const hiddenRiskCount = Math.max(0, riskItems.length - topRisks.length);
        
        let html = '';
        
        html += '<div style="margin-bottom: 20px;">';
        html += '<h3 style="color:#4caf50; margin: 0 0 6px 0; font-size: 16px;">🟢 Schnellste Hebel</h3>';
        html += '<div style="color:#5f6b7a; font-size: 12px; margin-bottom: 10px;">Nur Chancen mit niedrigem Aufwand bis zur nächsten Rundungsetappe.</div>';
        if (!topImprovements.length) {
          html += '<div style="color:#888; font-style: italic; font-size: 13px;">Aktuell keine echte Quick-Win-Chance gefunden.</div>';
        } else {
          html += topImprovements.map((item, idx) => `
            <div style="margin: 8px 0; padding: 10px; background-color: #e8f5e8; border-radius: 8px; border-left: 4px solid #4caf50; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <b style="font-size:15px;">${item.subject}</b>
                <span style="background:#c8e6c9; color:#2e7d32; padding:2px 6px; border-radius:4px; font-size:12px; font-weight:bold;">${idx === 0 ? 'Top Chance' : 'Chance'} • ${item.currentRounded.toFixed(1)} → ${item.targetRounded.toFixed(1)}</span>
              </div>
              <div style="font-size:13px; color:#444;">
                Aktueller Schnitt: <b>${item.currentAvg.toFixed(3)}</b><br>
                ${item.guaranteed
                  ? `Nächster Test (Gewichtung ${this.formatWeight(item.nextWeight)}): <b style="color:#2e7d32;">bereits mit 1.0 erreichbar</b>`
                  : `Benötigte Note (1x, Gewichtung ${this.formatWeight(item.nextWeight)}): <b style="color:#2e7d32;">${item.requiredGrade.toFixed(2)}</b>`}
              </div>
            </div>
          `).join('');

          if (hiddenImprovementCount > 0) {
            html += `<div style="margin-top:6px;color:#6c757d;font-size:12px;">${hiddenImprovementCount} weitere Chance(n) ausgeblendet, um den Fokus auf die besten Hebel zu halten.</div>`;
          }
        }
        html += '</div>';
        
        html += '<div style="margin-bottom: 20px;">';
        html += '<h3 style="color:#f44336; margin: 0 0 6px 0; font-size: 16px;">🔴 Kritische Risiken</h3>';
        html += '<div style="color:#5f6b7a; font-size: 12px; margin-bottom: 10px;">Nur Fächer mit hoher Abstiegsgefahr werden angezeigt.</div>';
        if (!topRisks.length) {
          html += '<div style="color:#888; font-style: italic; font-size: 13px;">Keine kritischen Risiken erkannt.</div>';
        } else {
          html += topRisks.map((item, idx) => `
            <div style="margin: 8px 0; padding: 10px; background-color: #ffebee; border-radius: 8px; border-left: 4px solid #f44336; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <b style="font-size:15px;">${item.subject}</b>
                <span style="background:#ffcdd2; color:#c62828; padding:2px 6px; border-radius:4px; font-size:12px; font-weight:bold;">${idx === 0 ? 'Höchstes Risiko' : 'Risiko'} • ${item.currentRounded.toFixed(1)} ↘ ${item.dropRounded.toFixed(1)}</span>
              </div>
              <div style="font-size:13px; color:#444;">
                Aktueller Schnitt: <b>${item.currentAvg.toFixed(3)}</b><br>
                ${item.unavoidable
                  ? `Abstieg kaum vermeidbar: selbst <b style="color:#c62828;">6.0</b> reicht bei Gewichtung ${this.formatWeight(item.nextWeight)} nicht.`
                  : `Abstieg bei Note (1x, Gewichtung ${this.formatWeight(item.nextWeight)}) < <b style="color:#c62828;">${item.minSafeGrade.toFixed(2)}</b>`}
              </div>
            </div>
          `).join('');

          if (hiddenRiskCount > 0) {
            html += `<div style="margin-top:6px;color:#6c757d;font-size:12px;">${hiddenRiskCount} weitere Risiko-Hinweise ausgeblendet.</div>`;
          }
        }
        html += '</div>';
        
        out.innerHTML = html;
      });
    }
  }

  window.ImprovementButton = ImprovementButton;
  console.log('✓ ImprovementButton class registered on window object');

})();
