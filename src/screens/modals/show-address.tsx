import { Layer, Box, Button, Text } from 'grommet';
import QRCode from 'qrcode.react';
import { useApp } from '../../app';

export function ShowAddressModal({ onClose}: { onClose: any }) {
  const app = useApp();

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
          <QRCode value={app.currentAddress} />
          <Text>{app.currentAddress}</Text>
          <Button label="Close" onClick={onClose} />
        </Box>
      </Layer>
    );
}
