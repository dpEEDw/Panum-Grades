(function() {
  'use strict';
  
  console.log('Loading PluspointsButton script...');

  class PluspointsButton {
    constructor(buttonManager) {
      this.buttonManager = buttonManager;
      this.buttonId = "pluspoints-overlay-btn";
      this.panelId = "pluspoints-overlay-panel";
    }

    isPanelOpen() {
      return !!document.getElementById(this.panelId);
    }

    getDefaultPosition() {
      return {
        right: 20,
        bottom: 140
      };
    }

    startWatching() {
      const myButton = document.getElementById(this.buttonId);
      if (!myButton) return;

      if (!myButton.dataset.originalBottom) {
        myButton.dataset.originalBottom = myButton.style.bottom;
      }

      const checkAndSlide = () => {
        const improvementPos = 80;
        const myOriginalPos = 140;
        
        let targetPosition = myOriginalPos;
        
        const improvementButton = document.getElementById('improvement-overlay-btn');
        if (!improvementButton || improvementButton.style.display === 'none') {
          targetPosition = improvementPos;
        }
        
        myButton.style.transition = 'bottom 0.3s ease';
        myButton.style.bottom = `${targetPosition}px`;
      };

      checkAndSlide();
      setInterval(checkAndSlide, 100);
    }

    punkteFuerNote(note) {
      const nMK = Math.round(note * 2) / 2;
      if (nMK >= 6.0)   return 2;
      if (nMK === 5.5)  return 1.5;
      if (nMK === 5.0)  return 1;
      if (nMK === 4.5)  return 0.5;
      if (nMK === 4.0)  return 0;
      if (nMK === 3.5)  return -1;
      if (nMK === 3.0)  return -2;
      if (nMK === 2.5)  return -3;
      if (nMK === 2.0)  return -4;
      if (nMK === 1.5)  return -6;
      if (nMK <= 1.0)   return -8;
      return 0;
    }

    loadMergedSubjects() {
      try {
        const mergedMK = localStorage.getItem('mergedSubjects');
        return mergedMK ? JSON.parse(mergedMK) : [];
      } catch {
        return [];
      }
    }

    saveMergedSubjects(mergedMK) {
      try {
        localStorage.setItem('mergedSubjects', JSON.stringify(mergedMK));
      } catch (e) {
        console.error('Failed to save merged subjects:', e);
      }
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

    openPluspointsPanelAt(btnLeft, btnTop) {
      const existingPanelMK = document.getElementById(this.panelId);
      if (existingPanelMK) existingPanelMK.remove();
      const panelMK = document.createElement("div");
      panelMK.id = this.panelId;
      const panelWidthMK = 420, panelHeightMK = 660, offsetMK = 10, buttonSizeMK = 50, gapMK = 10;
      const winWMK = window.innerWidth, winHMK = window.innerHeight;
      
      const panelLeftMK = window.innerWidth - panelWidthMK - 75;
      const panelTopMK = window.innerHeight - panelHeightMK - 80;
      
      panelMK.style.cssText = `
        position: fixed;
        left: ${panelLeftMK}px;
        top: ${panelTopMK}px;
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
        // Reset button styles
        const button = document.getElementById(this.buttonId);
        if (button) {
          button.style.outline = "none";
          button.style.boxShadow = "0 2px 8px rgba(0,0,0,0.18)";
          button.style.width = "50px";
          button.style.height = "50px";
        }
      };
      const contentMK = document.createElement('div');
      contentMK.style.cssText = 'padding: 0; overflow-y: auto; flex: 1; display: flex; flex-direction: column;';
      contentMK.innerHTML = `
        <div style="background: linear-gradient(135deg, #388e3c, #2e7d32); color: white; padding: 20px 18px 16px 18px; margin: 0;">
          <div style="font-size: 20px; font-weight: bold; margin-bottom: 6px;">📊 Pluspunkte Übersicht</div>
          <div style="font-size: 14px; opacity: 0.9;">Verwalte deine Fach-Sichtbarkeit und sieh deine Punkteverteilung. <span style="font-size:12px;font-style:italic;opacity:0.85;">Nur informativ, nicht verbindlich.</span></div>
        </div>
        <div style="padding: 18px; flex: 1;">
          <div style="background: #f8f9fa; border-radius: 8px; padding: 12px; margin-bottom: 16px; border: 1px solid #e9ecef;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="font-size: 13px; font-weight: 600; color: #495057;">⚙️ Fächer ein-/ausblenden:</label>
              <button id="merge-btn" style="background: #388e3c; color: white; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; cursor: pointer; font-weight: 600;">🔗 Fächer verbinden</button>
            </div>
            <div id="pluspoints-switch-wrap"></div>
          </div>
          <div id="pluspoints-table-wrap"></div>
        </div>
      `;
      panelMK.appendChild(contentMK);
      panelMK.appendChild(closeBtnMK);
      document.body.appendChild(panelMK);
      
      const mergeBtnMK = document.getElementById('merge-btn');
      if (mergeBtnMK) {
        mergeBtnMK.onclick = () => this.openMergeDialog();
      }
      
      this.renderPluspointsTable();
    }

    openMergeDialog() {
      const existingMK = document.getElementById('merge-dialog');
      if (existingMK) existingMK.remove();
      
      const dialogMK = document.createElement('div');
      dialogMK.id = 'merge-dialog';
      dialogMK.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 500px;
        max-height: 600px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        z-index: 10001;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      `;
      
      dialogMK.innerHTML = `
        <div style="background: linear-gradient(135deg, #388e3c, #2e7d32); color: white; padding: 18px; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 18px; font-weight: bold;">🔗 Fächer verbinden</div>
          <button id="merge-close" style="background: transparent; border: none; color: white; font-size: 24px; cursor: pointer; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">✕</button>
        </div>
        <div style="padding: 20px; overflow-y: auto; flex: 1;">
          <div style="margin-bottom: 16px; padding: 12px; background: #e8f5e9; border-radius: 8px; border-left: 4px solid #388e3c;">
            <div style="font-size: 13px; color: #2e7d32; font-weight: 600; margin-bottom: 4px;">ℹ️ Wie funktioniert es?</div>
            <div style="font-size: 12px; color: #1b5e20;">Ziehe Fächer in die Box unten, um sie zu verbinden. Die Pluspunkte werden nach dem Durchschnitt der verbundenen Fächer berechnet.</div>
          </div>
          <div id="merge-list" style="margin-bottom: 16px;"></div>
          <div style="margin-bottom: 16px;">
            <div style="font-weight: 600; margin-bottom: 8px; font-size: 14px; color: #495057;">Neue Verbindung erstellen:</div>
            <div id="merge-drop-zone" style="min-height: 120px; border: 2px dashed #388e3c; border-radius: 8px; padding: 12px; background: #f8f9fa; transition: all 0.2s ease;">
              <div style="text-align: center; color: #6c757d; font-size: 13px; padding: 20px;">
                Ziehe bis zu 4 Fächer hier hinein
              </div>
              <div id="merge-subjects-container" style="display: flex; flex-wrap: wrap; gap: 8px; min-height: 40px;"></div>
            </div>
          </div>
          <div id="merge-available" style="margin-bottom: 16px;">
            <div style="font-weight: 600; margin-bottom: 8px; font-size: 14px; color: #495057;">Verfügbare Fächer:</div>
            <div id="available-subjects" style="display: flex; flex-wrap: wrap; gap: 8px; max-height: 200px; overflow-y: auto; padding: 8px; background: #fff; border-radius: 8px; border: 1px solid #e9ecef;"></div>
          </div>
        </div>
        <div style="padding: 16px; background: #f8f9fa; border-top: 1px solid #e9ecef; display: flex; gap: 8px; justify-content: flex-end;">
          <button id="merge-cancel" style="background: #fff; color: #495057; border: 1px solid #dee2e6; border-radius: 6px; padding: 8px 16px; font-size: 13px; cursor: pointer; font-weight: 600;">Abbrechen</button>
          <button id="merge-save" style="background: #388e3c; color: white; border: none; border-radius: 6px; padding: 8px 16px; font-size: 13px; cursor: pointer; font-weight: 600;">Speichern</button>
        </div>
      `;
      
      document.body.appendChild(dialogMK);
      
      document.getElementById('merge-close').onclick = () => dialogMK.remove();
      document.getElementById('merge-cancel').onclick = () => dialogMK.remove();
      document.getElementById('merge-save').onclick = () => this.saveMergeGroup();
      
      this.renderMergeDialog();
    }

    renderMergeDialog() {
      this.loadNotenDaten((notenDatenMK) => {
        const mergedMK = this.loadMergedSubjects();
        const mergedListMK = document.getElementById('merge-list');
        const availableSubjectsMK = document.getElementById('available-subjects');
        const dropZoneMK = document.getElementById('merge-drop-zone');
        const subjectsContainerMK = document.getElementById('merge-subjects-container');
        
        if (!mergedListMK || !availableSubjectsMK || !dropZoneMK) return;
        
        if (!window.currentMergeGroup) {
          window.currentMergeGroup = [];
        }
        
        mergedListMK.innerHTML = '';
        if (mergedMK.length > 0) {
          mergedMK.forEach((groupMK, idxMK) => {
            const groupDivMK = document.createElement('div');
            groupDivMK.style.cssText = 'background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px; margin-bottom: 8px;';
            
            const groupName = groupMK.name || `Verbindung ${idxMK + 1}`;
            
            // Check if percentages are custom (not equal split)
            const count = groupMK.subjects.length;
            const equalShare = Math.floor(100 / count);
            const isCustom = groupMK.percentages.some(p => Math.abs(p - equalShare) > 1);
            
            let subjectsTextMK;
            if (isCustom) {
              subjectsTextMK = groupMK.subjects.map(sMK => {
                const percentMK = groupMK.percentages[groupMK.subjects.indexOf(sMK)];
                return `${sMK.split(' - ')[1] || sMK} (${percentMK}%)`;
              }).join(' + ');
            } else {
              subjectsTextMK = groupMK.subjects.map(sMK => sMK.split(' - ')[1] || sMK).join(' + ');
            }
            
            groupDivMK.innerHTML = `
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 600; color: #388e3c; margin-bottom: 4px; font-size: 13px;">🔗 ${groupName}</div>
                  <div style="font-size: 12px; color: #6c757d;">${subjectsTextMK}</div>
                </div>
                <button class="unmerge-btn" data-index="${idxMK}" style="background: #dc3545; color: white; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; cursor: pointer; font-weight: 600;">🔓 Trennen</button>
              </div>
            `;
            
            mergedListMK.appendChild(groupDivMK);
          });
          
          document.querySelectorAll('.unmerge-btn').forEach(btnMK => {
            btnMK.onclick = (eMK) => {
              const idxMK = parseInt(eMK.target.dataset.index);
              mergedMK.splice(idxMK, 1);
              this.saveMergedSubjects(mergedMK);
              this.renderMergeDialog();
              this.renderPluspointsTable();
            };
          });
        } else {
          mergedListMK.innerHTML = '<div style="text-align: center; color: #6c757d; font-size: 13px; padding: 12px;">Noch keine Verbindungen erstellt</div>';
        }
        
        const usedSubjectsMK = new Set();
        mergedMK.forEach(groupMK => {
          groupMK.subjects.forEach(sMK => usedSubjectsMK.add(sMK));
        });
        window.currentMergeGroup.forEach(sMK => usedSubjectsMK.add(sMK));
        
        availableSubjectsMK.innerHTML = '';
        notenDatenMK.forEach(fachMK => {
          if (!usedSubjectsMK.has(fachMK.fach)) {
            const chipMK = document.createElement('div');
            chipMK.draggable = true;
            chipMK.dataset.subject = fachMK.fach;
            chipMK.style.cssText = 'background: #388e3c; color: white; border-radius: 16px; padding: 6px 12px; font-size: 12px; cursor: move; user-select: none; font-weight: 600;';
            chipMK.textContent = fachMK.fach.split(' - ')[1] || fachMK.fach;
            
            chipMK.ondragstart = (eMK) => {
              eMK.dataTransfer.setData('text/plain', fachMK.fach);
              eMK.dataTransfer.effectAllowed = 'move';
            };
            
            availableSubjectsMK.appendChild(chipMK);
          }
        });
        
        dropZoneMK.ondragover = (eMK) => {
          eMK.preventDefault();
          dropZoneMK.style.borderColor = '#2e7d32';
          dropZoneMK.style.background = '#e8f5e9';
        };
        
        dropZoneMK.ondragleave = (eMK) => {
          dropZoneMK.style.borderColor = '#388e3c';
          dropZoneMK.style.background = '#f8f9fa';
        };
        
        dropZoneMK.ondrop = (eMK) => {
          eMK.preventDefault();
          dropZoneMK.style.borderColor = '#388e3c';
          dropZoneMK.style.background = '#f8f9fa';
          
          const subjectMK = eMK.dataTransfer.getData('text/plain');
          if (subjectMK && window.currentMergeGroup.length < 4 && !window.currentMergeGroup.includes(subjectMK)) {
            window.currentMergeGroup.push(subjectMK);
            this.updateMergeContainer();
          }
        };
        
        this.updateMergeContainer();
      });
    }

    updateMergeContainer() {
      const containerMK = document.getElementById('merge-subjects-container');
      if (!containerMK) return;
      
      containerMK.innerHTML = '';
      
      if (window.currentMergeGroup.length === 0) {
        containerMK.innerHTML = '<div style="text-align: center; color: #6c757d; font-size: 12px; width: 100%; padding: 10px;">Noch keine Fächer ausgewählt</div>';
        return;
      }
      
      const defaultPercentageMK = Math.floor(100 / window.currentMergeGroup.length);
      
      window.currentMergeGroup.forEach((subjectMK, idxMK) => {
        const itemMK = document.createElement('div');
        itemMK.style.cssText = 'background: white; border: 1px solid #388e3c; border-radius: 8px; padding: 8px 12px; display: flex; align-items: center; gap: 8px; font-size: 12px;';
        
        const nameMK = subjectMK.split(' - ')[1] || subjectMK;
        
        itemMK.innerHTML = `
          <span style="color: #388e3c; font-weight: 600;">${nameMK}</span>
          <input type="number" min="1" max="100" value="${defaultPercentageMK}" 
            data-index="${idxMK}" 
            class="merge-percentage"
            style="width: 50px; padding: 4px; border: 1px solid #dee2e6; border-radius: 4px; text-align: center; font-size: 12px;">
          <span style="color: #6c757d;">%</span>
          <button class="remove-merge-subject" data-subject="${subjectMK}" style="background: #dc3545; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 11px; margin-left: auto;">✕</button>
        `;
        
        containerMK.appendChild(itemMK);
      });
      
      document.querySelectorAll('.remove-merge-subject').forEach(btnMK => {
        btnMK.onclick = (eMK) => {
          const subjectMK = eMK.target.dataset.subject;
          window.currentMergeGroup = window.currentMergeGroup.filter(sMK => sMK !== subjectMK);
          this.updateMergeContainer();
          this.renderMergeDialog();
        };
      });
      
      document.querySelectorAll('.merge-percentage').forEach(inputMK => {
        inputMK.oninput = () => {
          this.normalizeMergePercentages();
        };
      });
    }

    normalizeMergePercentages() {
      const inputsMK = document.querySelectorAll('.merge-percentage');
      if (inputsMK.length === 0) return;
      
      let totalMK = 0;
      const valuesMK = [];
      inputsMK.forEach(inputMK => {
        const valMK = Math.max(1, Math.min(100, parseInt(inputMK.value) || 0));
        valuesMK.push(valMK);
        totalMK += valMK;
      });
      
      if (totalMK !== 100) {
        const factorMK = 100 / totalMK;
        let adjustedTotalMK = 0;
        
        valuesMK.forEach((valMK, idxMK) => {
          const adjustedMK = Math.round(valMK * factorMK);
          adjustedTotalMK += adjustedMK;
          inputsMK[idxMK].value = adjustedMK;
        });
        
        if (adjustedTotalMK !== 100) {
          const diffMK = 100 - adjustedTotalMK;
          inputsMK[0].value = parseInt(inputsMK[0].value) + diffMK;
        }
      }
    }

    saveMergeGroup() {
      if (!window.currentMergeGroup || window.currentMergeGroup.length < 2) {
        alert('Bitte wähle mindestens 2 Fächer aus!');
        return;
      }
      
      const inputsMK = document.querySelectorAll('.merge-percentage');
      const percentagesMK = [];
      inputsMK.forEach(inputMK => {
        percentagesMK.push(parseInt(inputMK.value) || 0);
      });
      
      const totalMK = percentagesMK.reduce((a, b) => a + b, 0);
      if (totalMK !== 100) {
        alert('Die Prozentsätze müssen zusammen 100% ergeben!');
        return;
      }
      
      const mergedMK = this.loadMergedSubjects();
      
      // Ask for custom name
      const defaultName = `Verbindung ${mergedMK.length + 1}`;
      const customName = prompt('Gib der Verbindung einen Namen (optional):', defaultName);
      
      mergedMK.push({
        subjects: [...window.currentMergeGroup],
        percentages: percentagesMK,
        name: customName || defaultName
      });
      
      this.saveMergedSubjects(mergedMK);
      window.currentMergeGroup = [];
      
      const dialogMK = document.getElementById('merge-dialog');
      if (dialogMK) dialogMK.remove();
      
      this.renderPluspointsTable();
    }

    renderPluspointsTable() {
      this.loadNotenDaten((notenDatenMK) => {
        let hiddenFaecherMK = JSON.parse(localStorage.getItem('pluspointsHiddenFaecher') || '[]');
        const mergedMK = this.loadMergedSubjects();
        
        const mergedSubjectsMK = new Set();
        mergedMK.forEach(groupMK => {
          groupMK.subjects.forEach(sMK => mergedSubjectsMK.add(sMK));
        });
        
        // 1. Collect all items (Merged & Single)
        let allItems = [];

        // Process Merged Groups
        mergedMK.forEach((groupMK, groupIdxMK) => {
          let weightedSumMK = 0;
          let totalWeightMK = 0;
          
          groupMK.subjects.forEach((subjectMK, idxMK) => {
            const fachDataMK = notenDatenMK.find(fMK => fMK.fach === subjectMK);
            if (fachDataMK && typeof fachDataMK.durchschnitt === 'number' && !isNaN(fachDataMK.durchschnitt)) {
              const percentMK = groupMK.percentages[idxMK] / 100;
              weightedSumMK += fachDataMK.durchschnitt * percentMK;
              totalWeightMK += percentMK;
            }
          });
          
          const mergedAvgMK = totalWeightMK > 0 ? weightedSumMK / totalWeightMK : null;
          const punkteMK = mergedAvgMK !== null ? this.punkteFuerNote(mergedAvgMK) : 0;
          const groupName = groupMK.name || `Verbindung ${groupIdxMK + 1}`;
          
          // Check if percentages are custom
          const count = groupMK.subjects.length;
          const equalShare = Math.floor(100 / count);
          const isCustom = groupMK.percentages.some(p => Math.abs(p - equalShare) > 1);
          
          let subjectsTextMK;
          if (isCustom) {
            subjectsTextMK = groupMK.subjects.map(sMK => {
              const percentMK = groupMK.percentages[groupMK.subjects.indexOf(sMK)];
              return `${sMK.split(' - ')[1] || sMK} (${percentMK}%)`;
            }).join(' + ');
          } else {
            subjectsTextMK = groupMK.subjects.map(sMK => sMK.split(' - ')[1] || sMK).join(' + ');
          }

          allItems.push({
            type: 'merged',
            name: groupName,
            subText: subjectsTextMK,
            avg: mergedAvgMK !== null ? mergedAvgMK : 0,
            points: punkteMK,
            isHidden: hiddenFaecherMK.includes('__merged__' + groupIdxMK),
            switchId: 'pluspoints-switch-merged-' + groupIdxMK,
            storageKey: '__merged__' + groupIdxMK
          });
        });

        // Process Single Subjects
        for (const fachMK of notenDatenMK) {
          if (mergedSubjectsMK.has(fachMK.fach)) continue;
          
          const punkteMK = this.punkteFuerNote(fachMK.durchschnitt);
          allItems.push({
            type: 'single',
            name: fachMK.fach,
            subText: null,
            avg: fachMK.durchschnitt,
            points: punkteMK,
            isHidden: hiddenFaecherMK.includes(fachMK.fach),
            switchId: 'pluspoints-switch-' + encodeURIComponent(fachMK.fach),
            storageKey: fachMK.fach
          });
        }

        // 2. Sort Items: Positive (>0) -> Neutral (0) -> Negative (<0). Within groups: Alphabetical.
        allItems.sort((a, b) => {
          const getGroup = (item) => {
            if (item.points > 0) return 0; // Positive
            if (item.points === 0) return 1; // Neutral
            return 2; // Negative
          };

          const groupA = getGroup(a);
          const groupB = getGroup(b);

          if (groupA !== groupB) {
            return groupA - groupB;
          }
          return a.name.localeCompare(b.name);
        });
        
        // 3. Render Table
        let htmlMK = `
          <div style="background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #e9ecef;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <thead>
                <tr style="background: linear-gradient(135deg, #f8f9fa, #e9ecef);">
                  <th id="pluspoints-clipboard-header" style="text-align:center;padding:12px 8px;width:40px;font-weight:600;color:#495057;cursor:pointer;user-select:none;">📋</th>
                  <th style="text-align:left;padding:12px 8px;font-weight:600;color:#495057;">Fach</th>
                  <th style="text-align:right;padding:12px 8px;font-weight:600;color:#495057;">Schnitt</th>
                  <th style="text-align:right;padding:12px 8px;font-weight:600;color:#495057;">Punkte</th>
                </tr>
              </thead>
              <tbody>
        `;
        
        let totalPoints = 0;
        let schnittSumMK = 0, schnittCountMK = 0;
        
        allItems.forEach(item => {
          const checkedMK = !item.isHidden;
          
          const swMK = `<label style="display:inline-block;width:32px;height:20px;position:relative;cursor:pointer;">
            <input type="checkbox" id="${item.switchId}" style="opacity:0;width:0;height:0;"${checkedMK ? ' checked' : ''}>
            <span style="position:absolute;top:0;left:0;right:0;bottom:0;background:${checkedMK ? '#388e3c' : '#ccc'};border-radius:10px;transition:all 0.3s ease;"></span>
            <span style="position:absolute;left:${checkedMK ? '14px' : '2px'};top:2px;width:16px;height:16px;background:#fff;border-radius:50%;transition:all 0.3s ease;box-shadow:0 2px 4px rgba(0,0,0,0.2);"></span>
          </label>`;
          
          let rowStyleMK = 'background: #f0f9ff;';
          let fachCellMK = '', schnittCellMK = '', pointsCellMK = '';
          
          if (!checkedMK) {
            // Hidden State
            const displayName = item.type === 'merged' ? `🔗 ${item.name}` : item.name.replace(/ /g, '\n');
            fachCellMK = `<td style="padding:10px 8px;color:#aaa;text-decoration:line-through;white-space:pre-line;border-bottom:1px solid #f1f3f4;">${displayName}</td>`;
            schnittCellMK = `<td style="text-align:right;padding:10px 8px;color:#aaa;text-decoration:line-through;border-bottom:1px solid #f1f3f4;">-</td>`;
            pointsCellMK = `<td style="text-align:right;padding:10px 8px;color:#aaa;border-bottom:1px solid #f1f3f4;">-</td>`;
            rowStyleMK = 'background:#f8f9fa;';
          } else {
            // Active State
            let displayName = item.name.replace(/ /g, '\n');
            let subTextHtml = '';
            
            if (item.type === 'merged') {
              displayName = `🔗 ${item.name}`;
              subTextHtml = `<div style="font-size:11px;color:#6c757d;">${item.subText}</div>`;
            }

            const isNegative = item.points < 0;
            const isPositive = item.points > 0;
            const pointColor = isNegative ? '#dc3545' : (isPositive ? '#28a745' : '#6c757d');
            const pointPrefix = isPositive ? '+' : '';
            
            // Subject name styling
            if (isNegative) {
              fachCellMK = `<td style="padding:10px 8px;color:#dc3545;font-weight:600;white-space:pre-line;border-bottom:1px solid #f1f3f4;">${displayName}${subTextHtml}</td>`;
            } else {
              const nameColor = item.type === 'merged' ? '#1976d2' : '#495057';
              const weight = item.type === 'merged' ? '600' : '400';
              fachCellMK = `<td style="padding:10px 8px;white-space:pre-line;border-bottom:1px solid #f1f3f4;color:${nameColor};font-weight:${weight};">${displayName}${subTextHtml}</td>`;
            }

            schnittCellMK = `<td style="text-align:right;padding:10px 8px;border-bottom:1px solid #f1f3f4;color:#495057;font-weight:500;">${typeof item.avg === 'number' ? item.avg.toFixed(2) : '-'}</td>`;
            pointsCellMK = `<td style="text-align:right;padding:10px 8px;color:${pointColor};font-weight:600;border-bottom:1px solid #f1f3f4;">${pointPrefix}${item.points}</td>`;

            totalPoints += item.points;
            if (typeof item.avg === 'number' && !isNaN(item.avg)) {
              schnittSumMK += item.avg;
              schnittCountMK++;
            }
          }
          
          htmlMK += `<tr style="${rowStyleMK}">
            <td style="text-align:center;padding:10px 8px;border-bottom:1px solid #f1f3f4;">${swMK}</td>
            ${fachCellMK}${schnittCellMK}${pointsCellMK}
          </tr>`;
        });
        
        let schnittAvgMK = schnittCountMK > 0 ? (schnittSumMK / schnittCountMK).toFixed(2) : '-';
        let gesamtColorMK = totalPoints < 0 ? '#dc3545' : '#28a745';
        
        htmlMK += `
              </tbody>
              <tfoot style="background: linear-gradient(135deg, #f8f9fa, #e9ecef);">
                <tr style="font-weight:700;background:rgba(${totalPoints < 0 ? '220,53,69' : '40,167,69'},0.1);">
                  <td style="padding:10px 8px;"></td>
                  <td style="padding:10px 8px;color:#495057;">🎯 Gesamtpunkte</td>
                  <td style="padding:10px 8px;"></td>
                  <td style="text-align:right;padding:10px 8px;color:${gesamtColorMK};font-size:16px;">${totalPoints}</td>
                </tr>
                <tr style="font-weight:600;">
                  <td style="padding:10px 8px;"></td>
                  <td style="padding:10px 8px;color:#495057;">📊 Durchschnitt</td>
                  <td style="text-align:right;padding:10px 8px;color:#388e3c;font-weight:700;font-size:15px;">${schnittAvgMK}</td>
                  <td style="padding:10px 8px;"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        `;
        
        document.getElementById('pluspoints-table-wrap').innerHTML = htmlMK;
        
        // Easter Egg Logic
        const clipboardHeader = document.getElementById('pluspoints-clipboard-header');
        if (clipboardHeader) {
          let clickCount = 0;
          clipboardHeader.onclick = () => {
            clickCount++;
            if (clickCount === 5) {
              const videoOverlay = document.createElement('div');
              videoOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: black;
                z-index: 2147483647;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
              `;
              
              const video = document.createElement('video');
              
              let videoUrl;
              if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.getURL) {
                videoUrl = browser.runtime.getURL('buttons/rickroll.mp4');
              } else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                videoUrl = chrome.runtime.getURL('buttons/rickroll.mp4');
              } else {
                videoUrl = 'buttons/rickroll.mp4';
              }
                
              video.src = videoUrl;
              video.style.cssText = 'width: 100%; height: 100%; object-fit: contain;';
              video.autoplay = true;
              video.controls = false;
              
              videoOverlay.appendChild(video);
              document.body.appendChild(videoOverlay);
              
              const closeVideo = () => {
                videoOverlay.remove();
              };
              
              videoOverlay.onclick = closeVideo;
              video.onended = closeVideo;
              
              video.play().catch(e => console.error('Autoplay failed:', e));
              
              clickCount = 0;
            }
          };
        }
        
        // Re-attach event listeners
        allItems.forEach(item => {
          const elMK = document.getElementById(item.switchId);
          if (!elMK) return;
          
          elMK.addEventListener('change', () => {
            let hiddenFaecherMK = JSON.parse(localStorage.getItem('pluspointsHiddenFaecher') || '[]');
            if (!elMK.checked) {
              if (!hiddenFaecherMK.includes(item.storageKey)) hiddenFaecherMK.push(item.storageKey);
            } else {
              hiddenFaecherMK = hiddenFaecherMK.filter(k => k !== item.storageKey);
            }
            localStorage.setItem('pluspointsHiddenFaecher', JSON.stringify(hiddenFaecherMK));
            this.renderPluspointsTable();
          });
        });
      });
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
      buttonMK.title = "Pluspunkte-Übersicht";
      buttonMK.style.cssText = `
        position: fixed;
        width: 50px;
        height: 50px;
        background: #fff;
        color: white;
        border: 1px solid #388e3c;
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
      buttonMK.innerHTML = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="6" width="4" height="20" rx="2" fill="#388e3c"/><rect x="6" y="14" width="20" height="4" rx="2" fill="#388e3c"/></svg>`;
      
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
        buttonMK.style.outline = "3px solid #4afc7a";
        buttonMK.style.boxShadow = "0 0 16px 4px #4afc7a, 0 2px 8px rgba(0,0,0,0.18)";
        buttonMK.style.width = "58px";
        buttonMK.style.height = "58px";
        const btnLeftMK = parseInt(buttonMK.style.left);
        const btnTopMK = parseInt(buttonMK.style.top);
        this.openPluspointsPanelAt(btnLeftMK, btnTopMK);
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
      
      this.startWatching();
    }
  }

  window.PluspointsButton = PluspointsButton;
  console.log('✓ PluspointsButton class registered on window object');

  window.PluspointsButton = PluspointsButton;
  console.log('✓ PluspointsButton class registered on window object');

})();
