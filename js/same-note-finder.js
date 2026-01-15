class SameNoteFinderGame {
    constructor(fretboardElement) {
        this.fretboard = new Fretboard(fretboardElement, {
            onClick: (data) => this.handleBoardClick(data)
        });

        // State
        this.isPlaying = false;
        this.currentQuestion = 0;
        this.score = 0;
        this.totalTime = 0; // ms
        this.roundStartTime = 0;
        this.timerInterval = null;
        this.roundTimerId = null;

        this.targetNote = null;
        this.requiredPositions = [];
        this.foundPositions = new Set();

        // Settings
        this.settings = {
            questions: 10,
            waitTime: 10 // seconds
        };

        // DOM Elements
        this.elScore = document.getElementById('score-display');
        this.elTimer = document.getElementById('timer-display');
        this.elResult = document.getElementById('result-overlay');

        this.fretboard.render(); // Draw the fretboard
    }

    start() {
        this.isPlaying = true;
        this.currentQuestion = 0;
        this.score = 0;
        this.totalTime = 0;
        this.elResult.classList.add('hidden');
        this.nextQuestion();
    }

    stop() {
        this.isPlaying = false;
        this.clearTimers();
        this.fretboard.clearMarks();
    }

    updateSettings(q, t) {
        this.settings.questions = q;
        this.settings.waitTime = t;
    }

    clearTimers() {
        clearInterval(this.timerInterval);
        clearTimeout(this.roundTimerId);
    }

    nextQuestion() {
        if (this.currentQuestion >= this.settings.questions) {
            this.endGame();
            return;
        }

        this.currentQuestion++;
        this.updateStats();

        // Pick Random Note (String 1-6, Fret 0-12)
        // Avoid picking a note that only appears once? No, even if once, user clicks it?
        // Wait, if I pick a random spot, that spot is already "found" or acts as clue?
        // Spec: "User points to identical note sound positions *including* the highlighted one?"
        // Spec Line 58: "highligthed point and matches same note... all places"
        // Usually, the highlighted point is the "Question". The user finds "Matches".
        // Does the user have to click the highlighted point again?
        // "ハイライトされたポイントと音階が同じすべての箇所" -> "All places same as the highlighted point".
        // Usually implies "other" places. But if I click the question point, does it count?
        // Let's assume the user needs to find ALL instances. The question mark is on one instance.
        // It's intuitive to just click all "E"s.
        // I will pre-fill the Question Instance as "found" or just treat it as a clue.
        // Let's treat the Question Instance as a clue. It is highlighted "Target Hidden".
        // If the user clicks it, nothing happens or it reveals?
        // Let's require the user to click ALL instances found in `getAllPositions`.
        // If the Question Instance is one of them, they must click it (or it counts as already clicked).
        // Let's count the Question Instance as "Given".

        const rString = Math.floor(Math.random() * 6) + 1; // 1-6
        const rFret = Math.floor(Math.random() * (MAX_FRETS + 1)); // 0-MAX_FRETS

        const note = getNoteAt(STRINGS.find(s => s.id === rString).openNote, rFret);
        this.targetNote = note;

        // Calculate all positions for this note
        const allPos = getAllPositions(note);
        this.requiredPositions = allPos;
        this.foundPositions = new Set();

        // Mark the Question Instance as "Target Hidden"
        // And treat it as "Found" automatically? Or user must click?
        // "Find same note" usually implies finding others.
        // Let's strict mode: Find ALL.
        // I will add the Question instance to `foundPositions` initially so user doesn't have to click the clue?
        // Or cleaner: The clue is just a visual prompt. User must click all valid spots.
        // "All places" usually includes the place itself in set theory, but in UI...
        // Let's assume the user has to identify the note first.
        // I'll auto-add the Question Source to foundPositions to be friendly.

        const qKey = `${rString}-${rFret}`;
        this.foundPositions.add(qKey);

        this.fretboard.clearMarks();
        this.fretboard.markNote(rString, rFret, 'target-hidden');

        // Start Timer
        this.roundStartTime = Date.now();
        this.updateTimerDisplay(this.settings.waitTime * 1000);

        this.timerInterval = setInterval(() => {
            const elap = Date.now() - this.roundStartTime;
            const remaining = (this.settings.waitTime * 1000) - elap;
            if (remaining <= 0) {
                this.handleTimeout();
            } else {
                this.updateTimerDisplay(remaining);
            }
        }, 100);
    }

    handleBoardClick(data) {
        if (!this.isPlaying) return;

        const { string, fret, note } = data;
        const key = `${string}-${fret}`;

        // Ignore if already found
        if (this.foundPositions.has(key)) return;

        if (note === this.targetNote) {
            // Correct
            this.fretboard.markNote(string, fret, 'correct');
            this.foundPositions.add(key);

            // Check Win
            if (this.foundPositions.size === this.requiredPositions.length) {
                this.handleRoundWin();
            }
        } else {
            // Wrong
            this.fretboard.markNote(string, fret, 'wrong');
            // Optional: Penalize? 
        }
    }

    handleRoundWin() {
        this.clearTimers();
        const timeTaken = Date.now() - this.roundStartTime;
        this.totalTime += timeTaken;
        this.score++;

        // Reveal the hidden target too (change style to revealed)
        // Find the initial question mark (the one that was target-hidden) and make it revealed
        // Actually, since we found all, they are all green now.
        // But the initial one might still be 'target-hidden'. 
        // Let's just repaint all required as correct.
        this.requiredPositions.forEach(p => {
            this.fretboard.markNote(p.string, p.fret, 'correct');
        });

        setTimeout(() => {
            this.nextQuestion();
        }, 1000); // 1s pause
    }

    handleTimeout() {
        this.clearTimers();
        this.updateTimerDisplay(0);

        // Show correct answers
        this.requiredPositions.forEach(p => {
            // Apply 'active' or 'target-revealed' if not found
            const key = `${p.string}-${p.fret}`;
            if (!this.foundPositions.has(key)) {
                this.fretboard.revealNote(p.string, p.fret); // Reveal note name
                this.fretboard.markNote(p.string, p.fret, 'target-revealed');
            }
        });

        // Wait longer so user can see
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }

    endGame() {
        this.isPlaying = false;

        const avgTime = this.totalTime > 0 ? (this.totalTime / this.settings.questions) : 0;
        const avgTimeDisplay = formatTime(avgTime);

        document.getElementById('res-score').textContent = `${this.score} / ${this.settings.questions}`;
        document.getElementById('res-time').textContent = avgTimeDisplay;

        // Grade
        let grade = 'C';
        const percent = this.score / this.settings.questions;
        if (percent === 1) grade = 'S';
        else if (percent >= 0.8) grade = 'A';
        else if (percent >= 0.6) grade = 'B';

        document.getElementById('res-grade').textContent = grade;

        document.getElementById('result-overlay').classList.remove('hidden');
    }

    updateStats() {
        this.elScore.textContent = `Score: ${this.score} / ${this.settings.questions}`;
    }

    updateTimerDisplay(ms) {
        this.elTimer.textContent = `Time: ${formatTime(ms)}`;
    }
}
