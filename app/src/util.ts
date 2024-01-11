export const capStr = (s: string) =>
  s.replace(/\b\w/g, (char) => {
    return char.toUpperCase();
  });

export function setDiff<T>(a: T[], b: T[]) {
  return new Set(Array.from(a).filter((item) => !new Set(b).has(item)));
}
