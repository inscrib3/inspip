import { Box, Button, Image, TextInput, Text, Spinner } from "grommet";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { hashToString } from "../utils/hash-to-string";
import { RoutePath } from "../router";
import { useApp } from "../app";

export const Password = () => {
  const navigate = useNavigate();
  const app = useApp();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    password?: string;
    error?: string;
  }>({});

  const onNext = async () => {
    setErrors({});

    if (!password) {
      setErrors({
        password: "Password is required",
      });
      return;
    }

    const uuid = localStorage.getItem("uuid");
    const now = localStorage.getItem("now");
    const name = localStorage.getItem("name");

    if (!uuid || !now || !name) {
      setErrors({
        error: "Something went wrong",
      });
      return;
    }

    setLoading(true);

    const hash = await self.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(password + uuid + now)
    );

    if (hashToString(hash) !== name) {
      setErrors({
        password: "Incorrect password",
      });
      setLoading(false);
      return;
    }

    app.setName(name);
    app.setAddresses(JSON.parse(localStorage.getItem("addresses") || '[]'));
    app.setAddress(localStorage.getItem("address") || '');

    setLoading(false);

    navigate(RoutePath.Balances);
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
          {loading && <Spinner />}
          <Box>
            <Button
              primary
              label="Next"
              style={{ width: "100%" }}
              onClick={onNext}
              disabled={loading}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
