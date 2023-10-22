import { Layer, Box, Button, Text } from 'grommet';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../../router';

export function ResetStorageModal({ onClose}: { onClose: any }) {
  const navigate = useNavigate();

  const reset = () => {
    localStorage.clear();
    navigate(RoutePath.Root);
  };

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
          <Text>Are you sure you want to reset this wallet storage?</Text>
          <Text color="status-critical">This action cannot be undone.</Text>
          <Box direction="row" gap="small">
            <Button primary label="Yes" onClick={reset} />
            <Button secondary label="No" onClick={onClose} />
          </Box>
        </Box>
      </Layer>
    );
}
