import { Layer, Box, Text, Button, TextInput } from 'grommet';
import { useState } from 'react';
import { loadWallet } from '../../lib/wallet';

export function ShowMnemonicModal({ onClose}: { onClose: any }) {
  const [mnemonic, setMnemonic] = useState<string>("");
  const [password, setPassword] = useState<string>("");

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
            <Text textAlign="center" style={{wordBreak: 'break-all'}}>
              {mnemonic}
            </Text>
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
