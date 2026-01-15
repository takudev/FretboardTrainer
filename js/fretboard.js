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

        // Fret Numbers (Top)
        // Can be added via CSS or logical rows.
        // Current Grid: columns = 40px (Note names) + 12 (Frets)

        // Render Strings (6 to 1)
        // We iterate STRINGS which are ordered 1 to 6 in the array?
        // STRINGS is [1 (high E)... 6 (low E)]
        // The display wants 6 at bottom, 1 at top.
        // So simple iteration works if CSS order matches or we simply render top-down.
        // Usually tab/fretboard diagrams have High E at top.

        // Let's verify spec: "6弦から1弦まで表示（6弦が一番下）" -> 6th string at bottom.
        // So visually:
        // 1 (High E)
        // ...
        // 6 (Low E)

        // My STRINGS array has 1 first. So iterating them naturally puts 1 at top.

        STRINGS.forEach((stringData, strIndex) => {
            const stringNum = stringData.id;

            // Note Label (Left column)
            // Ideally we show the open note name
            const label = document.createElement('div');
            label.className = 'string-label';
            label.textContent = stringData.openNote;
            label.style.gridRow = strIndex + 1;
            label.style.gridColumn = 1;
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.justifyContent = 'center';
            label.style.fontWeight = 'bold';
            this.container.appendChild(label);

            // Frets 0 to 12
            for (let fret = 0; fret <= MAX_FRETS; fret++) {
                const cell = document.createElement('div');
                cell.className = `string-cell string-${stringNum} fret-${fret}`;
                cell.dataset.string = stringNum;
                cell.dataset.fret = fret;
                cell.dataset.note = getNoteAt(stringData.openNote, fret);

                // Grid Position
                cell.style.gridRow = strIndex + 1;
                cell.style.gridColumn = fret + 2; // +1 for label, +1 for 0-index adjustment? fret 0 is col 2

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

        // Add Inlay Dots (Background decoration)
        // 3, 5, 7, 9 -> Single
        // 12 -> Double
        const inlays = [3, 5, 7, 9, 12];
        inlays.forEach(fret => {
            if (fret === 12) {
                this._addInlay(fret, 2); // roughly string 2
                this._addInlay(fret, 5); // roughly string 5
            } else {
                this._addInlay(fret, 3.5); // between 3 and 4
            }
        });

        // Fret Numbers at Bottom
        for (let fret = 0; fret <= MAX_FRETS; fret++) {
            const num = document.createElement('div');
            num.className = 'fret-number';
            num.textContent = fret;
            num.style.gridColumn = fret + 2;
            num.style.textAlign = 'center';
            num.style.marginTop = '4px';
            num.style.fontSize = '0.8rem';
            num.style.color = '#555';
            // Position after the last row
            num.style.gridRow = 7;
            this.container.appendChild(num);
        }
    }

    _addInlay(fret, stringPos) {
        const dot = document.createElement('div');
        dot.className = 'inlay-dot';
        // Position
        // Grid Row is roughly stringPos.
        // Note: CSS Grid Placement uses simple integers.
        // We can use absolute positioning relative to container or a separate overlay layer.
        // For simplicity, let's append to specific cells or use 'grid-area'.

        // Actually, easiest is to append to the 0th row or similar, but absolutely position it.
        // But since fretboard is relative, let's just make a 'decoration' layer if needed.
        // Simple hack: put it in a cell on the middle string and offset it?
        // No, let's skip complex visual inlays for this MVP version to ensure stability,
        // or just add a class to the cell that should contain it.

        // Alternate Strategy: Add a marker to the cell at string 3 or 4 for single dots.
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
            cell.classList.remove('target-hidden');
            cell.classList.add('target-revealed');
        }
    }
}
