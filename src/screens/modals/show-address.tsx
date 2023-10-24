import { Layer, Box, Button, Text } from 'grommet';
import QRCode from 'qrcode.react';
import { useApp } from '../../app';
import { useState } from 'react';

export function ShowAddressModal({ onClose }: { onClose: any }) {
  const app = useApp();
  const [copySuccess, setCopySuccess] = useState('');

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(app.currentAddress);
      setCopySuccess('Address Copied!');
    } catch (error) {
      console.error('Failed to copy: ', error);
    }
  };

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
          style={{ fontFamily: "monospace", maxWidth: "100%", wordWrap: "break-word", cursor: "pointer" }}
          margin={{ top: 'small' }}
          onClick={copyToClipboard}
        >
          {app.currentAddress}
        </Text>
        {copySuccess && (
          <Text color="status-ok" size="small">
            {copySuccess}
          </Text>
        )}
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
