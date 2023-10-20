import { useState } from "react";
import { Text, Image, Box, TextInput, Button, Spinner } from "grommet";

import { Layout } from "../components";
import { useCreateWallet } from "../hooks";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "../router";

export const CreateWallet = (): JSX.Element => {
  const createWallet = useCreateWallet();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    error?: string;
  }>({});

  const onCreateWallet = async () => {
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

    //await generateName(password);

    let data: any;

    try {
      data = await createWallet.dispatch();
    } catch (e) {
      setErrors({
        error: (e as Error).message,
      });
      return;
    }

    navigate(RoutePath.Mnemonic, { state: { mnemonic: data.mnemonic } });
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
        <Box gap="large">
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
        {createWallet.loading && <Spinner />}
        <Box>
          <Button
            primary
            label="Create Wallet"
            style={{ width: "100%" }}
            onClick={onCreateWallet}
            disabled={createWallet.loading}
          />
        </Box>
      </Box>
      </Box>
    </Layout>
  );
};
