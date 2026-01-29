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
        this.tappedPositions = new Set(); // Track all tapped positions

        // Settings
        this.settings = {
            questions: 10,
            waitTime: 10 // seconds
        };

        // DOM Elements
        this.elProgress = document.getElementById('progress-display');
        this.elScore = document.getElementById('score-display');
        this.elTimer = document.getElementById('timer-display');
        this.elResult = document.getElementById('result-overlay');

        // No message overlay as per new spec
        // this.elMessage = document.getElementById('message-overlay');

        this.fretboard.render(); // Draw the fretboard
    }

    start() {
        this.isPlaying = true;
        this.isWaiting = false; // Block input during result view
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
        this.isWaiting = false;
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
        this.tappedPositions = new Set();

        // Mark the Question Instance as "Target Hidden"
        // And treat it as "Found" automatically? Or user must click?
        // "Find same note" usually implies finding others.
        // Let's strict mode: Find ALL.
        // I will add the Question instance to `foundPositions` initially so user doesn't have to click the clue?
        // Or cleaner: The clue is just a visual prompt. User must click all valid spots.
        // "All places" usually includes the place itself in set theory, but in UI...
        // Let's assume the user has to identify the note first.
        // Mark the Question Instance as "Target Hidden"
        // User must click ALL instances, including this one.
        const qKey = `${rString}-${rFret}`;
        // this.foundPositions.add(qKey); // Removed: force user to tap target too

        this.fretboard.clearMarks();

        // Mark the Question Instance as "Target Hidden"
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
        if (!this.isPlaying || this.isWaiting) return;

        const { string, fret, note } = data;
        const key = `${string}-${fret}`;

        // Toggle selection: if already tapped, untap (spec: 同じ箇所をタップした場合、選択状態を解除できる)
        if (this.tappedPositions.has(key)) {
            this.fretboard.unmarkNote(string, fret);
            this.tappedPositions.delete(key);
            if (note === this.targetNote) {
                this.foundPositions.delete(key);
            }
            return;
        }

        // Mark as tapped (no success/failure display per spec: 成否も表示しない)
        this.fretboard.markNote(string, fret, 'tapped-hidden');
        this.tappedPositions.add(key);

        if (note === this.targetNote) {
            this.foundPositions.add(key);

            // Check if ALL correct positions are found
            if (this.foundPositions.size === this.requiredPositions.length) {
                this.handleRoundWin();
            }
        }
        // Wrong taps are just highlighted without showing success/failure
    }

    handleRoundWin() {
        this.clearTimers();
        this.isWaiting = true;

        const timeTaken = Date.now() - this.roundStartTime;
        this.totalTime += timeTaken;
        this.score++;

        // Reveal All Correct Notes
        this.requiredPositions.forEach(p => {
            // Simplest: `revealNote` helper removes hidden class.
            this.fretboard.revealNote(p.string, p.fret);
            // And ensures it is green/correct
            this.fretboard.markNote(p.string, p.fret, 'correct');
        });

        // Wait 5s then Next (No message)
        setTimeout(() => {
            this.nextQuestion();
        }, 5000);
    }

    handleTimeout() {
        this.clearTimers();
        this.isWaiting = true;
        this.updateTimerDisplay(0);

        // Show correct answers (Incorrect/Timeout)
        this.requiredPositions.forEach(p => {
            // Reveal note name
            this.fretboard.revealNote(p.string, p.fret);
            // Mark correct (make them green)
            this.fretboard.markNote(p.string, p.fret, 'correct');
        });

        // Wait 5s then Next (No message)
        setTimeout(() => {
            this.nextQuestion();
        }, 5000);
    }

    endGame() {
        this.isPlaying = false;
        this.isWaiting = false;

        const avgTime = this.totalTime > 0 ? (this.totalTime / this.score) : 0; // Avg of correct answers usually? Or total rounds?
        // Spec says "Average Answer Time". Usually TotalTime / CorrectCount or TotalTime / TotalQuestions?
        // Let's use TotalTime / CorrectCount if score > 0, else 0.
        // Or TotalTime / Questions. 
        // "回答時間" implies successful answer time.
        // Let's use TotalTime / Score for now. Capture only successful times? 
        // Actually I added time only on Win. So TotalTime is sum of winning times.
        const effectiveAvg = this.score > 0 ? (this.totalTime / this.score) : 0;

        const avgTimeDisplay = formatTime(effectiveAvg);

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
        this.elProgress.textContent = `Question: ${this.currentQuestion} / ${this.settings.questions}`;
        this.elScore.textContent = `Score: ${this.score}`;
    }

    updateTimerDisplay(ms) {
        this.elTimer.textContent = `Time: ${formatTime(ms)}`;
    }
}
