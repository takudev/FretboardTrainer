# Guitar Fretboard Trainer

A mobile-friendly web application to learn and master the guitar fretboard. Built with modern Vanilla JS and CSS.

## Features
- **Same Note Finder Game**: Challenge yourself to find all matching notes on the fretboard.
- **Responsive Design**: optimized for landscape mobile usage.
- **Interactive Fretboard**: Detailed fretboard visualization with string/note mapping.

## How to Run
**Important**: This application uses ES Modules (`<script type="module">`). Due to browser security restrictions (CORS), you cannot run it by simply double-clicking `index.html`. You must serve it via a local web server.

### Options:

1. **VS Code Live Server (Recommended)**
   - Install the "Live Server" extension in VS Code.
   - Right-click `index.html` and select "Open with Live Server".

2. **Python**
   - Run `python -m http.server` in this directory.
   - Open `http://localhost:8000`.

3. **Node.js**
   - Run `npx serve .`
   - Open the displayed URL.

## Architecture
- `index.html`: Main entry point.
- `js/`: Application logic (Modules).
  - `app.js`: Router and initialization.
  - `fretboard.js`: Fretboard rendering component.
  - `same-note-finder.js`: Game logic.
  - `utils.js`: Music theory helpers.
- `css/`: Styles.
