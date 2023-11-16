export const calculateFee = (
    vinsLength: number,
    voutsLength: number,
    feeRate: number,
    includeChangeOutput: 0 | 1 = 1,
  ): number => {
    const baseTxSize = 10;
    const inSize = 180;
    const outSize = 34;
  
    const txSize =
      baseTxSize +
      vinsLength * inSize +
      voutsLength * outSize +
      includeChangeOutput * outSize;
    const fee = txSize * feeRate;
    return fee;
  }