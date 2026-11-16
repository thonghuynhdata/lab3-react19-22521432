# Lab 3 Homeworks — React 19

A self-contained Vite React 19 project implementing HW1, HW2, HW3 and the optional 'Hẹn Hò Nhưng Không Yêu' FSM from the uploaded 35-slide lab.

## Launch

```bash
npm install
npm run dev
```

Open the localhost address printed by Vite. For release build: `npm run build` then `npm run preview`.

## Contents

- **01 / Drum Kit:** Seven sound pads W A S D J K L, accessibly operated via click and physical keyboard; sound synthesis, visual hit indicators and live hit history.
- **02 / Grand Piano:** mathematically generated 88 keys, up to 8 simultaneous Web Audio voices (oldest stolen on overflow), record, replay, stop, speed control.
- **03 / PUBG Arena:** epoch-based airdrop countdown, simulated server claims with 409 rollback, squad leaderboard, kill-feed filtering.
- **Bonus / FSM:** finite relationship phases, asymmetric effort scores, cancelable ghosting timer.

## Important scope

The arena is a **local demonstration** with simulated scores, inventory, claim success and 409 errors. It does **not** connect to KRAFTON APIs, grant real tickets or G-Coin, or show real tournament standings. Drum and piano sound requires browser Web Audio support and a user gesture.

The slide deck requires 100 Lighthouse Accessibility and 6–8 atomic Git commits, but these are **targets**, not verified achievements in the archive. Collect real DevTools/Lighthouse screenshots and create genuine commits after reviewing the code. `AI_FAILURE_AUDIT.md` contains inspection-ready cases, not fabricated tests.

## Suggested manual checks

1. At 375px confirm no horizontal page overflow (piano keys intentionally scroll *inside* the keyboard region).
2. For HW1, test W/A/S/D/J/K/L, disabled keyboard, repeat suppression, and focus inside volume control.
3. For HW2, play chords, exceed eight notes, record a small sequence, change playback speed, click Stop and leave tab during playback.
4. For HW3, background and foreground browser while a countdown runs, claim once, double-click while waiting, and observe randomized 409 rollback.
5. For bonus, send ping, let five seconds pass; repeat but click Receive reply first; verify no ghosting after changing phases.
