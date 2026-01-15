const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const STRINGS = [
    { id: 1, openNote: 'E', octave: 4 }, // High E
    { id: 2, openNote: 'B', octave: 3 },
    { id: 3, openNote: 'G', octave: 3 },
    { id: 4, openNote: 'D', octave: 3 },
    { id: 5, openNote: 'A', octave: 2 },
    { id: 6, openNote: 'E', octave: 2 }  // Low E
];

const MAX_FRETS = 11;

function getNoteAt(stringOpenNote, fret) {
    const startIndex = NOTES.indexOf(stringOpenNote);
    const index = (startIndex + fret) % 12;
    return NOTES[index];
}

function getAllPositions(note) {
    const positions = [];
    STRINGS.forEach(s => {
        const startIndex = NOTES.indexOf(s.openNote);
        for (let fret = 0; fret <= MAX_FRETS; fret++) {
            const currentNoteIndex = (startIndex + fret) % 12;
            if (NOTES[currentNoteIndex] === note) {
                positions.push({ string: s.id, fret: fret });
            }
        }
    });
    return positions;
}

// Format seconds to mm:ss.ms
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
}
