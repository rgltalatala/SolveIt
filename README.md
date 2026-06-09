# SolveIt

SolveIt is a web app for learning to solve a 3×3 Rubik’s Cube. Scan your physical cube with the device camera to build a virtual model, then follow guided lessons for the white cross and white corners with animated 3D demos and step-by-step instructions matched to your hold (white on bottom, yellow on top).

You can also skip scanning and jump straight into a lesson with a random WCA scramble for practice.

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- npm (included with Node.js)
- A webcam if you want to use the face-scanning flow

## Run locally

```bash
git clone <repository-url>
cd solveit
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### Other commands

```bash
npm run build    # production build
npm run preview  # preview the production build
npm test         # run the test suite
npm run lint     # run ESLint
```

## Using the app

1. **Scan** — Allow camera access and capture all six faces of your cube. Confirm or correct the detected colors if needed.
2. **Ready** — Inspect the virtual cube, then start the white cross or white corners lesson.
3. **Learn** — Follow each step on your physical cube while watching the animated demo. Use **Practice: random scramble → lesson** at any time to skip scanning.
