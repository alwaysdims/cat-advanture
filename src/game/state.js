export const newRun = () => ({ hearts: 5, score: 0, fish: 0, coins: 0 });
export function collect(run, kind) {
  if (kind === 'fish') { run.fish++; run.score += 10; }
  else if (kind === 'coin') { run.coins++; run.score += 25; }
}
export function completeLevel(run, final) {
  run.score += 100 + (final ? run.hearts * 20 : 0);
}
export const retryRun = (entry, dead) => ({ ...entry, hearts: dead ? 5 : entry.hearts });
