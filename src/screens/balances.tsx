import {
  Box,
  Text,
  Button,
  InfiniteScroll,
  Tabs,
  Tab,
  Menu,
  Anchor,
  Spinner,
} from "grommet";
import { useGetBalances } from "../hooks";
import { useApp } from "../app";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "../router";
import { Layout } from "../components";
import { MoreVertical } from "grommet-icons";
import { truncateInMiddle } from "../utils/truncate-in-middle";
import { useEffect, useMemo, useRef, useState } from "react";
import { ShowAddressModal } from "./modals/show-address";
import { satsToDollars } from "../utils/sats-to-dollars";
import { getBitcoinPrice } from "../utils/bitcoin-price";
import { ShowMnemonicModal } from "./modals/show-mnemonic";
import { Transaction, load } from "../hooks/show-transactions.hook";
import { ResetStorageModal } from "./modals/reset-storage";

export const Balances = () => {
  const app = useApp();
  const balances = useGetBalances();
  const navigate = useNavigate();
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(0);
  const [isAddressModalOpen, setAddressModalOpen] = useState(false);
  const [isMnemonicModalOpen, setMnemonicModalOpen] = useState(false);
  const [isResetModalOpen, setResetModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const balancesWithoutBTC = Object.keys(balances.data)
    .sort()
    .filter((balance) => balance !== "btc" && balance !== "sats");

  useEffect(() => {
    if (!app.currentAddress) {
      navigate(RoutePath.Root);
    }
  }, []);

  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    getBitcoinPrice().then((price) => {
      setBitcoinPrice(price);
    });

    setTransactions(
      load()
        .filter((t) => t.from === app.currentAddress)
        .reverse()
    );
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

  return (
    <Layout
      showLogo
      actions={[
        {
          render: () => (
            <Menu
              key={0}
              label={""}
              icon={<MoreVertical />}
              items={[
                {
                  label: "Export",
                  onClick: () => {
                    handleToggleMnemonicModal();
                  },
                },
                {
                  label: "Exit",
                  onClick: () => {
                    setResetModalOpen(true);
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
        {isResetModalOpen && (
          <ResetStorageModal onClose={() => setResetModalOpen(false)} />
        )}
        <Box flex overflow="auto" margin={{ top: "medium" }}>
          {app.loading ? (
            <Box align="center" pad="medium">
              <Spinner size="medium" />
            </Box>
          ) : (
            <Tabs>
              <Tab title="TOKENS">
                <InfiniteScroll items={balancesWithoutBTC}>
                  {(balance: string, index: number) => (
                    <Box
                      key={index}
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
                    <Box
                      key={transaction.txid}
                      direction="row"
                      gap="small"
                      align="center"
                      border={{ color: "brand" }}
                      pad="medium"
                      margin={{ top: "medium" }}
                      style={{ borderRadius: "5px" }}
                    >
                      {/* 
                    <Box margin={{ right: "medium" }}>
                      {transaction.confirmed ? (
                        <Checkmark color="brand" />
                      ) : (
                        <Clock color="brand" />
                      )}
                    </Box> */}
                      <Anchor
                        color="white"
                        target="_blank"
                        href={`https://blockstream.info/${
                          app.network === "testnet" ? "testnet/" : ""
                        }tx/${transaction.txid}`}
                        style={{ wordBreak: "break-all" }}
                      >
                        {transaction.token ? (
                          <>
                            Sent {transaction.amount} {transaction.token} to{" "}
                            {truncateInMiddle(transaction.to, 20)}
                          </>
                        ) : (
                          <>
                            Sent {transaction.amount} BTC to{" "}
                            {truncateInMiddle(transaction.to, 20)}
                          </>
                        )}
                      </Anchor>
                    </Box>
                  )}
                </InfiniteScroll>
              </Tab>
            </Tabs>
          )}
        </Box>
      </Box>
    </Layout>
  );
};
