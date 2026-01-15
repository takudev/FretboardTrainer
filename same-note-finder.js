class SameNoteFinderGame {
    constructor() {
        // Standard tuning: E A D G B E (low to high, strings 6 to 1)
        this.tuning = ['E', 'A', 'D', 'G', 'B', 'E'];
        this.notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.totalFrets = 11;
        this.totalQuestions = 10;
        this.timeLimit = 10000; // default 10 seconds

        this.currentQuestion = 0;
        this.score = 0;
        this.targetNote = null;
        this.targetPosition = null;
        this.correctPositions = [];
        this.selectedPositions = [];
        this.responseTimes = [];
        this.lastResponseTime = 0;
        this.timer = null;
        this.gameState = 'idle'; // idle, playing, timeout, correct, wrong
    }

    // Get note at a specific position
    getNoteAt(stringIndex, fret) {
        const openNote = this.tuning[stringIndex];
        const openNoteIndex = this.notes.indexOf(openNote);
        const noteIndex = (openNoteIndex + fret) % 12;
        return this.notes[noteIndex];
    }

    // Find all positions with the same note
    findSameNotes(note) {
        const positions = [];
        for (let string = 0; string < 6; string++) {
            for (let fret = 0; fret <= this.totalFrets; fret++) {
                if (this.getNoteAt(string, fret) === note) {
                    positions.push({ string, fret });
                }
            }
        }
        return positions;
    }

    // Generate a random question
    generateQuestion() {
        const stringIndex = Math.floor(Math.random() * 6);
        const fret = Math.floor(Math.random() * (this.totalFrets + 1));
        const note = this.getNoteAt(stringIndex, fret);

        this.targetPosition = { string: stringIndex, fret };
        this.targetNote = note;
        this.correctPositions = this.findSameNotes(note);
        this.selectedPositions = [];
        this.gameState = 'playing';
    }

    // Check if position is the target
    isTarget(string, fret) {
        return this.targetPosition &&
            this.targetPosition.string === string &&
            this.targetPosition.fret === fret;
    }

    // Check if position is correct (same note)
    isCorrect(string, fret) {
        return this.correctPositions.some(p => p.string === string && p.fret === fret);
    }

    // Check if position is selected
    isSelected(string, fret) {
        return this.selectedPositions.some(p => p.string === string && p.fret === fret);
    }

    // Toggle position selection
    togglePosition(string, fret) {
        if (this.gameState !== 'playing') return false;
        if (this.isTarget(string, fret)) return false; // Can't select target

        const index = this.selectedPositions.findIndex(
            p => p.string === string && p.fret === fret
        );

        if (index >= 0) {
            this.selectedPositions.splice(index, 1);
        } else {
            this.selectedPositions.push({ string, fret });
        }
        return true;
    }

    // Submit answer
    submitAnswer() {
        if (this.gameState !== 'playing') return null;

        // Get correct positions excluding the target
        const requiredPositions = this.correctPositions.filter(
            p => !(p.string === this.targetPosition.string && p.fret === this.targetPosition.fret)
        );

        // Check if all correct positions are selected and no wrong ones
        const allCorrectSelected = requiredPositions.every(
            p => this.isSelected(p.string, p.fret)
        );
        const noWrongSelected = this.selectedPositions.every(
            p => this.isCorrect(p.string, p.fret)
        );

        const isCorrect = allCorrectSelected && noWrongSelected;


        if (isCorrect) {
            this.score++;
            this.gameState = 'correct';
            // Record response time if we have a start time provided externally
            if (this.currentStartTime) {
                this.lastResponseTime = (Date.now() - this.currentStartTime) / 1000;
                this.responseTimes.push(this.lastResponseTime);
            }
        } else {
            this.gameState = 'wrong';
        }

        return isCorrect;
    }

    // Check if the current selection is complete and correct
    isSelectionComplete() {
        const requiredPositions = this.correctPositions.filter(
            p => !(p.string === this.targetPosition.string && p.fret === this.targetPosition.fret)
        );

        // Selection is complete if all required are selected and NO wrong ones
        const allCorrectSelected = requiredPositions.every(
            p => this.isSelected(p.string, p.fret)
        );
        const noWrongSelected = this.selectedPositions.every(
            p => this.isCorrect(p.string, p.fret)
        );

        return allCorrectSelected && noWrongSelected && this.selectedPositions.length === requiredPositions.length;
    }

    // Handle timeout
    handleTimeout() {
        this.gameState = 'timeout';
    }

    // Move to next question
    nextQuestion() {
        this.currentQuestion++;
        if (this.currentQuestion >= this.totalQuestions) {
            return false; // Game over
        }
        this.generateQuestion();
        return true;
    }

    // Reset game
    reset(timeLimit = 10000, totalQuestions = 10) {
        this.currentQuestion = 0;
        this.score = 0;
        this.targetNote = null;
        this.targetPosition = null;
        this.correctPositions = [];
        this.selectedPositions = [];
        this.responseTimes = [];
        this.lastResponseTime = 0;
        this.timeLimit = timeLimit;
        this.totalQuestions = totalQuestions;
        this.currentStartTime = null;
        this.gameState = 'idle';
    }

    // Start game
    start(timeLimit, totalQuestions) {
        this.reset(timeLimit, totalQuestions);
        this.generateQuestion();
    }

    // Get game state for rendering
    getState() {
        const avgResponseTime = this.responseTimes.length > 0
            ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
            : 0;

        return {
            currentQuestion: this.currentQuestion + 1,
            totalQuestions: this.totalQuestions,
            score: this.score,
            targetNote: this.targetNote,
            targetPosition: this.targetPosition,
            correctPositions: this.correctPositions,
            selectedPositions: this.selectedPositions,
            gameState: this.gameState,
            timeLimit: this.timeLimit,
            lastResponseTime: this.lastResponseTime,
            avgResponseTime: avgResponseTime
        };
    }
}

// ===================================
// Same Note Finder UI Controller
// ===================================

class SameNoteFinderUI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.game = new SameNoteFinderGame();
        this.timerInterval = null;
        this.startTime = null;
    }

    // Render the game screen
    render() {
        const state = this.game.getState();

        if (state.gameState === 'idle') {
            this.renderStartScreen();
        } else if (this.game.currentQuestion >= this.game.totalQuestions && state.gameState !== 'playing') {
            this.renderResultScreen();
        } else {
            this.renderGameScreen();
        }
    }

    // Render start screen
    renderStartScreen() {
        this.container.innerHTML = `
            <div class="screen">
                <div class="screen-header">
                    <h1 class="screen-title">Same Note Finder</h1>
                    <p class="screen-subtitle">Find all positions with the same note</p>
                </div>
                <div class="game-intro">
                    <div class="intro-card">
                        <div class="intro-icon">🎯</div>
                        <h2 class="intro-title">Settings</h2>
                        <div class="game-config">
                            <div class="config-item">
                                <label for="question-count">Questions:</label>
                                <select id="question-count">
                                    <option value="5">5</option>
                                    <option value="10" selected>10</option>
                                    <option value="15">15</option>
                                    <option value="20">20</option>
                                </select>
                            </div>
                            <div class="config-item">
                                <label for="time-limit">Time Limit:</label>
                                <select id="time-limit">
                                    <option value="5">5s</option>
                                    <option value="10" selected>10s</option>
                                    <option value="15">15s</option>
                                    <option value="20">20s</option>
                                    <option value="30">30s</option>
                                </select>
                            </div>
                            <div class="config-item">
                                <label for="fret-range">Fret Range:</label>
                                <select id="fret-range">
                                    <option value="11" selected>11 Frets</option>
                                    <option value="12">12 Frets</option>
                                </select>
                            </div>
                        </div>
                        <button class="game-button primary" id="start-game" style="margin-top: 1rem;">Start Game</button>
                    </div>
                </div>
                <a href="#/" class="back-button">← Back to Home</a>
            </div>
        `;

        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });
    }

    // Render game screen
    renderGameScreen() {
        const state = this.game.getState();
        const isRevealed = state.gameState === 'timeout' ||
            state.gameState === 'correct' ||
            state.gameState === 'wrong';

        this.container.innerHTML = `
            <div class="screen game-screen">
                <div class="game-header">
                    <div class="game-info">
                        <span class="question-counter">Q${state.currentQuestion}/${state.totalQuestions}</span>
                        <span class="score-display">Score: ${state.score}</span>
                    </div>
                    <div class="timer-container">
                        <div class="timer-bar" id="timer-bar"></div>
                    </div>
                    <div class="target-note">
                        Find same notes as highlighted position
                    </div>
                </div>
                
                <div class="fretboard-container">
                    ${this.renderFretboard(state, isRevealed)}
                </div>

                <div class="game-actions">
                    ${this.renderGameActions(state)}
                </div>
            </div>
        `;

        this.attachFretboardListeners();
        this.attachActionListeners(state);

        if (state.gameState === 'playing') {
            this.game.currentStartTime = Date.now();
            this.startTimer();
        }
    }

    // Render fretboard
    renderFretboard(state, isRevealed) {
        let html = '<div class="fretboard">';

        // Fret numbers
        html += '<div class="fret-numbers">';
        html += '<div class="fret-number-spacer"></div>'; // Spacer for string labels
        for (let fret = 0; fret <= this.game.totalFrets; fret++) {
            html += `<div class="fret-number">${fret}</div>`;
        }
        html += '</div>';

        const stringNames = ['e', 'B', 'G', 'D', 'A', 'E'];

        // Strings (from high E to low E, visually top to bottom)
        for (let string = 5; string >= 0; string--) {
            html += `<div class="guitar-string" data-string="${string}">`;
            html += `<div class="string-label-inline">${stringNames[5 - string]}</div>`;

            for (let fret = 0; fret <= this.game.totalFrets; fret++) {
                const note = this.game.getNoteAt(string, fret);
                const isTarget = this.game.isTarget(string, fret);
                const isCorrect = this.game.isCorrect(string, fret);
                const isSelected = this.game.isSelected(string, fret);

                let classes = ['fret-position'];

                if (isTarget) {
                    classes.push('target');
                } else if (isRevealed) {
                    if (isCorrect && isSelected) {
                        classes.push('correct');
                    } else if (isCorrect && !isSelected) {
                        classes.push('missed');
                    } else if (!isCorrect && isSelected) {
                        classes.push('wrong');
                    }
                } else if (isSelected) {
                    classes.push('selected');
                }

                const showNote = isRevealed && (isTarget || isCorrect);

                html += `
                    <div class="${classes.join(' ')}" 
                         data-string="${string}" 
                         data-fret="${fret}"
                         ${!isTarget && !isRevealed ? 'data-clickable="true"' : ''}>
                        ${showNote ? `<span class="note-label">${note}</span>` : ''}
                    </div>
                `;
            }

            html += '</div>';
        }



        html += '</div>';
        return html;
    }

    // Render game action buttons
    renderGameActions(state) {
        if (state.gameState === 'playing') {
            return `
                <button class="game-button primary" id="submit-answer">Submit Answer</button>
            `;
        } else {
            let message;
            if (state.gameState === 'correct') {
                const responseTime = state.lastResponseTime.toFixed(2);
                message = `<span class="result-correct">✓ Correct! (${responseTime}s)</span>`;
            } else if (state.gameState === 'timeout') {
                message = '<span class="result-timeout">⏱ Time\'s up!</span>';
            } else {
                message = '<span class="result-wrong">✗ Wrong!</span>';
            }

            const isLastQuestion = state.currentQuestion >= state.totalQuestions;
            const buttonText = isLastQuestion ? 'See Results' : 'Next Question';

            return `
                <div class="result-message">${message}</div>
                <button class="game-button primary" id="next-question">${buttonText}</button>
            `;
        }
    }


    // Render result screen
    renderResultScreen() {
        const state = this.game.getState();
        const percentage = Math.round((state.score / state.totalQuestions) * 100);

        let grade, gradeClass;
        if (percentage >= 90) { grade = 'A+'; gradeClass = 'grade-a'; }
        else if (percentage >= 80) { grade = 'A'; gradeClass = 'grade-a'; }
        else if (percentage >= 70) { grade = 'B'; gradeClass = 'grade-b'; }
        else if (percentage >= 60) { grade = 'C'; gradeClass = 'grade-c'; }
        else { grade = 'D'; gradeClass = 'grade-d'; }

        this.container.innerHTML = `
            <div class="screen">
                <div class="result-container">
                    <div class="result-icon">🎸</div>
                    <h1 class="result-title">Game Complete!</h1>
                    <div class="result-grade ${gradeClass}">${grade}</div>
                    <div class="result-score">
                        <span class="score-number">${state.score}</span>
                        <span class="score-total">/ ${state.totalQuestions}</span>
                    </div>
                    <div class="result-stats" style="margin-bottom: 2rem;">
                        <p class="result-percentage">${percentage}% Correct</p>
                        <p class="result-avg-time">Avg. Time: <b>${state.avgResponseTime.toFixed(2)}s</b></p>
                    </div>
                    <div class="result-actions">
                        <button class="game-button primary" id="play-again">Play Again</button>
                        <a href="#/" class="game-button secondary">Back to Home</a>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('play-again').addEventListener('click', () => {
            this.startGame();
        });
    }

    // Attach fretboard click listeners
    attachFretboardListeners() {
        const positions = this.container.querySelectorAll('[data-clickable="true"]');
        positions.forEach(pos => {
            pos.addEventListener('click', () => {
                const string = parseInt(pos.dataset.string);
                const fret = parseInt(pos.dataset.fret);
                if (this.game.togglePosition(string, fret)) {
                    pos.classList.toggle('selected');

                    // Auto-submit if all correct ones are selected
                    if (this.game.isSelectionComplete()) {
                        this.stopTimer();
                        this.game.submitAnswer();
                        this.render();
                    }
                }
            });
        });
    }

    // Attach action button listeners
    attachActionListeners(state) {
        const submitBtn = document.getElementById('submit-answer');
        const nextBtn = document.getElementById('next-question');

        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.stopTimer();
                this.game.submitAnswer();
                this.render();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (!this.game.nextQuestion()) {
                    // Game over, show results
                }
                this.render();
            });
        }
    }

    // Timer functions
    startTimer() {
        this.startTime = Date.now();
        const timerBar = document.getElementById('timer-bar');

        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const remaining = Math.max(0, this.game.timeLimit - elapsed);
            const percentage = (remaining / this.game.timeLimit) * 100;

            if (timerBar) {
                timerBar.style.width = `${percentage}%`;

                if (percentage < 30) {
                    timerBar.classList.add('timer-danger');
                } else if (percentage < 60) {
                    timerBar.classList.add('timer-warning');
                }
            }

            if (remaining <= 0) {
                this.stopTimer();
                this.game.handleTimeout();
                this.render();
            }
        }, 50);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // Start the game
    startGame() {
        const questionCount = parseInt(document.getElementById('question-count').value);
        const timeLimit = parseInt(document.getElementById('time-limit').value) * 1000;
        const fretRange = parseInt(document.getElementById('fret-range').value);
        this.game.totalFrets = fretRange;
        this.game.start(timeLimit, questionCount);
        this.render();
    }

    // Initialize
    init() {
        this.render();
    }
}

// Export for use in main app
window.SameNoteFinderUI = SameNoteFinderUI;
