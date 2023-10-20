import { useState } from "react";
import { Text, Image, Box, TextInput, Button, Spinner } from "grommet";
import { Layout } from "../components";
import { useRestoreWallet } from "../hooks";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "../router";

export const RestoreWallet = (): JSX.Element => {
  const restoreWallet = useRestoreWallet();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");

  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    seedPhrase?: string;
    error?: string;
  }>({});

  const onRestoreWallet = async () => {
    if (!password) {
      setErrors({
        password: "Password is required",
      });
      return;
    } else if (
      !password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
    ) {
      setErrors({
        password:
          "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character",
      });
      return;
    } else if (password !== confirmPassword) {
      setErrors({
        confirmPassword: "Passwords do not match",
      });
      return;
    }

    try {
      await restoreWallet.dispatch(seedPhrase);
    } catch (e) {
      setErrors({
        error: (e as Error).message,
      });
      return;
    }

    navigate(RoutePath.Balances);
  };

  return (
    <Layout showBack>
      <Box fill align="center" justify="center">
      <Box align="center" gap="medium">
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
          <Text size="small" color="status-critical" margin={{ top: "medium" }}>
            {errors.password}
          </Text>
        )}
      </Box>
      <Box>
        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          type="password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          width="100%"
        />
        {!!errors.confirmPassword && (
          <Text size="small" color="status-critical" margin={{ top: "medium" }}>
            {errors.confirmPassword}
          </Text>
        )}
      </Box>
      <Box align="center">
        <TextInput
          placeholder="Seed Phrase"
          value={seedPhrase}
          onChange={(e) => setSeedPhrase(e.target.value)}
        />
      </Box>
      {!!errors.seedPhrase && (
        <Text size="small" color="status-critical">
          {errors.seedPhrase}
        </Text>
      )}
      {restoreWallet.loading && <Spinner />}
      <Box>
        <Button
          primary
          label="Restore Wallet"
          style={{ width: "100%" }}
          onClick={onRestoreWallet}
          disabled={restoreWallet.loading}
        />
      </Box>
      </Box>
      </Box>
    </Layout>
  );
};
