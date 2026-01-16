class Fretboard {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            onClick: null,
            ...options
        };
        this.cells = new Map(); // key: "${string}-${fret}" -> element
    }

    render() {
        this.container.innerHTML = '';
        this.cells.clear();

        // Grid definition: 
        // Rows: [Top Numbers] [String 1] [String 2] [String 3] [String 4] [String 5] [String 6] [Bottom Numbers] - Total 8 rows
        // Columns: [String Labels] [Fret 0] [Fret 1] ... [Fret 11] - Total 13 columns

        // 1. Fret Numbers (Top & Bottom)
        for (let fret = 0; fret <= MAX_FRETS; fret++) {
            // Top
            this._addFretNumber(fret, 1);
            // Bottom
            this._addFretNumber(fret, 8);
        }

        // 2. Strings (1 to 6)
        // Spec: "6th string at bottom" (line 68)
        // STRINGS array: [1 (High E), 2, 3, 4, 5, 6 (Low E)]
        // We render STRINGS[0] at Row 2, STRINGS[1] at Row 3... STRINGS[5] at Row 7
        STRINGS.forEach((stringData, index) => {
            const stringNum = stringData.id;
            const row = index + 2; // Row 1 is Top Numbers

            // String Name Label
            const label = document.createElement('div');
            label.className = 'string-label';
            label.textContent = stringData.openNote;
            label.style.gridRow = row;
            label.style.gridColumn = 1;
            this.container.appendChild(label);

            // Frets
            for (let fret = 0; fret <= MAX_FRETS; fret++) {
                const cell = document.createElement('div');
                cell.className = `string-cell string-${stringNum} fret-${fret}`;
                cell.dataset.string = stringNum;
                cell.dataset.fret = fret;
                cell.dataset.note = getNoteAt(stringData.openNote, fret);

                cell.style.gridRow = row;
                cell.style.gridColumn = fret + 2;

                // String Line
                const line = document.createElement('div');
                line.className = 'string-line';
                cell.appendChild(line);

                // Note Marker
                const marker = document.createElement('div');
                marker.className = 'note-marker';
                marker.textContent = cell.dataset.note;
                cell.appendChild(marker);

                // Click Handler
                cell.addEventListener('click', () => {
                    if (this.options.onClick) {
                        this.options.onClick({
                            string: stringNum,
                            fret: fret,
                            note: cell.dataset.note,
                            element: cell
                        });
                    }
                });

                this.cells.set(`${stringNum}-${fret}`, cell);
                this.container.appendChild(cell);
            }
        });

        // 3. Inlay Dots
        // Single dots at 3, 5, 7, 9
        // Double dots at 12 (but we only show up to 11 in this mode, if 12 is included might need it)
        // Wait, spec says 0 to 11. If 12 is needed I'll adjust.
        // Usually dots are between frets or on the fretboard wood.
        // We'll place them as background elements for the grid.
        [3, 5, 7, 9].forEach(fret => {
            if (fret <= MAX_FRETS) {
                this._addInlay(fret);
            }
        });
    }

    _addFretNumber(fret, row) {
        const num = document.createElement('div');
        num.className = 'fret-number';
        num.textContent = fret === 0 ? 'Nut' : fret;
        num.style.gridRow = row;
        num.style.gridColumn = fret + 2;
        this.container.appendChild(num);
    }

    _addInlay(fret) {
        // Place a dot in the middle of the fretboard (between strings 3 and 4)
        const dot = document.createElement('div');
        dot.className = 'inlay-dot';
        dot.style.gridRow = 'span 6 / 8'; // Span strings 1-6 area
        dot.style.gridColumn = fret + 2;
        // In CSS we will center it
        this.container.appendChild(dot);
    }

    clearMarks() {
        this.cells.forEach(cell => {
            cell.classList.remove('active', 'correct', 'wrong', 'target-hidden', 'target-revealed');
            // Remove text content hide overrides
            // const marker = cell.querySelector('.note-marker');
            // marker.style.color = '';
        });
    }

    markNote(string, fret, type = 'active') {
        const cell = this.cells.get(`${string}-${fret}`);
        if (cell) {
            cell.classList.add(type);
        }
    }

    revealNote(string, fret) {
        const cell = this.cells.get(`${string}-${fret}`);
        if (cell) {
            cell.classList.remove('target-hidden', 'tapped-hidden');
            cell.classList.add('target-revealed');
        }
    }
}
