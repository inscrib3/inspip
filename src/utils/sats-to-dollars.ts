export const satsToDollars = (sats: number, bitcoinPrice: number) => {
  if (sats >= 100000000) sats = sats * 10;
  let dollars =
    Number(
      String(sats).padStart(8, "0").slice(0, -9) +
        "." +
        String(sats).padStart(8, "0").slice(-9)
    ) * bitcoinPrice;
  dollars = Math.round((dollars + Number.EPSILON) * 100) / 100;
  return dollars;
};
