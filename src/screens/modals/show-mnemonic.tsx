import { Layer, Box, Text, Button, TextInput } from 'grommet';
import { useState } from 'react';
import { loadWallet } from '../../lib/wallet';

export function ShowMnemonicModal({ onClose}: { onClose: any }) {
  const [mnemonic, setMnemonic] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const mnemonicGrid = () => {
    return mnemonic.split(" ").reduce((acc, word, index) => {
      if (index % 3 === 0) {
        acc.push([]);
      }
      acc[acc.length - 1].push(word);
      return acc;
    }, [] as string[][]);
  }

  const load = () => {
    try {
      const wallet = loadWallet(password);
      setMnemonic(wallet.mnemonic);
    } catch (e) {
      alert("Wrong password")
    }
  }

  return (
        <Layer
          onEsc={onClose}
          onClickOutside={onClose}
          responsive={false}
          position="center"
        >
          <Box
            pad="medium"
            gap="small"
            align="center"
            elevation="medium"
            round="small"
            background="white"
          >
            {mnemonic !== "" ? (
              <>
            {mnemonicGrid().map((row: any, rowIndex: number) => (
              <Box direction="row" gap="small" key={rowIndex}>
                {row.map((word: string, wordIndex: number) => (
                  <Box
                    border={{ color: "brand" }}
                    flex
                    margin="small"
                    pad="small"
                  >
                    <Text
                      weight="bold"
                      size="small"
                      style={{ wordBreak: "break-all" }}
                    >
                      {rowIndex * 3 + wordIndex + 1}. {word}
                    </Text>
                  </Box>
                ))}
              </Box>
            ))}
            </>
            ) : (
              <>
              <TextInput
                placeholder="Enter password"
                type="password"
                onChange={(event) => setPassword(event.target.value)} />
              <Button label="Show" onClick={() => load()} />
              </>
            )}
            <Button label="Close" onClick={onClose} />
          </Box>
        </Layer>
  );
}
