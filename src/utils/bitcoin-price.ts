export const getBitcoinPriceFromCoinbase = async () => {
  const request = await fetch(
    "https://api.coinbase.com/v2/prices/BTC-USD/spot"
  );
  const data: {
    data: {
      amount: string;
    };
  } = await request.json();
  const price = data.data.amount;
  return price;
};

export const getBitcoinPriceFromKraken = async () => {
  const request = await fetch(
    "https://api.kraken.com/0/public/Ticker?pair=XBTUSD"
  );
  const data: {
    result: {
      XXBTZUSD: {
        a: string[];
      };
    };
  } = await request.json();
  const price = data.result.XXBTZUSD.a[0];
  return price;
};

export const getBitcoinPriceFromCoindesk = async () => {
  const request = await fetch(
    "https://api.coindesk.com/v1/bpi/currentprice.json"
  );
  const data: {
    bpi: {
      USD: {
        rate_float: string;
      };
    };
  } = await request.json();
  const price = data.bpi.USD.rate_float;
  return price;
};

export const getBitcoinPriceFromGemini = async () => {
  const request = await fetch("https://api.gemini.com/v2/ticker/BTCUSD");
  const data: {
    bid: string;
  } = await request.json();
  const price = data.bid;
  return price;
};

export const getBitcoinPriceFromBybit = async () => {
  const request = await fetch(
    "https://api-testnet.bybit.com/derivatives/v3/public/order-book/L2?category=linear&symbol=BTCUSDT"
  );
  const data: {
    result: {
      b: string[][];
    };
  } = await request.json();
  const price = data.result.b[0][0];
  return price;
};

export const getBitcoinPrice = async () => {
  const cbprice = await getBitcoinPriceFromCoinbase();
  const kprice = await getBitcoinPriceFromKraken();
  const cdprice = await getBitcoinPriceFromCoindesk();
  const gprice = await getBitcoinPriceFromGemini();
  const bprice = await getBitcoinPriceFromBybit();

  let prices = [
    parseFloat(cbprice),
    parseFloat(kprice),
    parseFloat(cdprice),
    parseFloat(gprice),
    parseFloat(bprice)
  ];
  prices = prices.filter((value) => !Number.isNaN(value) && value > 0);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

  return avg;
};
