// [ .[] | select(.category | IN("Smileys & Emotion", "Animals & Nature", "Food & Drink")) | .emoji ]
import emojis from "./emojis.json";
import fnv1a from "@sindresorhus/fnv1a";

export function hash(input: string, length = 2) {
  const hash = fnv1a(input, { size: 32 });

  let emojiIdx = Number(hash) % Math.pow(emojis.length, length);
  let emojiStr = "";
  for (let i = 0; i < length; i++) {
    emojiStr += emojis[emojiIdx % emojis.length];
    emojiIdx = Math.floor(emojiIdx / emojis.length);
  }

  return emojiStr;
}
