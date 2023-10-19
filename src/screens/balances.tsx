import { Box, Text, Button, InfiniteScroll } from "grommet";
import { useGetBalances } from "../hooks";
import { useApp } from "../app";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "../router";
import { Layout } from "../components";
/*
import { useEffect, useState } from "react";
import { utxos } from "../mempool/utxos";
*/

export const Balances = () => {
  const app = useApp();
  const balances = useGetBalances();
  const navigate = useNavigate();
  const balancesWithoutBTC = Object.keys(balances.data).filter(
    (balance) => balance !== "btc" && balance !== "sats"
  );
  /*const [btcBalance, setBtcBalance] = useState<string>("0");

  useEffect(() => {
    (async () => {
      const _utxos = await utxos();
      console.log(_utxos);
      _btcBalance = _utxos.reduce((acc, utxo) => acc + utxo.value, 0);
      console.log(_btcBalance);
      setBtcBalance(_btcBalance.toString());
    })();
  }, []);*/

  const receive = () => {};

  const send = () => {
    navigate(RoutePath.Send);
  };

  return (
    <Layout
      showLogo
    >
      <Box height="full">
        <Box
          width="100%"
          style={{ overflow: "scroll" }}
          align="center"
          margin={{ bottom: "medium" }}
          pad={{ horizontal: "large", vertical: "small" }}
        >
          <Text size="32px" weight="bold">
            {balances.data.btc} BTC
          </Text>
        </Box>
        <Box pad={{ horizontal: "large", vertical: "small" }} style={{ overflow: "scroll" }}>
          <Text>{app.address}</Text>
        </Box>
        <Box margin={{ vertical: "large" }} gap="medium" direction="row" justify="center">
          <Button label="RECEIVE" onClick={receive} />
          <Button label="SEND" onClick={send} />
        </Box>
        <Box flex overflow="auto" margin="large">
          <InfiniteScroll items={balancesWithoutBTC}>
            {(balance: string) => (
              <Box
                key={balance}
                direction="row"
                gap="small"
                align="center"
                border={{ color: "brand" }}
                pad="large"
                margin={{ bottom: "medium" }}
                style={{ borderRadius: "5px" }}
              >
                <Box width="small">
                  <Text weight="bold">{balance.toUpperCase()}</Text>
                </Box>
                <Box width="small" align="end">
                  <Text>{balances.data[balance]}</Text>
                </Box>
              </Box>
            )}
          </InfiniteScroll>
        </Box>
        </Box>
    </Layout>
  );
};
