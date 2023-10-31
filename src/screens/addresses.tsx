import { Box, Button, InfiniteScroll, Text } from "grommet";
import { Layout } from "../components";
import { useAddress } from "../hooks/address.hook";
import { truncateInMiddle } from "../utils/truncate-in-middle";
import { Add } from "grommet-icons";
import * as bip39 from "bip39";
import { useApp } from "../app";

export const Addresses = (): JSX.Element => {
  const address = useAddress();
  const app = useApp();

  const isMnemo = bip39.validateMnemonic(app.account.mnemonic);

  return (
    <Layout showBack={true}>
      <Box height="full" pad="large">
        {isMnemo && (
          <Button
            secondary
            label="Add new address"
            icon={<Add />}
            pad="small"
            onClick={() => address.createAddress()}
          />
        )}
        <Box overflow="auto" flex margin={{ top: "large" }}>
          <InfiniteScroll items={address.data}>
            {(item: string, index: number) => (
              <Box
                flex="grow"
                background={address.address === item ? "brand" : undefined}
                onClick={() => address.switchAddress(item, index)}
                pad="medium"
                margin={{ bottom: "medium" }}
              >
                <Text size="small" weight="bold">
                  Account {index + 1}
                </Text>
                <Text size="small">{truncateInMiddle(item, 20)}</Text>
              </Box>
            )}
          </InfiniteScroll>
        </Box>
      </Box>
    </Layout>
  );
};
