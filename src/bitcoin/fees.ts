export function estimateFee(vin: bigint, vout: bigint, rate: bigint) {
  return (102n + vin * 112n + vout * 33n) * rate;
}
