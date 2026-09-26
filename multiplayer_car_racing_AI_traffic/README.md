# Multiplayer Car Racing

## Run on your computer
1. Install Node.js.
2. Open this folder in Terminal.
3. Run `npm install`
4. Run `npm start`
5. Open `http://localhost:3000`

## Make it playable by friends
Deploy this project to a Node.js hosting service that supports WebSockets (for example Render or Railway).
Use:
- Build/install command: `npm install`
- Start command: `npm start`

Then share the generated HTTPS URL with friends. One player creates a room and shares the 6-character room code; others join with that code.

The game has 2–4 player rooms, live movement sync, mobile touch controls, keyboard controls, nitro, player names, scores, reset and leave.
