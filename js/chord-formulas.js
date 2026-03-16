/**
 * Chord Formulas Data & Renderer
 * Based on: https://docs.google.com/spreadsheets/d/15peJC7w_jhZ935oq1jTtHYaHPOj1gtEbgMkTWSP4XGs
 */

const CHORD_FORMULAS_DATA = [
    {
        num: 1, symbol: 'C', name: 'Major Chord（長三和音）',
        intervals: [0, 4, 7], // indices in 0-11
        labels: ['①', '', '', '', '③', '', '', '⑤', '', '', '', ''],
        formulaInterval: 'Root, Major 3rd, Perfect 5th',
        formulaDoMiSo: 'Do, Mi, So'
    },
    {
        num: 2, symbol: 'Cm', name: 'Minor Chord（短三和音）',
        intervals: [0, 3, 7],
        labels: ['①', '', '', '③', '', '', '', '⑤', '', '', '', ''],
        formulaInterval: 'Root, Minor 3rd, Perfect 5th',
        formulaDoMiSo: 'Do, Mi♭, So'
    },
    {
        num: 3, symbol: 'Cdim', name: 'Diminished Chord（減三和音）',
        intervals: [0, 3, 6],
        labels: ['①', '', '', '③', '', '', '⑤', '', '', '', '', ''],
        formulaInterval: 'Root, Minor 3rd, Diminished 5th',
        formulaDoMiSo: 'Do, Mi♭, So♭'
    },
    {
        num: 4, symbol: 'Caug', name: 'Augmented Chord（増三和音）',
        intervals: [0, 4, 8],
        labels: ['①', '', '', '', '③', '', '', '', '⑤', '', '', ''],
        formulaInterval: 'Root, Major 3rd, Augmented 5th',
        formulaDoMiSo: 'Do, Mi, So♯'
    },
    {
        num: 5, symbol: 'CMaj7', name: 'Major 7th Chord',
        intervals: [0, 4, 7, 11],
        labels: ['①', '', '', '', '③', '', '', '⑤', '', '', '', '⑦'],
        formulaInterval: 'Root, Major 3rd, Perfect 5th, Major 7th',
        formulaDoMiSo: 'Do, Mi, So, Si'
    },
    {
        num: 6, symbol: 'Cm7', name: 'Minor 7th Chord',
        intervals: [0, 3, 7, 10],
        labels: ['①', '', '', '③', '', '', '', '⑤', '', '', '⑦', ''],
        formulaInterval: 'Root, Minor 3rd, Perfect 5th, Minor 7th',
        formulaDoMiSo: 'Do, Mi♭, So, Si♭'
    },
    {
        num: 7, symbol: 'C7', name: 'Dominant 7th Chord',
        intervals: [0, 4, 7, 10],
        labels: ['①', '', '', '', '③', '', '', '⑤', '', '', '⑦', ''],
        formulaInterval: 'Root, Major 3rd, Perfect 5th, Minor 7th',
        formulaDoMiSo: 'Do, Mi, So, Si♭'
    },
    {
        num: 8, symbol: 'CmM7', name: 'Minor Major 7th Chord',
        intervals: [0, 3, 7, 11],
        labels: ['①', '', '', '③', '', '', '', '⑤', '', '', '', '⑦'],
        formulaInterval: 'Root, Minor 3rd, Perfect 5th, Major 7th',
        formulaDoMiSo: 'Do, Mi♭, So, Si'
    },
    {
        num: 9, symbol: 'Cm7(♭5)', name: 'Half Diminished Chord',
        intervals: [0, 3, 6, 10],
        labels: ['①', '', '', '③', '', '', '⑤', '', '', '', '⑦', ''],
        formulaInterval: 'Root, Minor 3rd, Diminished 5th, Minor 7th',
        formulaDoMiSo: 'Do, Mi♭, So♭, Si♭'
    },
    {
        num: 10, symbol: 'Cdim7', name: 'Diminished 7th Chord',
        intervals: [0, 3, 6, 9],
        labels: ['①', '', '', '③', '', '', '⑤', '', '', '⑦', '', ''],
        formulaInterval: 'Root, Minor 3rd, Diminished 5th, Diminished 7th',
        formulaDoMiSo: 'Do, Mi♭, So♭, Si♭♭'
    }
];

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function renderChordFormulas(container) {
    const html = `
        <div class="chord-formulas-container">
            <div class="ref-page-header">
                <button class="btn-back" id="cf-btn-back">← Back</button>
                <h2>Chord Formulas</h2>
            </div>
            <div class="ref-page-body">
                <table class="chord-formula-table">
                    <thead>
                        <tr>
                            <th class="col-num">#</th>
                            <th class="col-symbol">Symbol</th>
                            <th class="col-name">Name</th>
                            ${NOTE_NAMES.map((n, i) => `<th class="col-note">${n}<br><span class="interval-num">${i}</span></th>`).join('')}
                            <th class="col-formula">Formulas (Intervals)</th>
                            <th class="col-formula">Formulas (Do Mi So)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${CHORD_FORMULAS_DATA.map(chord => `
                            <tr>
                                <td class="col-num">${chord.num}</td>
                                <td class="col-symbol"><strong>${chord.symbol}</strong></td>
                                <td class="col-name">${chord.name}</td>
                                ${chord.labels.map((label, i) => {
                                    const isActive = label !== '';
                                    const cls = isActive ? 'interval-active' : 'interval-empty';
                                    return `<td class="col-note ${cls}">${label}</td>`;
                                }).join('')}
                                <td class="col-formula">${chord.formulaInterval}</td>
                                <td class="col-formula">${chord.formulaDoMiSo}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    container.innerHTML = html;
}
