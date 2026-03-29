// Minoshek built this with help from AI.

(function () {
    class IncognitoSystem {
        constructor() {
            this.isActive = false;
            this.headerElement = null;
            this.iconButton = null;
            this.storageKeyHash = 'sn_incognito_hash';
            this.storageKeyRecovery = 'sn_incognito_recovery';
            this.storageKeyActive = 'sn_incognito_active_state';
        }

        init() {
            this.createStyles();
            this.findHeaderAndInjectButton();
            this.checkStoredState();
            
            // Watch for DOM changes to re-apply obfuscation if new content loads
            this.setupObserver();
        }

        createStyles() {
            const style = document.createElement('style');
            style.textContent = `
                :root {
                    --sn-incognito-modal-bg: #ffffff;
                    --sn-incognito-title: #333;
                    --sn-incognito-text-muted: #666;
                    --sn-incognito-input-bg: #ffffff;
                    --sn-incognito-input-text: #333;
                    --sn-incognito-input-border: #ddd;
                    --sn-incognito-action-bg: #333;
                    --sn-incognito-action-bg-hover: #555;
                    --sn-incognito-action-neutral-bg: #999;
                    --sn-incognito-action-neutral-bg-hover: #888;
                    --sn-incognito-timer-border: #333;
                    --sn-incognito-timer-text: #333;
                    --sn-incognito-forgot-link: #666;
                }

                html.panum-dark-theme {
                    --sn-incognito-modal-bg: #1d2430;
                    --sn-incognito-title: #e8edf5;
                    --sn-incognito-text-muted: #b5bfce;
                    --sn-incognito-input-bg: #171b22;
                    --sn-incognito-input-text: #e8edf5;
                    --sn-incognito-input-border: #303a4b;
                    --sn-incognito-action-bg: #2d4f74;
                    --sn-incognito-action-bg-hover: #3c628b;
                    --sn-incognito-action-neutral-bg: #4f5b6f;
                    --sn-incognito-action-neutral-bg-hover: #5d6a80;
                    --sn-incognito-timer-border: #b5bfce;
                    --sn-incognito-timer-text: #e8edf5;
                    --sn-incognito-forgot-link: #b5bfce;
                }

                .sn-incognito-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    margin-left: 10px;
                    cursor: pointer;
                    vertical-align: middle;
                    opacity: 1;
                    transition: opacity 0.2s, transform 0.2s;
                }
                .sn-incognito-btn svg,
                .sn-incognito-btn svg path {
                    fill: #111111;
                    filter: none;
                }
                .sn-incognito-btn:hover {
                    opacity: 1;
                    transform: scale(1.1);
                }
                .sn-incognito-btn.active svg {
                    fill: #ff6b6b;
                }
                
                /* Modal Styles */
                .sn-incognito-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.6);
                    z-index: 20000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(3px);
                    animation: snFadeIn 0.2s ease;
                }
                
                .sn-incognito-modal {
                    background: var(--sn-incognito-modal-bg);
                    padding: 25px;
                    border-radius: 12px;
                    width: 320px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    font-family: 'Segoe UI', sans-serif;
                    animation: snSlideUp 0.3s ease;
                    text-align: center;
                }
                
                .sn-incognito-title {
                    margin: 0 0 15px 0;
                    color: var(--sn-incognito-title);
                    font-size: 18px;
                }

                .sn-incognito-copy-muted {
                    font-size: 13px;
                    color: var(--sn-incognito-text-muted);
                }

                .sn-incognito-copy-muted-small {
                    font-size: 12px;
                    color: var(--sn-incognito-text-muted);
                }
                
                .sn-incognito-input {
                    width: 100%;
                    padding: 10px;
                    margin: 10px 0;
                    border: 1px solid var(--sn-incognito-input-border);
                    border-radius: 6px;
                    background: var(--sn-incognito-input-bg);
                    color: var(--sn-incognito-input-text);
                    font-size: 24px;
                    text-align: center;
                    letter-spacing: 5px;
                    box-sizing: border-box;
                }
                
                .sn-incognito-btn-action {
                    background: var(--sn-incognito-action-bg);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    margin-top: 10px;
                    width: 100%;
                    box-sizing: border-box;
                    transition: background 0.2s;
                }
                
                .sn-incognito-btn-action:hover {
                    background: var(--sn-incognito-action-bg-hover);
                }

                .sn-incognito-btn-action-neutral {
                    background: var(--sn-incognito-action-neutral-bg);
                }

                .sn-incognito-btn-action-neutral:hover {
                    background: var(--sn-incognito-action-neutral-bg-hover);
                }
                
                .sn-incognito-error {
                    color: #d32f2f;
                    font-size: 12px;
                    margin-top: 5px;
                    min-height: 18px;
                }

                .sn-timer-circle {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    border: 4px solid var(--sn-incognito-timer-border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: bold;
                    margin: 20px auto;
                    color: var(--sn-incognito-timer-text);
                }

                .sn-forgot-pass {
                    display: block;
                    margin-top: 15px;
                    color: var(--sn-incognito-forgot-link);
                    font-size: 12px;
                    text-decoration: underline;
                    cursor: pointer;
                }

                @keyframes snFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes snSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `;
            document.head.appendChild(style);
        }

        findHeaderAndInjectButton() {
            // Look for the h3 containing the current-grades label
            const headers = document.querySelectorAll('h3');
            for (const h3 of headers) {
                if (h3.textContent.includes('Aktuelle Noten')) {
                    this.headerElement = h3;
                    this.createButton();
                    break;
                }
            }
        }

        createButton() {
            if (!this.headerElement || this.iconButton) return;

            this.iconButton = document.createElement('span');
            this.iconButton.className = 'sn-incognito-btn';
            this.iconButton.title = 'Incognito Modus (Noten verbergen)';
            this.iconButton.innerHTML = `
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M12 6c3.79 0 7.17 2.13 8.82 5.5C19.17 14.87 15.79 17 12 17s-7.17-2.13-8.82-5.5C4.83 8.13 8.21 6 12 6m0-2C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 5c1.38 0 2.5 1.12 2.5 2.5S13.38 14 12 14s-2.5-1.12-2.5-2.5S10.62 9 12 9m0-2c-2.48 0-4.5 2.02-4.5 4.5S9.52 16 12 16s4.5-2.02 4.5-4.5S14.48 7 12 7z"/>
                </svg>
            `;
            
            this.iconButton.onclick = () => this.handleButtonClick();
            this.headerElement.appendChild(this.iconButton);
        }

        handleButtonClick() {
            const hasPassword = localStorage.getItem(this.storageKeyHash);
            
            if (!hasPassword) {
                this.showSetupModal();
            } else {
                this.showLoginModal();
            }
        }

        showSetupModal() {
            this.createModal({
                title: 'PIN erstellen',
                content: `
                    <p class="sn-incognito-copy-muted">Wähle einen 4-stelligen PIN.</p>
                    <input type="password" inputmode="numeric" class="sn-incognito-input" id="sn-pass-1" placeholder="PIN" maxlength="4" style="letter-spacing: 8px;">
                    <input type="password" inputmode="numeric" class="sn-incognito-input" id="sn-pass-2" placeholder="Wiederholen" maxlength="4" style="letter-spacing: 8px;">
                    <div class="sn-incognito-error" id="sn-error"></div>
                    <button class="sn-incognito-btn-action" id="sn-submit">Speichern</button>
                `,
                onSubmit: (modal) => {
                    const p1 = modal.querySelector('#sn-pass-1').value;
                    const p2 = modal.querySelector('#sn-pass-2').value;
                    const error = modal.querySelector('#sn-error');

                    if (!/^\d{4}$/.test(p1)) {
                        error.textContent = 'Genau 4 Zahlen erforderlich!';
                        return;
                    }
                    if (p1 !== p2) {
                        error.textContent = 'PINs stimmen nicht überein!';
                        return;
                    }

                    localStorage.setItem(this.storageKeyHash, this.hashPassword(p1));
                    
                    document.body.removeChild(modal.parentElement);
                    this.toggleIncognito(true, true);
                }
            });
        }

        showLoginModal() {
            this.createModal({
                title: this.isActive ? 'Modus deaktivieren' : 'Incognito aktivieren',
                content: `
                    <input type="password" inputmode="numeric" class="sn-incognito-input" id="sn-pass" placeholder="PIN eingeben" maxlength="4" autofocus style="letter-spacing: 8px;">
                    <div class="sn-incognito-error" id="sn-error"></div>
                    <button class="sn-incognito-btn-action" id="sn-submit">Bestätigen</button>
                    <span class="sn-forgot-pass" id="sn-forgot">PIN vergessen?</span>
                `,
                onSubmit: (modal) => {
                    const pass = modal.querySelector('#sn-pass').value;
                    const storedHash = localStorage.getItem(this.storageKeyHash);
                    
                    if (this.hashPassword(pass) === storedHash) {
                        document.body.removeChild(modal.parentElement);
                        // Reload if turning ON, just toggle if turning OFF
                        this.toggleIncognito(!this.isActive, !this.isActive);
                    } else {
                        modal.querySelector('#sn-error').textContent = 'Falscher PIN!';
                        modal.querySelector('#sn-pass').value = '';
                        modal.querySelector('#sn-pass').focus();
                    }
                },
                onForgot: (modal) => {
                    this.showDelayUnlockModal(modal);
                }
            });
        }

        showDelayUnlockModal(previousModal) {
            previousModal.innerHTML = `
                <h3 class="sn-incognito-title">Notfall-Entsperrung</h3>
                <p>Wartezeit aus Sicherheitsgründen:</p>
                <div class="sn-timer-circle">30</div>
                <p class="sn-incognito-copy-muted-small">Der Incognito-Modus wird nach Ablauf der Zeit deaktiviert und das Passwort zurückgesetzt.</p>
                <button class="sn-incognito-btn-action sn-incognito-btn-action-neutral" id="sn-cancel">Abbrechen</button>
            `;

            const timerDisplay = previousModal.querySelector('.sn-timer-circle');
            const cancelBtn = previousModal.querySelector('#sn-cancel');
            
            let timeLeft = 30;
            
            const interval = setInterval(() => {
                timeLeft--;
                timerDisplay.textContent = timeLeft;
                
                if (timeLeft <= 0) {
                    clearInterval(interval);
                    // Unlock and Reset
                    localStorage.removeItem(this.storageKeyHash);
                    localStorage.removeItem(this.storageKeyRecovery);
                    document.body.removeChild(previousModal.parentElement);
                    this.toggleIncognito(false);
                }
            }, 1000);

            cancelBtn.onclick = () => {
                clearInterval(interval);
                document.body.removeChild(previousModal.parentElement);
            };
        }

        createModal({ title, content, onSubmit, onForgot }) {
            const overlay = document.createElement('div');
            overlay.className = 'sn-incognito-modal-overlay';
            
            const modal = document.createElement('div');
            modal.className = 'sn-incognito-modal';
            modal.innerHTML = `
                <h3 class="sn-incognito-title">${title}</h3>
                ${content}
            `;
            
            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            const submitBtn = modal.querySelector('#sn-submit');
            const input = modal.querySelector('input');
            const forgotBtn = modal.querySelector('#sn-forgot');

            if (input) input.focus();

            const submitHandler = () => onSubmit(modal);

            if (submitBtn) submitBtn.onclick = submitHandler;
            
            if (input) {
                input.onkeydown = (e) => {
                    if (e.key === 'Enter') submitHandler();
                };
            }

            if (forgotBtn && onForgot) {
                forgotBtn.onclick = () => onForgot(modal);
            }

            overlay.onclick = (e) => {
                if (e.target === overlay) document.body.removeChild(overlay);
            };
        }

        hashPassword(string) {
            // Simple hash for local storage (not high security, but prevents plain text reading)
            let hash = 0;
            for (let i = 0; i < string.length; i++) {
                const char = string.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return hash.toString();
        }

        toggleIncognito(state, reload = false) {
            this.isActive = state;
            localStorage.setItem(this.storageKeyActive, state);
            
            if (this.iconButton) {
                if (state) {
                    this.iconButton.classList.add('active');
                    this.iconButton.innerHTML = `
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="#d32f2f">
                            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                        </svg>
                    `;
                } else {
                    this.iconButton.classList.remove('active');
                    this.iconButton.innerHTML = `
                        <svg viewBox="0 0 24 24" width="24" height="24">
                            <path d="M12 6c3.79 0 7.17 2.13 8.82 5.5C19.17 14.87 15.79 17 12 17s-7.17-2.13-8.82-5.5C4.83 8.13 8.21 6 12 6m0-2C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 5c1.38 0 2.5 1.12 2.5 2.5S13.38 14 12 14s-2.5-1.12-2.5-2.5S10.62 9 12 9m0-2c-2.48 0-4.5 2.02-4.5 4.5S9.52 16 12 16s4.5-2.02 4.5-4.5S14.48 7 12 7z"/>
                        </svg>
                    `;
                }
            }

            if (state && reload) {
                location.reload();
            } else {
                this.applyObfuscation();
            }
        }

        checkStoredState() {
            const storedState = localStorage.getItem(this.storageKeyActive);
            if (storedState === 'true') {
                this.toggleIncognito(true, false);
            }
        }

        setupObserver() {
            const observer = new MutationObserver(() => {
                if (this.isActive) {
                    this.applyObfuscation();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        applyObfuscation() {
            if (!this.isActive) {
                this.restoreValues();
                return;
            }

            // 1. Main Table Averages
            const mainRows = document.querySelectorAll('.mdl-data-table > tbody > tr');
            mainRows.forEach(row => {
                if (row.classList.contains('detailrow') || row.id.startsWith('schueleruebersicht_verlauf')) return;
                const tds = row.children;
                if (tds.length > 1) this.obfuscateNode(tds[1]);
            });

            // 2. Detail Tables
            const cleanTables = document.querySelectorAll('table.clean');
            cleanTables.forEach(table => {
                const rows = table.querySelectorAll('tbody > tr');
                rows.forEach(row => {
                    const tds = row.children;
                    if (tds.length >= 5) {
                        this.obfuscateNode(tds[2]); // Grade
                        this.obfuscateNode(tds[4]); // Class Average
                    }
                    if (tds.length === 2 && row.textContent.includes('Durchschnitt')) {
                        this.obfuscateNode(tds[1]);
                    }
                });
            });

            // 3. Color Obfuscation (Orange/Red)
            const coloredElements = document.querySelectorAll('[style*="color"]');
            coloredElements.forEach(el => {
                const color = el.style.color;
                if (color.includes('223, 141, 6') || color.includes('df8d06') || 
                    color.includes('211, 47, 47') || color.includes('d32f2f')) {
                    this.obfuscateColor(el);
                }
            });
        }

        obfuscateNode(container) {
            const process = (node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.nodeValue;
                    // Match grades 1-6 with optional decimals and *
                    if (text.trim().length > 0 && /^[1-6]([\.,]\d+)?\*?$/.test(text.trim())) {
                        if (node.parentNode && node.parentNode.dataset.snObfuscated) return;
                        
                        const span = document.createElement('span');
                        span.dataset.snObfuscated = "true";
                        span.dataset.original = text;
                        span.textContent = "0.000";
                        node.parentNode.replaceChild(span, node);
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.dataset.snObfuscated) return;
                    if (node.classList.contains('mdl-tooltip') || node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;
                    Array.from(node.childNodes).forEach(process);
                }
            };
            process(container);
        }

        obfuscateColor(el) {
            if (el.dataset.snOriginalColor) return;
            el.dataset.snOriginalColor = el.style.color;
            el.style.color = 'black';
            this.obfuscateNode(el);
        }

        restoreValues() {
            document.querySelectorAll('span[data-sn-obfuscated]').forEach(span => {
                span.parentNode.replaceChild(document.createTextNode(span.dataset.original), span);
            });
            document.querySelectorAll('[data-sn-original-color]').forEach(el => {
                el.style.color = el.dataset.snOriginalColor;
                delete el.dataset.snOriginalColor;
            });
        }
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new IncognitoSystem().init());
    } else {
        new IncognitoSystem().init();
    }

})();
