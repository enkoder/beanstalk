export const capStr = (s: string) =>
  s.replace(/\b\w/g, (char) => {
    return char.toUpperCase();
  });
