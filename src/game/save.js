const KEY = 'cat-adventure-v1';
const defaults = () => ({ highScore: 0, unlocked: 1, muted: false, reducedMotion: false });
export function loadSave(storage) {
  try {
    const data = JSON.parse((storage ?? window.localStorage).getItem(KEY));
    return {
      highScore: Number.isSafeInteger(data?.highScore) && data.highScore >= 0 ? data.highScore : 0,
      unlocked: Number.isInteger(data?.unlocked) && data.unlocked >= 1 && data.unlocked <= 3 ? data.unlocked : 1,
      muted: data?.muted === true,
      reducedMotion: data?.reducedMotion === true,
    };
  } catch { return defaults(); }
}
export function writeSave(save, storage) {
  try { (storage ?? window.localStorage).setItem(KEY, JSON.stringify(save)); return true; }
  catch { return false; }
}
