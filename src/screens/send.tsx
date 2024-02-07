import { Box, Button, Select, TextInput, Text, Spinner, Anchor } from "grommet";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { bigIntToString, getNetwork, parseStringToBigInt, validateAddress } from "../bitcoin/helpers";
import { SetFees } from "../components";
import { useSendSats, useSendTokens } from "../hooks";
import { useApp } from "../app";
import { useSafeBalances } from "../hooks/safe-balances.hook";
import { RoutePath } from "../router";
import { AppLayout } from "../components/app-layout";

export const Send = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const app = useApp();
  const sendSats = useSendSats();
  const sendTokens = useSendTokens();
  const balances = useSafeBalances();
  const [ticker, setTicker] = useState<string>(location?.state?.ticker || '');
  const [address, setAddress] = useState<string>(location?.state?.toAddress || '');
  const [amount, setAmount] = useState<string>(location?.state?.satoshi ? (parseInt(location?.state?.satoshi) / Math.pow(10, 8)).toString() : '');
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const tickers = useMemo(
    () => Object.keys(balances.data).map((value) => value.toUpperCase()),
    [balances.data]
  );

  useEffect(() => {
    if (!ticker && tickers.length > 0) {
      setTicker(tickers[0]);
    }
  }, [ticker, tickers]);

  const send = async () => {
    setError("");

    if(!validateAddress(address, getNetwork(app.network))) {
      setError("Invalid address");
      return;
    }

    const splittedTicker = ticker.split(":");

    const token = app.tokens.filter((t) => t.tick === splittedTicker[0].toLowerCase() && t.id === parseInt(splittedTicker[1]));

    try {
      if (ticker.toLowerCase() === 'btc') {
        if (!parseStringToBigInt(amount, 8)) {
          throw new Error("Amount exceeds 8 decimals");
        }
      } else {
        if (!parseStringToBigInt(amount, token[0].dec)) {
          throw new Error("Amount exceeds 8 decimals");
        }
      }
    } catch (e) {
      if (!(e instanceof Error)) {
        setError("Unknown error");
        return;
      }
      setError(e.message);
      return;
    }

    setLoading(true);

    if (ticker.toLowerCase() === "btc") {
      try {
        const tx = await sendSats.dispatch(address, bigIntToString(parseStringToBigInt(amount, 8), 8), `${app.feerate}`);
        if ((tx?.vin?.length || 0) > 0 && (tx?.vout?.length || 0) > 0) {
          navigate(RoutePath.ConfirmTransaction, { state: {tx, fromWeb: location?.state?.satoshi ? true : false} })
        } else {
          setLoading(false);
          throw new Error("Something went wrong, please try again");
        }
      } catch (e) {
        setError((e as Error).message);
      }
      setLoading(false);
      return;
    }

    const tickerSplit = ticker.split(":");

    try {
      const tx = await sendTokens.dispatch(
        address,
        tickerSplit[0],
        tickerSplit[1],
        amount,
        `${app.feerate}`
      );
      setLoading(false);
      if ((tx?.vin?.length || 0) > 0 && (tx?.vout?.length || 0) > 0) {
        navigate(RoutePath.ConfirmTransaction, { state: {tx, fromWeb: location?.state?.satoshi ? true : false} })
      } else {
        throw new Error("Something went wrong, please try again");
      }
      // const txid = await sendTransaction(hex, app.network);
      // save({txid, from: app.currentAddress, to: address, amount, token: ticker, timestamp: Date.now(), confirmed: false });
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
      return;
    }
  };

  return (
    <AppLayout showBack>
      <Box alignSelf="center" pad="small" width="medium" flex>
        {!!error && (<Text color="red" margin={{ bottom: "small" }}>{error}</Text>)}
        {ticker && balances.data[ticker.toLowerCase()] && (
          <Box>
            <Text textAlign="end">MAX SAFE</Text>
            <Box justify="end" margin={{ bottom: "medium" }} direction="row" gap="small">
              <Anchor onClick={() => {
                setAmount(balances.data[ticker.toLowerCase()])
              }}><Text>{balances.data[ticker.toLowerCase()]}</Text></Anchor>
              <Text>{ticker}</Text>
            </Box>
          </Box>
        )}
        <Box direction="row" gap="medium">          
          <Box flex="grow">
            <TextInput
              placeholder="Amount"
              onChange={(e) => setAmount(e.target.value)}
              max={balances.data[ticker?.toLowerCase() || ""]}
              value={amount}
            />
          </Box>
          <Box>
            <Select
              options={tickers}
              value={ticker}
              onChange={({ option }) => setTicker(option)}
            />
          </Box>
        </Box>
        <Box direction="row" gap="medium">
          <Box flex="grow" margin={{ top: "large" }}>
            <TextInput
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Box>
        </Box>
        <SetFees />
        {loading && <Spinner margin={{ top: "large" }} />}
        <Button
          primary
          onClick={send}
          label="Send"
          margin={{ top: "medium" }}
          disabled={loading}
        />
      </Box>
    </AppLayout>
  );
};
