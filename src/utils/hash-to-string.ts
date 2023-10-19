export const hashToString = (arrayBuffer: ArrayBuffer) => {
  return Array.from(new Uint8Array(arrayBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
