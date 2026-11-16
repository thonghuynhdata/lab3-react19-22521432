# AI failure mode audit — engineering review

**Integrity note:** These are concrete failure patterns reviewed and prevented in the delivered code, *not* claims that a tool actually produced these bugs or that DevTools was run. Add genuine screenshots and commit IDs only after verifying in your browser.

## #01 — Stale event closure
- **Possible bad code:** `useEffect(() => addEventListener('keydown', onKeyDown), [])` with an unchanging handler closure.
- **Failure:** The handler continues using old volume, pad mapping or onTriggerPad callbacks.
- **Engineering correction:** `useDrumKeyboard` depends on `padMap`, `onTriggerPad`, `onReleasePad`, and `isEnabled`, and removes both listeners on cleanup.
- **Manual proof to capture:** Change drum volume and toggle keyboard. Confirm correct response and no orphan listener after switching tabs.

## #02 — Incremental timer drift in inactive browser tabs
- **Possible bad code:** `setInterval(() => setSeconds(s => s - 1), 1000)`.
- **Failure:** Timers are throttled while backgrounded, so airdrops can run late.
- **Engineering correction:** `usePubgAirdropTimer` derives time from target epoch minus `Date.now()`, resynchronizes on visibilitychange and clears its timer/listener.
- **Manual proof to capture:** Background the tab for 20 seconds; return and compare displayed countdown to real elapsed time.

## #03 — Optimistic stock corruption under repeated clicks / 409
- **Possible bad code:** `setStock(stock - 1); await claim()` with no lock or rollback.
- **Failure:** Duplicate requests drive stock negative, or failed claims lose inventory.
- **Engineering correction:** `locks` Ref serializes per-drop submissions and restores one stock unit on simulated 409 response.
- **Manual proof to capture:** Trigger a 409 in local simulation; observe inventory return to previous value; try double click during pending state.

## #04 — Audio oscillators left running after unmount
- **Possible bad code:** creating AudioContext oscillators without noteOff/disconnect and replay cancelation.
- **Failure:** Audio persists after navigation; browser audio resources leak.
- **Engineering correction:** `PolyphonicSynth.noteOff()` applies ramp + stops and disconnects; piano cleanup aborts replay and closes the context.
- **Manual proof to capture:** Hold a note, switch tabs, observe sound stops.

## #05 — Derived filter state effect
- **Possible bad code:** store `filteredSquads` and synchronize it with useEffect.
- **Failure:** One user edit causes a stale initial render followed by another render.
- **Engineering correction:** Filter and `.toSorted()` are derived in `useMemo` from query/sort values.
- **Manual proof to capture:** Inspect commits in React DevTools Profiler while changing the sorting control.
