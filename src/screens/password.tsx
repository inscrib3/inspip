import { Box, Button, Image, TextInput, Text, Spinner } from "grommet";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "../router";
import { useApp } from "../app";
import { importWallet } from "../bitcoin/wallet";
import { loadWallet } from "../bitcoin/wallet-storage";
import { ResetStorageModal } from "./modals/reset-storage";
import { getPasswordFromSettings, savePasswordInSettings } from "../app/settings";

export const Password = () => {
  const navigate = useNavigate();
  const app = useApp();
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isResetModalOpen, setResetModalOpen] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    error?: string;
  }>({});

  useEffect(() => {
    const pass = getPasswordFromSettings();
    if(pass) {
      handleLoadWallet(pass);
    }
  }, [])

  const handleLoadWallet = (pass: string) => {
    setLoading(true);

    try {
      const wallet = loadWallet(pass);
      
      if (wallet.mnemonic === "") {
        throw new Error("Invalid password");
      }

      app.setAccount(importWallet(wallet.mnemonic, wallet.network, wallet.addressIndex));
      app.setNetwork(wallet.network);
      app.setCurrentAddress(wallet.currentAddress, wallet.addressIndex)
      app.setAddresses(wallet.addresses);
    } catch(e) {
      setErrors({
        error: (e as Error).message,
      });
      setLoading(false);
      return;
    }

    setLoading(false);

    navigate(RoutePath.Balances);
  }

  const onNext = async () => {
    setErrors({});

    if (!password) {
      setErrors({
        password: "Password is required",
      });
      return;
    }

    savePasswordInSettings(password);

    handleLoadWallet(password);
  };

  return (
    <Box height="full">
      <Box align="center" justify="center" flex="grow">
        <Box gap="medium">
          <Image src="/logo.svg" width={50} />
          {!!errors.error && (
            <Text size="small" color="status-critical">
              {errors.error}
            </Text>
          )}
          <Box>
            <TextInput
              placeholder="Password"
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              width="100%"
            />
            {!!errors.password && (
              <Text
                size="small"
                color="status-critical"
                margin={{ top: "medium" }}
              >
                {errors.password}
              </Text>
            )}
          </Box>
          {isResetModalOpen && (
          <ResetStorageModal onClose={() => setResetModalOpen(false)} />
          )}
          {loading && <Spinner />}
          <Box direction="column" gap="small">
            <Button
              primary
              label="Next"
              style={{ width: "100%" }}
              onClick={onNext}
              disabled={loading}
            />
            <Button
              secondary
              label="Reset"
              style={{ width: "100%" }}
              onClick={() => setResetModalOpen(true)}
              disabled={loading}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
