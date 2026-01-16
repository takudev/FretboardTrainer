class App {
    constructor() {
        this.appContainer = document.getElementById('page-content');
        this.navLinks = document.querySelectorAll('.nav-links a');
        this.sidebar = document.getElementById('sidebar');
        this.openNavBtn = document.getElementById('open-nav');
        this.closeNavBtn = document.getElementById('close-nav');
        this.sidebarOverlay = document.getElementById('sidebar-overlay');

        this.currentGame = null; // Store active game instance

        this.init();
    }

    init() {
        // Nav Events
        this.openNavBtn.addEventListener('click', () => {
            this.sidebar.classList.add('open');
        });

        this.closeNavBtn.addEventListener('click', () => {
            this.sidebar.classList.remove('open');
        });

        this.sidebarOverlay.addEventListener('click', () => {
            this.sidebar.classList.remove('open');
        });

        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigate(page);

                // Close sidebar after click
                this.sidebar.classList.remove('open');
            });
        });

        // Initial Load
        this.navigate('home');
    }

    navigate(pageId) {
        // Cleanup active game if any
        if (this.currentGame && typeof this.currentGame.stop === 'function') {
            this.currentGame.stop();
            this.currentGame = null;
        }

        // Update active link
        this.navLinks.forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-links a[data-page="${pageId}"]`);
        if (activeLink) activeLink.classList.add('active');

        // Render Page
        const tmpl = document.getElementById(`tmpl-${pageId}`);
        if (!tmpl) {
            // Handle sub-pages or unknown
            if (pageId.startsWith('ref-')) {
                // Determine which reference and show placeholder
                this.appContainer.innerHTML = `<div class="home-container"><h3>${pageId}</h3><p>Under Construction</p></div>`;
                return;
            }
            // Fallback
            this.appContainer.innerHTML = `<div class="home-container"><h3>Page Not Found</h3></div>`;
            return;
        }

        const content = tmpl.content.cloneNode(true);
        this.appContainer.innerHTML = '';
        this.appContainer.appendChild(content);

        // Post-Render Logic
        this.handlePageLogic(pageId);
    }

    handlePageLogic(pageId) {
        if (pageId === 'home') {
            // Bind dashboard links
            const cards = this.appContainer.querySelectorAll('.card');
            cards.forEach(c => {
                c.addEventListener('click', () => {
                    this.navigate(c.dataset.link);
                });
            });
        }
        else if (pageId === 'game-same-note') {
            this.initSameNoteGame();
        }
        else if (pageId === 'reference') {
            // Bind ref links
            const items = this.appContainer.querySelectorAll('.list-item');
            items.forEach(i => {
                i.addEventListener('click', () => {
                    // Just show "Under Construction" for now as per spec
                    // Or navigate to a detail view if I had templates.
                    // Spec says distinct pages, but "Under Construction".
                    // I'll just use a generic placeholder for them.
                    alert(`Navigate to: ${i.dataset.link} (Under Construction)`);
                });
            });
        }
    }

    initSameNoteGame() {
        const board = document.getElementById('fretboard');
        const game = new SameNoteFinderGame(board);
        this.currentGame = game;

        // Bind Buttons
        document.getElementById('btn-start-game').addEventListener('click', () => {
            // Hide Start Button (optional? Or just change text)
            // Ideally start immediately.
            game.start();
        });

        // Settings Modal
        const modal = document.getElementById('settings-modal');
        document.getElementById('btn-settings').addEventListener('click', () => {
            modal.classList.remove('hidden');
        });

        document.getElementById('btn-save-settings').addEventListener('click', () => {
            const q = parseInt(document.getElementById('setting-questions').value, 10);
            const t = parseInt(document.getElementById('setting-timer').value, 10);
            game.updateSettings(q, t);
            modal.classList.add('hidden');
        });

        // Result Overlay
        document.getElementById('btn-retry').addEventListener('click', () => {
            game.start();
        });

        document.getElementById('btn-home').addEventListener('click', () => {
            this.navigate('home');
        });
    }
}

// Start
new App();
