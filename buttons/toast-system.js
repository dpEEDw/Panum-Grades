// Minoshek built this with help from AI.

(function () {
    const ENABLE_SHARE_TRIGGER = true;
    const GRADES_PAGE_ID = '21311';

    function isGradesPage() {
        const currentUrl = new URL(window.location.href);
        return currentUrl.searchParams.get('pageid') === GRADES_PAGE_ID;
    }

    const TIPS = [
        "Wusstest du: Du kannst einzelne Buttons im <span class='highlight-popup'>Erweiterungs-Popup</span> an- und ausschalten?",
        "Wusstest du: Deine Daten werden sicher lokal in deinem Browser gespeichert?",
        "Wusstest du: Du kannst das Layout anpassen, indem du Buttons im Popup deaktivierst?",
        "Wusstest du: Wenn du fünf mal auf das 📋-emoji im \"Pluspunkte\"-Button klickst, schaltest du ein neuen hidden Button frei!",
        "Wusstest du: Der Rechner zeigt dir sofort, wie sich eine neue Note auf deinen Schnitt auswirkt?",
        "Wusstest du: Du kannst Zielnoten festlegen und sehen, wie realistisch sie sind?",
        "Wusstest du: Diese Erweiterung wird ständig weiterentwickelt – Feedback ist willkommen!",
        "Wusstest du: Du kannst deine Noten-Historie visuell verfolgen (in Entwicklung)?",
        "Wusstest du: Das 'Custom'-Feature erlaubt dir, eigene Berechnungen anzustellen?",
        "Wusstest du: Du kannst die Erweiterung auf Chrome, Edge und Firefox nutzen?",
        "Wusstest du: Wenn dich ein Button stört, schalte ihn einfach im Menü oben rechts aus.",
        "Wusstest du: Der Durchschnitt wird automatisch basierend auf deinen eingetragenen Noten aktualisiert?",
        "Wusstest du: Du kannst sehen, wie viele Punkte dir zur nächsten Notenstufe fehlen?",
        "Wusstest du: Das Gamification-Feature macht das Notensammeln etwas spannender!",
        "Wusstest du: Du kannst diesen Hinweis schließen, indem du kurz wartest oder ihn wegklickst."
    ];

    class ToastSystem {
        constructor() {
            this.container = null;
            this.triggerBtn = null;
            this.timer = null;
            this.isVisible = false;
            this.minInterval = 2 * 60 * 1000; // 2 minutes
            this.maxInterval = 5 * 60 * 1000; // 5 minutes
            this.displayDuration = 8000; // 8 seconds
        }

        init() {
            this.createStyles();
            if (ENABLE_SHARE_TRIGGER && isGradesPage()) {
                this.createShareButton();
            }
            this.createToastContainer();
            this.scheduleNextToast();
        }

        createStyles() {
            const style = document.createElement('style');
            style.textContent = `
                :root {
                    --sn-share-modal-bg: #ffffff;
                    --sn-share-modal-title: #333;
                    --sn-share-modal-muted: #5b677a;
                    --sn-share-close: #999;
                    --sn-share-close-hover: #333;
                    --sn-share-option-bg: #f8f9fa;
                    --sn-share-option-bg-hover: #e9ecef;
                    --sn-share-option-border: #eee;
                    --sn-share-option-text: #333;
                }

                html.panum-dark-theme {
                    --sn-share-modal-bg: #1d2430;
                    --sn-share-modal-title: #e8edf5;
                    --sn-share-modal-muted: #b5bfce;
                    --sn-share-close: #b5bfce;
                    --sn-share-close-hover: #f3f7ff;
                    --sn-share-option-bg: #171b22;
                    --sn-share-option-bg-hover: #202735;
                    --sn-share-option-border: #303a4b;
                    --sn-share-option-text: #e8edf5;
                }

                .sn-toast-container {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%) translateY(100px);
                    background: rgba(33, 37, 41, 0.95);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 50px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    font-family: 'Segoe UI', sans-serif;
                    font-size: 14px;
                    z-index: 10000;
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.27), opacity 0.4s ease;
                    opacity: 0;
                    pointer-events: none;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    max-width: 80%;
                    width: max-content;
                    text-align: center;
                    border: 1px solid rgba(255,255,255,0.1);
                }

                .sn-toast-container.visible {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                    pointer-events: auto;
                }

                .sn-toast-icon {
                    font-size: 18px;
                    margin-right: 5px;
                }

                .sn-toast-text {
                    line-height: 1.4;
                }

                /* Share Button Styles */
                .sn-share-trigger {
                    position: fixed;
                    bottom: 200px; /* Above Pluspoints button (140px) */
                    right: 20px;   /* Aligned with the vertical stack */
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #1f2b3a, #2f4c6f);
                    border-radius: 50%;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    cursor: pointer;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .sn-share-trigger:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                }

                .sn-share-trigger svg {
                    width: 20px;
                    height: 20px;
                    fill: #dfe9f7;
                }

                .highlight-popup {
                    color: #4dabf7;
                    font-weight: bold;
                    text-decoration: underline;
                    cursor: help;
                }
                
                /* Share Popup Styles */
                .sn-share-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    z-index: 20000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(2px);
                    animation: fadeIn 0.2s ease;
                }
                
                .sn-share-modal {
                    background: var(--sn-share-modal-bg);
                    padding: 25px;
                    border-radius: 16px;
                    width: 320px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
                    font-family: 'Segoe UI', sans-serif;
                    animation: slideUp 0.3s ease;
                    position: relative;
                }
                
                .sn-share-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .sn-share-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--sn-share-modal-title);
                    margin: 0;
                }

                .sn-share-description {
                    margin: 0 0 12px 0;
                    color: var(--sn-share-modal-muted);
                    font-size: 13px;
                }
                
                .sn-share-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: var(--sn-share-close);
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                }
                
                .sn-share-close:hover {
                    color: var(--sn-share-close-hover);
                }
                
                .sn-share-options {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .sn-share-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border: 1px solid var(--sn-share-option-border);
                    border-radius: 8px;
                    background: var(--sn-share-option-bg);
                    color: var(--sn-share-option-text);
                    text-decoration: none;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                    width: 100%;
                    box-sizing: border-box;
                    text-align: left;
                }
                
                .sn-share-btn:hover {
                    background: var(--sn-share-option-bg-hover);
                    transform: translateY(-1px);
                }
                
                .sn-share-btn svg {
                    width: 20px;
                    height: 20px;
                }

                #sn-copy-link svg {
                    fill: currentColor;
                }

                /* Help Modal Styles (Restored) */
                .sn-help-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    z-index: 20000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.2s ease;
                }
                
                .sn-help-modal {
                    background: white;
                    padding: 25px;
                    border-radius: 12px;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    text-align: center;
                    font-family: 'Segoe UI', sans-serif;
                    animation: slideUp 0.3s ease;
                }
                
                .sn-help-modal h3 {
                    margin-top: 0;
                    color: #333;
                }
                
                .sn-help-modal p {
                    color: #666;
                    line-height: 1.5;
                }
                
                .sn-help-modal-btn {
                    background: #1976d2;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    margin-top: 15px;
                    transition: background 0.2s;
                }
                
                .sn-help-modal-btn:hover {
                    background: #1565c0;
                }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `;
            document.head.appendChild(style);
        }

        createShareButton() {
            this.shareBtn = document.createElement('div');
            this.shareBtn.className = 'sn-share-trigger';
            this.shareBtn.title = 'Schulnetz Plus teilen';
            this.shareBtn.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                </svg>
            `;
            this.shareBtn.onclick = () => this.openSharePopup();
            document.body.appendChild(this.shareBtn);
        }

        openSharePopup() {
            if (document.querySelector('.sn-share-modal-overlay')) return;

            const overlay = document.createElement('div');
            overlay.className = 'sn-share-modal-overlay';
            
            // URL
            const WEBSITE_URL = "https://panumic.com/grades/";
            
            // Direct View: Sharing Options
            overlay.innerHTML = `
                <div class="sn-share-modal">
                    <div class="sn-share-header">
                        <h3 class="sn-share-title">Panum Grades Extension teilen</h3>
                        <button class="sn-share-close">&times;</button>
                    </div>
                    <p class="sn-share-description">
                        Teile nur die Extension-Seite, nicht deine persönlichen Noten.
                    </p>
                    <div class="sn-share-options">
                        <button class="sn-share-btn" id="sn-copy-link">
                            <svg viewBox="0 0 24 24" fill="#555"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                            Link kopieren
                        </button>
                        <a href="https://teams.microsoft.com/share?href=${encodeURIComponent(WEBSITE_URL)}" target="_blank" class="sn-share-btn">
                            <svg viewBox="0 0 24 24" fill="#6264A7"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/></svg>
                            Auf Teams teilen
                        </a>
                        <a href="https://mail.google.com/mail/?view=cm&fs=1&su=Panum%20Grades%20Extension&body=Check%20out%20the%20Panum%20Grades%20extension:%20${encodeURIComponent(WEBSITE_URL)}" target="_blank" class="sn-share-btn">
                            <svg viewBox="0 0 24 24" fill="#EA4335"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                            Per Gmail senden
                        </a>
                        <a href="https://wa.me/?text=${encodeURIComponent("Schau dir die Panum Grades Extension an: " + WEBSITE_URL)}" target="_blank" class="sn-share-btn">
                            <svg viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                            Per WhatsApp senden
                        </a>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Close Handlers
            const closePopup = () => overlay.remove();
            overlay.querySelector('.sn-share-close').onclick = closePopup;
            overlay.onclick = (e) => {
                if (e.target === overlay) closePopup();
            };

            // Copy Link Handler
            overlay.querySelector('#sn-copy-link').onclick = function() {
                navigator.clipboard.writeText(WEBSITE_URL).then(() => {
                    const originalHTML = this.innerHTML;
                    this.innerHTML = '✅ Kopiert!';
                    setTimeout(() => {
                        this.innerHTML = originalHTML;
                    }, 2000);
                });
            };
        }

        createToastContainer() {
            this.container = document.createElement('div');
            this.container.className = 'sn-toast-container';
            this.container.innerHTML = `
                <span class="sn-toast-icon">💡</span>
                <span class="sn-toast-text"></span>
            `;
            document.body.appendChild(this.container);
        }
        
        createHelpModal() {
            // Remove existing if any
            const existing = document.querySelector('.sn-help-modal-overlay');
            if (existing) existing.remove();
            
            const overlay = document.createElement('div');
            overlay.className = 'sn-help-modal-overlay';
            
            overlay.innerHTML = `
                <div class="sn-help-modal">
                    <h3>Einstellungen öffnen</h3>
                    <p>Browser-Erweiterungen können ihr Menü aus Sicherheitsgründen nicht automatisch öffnen.</p>
                    <div style="margin: 20px 0; font-size: 40px;">🧩 ↗️</div>
                    <p>Bitte klicke auf das <strong>Puzzle-Icon</strong> oder das <strong>Schulnetz Plus Icon</strong> oben rechts in deiner Browser-Leiste, um Buttons an- und auszuschalten.</p>
                    <button class="sn-help-modal-btn">Verstanden</button>
                </div>
            `;
            
            overlay.querySelector('button').onclick = () => overlay.remove();
            overlay.onclick = (e) => {
                if (e.target === overlay) overlay.remove();
            };
            
            document.body.appendChild(overlay);
        }

        showRandomToast() {
            const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
            this.showToast(randomTip);
        }

        showToast(message) {
            if (this.isVisible) return; // Don't overlap

            const textEl = this.container.querySelector('.sn-toast-text');
            textEl.innerHTML = message;

            // Add click handler for the popup link if present
            const popupLink = textEl.querySelector('.highlight-popup');
            if (popupLink) {
                popupLink.onclick = (e) => {
                    e.stopPropagation();
                    this.createHelpModal();
                };
            }

            this.isVisible = true;
            this.container.classList.add('visible');

            // Auto hide
            setTimeout(() => {
                this.hideToast();
            }, this.displayDuration);
        }

        hideToast() {
            this.isVisible = false;
            this.container.classList.remove('visible');
        }

        scheduleNextToast() {
            const nextInterval = Math.floor(Math.random() * (this.maxInterval - this.minInterval + 1) + this.minInterval);
            setTimeout(() => {
                if (!document.hidden) { // Only show if tab is active-ish
                    this.showRandomToast();
                }
                this.scheduleNextToast();
            }, nextInterval);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new ToastSystem().init());
    } else {
        new ToastSystem().init();
    }

})();
