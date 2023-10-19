export type FeesResponse = {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
};

export const getFees = async () => {
  const response = await fetch("https://mempool.space/api/v1/fees/recommended");
  const data: FeesResponse = await response.json();
  return {
    ...data,
    economyFee: data.economyFee <= 2 ? 3 : data.economyFee,
    halfHourFee: data.halfHourFee <= 2 ? 3 : data.halfHourFee,
  };
};
