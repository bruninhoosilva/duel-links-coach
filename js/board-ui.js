// The only browser-side logic for the board: show one pre-rendered snapshot at a time.
export const clampStep = (step, steps) => Math.max(0, Math.min(steps, step));

export function showStep(wrap, step) {
  const steps = Number(wrap.dataset.steps);
  const n = clampStep(step, steps);
  wrap.dataset.current = String(n);
  for (const panel of wrap.querySelectorAll('[data-board-step]')) panel.hidden = Number(panel.dataset.boardStep) !== n;
  const count = wrap.querySelector('[data-board-count]');
  if (count) count.textContent = n === 0 ? 'Start' : `Step ${n} of ${steps}`;
  const items = wrap.closest('.scenario')?.querySelectorAll('.step') ?? [];
  items.forEach((item, i) => {
    if (i + 1 === n) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
}

// Returns true when the click was for the board (so the caller can stop handling it).
export function handleBoardClick(event) {
  const nav = event.target.closest('[data-board-nav]');
  const goto = event.target.closest('[data-board-goto]');
  if (!nav && !goto) return false;
  const wrap = (nav ?? goto).closest('.scenario')?.querySelector('.board-wrap');
  if (!wrap) return false;
  const current = Number(wrap.dataset.current ?? 0);
  showStep(wrap, goto ? Number(goto.dataset.boardGoto) : current + (nav.dataset.boardNav === 'next' ? 1 : -1));
  if (goto) wrap.scrollIntoView({ block: 'nearest' });
  return true;
}
