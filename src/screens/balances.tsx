import { Box, Text, Button, InfiniteScroll, Header, Tag, Tabs, Tab, Avatar, Menu } from "grommet";
import { useGetBalances } from "../hooks";
import { useApp } from "../app";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "../router";
import { Layout } from "../components";
import { Clock, MoreVertical, Ticket } from "grommet-icons";
import { truncateInMiddle } from "../utils/truncate-in-middle";
import { useState } from "react";
import { ShowAddressModal } from "./modals/show-address";
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

  const [isModalOpen, setModalOpen] = useState(false);

  const handleToggleModal = () => {
    setModalOpen(prevState => !prevState);
  };

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

  const send = () => {
    navigate(RoutePath.Send);
  };

  return (
    <Layout showLogo actions={[
      {
        render: () => (
          <Menu
            label=""
            icon={<MoreVertical />}
            items={[
              { label: 'Export', onClick: () => {} },
              { label: 'Help', onClick: () => {} },
            ]}
          />
        ),
      },
    ]}>
      <Box height="full">
        <Box
          width="100%"
          align="center"
          margin={{ bottom: "medium" }}
          pad={{ horizontal: "large", vertical: "small" }}
        >
          <Tag name={truncateInMiddle(app.currentAddress, 10)} value="" />
          <Text size="32px" weight="bold">
            {balances.data.btc}&nbsp;BTC
          </Text>
          <Text weight="lighter">$145.21</Text>
        </Box>
        <Box margin={{ vertical: "large" }} gap="medium" direction="row" justify="center">
          <Button label="Receive" onClick={handleToggleModal} />
          <Button label="Send" onClick={send} />
          <Button label="Swap" />
        </Box>
        {isModalOpen && <ShowAddressModal onClose={handleToggleModal} />}
        <Box flex overflow="auto" margin="large">
          <Tabs>
            <Tab title="Tokens">
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
                <Box direction="row" gap="small" align="center">
                  <Avatar src="//s.gravatar.com/avatar/b7fb138d53ba0f573212ccce38a7c43b?s=80" />
                  <Box direction="column">
                    <Text>{balance.toUpperCase()}</Text>
                    <Text>ID</Text>
                  </Box>
                  <Text weight="bold" margin={{ left: 'auto' }}>{balances.data[balance]}</Text>
                </Box>
              </Box>
            )}
          </InfiniteScroll>
          <Text>Import token</Text>
            </Tab>
            <Tab title="Transactions">
              <InfiniteScroll items={app.transactions}>
                {(transaction: any) => (
                  <Box direction="row" gap="small" align="center">
                    <Avatar background="brand">
                      {transaction.status === 'confirmed' ? (
                        <Ticket color="text-strong" />
                      ) : (
                        <Clock color="text-strong" />
                      )}
                    </Avatar>
                    <Text margin={{ left: 'auto' }}>{transaction.description}</Text>
                  </Box>
                )}
              </InfiniteScroll>
            </Tab>
          </Tabs>
        </Box>
      </Box>
    </Layout>
  );
};
