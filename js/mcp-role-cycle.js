// Hero headline: types through the roles the skills cover, treg-style.
// Starts and holds on the first role, so screenshots and no-JS show it.
// Respects reduced motion by staying on the first role.
const el = document.querySelector('.role-h1__text');
if (el && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const roles = el.dataset.roles.split('|');
  const HOLD = 2200, FIRST_HOLD = 3200, TYPE = 55, DELETE = 28;
  let i = 0;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const run = async () => {
    await wait(FIRST_HOLD);
    for (;;) {
      const text = roles[i];
      for (let n = text.length; n >= 0; n--) { el.textContent = text.slice(0, n); await wait(DELETE); }
      i = (i + 1) % roles.length;
      const next = roles[i];
      for (let n = 1; n <= next.length; n++) { el.textContent = next.slice(0, n); await wait(TYPE); }
      await wait(i === 0 ? FIRST_HOLD : HOLD);
    }
  };
  run();
}
