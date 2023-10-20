import { useEffect, useState } from "react"

export const DollarBalance = (sats: bigint): JSX.Element => {
  const [ convertedValue, setConvertedValue ] = useState<bigint>();

  const getPrice = async () => {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`;

    try {
      const response = await fetch(url, { method: 'GET' });
      const rate = await response.json();

      if(!rate.rate.bitcoin) return BigInt(0);
      else return BigInt(rate.rate.bitcoin);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const convert = async (sats: bigint) => {
      const rate = await getPrice()
      const val = sats * rate!;
      setConvertedValue(val);
    }

    convert(1n);
  }, [sats])

  return (
    <>
    $&nbsp;{convertedValue}
    </>
  )
}
