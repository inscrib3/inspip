import { useContext, useEffect, useState } from "react";
import { FeesResponse, getFees } from "../mempool/get-fees";
import { Box, Button, RangeInput, ResponsiveContext, TextInput } from "grommet";
import { useApp } from "../app";

export const SetFees = (): JSX.Element => {
  const app = useApp();

  const [fees, setFees] = useState<FeesResponse>({
    fastestFee: 0,
    halfHourFee: 0,
    hourFee: 0,
    economyFee: 0,
    minimumFee: 0,
  });

  const [selectedFee, _setSelectedFee] = useState<
    "economyFee" | "halfHourFee" | "custom"
  >("halfHourFee");

  const [customFee, setCustomFee] = useState<number>(fees.fastestFee);

  const onCustomFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) return setCustomFee(0);
    const value = parseInt(event.target.value, 10);
    setCustomFee(value);
    app.setFeerate(value);
  };

  useEffect(() => {
    getFees().then((fees) => {
      setFees(fees);
      setCustomFee(fees.fastestFee);
      if (selectedFee === "custom") return;
      app.setFeerate(fees[selectedFee]);
    });

    setInterval(() => {
      getFees().then((fees) => {
        setFees(fees);
        setCustomFee(fees.fastestFee);
        if (selectedFee === "custom") return;
        app.setFeerate(fees[selectedFee]);
      });
    }, 10000);
  }, []);

  const size = useContext(ResponsiveContext);

  const setSelectedFee = (fee: "economyFee" | "halfHourFee" | "custom") => {
    _setSelectedFee(fee);
    if (fee === "custom") {
      app.setFeerate(customFee);
      return;
    }
    app.setFeerate(fees[fee]);
  }

  return (
    <>
      <Box
        direction="row"
        gap="small"
        margin={{
          top: "medium",
          bottom: selectedFee === "custom" ? "" : "",
        }}
        justify={size !== "small" ? "center" : "start"}
        overflow={{ horizontal: "scroll" }}
      >
        <Button
          primary={selectedFee === "economyFee"}
          label={`Economy: ${fees.economyFee} sats/vB`}
          onClick={() => setSelectedFee("economyFee")}
          size="small"
        />
        <Button
          primary={selectedFee === "halfHourFee"}
          label={`Normal: ${fees.halfHourFee} sats/vB`}
          onClick={() => setSelectedFee("halfHourFee")}
          size="small"
        />
        <Button
          primary={selectedFee === "custom"}
          label={`Custom`}
          onClick={() => setSelectedFee("custom")}
          size="small"
        />
      </Box>
      {selectedFee === "custom" && (
        <Box direction="row" gap="small" pad={{ top: "small" }} align="center">
          <RangeInput
            min={fees.minimumFee}
            max={500}
            value={customFee}
            onChange={onCustomFee}
          />
          <Box width="small">
            <TextInput
              placeholder="Custom"
              size="small"
              value={customFee}
              onChange={onCustomFee}
            />
          </Box>
        </Box>
      )}
    </>
  );
};
