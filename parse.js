const fs = require('fs');
const https = require('https');

const url = 'https://docs.google.com/spreadsheets/d/1A1TosoPI_PX6efnzpwr40W-minNWmPJr18DsSCDJgD8/export?format=csv';

function fetchCSV(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                resolve(fetchCSV(res.headers.location));
                return;
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function parseCSV(csvText) {
    const lines = csvText.split(/\r?\n/);
    
    // Formula Mapper
    function mapFormula(formulaStr) {
        // e.g. "R,3,5" or "R, b3, 5"
        let parts = formulaStr.split(',').map(s => s.trim().replace(/"/g, ''));
        const map = {
            'R': 'Root',
            '2': 'Major 2nd',
            '3': 'Major 3rd',
            'b3': 'Minor 3rd',
            '4': 'Perfect 4th',
            '5': 'Perfect 5th',
            'b5': 'Diminished 5th',
            '#5': 'Augmented 5th',
            '6': 'Major 6th',
            '7': 'Major 7th',
            'b7': 'Minor 7th',
            'bb7': 'Diminished 7th',
            '9': 'Major 9th'
        };
        return parts.map(p => map[p] || p).join(', ');
    }
    
    const fretMap = {
        1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 
        7: 8, 8: 9, 9: 10, 10: 11, 
        11: 7, 12: 8, 13: 9, 14: 10, 15: 11, 16: 12, 17: 13, 18: 14
    };
    
    const shapeMap = {
        'A Shape': [1, 6],
        'E Shape': [7, 10],
        '4th Root': [11, 18]
    };
    
    const chords = [];
    let currentChord = null;
    let mode = 'search'; 
    let stringsFound = 0;
    
    const parseDotsLine = (cols, chord) => {
        const strNumStr = cols[0].replace(':', '').trim();
        const strNum = parseInt(strNumStr, 10);
        if (isNaN(strNum) || strNum < 1 || strNum > 6) return false;
        
        // iterate parts 1 to 18
        for (let i = 1; i <= 18; i++) {
            let val = cols[i] ? cols[i].trim() : '';

            if (val && val !== '---' && val.startsWith('(') && val.endsWith(')')) {
                let label = val.slice(1, -1);
                let fret = fretMap[i];
                if (!fret) continue;
                
                // Determine shape
                let shapeName = null;
                if (i >= shapeMap['A Shape'][0] && i <= shapeMap['A Shape'][1]) shapeName = 'A Shape';
                else if (i >= shapeMap['E Shape'][0] && i <= shapeMap['E Shape'][1]) shapeName = 'E Shape';
                else if (i >= shapeMap['4th Root'][0] && i <= shapeMap['4th Root'][1]) shapeName = '4th Root';
                
                if (shapeName) {
                    if (!chord.shapesMap) chord.shapesMap = {};
                    if (!chord.shapesMap[shapeName]) chord.shapesMap[shapeName] = [];
                    chord.shapesMap[shapeName].push([strNum, fret, label]);
                }
            }
        }
        return true;
    };

    // Helper to safely parse csv row
    function parseCSVLine(line) {
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            let c = line[i];
            if (c === '"') {
                inQuotes = !inQuotes;
            } else if (c === ',' && !inQuotes) {
                result.push(cur);
                cur = '';
            } else {
                cur += c;
            }
        }
        result.push(cur);
        return result;
    }
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;
        
        const cols = parseCSVLine(line);
        // If string line
        if (cols[0] && cols[0].match(/^[1-6]:/)) {
            if (currentChord) {
                parseDotsLine(cols, currentChord);
                stringsFound++;
                if (stringsFound === 6) {
                    // Process chord
                    currentChord.shapes = [];
                    for (let sName of ['A Shape', 'E Shape', '4th Root']) {
                        if (currentChord.shapesMap && currentChord.shapesMap[sName] && currentChord.shapesMap[sName].length > 0) {
                            
                            // Let's add mute ('x') for unused strings for A Shape and E Shape to match previous format?
                            // Previous dictionary had 'x' for unplayed strings. If a string isn't mentioned, we can just leave it out,
                            // EXCEPT our renderMiniFretboard handles missing dots by not rendering a dot, but wait!
                            // renderMiniFretboard handles Mute string ONLY IF we explicitly add `x`. Wait, earlier it was:
                            // `[6, 3, 'x']`.
                            // If we don't add `x`, it will just be empty. Empty is fine, it just won't draw a dot or 'x'.
                            // The user might prefer exactly matching the visual, but let's see. I'll add 'x' for string 6 on A Shape if missing.
                            currentChord.shapes.push({
                                shapeName: sName,
                                positions: currentChord.shapesMap[sName].slice()
                            });
                        }
                    }
                    delete currentChord.shapesMap;
                    chords.push(currentChord);
                    currentChord = null;
                }
            }
        } else {
            // Check if it's a chord name line (Name,"R,3,5")
            if (cols[0] && /^C[a-zA-Z0-9]*$/.test(cols[0]) && cols[1] && /[R2345679]/.test(cols[1])) {
                let name = cols[0];
                let formula = mapFormula(cols[1]);
                currentChord = { name, formula };
                stringsFound = 0;
            }
        }
    }
    
    return chords;
}

fetchCSV(url).then(csvText => {
    let chords = parseCSV(csvText);
    
    // Add missing mute 'x' and root 'R' fallbacks just to keep visual styling similar.
    chords.forEach(chord => {
        chord.shapes.forEach(shape => {
            // Find lowest fret to place 'x' markers.
            let minFret = Math.min(...shape.positions.map(p => p[1]));
            let usedStrings = new Set(shape.positions.map(p => p[0]));
            
            // For A shape, typically 6th string is muted.
            if (shape.shapeName === 'A Shape' && !usedStrings.has(6)) {
                shape.positions.push([6, Math.max(0, minFret - 1), 'x']);
            }
            if (shape.shapeName === 'A Shape' && !usedStrings.has(1)) {
                shape.positions.push([1, Math.max(0, minFret - 1), 'x']);
            }
            
            // Sort positions block to look neat in code
            shape.positions.sort((a,b) => a[0] - b[0]);
        });
    });
    
    // Read the original chord-dictionary.js to keep the renderMiniFretboard and renderChordDictionary functions untouched.
    const fileTarget = 'c:/workspace/AntiGravity/FretboardTrainer/js/chord-dictionary.js';
    const oldContent = fs.readFileSync(fileTarget, 'utf-8');
    
    // Split on function renderMiniFretboard
    const splitIndex = oldContent.indexOf('function renderMiniFretboard');
    if (splitIndex === -1) {
        console.error("Could not find renderMiniFretboard in target file.");
        process.exit(1);
    }
    
    const functionPart = oldContent.slice(splitIndex);
    
    const prefix = `/**
 * Chord Dictionary Data & Renderer
 * Based on: https://docs.google.com/spreadsheets/d/1A1TosoPI_PX6efnzpwr40W-minNWmPJr18DsSCDJgD8
 * 
 * Auto-updated from Google Sheets CSV.
 */

const CHORD_DICTIONARY_DATA = ${JSON.stringify(chords, null, 4)};

/**
 * Render a mini fretboard diagram using HTML
 */
`;

    // Wait, the split index includes "/**\n * Render a mini fretboard diagram using HTML\n */\nfunction renderMiniFretboard"
    // Let's refine splitting.
    const finalContent = prefix + functionPart;
    fs.writeFileSync(fileTarget, finalContent, 'utf-8');
    console.log("Updated " + fileTarget);
}).catch(console.error);

