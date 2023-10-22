import { Layer, Box, Button, Text } from 'grommet';
import QRCode from 'qrcode.react';
import { useApp } from '../../app';

export function ShowAddressModal({ onClose }: { onClose: any }) {
  const app = useApp();

  return (
    <Layer
      onEsc={onClose}
      onClickOutside={onClose}
      responsive={false}
      position="center"
      background={{ color: 'black', opacity: 'medium' }}
    >
      <Box 
        pad="large" 
        gap="medium" 
        align="center" 
        elevation="large"
        round="small"
        background="white"
        width="medium"
      >
        <QRCode value={app.currentAddress} size={128} />
        <Text 
          style={{ fontFamily: "monospace", maxWidth: "100%", wordWrap: "break-word" }}
          margin={{ top: 'small' }}
        >
          {app.currentAddress}
        </Text>
        <Button 
          label="Close" 
          onClick={onClose} 
          primary
          margin={{ top: 'medium' }}
        />
      </Box>
    </Layer>
  );
}
