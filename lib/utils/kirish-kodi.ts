/** 000000–999999 oralig'ida 6 xonali kirish kodi generatsiya qiladi. */
export function kirishKodiYarat(): string {
  return Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
}
