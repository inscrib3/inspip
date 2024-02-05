import {
  Box,
  Text,
  Button,
  InfiniteScroll,
  Tip,
  Avatar,
  ResponsiveContext,
} from "grommet";
import { Next } from "grommet-icons";
import { Icon } from "../components/icon";
import { useGetBalances } from "../hooks";
import { IndexerToken, useApp } from "../app";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "../router";
import { truncateInMiddle } from "../utils/truncate-in-middle";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { satsToDollars } from "../utils/sats-to-dollars";
import { getBitcoinPrice } from "../utils/bitcoin-price";
import { Transaction, load } from "../hooks/show-transactions.hook";
import { colors } from "../theme";
import { AppLayout } from "../components/app-layout";

const TipContent = ({ message }: { message: string }) => (
  <Box direction="row" align="center" pad={{ right: "xsmall" }}>
    <Box
      background={colors.secondary}
      direction="row"
      pad={{ horizontal: "small", vertical: "xxsmall" }}
      round="xsmall"
    >
      <Text size="small">{message}</Text>
    </Box>
    <svg
      style={{ marginLeft: -6, zoom: 0.7 }}
      viewBox="0 0 22 22"
      version="1.1"
      width="22px"
      height="22px"
    >
      <polygon fill={colors.secondary} points="6 2 18 12 6 22" />
    </svg>
  </Box>
);

const hexToUrl = (metadata: string, mimeType: string) => {
  const input = metadata.replace(/[^A-Fa-f0-9]/g, "");

  if (input.length % 2) {
    console.log("cleaned hex string length is odd.");
    return;
  }

  const binary = [];
  for (let i = 0; i < input.length / 2; i++) {
    const h = input.substr(i * 2, 2);
    binary[i] = parseInt(h, 16);
  }

  const byteArray = new Uint8Array(binary);
  return window.URL.createObjectURL(new Blob([byteArray], { type: mimeType }));
};

export const Balances = () => {
  const size = useContext(ResponsiveContext);
  const app = useApp();
  const balances = useGetBalances();
  const navigate = useNavigate();
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTransactions, setShowTransactions] = useState<boolean>(false);
  const [tokens, setTokens] = useState<IndexerToken[]>([]);

  useEffect(() => {
    (async () => {
      const tickers = Object.keys(balances.data);

      if (tickers.length === 0) return;

      const tokens: IndexerToken[] = [];

      for (const ticker of tickers) {
        if (ticker === "btc" || ticker === "sats") continue;

        try {
          const tickerParts = ticker.split(":");
          const token: IndexerToken = await (
            await fetch(
              `${import.meta.env.VITE_SERVER_HOST}/token/get/${
                tickerParts[0]
              }/${tickerParts[1]}`
            )
          ).json();
          token.amount = Number(balances.data[ticker]);
          tokens.push(token);
        } catch (e) {
          console.error(e);
        }
      }

      setTokens(tokens);
    })();
  }, [balances.data]);

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
      Math.floor(
        satsToDollars(parseFloat(balances.data.btc) * 100000000, bitcoinPrice)
      ) + " $"
    );
  }, [balances.data.btc, bitcoinPrice]);

  const send = (ticker?: string, id?: number) => {
    if (ticker && id) {
      navigate(RoutePath.Send, {
        state: {
          ticker: `${ticker.toUpperCase()}:${id}`,
        },
      });
    } else {
      navigate(RoutePath.Send);
    }
  };

  return (
    <AppLayout>
      <Box
        alignSelf="center"
        pad={{ vertical: "small", horizontal: "large" }}
        width="large"
        flex={false}
        align="center"
      >
        <Box
          background={colors.dark}
          style={{
            borderRadius: 8,
          }}
          direction="row"
          pad={{
            horizontal: "medium",
            vertical: size === "small" ? "medium" : "small",
          }}
          align="center"
          width="medium"
          onClick={() => navigate(RoutePath.Addresses)}
        >
          <Icon
            name="content_copy"
            style={{ color: colors.primary, cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              window.navigator.clipboard.writeText(app.currentAddress);
            }}
          />
          <Box overflow="hidden" flex align="center">
            <Text
              style={{ overflow: "hidden", textOverflow: "clip" }}
              size="small"
            >
              {truncateInMiddle(app.currentAddress, 30)}
            </Text>
          </Box>
          <Next color="white" size="small" />
        </Box>
      </Box>
      <Box alignSelf="center" pad="small" width="large" flex={false}>
        <Text textAlign="center" weight="bold" size="large">
          {balances.data.btc}&nbsp;
          <Text color={colors.secondary} size="large">
            BTC
          </Text>
        </Text>
        <Text size="small" textAlign="center">
          {dollars}
        </Text>
      </Box>
      <Box
        alignSelf="center"
        pad={{ vertical: "small", horizontal: "large" }}
        width="large"
        direction="row"
        justify="around"
        gap="large"
        flex={false}
      >
        <Box flex>
          <Button
            pad={{ horizontal: "none" }}
            style={{
              textTransform: "uppercase",
              letterSpacing: 0.2,
              fontSize: 14,
            }}
            label="Deploy"
            onClick={() =>
              navigate(RoutePath.Explore, {
                state: {
                  url: "https://inspip.com/deploy/ticker",
                },
              })
            }
          />
        </Box>
        <Box flex>
          <Button
            pad={{ horizontal: "none" }}
            style={{
              textTransform: "uppercase",
              letterSpacing: 0.2,
              fontSize: 14,
            }}
            label="Mint"
            onClick={() =>
              navigate(RoutePath.Explore, {
                state: {
                  url: "https://inspip.com/mint/ticker",
                },
              })
            }
          />
        </Box>
        <Box flex>
          <Button
            pad={{ horizontal: "none" }}
            style={{
              textTransform: "uppercase",
              letterSpacing: 0.2,
              fontSize: 14,
            }}
            label="Transfer"
            onClick={() => send()}
          />
        </Box>
      </Box>
      <Box
        alignSelf="center"
        pad={{ vertical: "medium", horizontal: "large" }}
        width="large"
        direction="row"
        gap="medium"
        flex={false}
      >
        <Button
          style={{
            backgroundColor: showTransactions
              ? "transparent"
              : colors.secondary,
            borderRadius: 16,
            borderWidth: !showTransactions ? 0 : 2,
            borderColor: !showTransactions ? "transparent" : colors.secondary,
            color: showTransactions ? "white" : "black",
          }}
          label="TOKENS"
          size="small"
          onClick={() => setShowTransactions(false)}
        />
        <Button
          style={{
            borderWidth: showTransactions ? 0 : 2,
            borderColor: showTransactions ? "transparent" : colors.secondary,
            borderRadius: 16,
            backgroundColor: !showTransactions
              ? "transparent"
              : colors.secondary,
            color: !showTransactions ? "white" : "black",
          }}
          label="ACTIVITY"
          size="small"
          onClick={() => setShowTransactions(true)}
        />
      </Box>
      <Box width="large" alignSelf="center" style={{ minHeight: 200 }} flex>
        <Box overflow="auto">
          {showTransactions ? (
            <InfiniteScroll items={transactions}>
              {(item: Transaction) => (
                <Box
                  pad={{
                    top: "small",
                    bottom: "small",
                    horizontal: "large",
                    right: "medium",
                  }}
                  direction="row"
                  gap="medium"
                  align="center"
                  justify="between"
                  flex={false}
                  style={{
                    borderBottomColor: colors.dark,
                    borderBottomWidth: 1,
                    borderBottomStyle: "solid",
                  }}
                  onClick={() =>
                    window.open(
                      "https://mempool.space/tx/" + item.txid,
                      "_blank"
                    )
                  }
                >
                  <Box direction="row" gap="medium" align="center">
                    <Box direction="row" gap="medium" align="center">
                      <Box
                        pad={{ vertical: "small", horizontal: "medium" }}
                        style={{
                          borderStyle: "solid",
                          borderWidth: 1,
                          borderColor: colors.secondary,
                          borderRadius: 8,
                        }}
                      >
                        <Text weight="bold" size="xsmall">
                          {item.timestamp &&
                            `${new Date(item.timestamp).toLocaleDateString(
                              "en-US",
                              {
                                month: "numeric",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                              }
                            )}`}
                        </Text>
                      </Box>
                      <Text size="small" weight="bold">
                        {truncateInMiddle(item.to, 40)}
                      </Text>
                    </Box>
                  </Box>
                  <Box direction="row" gap="small" align="center">
                    <Tip
                      dropProps={{ align: { right: "left" } }}
                      content={<TipContent message="Amount" />}
                      plain
                    >
                      <Text
                        weight="bold"
                        size="small"
                        color="text-weak"
                        textAlign="end"
                      >
                        {item.token?.toUpperCase() || "BTC"}
                        <br />
                        {item.amount}
                      </Text>
                    </Tip>
                  </Box>
                </Box>
              )}
            </InfiniteScroll>
          ) : (
            <InfiniteScroll items={tokens}>
              {(item: IndexerToken) => (
                <Box
                  pad={{
                    top: "small",
                    bottom: "small",
                    horizontal: "large",
                    right: "medium",
                  }}
                  direction="row"
                  gap="medium"
                  align="center"
                  justify="between"
                  flex={false}
                  style={{
                    borderBottomColor: colors.dark,
                    borderBottomWidth: 1,
                    borderBottomStyle: "solid",
                  }}
                  onClick={() => send(item.ticker, item.id)}
                >
                  <Box direction="row" gap="medium" align="center">
                    <Avatar
                      style={{
                        borderColor: colors.secondary,
                        borderWidth: 2,
                        borderStyle: "solid",
                        borderRadius: 3,
                      }}
                      src={
                        item.metadata && item.mime
                          ? hexToUrl(item.metadata, item.mime)
                          : item.ref
                          ? item.ref.replace(
                              "ipfs://",
                              "https://nftstorage.link/ipfs/"
                            )
                          : undefined
                      }
                      // src="https://nftstorage.link/ipfs/bafybeibwdjfdvhqkusqoi6q3dvmadyxfkkid4ior32gl3seegl2pykq6ke/0"
                      size="medium"
                    >
                      <Text weight="bold" size="small">
                        {item.ticker.toUpperCase()[0]}
                      </Text>
                    </Avatar>
                    <Box>
                      <Text weight="bold" size="small">
                        {item.ticker.toUpperCase()}:{item.id}
                      </Text>
                    </Box>
                  </Box>
                  <Box direction="row" gap="small" align="center">
                    <Tip
                      dropProps={{ align: { right: "left" } }}
                      content={<TipContent message="Amount" />}
                      plain
                    >
                      <Text weight="bold" size="small" color="text-weak">
                        {item.amount}
                      </Text>
                    </Tip>
                    <Next color={colors.inactive} size="small" />
                  </Box>
                </Box>
              )}
            </InfiniteScroll>
          )}
        </Box>
      </Box>
    </AppLayout>
  );
};
