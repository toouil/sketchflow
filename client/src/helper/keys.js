import { SHORT_CUTS } from "../global/var";

export function shortKey(pressedKeys) {
  return SHORT_CUTS.some((subArray) => {
    const subArraySet = new Set(subArray);
    return [...subArraySet].every((item) => pressedKeys.has(item));
  });
}
