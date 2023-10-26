import { Box, Button, Header, Text } from "grommet";
import * as Icons from "grommet-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { RoutePath } from "../router";

export const Mnemonic = () => {
  const navigate = useNavigate();
  const params = useLocation() as { state:  { mnemonic: string } };
  const mnemonic = params.state?.mnemonic || "";

  const mnemonicGrid = mnemonic.split(" ").reduce((acc, word, index) => {
    if (index % 3 === 0) {
      acc.push([]);
    }
    acc[acc.length - 1].push(word);
    return acc;
  }, [] as string[][]);

  const onBalances = async () => {
    navigate(RoutePath.Balances);
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <Box height="full">
      <Header pad="medium">
        <Button icon={<Icons.LinkPrevious />} onClick={goBack} />
      </Header>
      <Box align="center" justify="center" flex="grow" margin={{ horizontal: "small" }}>
        <Box>
          <Text margin={{ bottom: "small" }}>Save this seed phrase in a secure place</Text>
          {mnemonicGrid.map((row, rowIndex) => (
            <Box direction="row" gap="small" key={rowIndex}>
              {row.map((word, wordIndex) => (
                <Box
                  border={{ color: "brand" }}
                  flex
                  margin="small"
                  pad="small"
                  key={wordIndex}
                >
                  <Text
                    weight="bold"
                    size="small"
                    style={{ userSelect: "none" }}
                  >
                    {rowIndex * 3 + wordIndex + 1}{". "}
                  </Text>
                  <Text
                    weight="bold"
                    size="small"
                    style={{ wordBreak: "break-all" }}
                  >
                    {word}
                  </Text>
                </Box>
              ))}
            </Box>
          ))}
          <Box margin={{ top: "medium" }}>
            <Button
              primary
              label="Next"
              style={{ width: "100%" }}
              onClick={onBalances}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
