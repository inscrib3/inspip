export const hexToBytes = (hex: string) => {
  const bytes = hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16));
  return bytes ? Uint8Array.from(bytes) : new Uint8Array();
};
