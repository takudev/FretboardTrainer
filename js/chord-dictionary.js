/**
 * Chord Dictionary Data & Renderer
 * Based on: https://docs.google.com/spreadsheets/d/1A1TosoPI_PX6efnzpwr40W-minNWmPJr18DsSCDJgD8
 * 
 * Each chord has shapes (A Shape, E Shape, etc.) with fretboard diagrams.
 * A Shape and E Shape are displayed as separate diagrams.
 */

const CHORD_DICTIONARY_DATA = [
    {
        name: 'C', formula: 'Root, Major 3rd, Perfect 5th',
        shapes: [
            {
                shapeName: 'A Shape',
                positions: [
                    [1, 3, '5'], [2, 5, '3'], [3, 5, 'R'], [4, 5, '5'], [5, 3, 'R']
                ]
            },
            {
                shapeName: 'E Shape',
                positions: [
                    [1, 8, 'R'], [2, 8, '5'], [3, 9, '3'], [4, 10, 'R'], [5, 10, '5'], [6, 8, 'R']
                ]
            },
            {
                shapeName: '4th Root',
                positions: [
                    [2, 8, '5'], [3, 9, '3'], [4, 10, 'R']
                ]
            }
        ]
    },
    {
        name: 'Cm', formula: 'Root, Minor 3rd, Perfect 5th',
        shapes: [
            {
                shapeName: 'A Shape',
                positions: [
                    [1, 3, '5'], [2, 4, 'b3'], [3, 5, 'R'], [4, 5, '5'], [5, 3, 'R']
                ]
            },
            {
                shapeName: 'E Shape',
                positions: [
                    [1, 8, 'R'], [2, 8, '5'], [3, 8, 'b3'], [4, 10, 'R'], [5, 10, '5'], [6, 8, 'R']
                ]
            }
        ]
    },
    {
        name: 'Cdim', formula: 'Root, Minor 3rd, Diminished 5th',
        shapes: [
            {
                shapeName: 'A Shape',
                positions: [
                    [2, 4, 'b3'], [3, 5, 'R'], [4, 4, 'b5'], [5, 3, 'R']
                ]
            }
        ]
    },
    {
        name: 'Caug', formula: 'Root, Major 3rd, Augmented 5th',
        shapes: []
    },
    {
        name: 'CMaj7', formula: 'Root, Major 3rd, Perfect 5th, Major 7th',
        shapes: [
            {
                shapeName: 'A Shape',
                positions: [
                    [1, 3, '5'], [2, 5, '3'], [3, 4, '7'], [4, 5, '5'], [5, 3, 'R']
                ]
            },
            {
                shapeName: 'E Shape',
                positions: [
                    [1, 8, 'R'], [2, 8, '5'], [3, 9, '3'], [4, 9, '7'], [5, 10, '5'], [6, 8, 'R']
                ]
            },
            {
                shapeName: '4th Root',
                positions: [
                    [1, 7, '7'], [2, 8, '5'], [3, 9, '3'], [4, 10, 'R']
                ]
            }
        ]
    },
    {
        name: 'Cm7', formula: 'Root, Minor 3rd, Perfect 5th, Minor 7th',
        shapes: [
            {
                shapeName: 'A Shape',
                positions: [
                    [1, 3, '5'], [2, 4, 'b3'], [3, 3, 'b7'], [4, 5, '5'], [5, 3, 'R']
                ]
            },
            {
                shapeName: 'E Shape',
                positions: [
                    [1, 8, 'R'], [2, 8, '5'], [3, 8, 'b3'], [4, 8, 'b7'], [5, 10, '5'], [6, 8, 'R']
                ]
            }
        ]
    },
    {
        name: 'C7', formula: 'Root, Major 3rd, Perfect 5th, Minor 7th',
        shapes: [
            {
                shapeName: 'A Shape',
                positions: [
                    [1, 3, '5'], [2, 5, '3'], [3, 3, 'b7'], [4, 5, '5'], [5, 3, 'R']
                ]
            },
            {
                shapeName: 'E Shape',
                positions: [
                    [1, 8, 'R'], [2, 8, '5'], [3, 9, '3'], [4, 8, 'b7'], [5, 10, '5'], [6, 8, 'R']
                ]
            }
        ]
    },
    {
        name: 'CmM7', formula: 'Root, Minor 3rd, Perfect 5th, Major 7th',
        shapes: []
    },
    {
        name: 'Cm7b5', formula: 'Root, Minor 3rd, Diminished 5th, Minor 7th',
        shapes: [
            {
                shapeName: 'A Shape',
                positions: [
                    [2, 4, 'b3'], [3, 3, 'b7'], [4, 4, 'b5'], [5, 3, 'R']
                ]
            },
            {
                shapeName: 'E Shape',
                positions: [
                    [2, 7, 'b5'], [3, 8, 'b3'], [4, 8, 'b7'], [6, 8, 'R']
                ]
            }
        ]
    },
    {
        name: 'Cdim7', formula: 'Root, Minor 3rd, Diminished 5th, Diminished 7th',
        shapes: [
            {
                shapeName: 'A Shape',
                positions: [
                    [2, 4, 'b3'], [3, 2, 'bb7'], [4, 4, 'b5'], [5, 3, 'R']
                ]
            },
            {
                shapeName: 'E Shape',
                positions: [
                    [2, 7, 'b5'], [3, 8, 'b3'], [4, 7, 'bb7'], [6, 8, 'R']
                ]
            }
        ]
    },
    {
        name: 'C6', formula: 'Root, Major 3rd, Perfect 5th, Major 6th',
        shapes: [
            {
                shapeName: 'A Shape',
                positions: [
                    [1, 3, '5'], [2, 5, '3'], [3, 2, '6'], [4, 5, '5'], [5, 3, 'R']
                ]
            },
            {
                shapeName: 'E Shape',
                positions: [
                    [2, 8, '5'], [3, 9, '3'], [4, 7, '6'], [6, 8, 'R']
                ]
            }
        ]
    },
    {
        name: 'C9', formula: 'Root, Major 3rd, Perfect 5th, Minor 7th, Major 9th',
        shapes: [
            {
                shapeName: 'A Shape',
                positions: [
                    [2, 3, '3'], [3, 3, 'b7'], [4, 2, '2'], [5, 3, 'R']
                ]
            },
            {
                shapeName: 'E Shape',
                positions: [
                    [2, 8, '5'], [3, 7, '9'], [4, 8, 'b7'], [5, 7, '3'], [6, 8, 'R']
                ]
            }
        ]
    },
    {
        name: 'Csus4', formula: 'Root, Perfect 4th, Perfect 5th',
        shapes: [
            {
                shapeName: 'A Shape',
                positions: [
                    [1, 3, '5'], [2, 6, '4'], [3, 5, 'R'], [4, 5, '5'], [5, 3, 'R']
                ]
            },
            {
                shapeName: 'E Shape',
                positions: [
                    [1, 8, 'R'], [2, 8, '5'], [3, 10, '4'], [4, 10, 'R'], [5, 10, '5'], [6, 8, 'R']
                ]
            }
        ]
    },
    {
        name: 'Csus2', formula: 'Root, Major 2nd, Perfect 5th',
        shapes: [
            {
                shapeName: 'A Shape',
                positions: [
                    [1, 3, '5'], [2, 3, '2'], [3, 5, 'R'], [4, 5, '5'], [5, 3, 'R']
                ]
            },
            {
                shapeName: 'E Shape',
                positions: [
                    [1, 8, 'R'], [2, 8, '5'], [3, 7, '2'], [4, 10, 'R'], [5, 10, '5'], [6, 8, 'R']
                ]
            }
        ]
    }
];

/**
 * Render a mini fretboard diagram using HTML
 */
function renderMiniFretboard(shape) {
    // Determine fret range from shape positions
    const frets = shape.positions.map(p => p[1]);
    const minFret = Math.min(...frets);
    const maxFret = Math.max(...frets);
    const startFret = Math.max(0, minFret - 1);
    const endFret = maxFret + 1;
    const numFrets = endFret - startFret + 1;

    // Build position lookup: key = "string-fret"
    const posMap = {};
    shape.positions.forEach(([str, fret, label]) => {
        posMap[`${str}-${fret}`] = label;
    });

    let html = `<div class="mini-fretboard-wrapper">`;
    html += `<div class="mini-fb-shape-name">${shape.shapeName}</div>`;
    html += `<div class="mini-fb" style="grid-template-columns: 30px repeat(${numFrets}, 1fr);">`;

    // Header row: fret numbers
    html += `<div class="mini-fb-corner"></div>`;
    for (let f = startFret; f <= endFret; f++) {
        html += `<div class="mini-fb-fret-num">${f}f</div>`;
    }

    // String rows (1 = high E, 6 = low E)
    for (let s = 1; s <= 6; s++) {
        html += `<div class="mini-fb-string-label">${s}:</div>`;
        for (let f = startFret; f <= endFret; f++) {
            const key = `${s}-${f}`;
            const label = posMap[key] || '';
            const isRoot = label === 'R';
            const isMute = label === 'x';
            const isNote = label && !isRoot && !isMute;
            let cellClass = 'mini-fb-cell';
            if (isRoot) cellClass += ' root';
            else if (isMute) cellClass += ' mute';
            else if (isNote) cellClass += ' note';
            html += `<div class="${cellClass}">`;
            if (label) {
                html += `<span class="mini-fb-dot">${label}</span>`;
            }
            html += `<div class="mini-fb-string-line string-gauge-${s}"></div>`;
            html += `</div>`;
        }
    }

    html += `</div></div>`;
    return html;
}

function renderChordDictionary(container) {
    let cardsHtml = CHORD_DICTIONARY_DATA.map(chord => {
        if (chord.shapes.length === 0) {
            // No diagrams yet - show placeholder
            return `
                <div class="chord-card">
                    <div class="chord-card-header">
                        <h3>${chord.name}</h3>
                        <span class="chord-card-formula">${chord.formula}</span>
                    </div>
                    <div class="chord-card-body-placeholder">Under Construction</div>
                </div>
            `;
        }

        // Render each shape as a separate diagram block
        const diagrams = chord.shapes.map(shape => renderMiniFretboard(shape)).join('');
        return `
            <div class="chord-card">
                <div class="chord-card-header">
                    <h3>${chord.name}</h3>
                    <span class="chord-card-formula">${chord.formula}</span>
                </div>
                <div class="chord-card-diagrams">
                    ${diagrams}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="chord-dictionary-container">
            <div class="ref-page-header">
                <button class="btn-back" id="cd-btn-back">← Back</button>
                <h2>Chord Dictionary</h2>
            </div>
            <div class="ref-page-body">
                <div class="chord-card-list">
                    ${cardsHtml}
                </div>
            </div>
        </div>
    `;
}
