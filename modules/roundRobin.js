let index = 0;

export function nextSub(list) {
  if (!list.length) return null;
  const sub = list[index];
  index = (index + 1) % list.length;
  return sub;
}
