import { Box, Text, Button, InfiniteScroll, Tabs, Tab, Avatar, Menu, Anchor } from "grommet";
import { useGetBalances } from "../hooks";
import { useApp } from "../app";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "../router";
import { Layout } from "../components";
import { Clock, MoreVertical, Ticket } from "grommet-icons";
import { truncateInMiddle } from "../utils/truncate-in-middle";
import { useEffect, useMemo, useState } from "react";
import { ShowAddressModal } from "./modals/show-address";
import { satsToDollars } from "../utils/sats-to-dollars";
import { getBitcoinPrice } from "../utils/bitcoin-price";
import { ShowMnemonicModal } from "./modals/show-mnemonic";
import { Transaction, load } from "../hooks/show-transactions.hook";

/*
import { useEffect, useState } from "react";
import { utxos } from "../mempool/utxos";
*/

export const Balances = () => {
  const app = useApp();
  const balances = useGetBalances();
  const navigate = useNavigate();
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(0);
  const [isAddressModalOpen, setAddressModalOpen] = useState(false);
  const [isMnemonicModalOpen, setMnemonicModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const balancesWithoutBTC = Object.keys(balances.data).filter(
    (balance) => balance !== "btc" && balance !== "sats"
  );

  useEffect(() => {
    getBitcoinPrice().then((price) => {
      setBitcoinPrice(price);
    });

    setTransactions(load());
  }, []);

  const dollars = useMemo(() => {
    if (bitcoinPrice === 0 || balances.data.btc === "0") return "";
    return (
      "$ " +
      satsToDollars(parseFloat(balances.data.btc) * 100000000, bitcoinPrice)
    );
  }, [balances.data.btc, bitcoinPrice]);

  const handleToggleAddressModal = () => {
    setAddressModalOpen((prevState) => !prevState);
  };

  const handleToggleMnemonicModal = () => {
    setMnemonicModalOpen((prevState) => !prevState);
  };

  const send = () => {
    navigate(RoutePath.Send);
  };

  const exit = () => {
    // @todo add confirmation
    localStorage.clear();
    navigate(RoutePath.Root);
  };

  return (
    <Layout
      showLogo
      actions={[
        {
          render: () => (
            <Menu
              label=""
              icon={<MoreVertical />}
              items={[
                {
                  label: "Export",
                  onClick: () => {
                    handleToggleMnemonicModal();
                  },
                },
                { label: "Help", onClick: () => {} },
                {
                  label: "Exit",
                  onClick: () => {
                    exit();
                  },
                },
              ]}
            />
          ),
        },
      ]}
    >
      <Box height="full">
        <Box
          width="100%"
          align="center"
          margin={{ bottom: "medium" }}
          pad={{ horizontal: "large", top: "small" }}
        >
          <Button
            secondary
            onClick={() => navigate(RoutePath.Addresses)}
            style={{ borderColor: "grey" }}
            label={truncateInMiddle(app.currentAddress, 20)}
            size="small"
          ></Button>
          <Text size="large" weight="bold" margin={{ top: "small" }}>
            {balances.data.btc}&nbsp;BTC
          </Text>
          <Text weight="lighter" size="small">
            {dollars}
          </Text>
        </Box>
        <Box gap="medium" direction="row" justify="center">
          <Button
            size="small"
            label="Receive"
            onClick={handleToggleAddressModal}
          />
          <Button size="small" label="Send" onClick={send} />
        </Box>
        {isMnemonicModalOpen && (
          <ShowMnemonicModal onClose={handleToggleMnemonicModal} />
        )}
        {isAddressModalOpen && (
          <ShowAddressModal onClose={handleToggleAddressModal} />
        )}
        <Box flex overflow="auto" margin={{ top: "medium" }}>
          <Tabs>
            <Tab title="TOKENS">
              <InfiniteScroll items={balancesWithoutBTC}>
                {(balance: string) => (
                  <Box
                    key={balance}
                    direction="row"
                    gap="small"
                    align="center"
                    border={{ color: "brand" }}
                    pad="medium"
                    margin={{ top: "medium" }}
                    style={{ borderRadius: "5px" }}
                  >
                    <Box flex>
                      <Text>{balance.toUpperCase()}</Text>
                    </Box>
                    <Text weight="bold">{balances.data[balance]}</Text>
                  </Box>
                )}
              </InfiniteScroll>
            </Tab>
            <Tab title="TRANSACTIONS">
              <InfiniteScroll items={transactions}>
                {(transaction: Transaction) => (
                  <Box direction="row" gap="small" align="center">
                    <Avatar background="brand">
                      {transaction.confirmed ? (
                        <Ticket color="text-strong" />
                      ) : (
                        <Clock color="text-strong" />
                      )}
                    </Avatar>
                    <Text margin={{ left: "auto" }}>
                      <Anchor href={`https://mempool.space/tx/${transaction.txid}`}>{transaction.description}</Anchor>
                    </Text>
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
