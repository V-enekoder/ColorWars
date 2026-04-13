export function printHexHash(hash: bigint): void {
  const hex = `0x${hash.toString(16).padStart(16, "0")}`;
  console.log(hex);
}
