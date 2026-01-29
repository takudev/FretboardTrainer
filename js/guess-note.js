class GuessNoteGame {
    constructor(fretboardElement, noteListElement) {
        this.fretboard = new Fretboard(fretboardElement, {
            onClick: null // No click handler for fretboard in this game
        });
        this.noteListElement = noteListElement;

        // State
        this.isPlaying = false;
        this.isWaiting = false;
        this.currentQuestion = 0;
        this.score = 0;
        this.totalTime = 0; // ms
        this.roundStartTime = 0;

        this.targetNote = null;
        this.targetString = null;
        this.targetFret = null;

        // Settings
        this.settings = {
            questions: 10
        };

        // DOM Elements
        this.elProgress = document.getElementById('gtn-progress-display');
        this.elScore = document.getElementById('gtn-score-display');
        this.elTimer = document.getElementById('gtn-timer-display');
        this.elResult = document.getElementById('gtn-result-overlay');

        this.fretboard.render();
        this.renderNoteList();
    }

    renderNoteList() {
        this.noteListElement.innerHTML = '';
        NOTES.forEach(note => {
            const btn = document.createElement('button');
            btn.className = 'note-btn';
            btn.textContent = note;
            btn.dataset.note = note;
            btn.addEventListener('click', () => this.handleNoteSelection(note));
            this.noteListElement.appendChild(btn);
        });
    }

    start() {
        this.isPlaying = true;
        this.isWaiting = false;
        this.currentQuestion = 0;
        this.score = 0;
        this.totalTime = 0;
        this.elResult.classList.add('hidden');
        this.enableNoteButtons(true);
        this.nextQuestion();
    }

    stop() {
        this.isPlaying = false;
        this.fretboard.clearMarks();
        this.enableNoteButtons(false);
    }

    updateSettings(q) {
        this.settings.questions = q;
    }

    enableNoteButtons(enabled) {
        const buttons = this.noteListElement.querySelectorAll('.note-btn');
        buttons.forEach(btn => {
            btn.disabled = !enabled;
            btn.classList.remove('selected');
        });
    }

    nextQuestion() {
        if (this.currentQuestion >= this.settings.questions) {
            this.endGame();
            return;
        }

        this.currentQuestion++;
        this.isWaiting = false;
        this.updateStats();
        this.enableNoteButtons(true);

        // Pick Random Note Position
        const rString = Math.floor(Math.random() * 6) + 1; // 1-6
        const rFret = Math.floor(Math.random() * (MAX_FRETS + 1)); // 0-MAX_FRETS

        const stringData = STRINGS.find(s => s.id === rString);
        const note = getNoteAt(stringData.openNote, rFret);

        this.targetNote = note;
        this.targetString = rString;
        this.targetFret = rFret;

        this.fretboard.clearMarks();

        // Mark the target as hidden (no note display)
        this.fretboard.markNote(rString, rFret, 'target-hidden');

        // Start Timer (for tracking answer time, no limit)
        this.roundStartTime = Date.now();
        this.updateTimerDisplay(0);

        // Update timer display continuously
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.roundStartTime;
            this.updateTimerDisplay(elapsed);
        }, 100);
    }

    handleNoteSelection(selectedNote) {
        if (!this.isPlaying || this.isWaiting) return;

        this.isWaiting = true;
        clearInterval(this.timerInterval);
        this.enableNoteButtons(false);

        // Mark selected button
        const buttons = this.noteListElement.querySelectorAll('.note-btn');
        buttons.forEach(btn => {
            if (btn.dataset.note === selectedNote) {
                btn.classList.add('selected');
            }
        });

        const timeTaken = Date.now() - this.roundStartTime;

        if (selectedNote === this.targetNote) {
            this.handleCorrect(timeTaken);
        } else {
            this.handleWrong();
        }
    }

    handleCorrect(timeTaken) {
        this.score++;
        this.totalTime += timeTaken;

        // Reveal all same notes
        this.revealSameNotes();

        // Wait 5s then next
        setTimeout(() => {
            this.nextQuestion();
        }, 5000);
    }

    handleWrong() {
        // Reveal all same notes (show correct answer)
        this.revealSameNotes();

        // Wait 5s then next
        setTimeout(() => {
            this.nextQuestion();
        }, 5000);
    }

    revealSameNotes() {
        const allPositions = getAllPositions(this.targetNote);
        allPositions.forEach(p => {
            this.fretboard.revealNote(p.string, p.fret);
            this.fretboard.markNote(p.string, p.fret, 'correct');
        });
    }

    endGame() {
        this.isPlaying = false;
        this.isWaiting = false;
        clearInterval(this.timerInterval);
        this.enableNoteButtons(false);

        // Average time (only for correct answers)
        const avgTime = this.score > 0 ? (this.totalTime / this.score) : 0;
        const avgTimeDisplay = formatTime(avgTime);

        document.getElementById('gtn-res-score').textContent = `${this.score} / ${this.settings.questions}`;
        document.getElementById('gtn-res-time').textContent = avgTimeDisplay;

        // Grade
        let grade = 'C';
        const percent = this.score / this.settings.questions;
        if (percent === 1) grade = 'S';
        else if (percent >= 0.8) grade = 'A';
        else if (percent >= 0.6) grade = 'B';

        document.getElementById('gtn-res-grade').textContent = grade;

        this.elResult.classList.remove('hidden');
    }

    updateStats() {
        this.elProgress.textContent = `Question: ${this.currentQuestion} / ${this.settings.questions}`;
        this.elScore.textContent = `Score: ${this.score}`;
    }

    updateTimerDisplay(ms) {
        this.elTimer.textContent = `Time: ${formatTime(ms)}`;
    }
}
