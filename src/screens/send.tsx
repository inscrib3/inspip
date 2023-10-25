import { Header, Box, Button, Select, TextInput, Text, Spinner, Anchor } from "grommet";
import * as Icons from "grommet-icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getNetwork, validateAddress } from "../bitcoin/helpers";
import { SetFees } from "../components";
import { useSendSats, useSendTokens } from "../hooks";
import { useApp } from "../app";
import { sendTransaction } from "../bitcoin/node";
import { save } from "../hooks/show-transactions.hook";
import { useSafeBalances } from "../hooks/safe-balances.hook";

export const Send = () => {
  const navigate = useNavigate();
  const app = useApp();
  const sendSats = useSendSats();
  const sendTokens = useSendTokens();
  const balances = useSafeBalances();
  const [ticker, setTicker] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
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

  const goBack = () => {
    navigate(-1);
  };

  const send = async () => {
    setError("");

    if(!validateAddress(address, getNetwork(app.network))) {
      setError("Invalid address");
      return;
    }

    const splittedTicker = ticker.split(":");

    const token = app.tokens.filter((t) => t.tick === splittedTicker[0].toLowerCase() && t.id === parseInt(splittedTicker[1]));

    if (
      ticker.toLowerCase() !== 'btc'
      && Math.floor(parseFloat(amount) * Math.pow(10, token[0].dec)) === 0) {
      setError(`Amount exceeds ${token[0].dec} decimals`);
      return;
    } else if (ticker.toLowerCase() === 'btc' && Math.floor(parseFloat(amount) * Math.pow(10, 8)) === 0) {
      setError("Amount exceeds 8 decimals");
      return;
    }

    setLoading(true);

    if (ticker.toLowerCase() === "btc") {
      try {
        const hex = await sendSats.dispatch(address, `${Math.floor(parseFloat(amount) * Math.pow(10, 8))}`, `${app.feerate}`);
        const txid = await sendTransaction(hex, app.network);
        save({txid, from: app.currentAddress, to: address, amount, timestamp: Date.now(), confirmed: false });
        navigate(-1);
      } catch (e) {
        setError((e as Error).message);
      }
      setLoading(false);
      return;
    }

    const tickerSplit = ticker.split(":");

    try {
      const hex = await sendTokens.dispatch(
        address,
        tickerSplit[0],
        tickerSplit[1],
        amount,
        `${app.feerate}`
      );
      const txid = await sendTransaction(hex, app.network);
      save({txid, from: app.currentAddress, to: address, amount, token: ticker, timestamp: Date.now(), confirmed: false });
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate(-1);
  };

  return (
    <Box height="full">
      <Header pad="medium">
        <Button icon={<Icons.LinkPrevious />} onClick={goBack} />
      </Header>
      <Box flex="grow" pad={{ horizontal: "large", vertical: "small" }}>
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
    </Box>
  );
};
