import { Header, Box, Button, Select, TextInput, Text } from "grommet";
import * as Icons from "grommet-icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { validateAddress } from "../lib/utils";
import { SetFees } from "../components";
import { useSendSats, useSendTokens, useGetBalances } from "../hooks";
import { useApp } from "../app";

export const Send = () => {
  const navigate = useNavigate();
  const app = useApp();
  const sendSats = useSendSats();
  const sendTokens = useSendTokens();
  const balances = useGetBalances();
  const [ticker, setTicker] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [fee] = useState<string>("10");
  const [error, setError] = useState<string>("");

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
    if(BigInt(amount) <= 0) {
      setError("Amount must be greater than zero");
      return;
    } else if(BigInt(fee) <= 0) {
        setError("Fee must be greater than zero");
      return;
    } else if(!validateAddress(address, app.network)) {
      console.log("Invalid address")
      setError("Invalid address");
      return;
    }
    setError("all good")
    return;
    if (ticker.toLowerCase() != "btc" || ticker.toLowerCase() == "sats") {
      await sendSats.dispatch(address, amount, fee);
      return;
    }
    const tickerSplit = ticker.split(":");
    await sendTokens.dispatch(
      address,
      tickerSplit[0],
      tickerSplit[1],
      amount,
      fee
    );
  };

  return (
    <Box height="full">
      <Header pad="medium">
        <Button icon={<Icons.LinkPrevious />} onClick={goBack} />
      </Header>
      <Box flex="grow" pad={{ horizontal: "large", vertical: "small" }}>
        {ticker && balances.data[ticker.toLowerCase()] && (
          <Box justify="end" margin={{ bottom: "medium" }} direction="row" gap="small">
            <Text>{balances.data[ticker.toLowerCase()]}</Text>
            <Text>{ticker}</Text>
          </Box>
        )}
        <Box direction="row" gap="medium">          
          <Box flex="grow">
            <TextInput
              type="number"
              placeholder="Amount"
              onChange={(e) => setAmount(e.target.value)}
              max={balances.data[ticker?.toLowerCase() || ""]}
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
        <Text color="red">{error}</Text>
        <Button
          primary
          onClick={send}
          label="Send"
          margin={{ top: "medium" }}
        />
      </Box>
    </Box>
  );
};
