import { Box, Button, InfiniteScroll, Text } from "grommet";
import { Layout } from "../components";
import { useAddress } from "../hooks/address.hook";
import { truncateInMiddle } from "../utils/truncate-in-middle";
import { Add } from "grommet-icons";

export const Addresses = (): JSX.Element => {
  const address = useAddress();

  return (
    <Layout showBack={true}>
      <Box height="full" pad="large">
        <Button
          secondary
          label="Add new address"
          icon={<Add />}
          pad="small"
          onClick={() => address.createAddress()}
        />
        <Box overflow="auto" flex margin={{ top: "large" }}>
          <InfiniteScroll items={address.data}>
            {(item: string, index: number) => (
              <Box
                pad="medium"
                key={item}
                background={address.address === item ? "brand" : undefined}
                onClick={() => address.setAddress(item)}
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
