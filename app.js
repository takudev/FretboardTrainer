// ===================================
// Router & App Initialization
// ===================================

class Router {
    constructor() {
        this.routes = {};
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }

    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    handleRoute() {
        const hash = window.location.hash || '#/';
        const path = hash.slice(1) || '/';
        const handler = this.routes[path];

        if (handler) {
            handler();
        } else {
            this.routes['/']();
        }

        this.updateActiveNav();
        // Close sidebar after navigation
        closeSidebar();
    }

    updateActiveNav() {
        const hash = window.location.hash || '#/';
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === hash);
        });
    }
}

// ===================================
// Sidebar Toggle
// ===================================

function initSidebar() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (!hamburgerBtn || !sidebar || !overlay) return;

    hamburgerBtn.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', closeSidebar);

    // Close sidebar on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSidebar();
    });
}

function toggleSidebar() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    hamburgerBtn.classList.toggle('active');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeSidebar() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (hamburgerBtn) hamburgerBtn.classList.remove('active');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

// Initialize sidebar on load
document.addEventListener('DOMContentLoaded', initSidebar);

// ===================================
// Screen Renderers
// ===================================

const screens = {
    home() {
        return `
            <div class="screen">
                <div class="screen-header">
                    <h1 class="screen-title">Guitar Fretboard Trainer</h1>
                    <p class="screen-subtitle">Master your fretboard with interactive exercises</p>
                </div>
                <div class="card-grid">
                    <a href="#/same-note-finder" class="card">
                        <div class="card-icon">🎯</div>
                        <div class="card-content">
                            <div class="card-title">Same Note Finder</div>
                            <div class="card-description">Find the same notes across the fretboard</div>
                        </div>
                        <span class="card-arrow">→</span>
                    </a>
                    <a href="#/guess-the-note" class="card">
                        <div class="card-icon">🎵</div>
                        <div class="card-content">
                            <div class="card-title">Guess The Note</div>
                            <div class="card-description">Identify notes on random positions</div>
                        </div>
                        <span class="card-arrow">→</span>
                    </a>
                    <a href="#/reference" class="card">
                        <div class="card-icon">📚</div>
                        <div class="card-content">
                            <div class="card-title">Reference</div>
                            <div class="card-description">Explore chord formulas and fretboard maps</div>
                        </div>
                        <span class="card-arrow">→</span>
                    </a>
                </div>
            </div>
        `;
    },

    sameNoteFinder() {
        return `<div id="same-note-finder-game"></div>`;
    },

    guessTheNote() {
        return screens.placeholder('Guess The Note', '🎵', '/');
    },

    reference() {
        return `
            <div class="screen">
                <div class="screen-header">
                    <h1 class="screen-title">Reference</h1>
                    <p class="screen-subtitle">Essential guitar theory resources</p>
                </div>
                <div class="card-grid">
                    <a href="#/chord-formulas" class="card">
                        <div class="card-icon">🎹</div>
                        <div class="card-content">
                            <div class="card-title">Chord Formulas</div>
                            <div class="card-description">Learn chord construction formulas</div>
                        </div>
                        <span class="card-arrow">→</span>
                    </a>
                    <a href="#/fretboard-note-map" class="card">
                        <div class="card-icon">🗺️</div>
                        <div class="card-content">
                            <div class="card-title">Fretboard Note Map</div>
                            <div class="card-description">Complete note positions on the fretboard</div>
                        </div>
                        <span class="card-arrow">→</span>
                    </a>
                    <a href="#/diatonic-chord" class="card">
                        <div class="card-icon">🎸</div>
                        <div class="card-content">
                            <div class="card-title">Diatonic Chord (5th String)</div>
                            <div class="card-description">C major diatonic chords with 5th string root</div>
                        </div>
                        <span class="card-arrow">→</span>
                    </a>
                </div>
            </div>
        `;
    },

    chordFormulas() {
        return screens.placeholder('Chord Formulas', '🎹', '/reference');
    },

    fretboardNoteMap() {
        return screens.placeholder('Fretboard Note Map', '🗺️', '/reference');
    },

    diatonicChord() {
        return screens.placeholder('Diatonic Chord (5th String)', '🎸', '/reference');
    },

    placeholder(title, icon, backPath) {
        return `
            <div class="screen">
                <div class="placeholder-container">
                    <div class="placeholder-icon">${icon}</div>
                    <h1 class="placeholder-title">${title}</h1>
                    <p class="placeholder-text">Coming soon...</p>
                    <a href="#${backPath}" class="back-button">← Go Back</a>
                </div>
            </div>
        `;
    }
};

// ===================================
// App Initialization
// ===================================

const app = document.getElementById('app');
const router = new Router();

function render(html) {
    app.innerHTML = html;
    window.scrollTo(0, 0);
}

// Register routes
router.addRoute('/', () => render(screens.home()));
router.addRoute('/same-note-finder', () => {
    render(screens.sameNoteFinder());
    const gameUI = new SameNoteFinderUI('same-note-finder-game');
    gameUI.init();
});
router.addRoute('/guess-the-note', () => render(screens.guessTheNote()));
router.addRoute('/reference', () => render(screens.reference()));
router.addRoute('/chord-formulas', () => render(screens.chordFormulas()));
router.addRoute('/fretboard-note-map', () => render(screens.fretboardNoteMap()));
router.addRoute('/diatonic-chord', () => render(screens.diatonicChord()));
