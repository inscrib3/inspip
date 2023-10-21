import { Layer, Box, Text, Button } from 'grommet';

export function ShowMnemonicModal({ mnemonic, onClose}: { mnemonic: string, onClose: any }) {
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
            <Text textAlign="center" style={{wordBreak: 'break-all'}}>
              {mnemonic}
            </Text>
            <Button label="Close" onClick={onClose} />
          </Box>
        </Layer>
  );
}
