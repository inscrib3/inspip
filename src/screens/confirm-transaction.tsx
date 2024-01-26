import { useLocation, useNavigate } from "react-router-dom";
import { Address } from "@cmdcode/tapscript";
import { Layout } from "../components";
import { Accordion, AccordionPanel, Box, Button, Footer, Text } from "grommet";
import { truncateInMiddle } from "../utils/truncate-in-middle";
import { sendTransaction } from "../bitcoin/node";
import { useApp } from "../app";
import { save } from "../hooks/show-transactions.hook";
import { useState } from "react";

export const ConfirmTransaction = (): JSX.Element => {
  const location = useLocation();
  const app = useApp();
  const navigate = useNavigate();
    const [error, setError] = useState("");

  const goBack = () => {
    navigate(-1);
  };

  const onSend = async () => {
    try {
        const txid = await sendTransaction(location.state.tx.hex, app.network);
        if (location.state.tx.ticker && location.state.tx.ticker !== '') {
            save({txid, from: app.currentAddress, to: location.state.tx.to, amount: location.state.tx.amount, token: `${location.state.tx.ticker.toUpperCase()}:${location.state.tx.id}`, timestamp: Date.now(), confirmed: false });
        } else {
            save({txid, from: app.currentAddress, to: location.state.tx.to, amount: (parseInt(location.state.tx.sats_amount) / Math.pow(10, 8)).toString(), timestamp: Date.now(), confirmed: false });
        }
        if(location.state.fromWeb){
          chrome.runtime.sendMessage({ message: `ReturnSendBitcoin;${txid}`});
          setTimeout(()=>{
            window.close();
          },1000)
        } else {
          navigate(-2);
        }
    } catch (e) {
        setError((e as Error).message);
    }
  };

  return (
    <Layout showBack>
      <Box height="full" style={{ overflow: "scroll" }}>
        {!!error && (<Text color="red" margin={{ bottom: "small" }}>{error}</Text>)}
        <Accordion>
          <AccordionPanel
            label={<Text margin={{ vertical: "small" }}>Inputs</Text>}
          >
            <Box pad="small" background="background-contrast">
              {location.state.tx.vin.map((vin: any, vinIndex: number) => (
                <Box
                  key={`vin-${vinIndex}`}
                  justify="between"
                  margin={{ vertical: "small" }}
                >
                  <Text>
                    {truncateInMiddle(
                      Address.fromScriptPubKey(vin.prevout.scriptPubKey),
                      20
                    )}
                  </Text>
                  <Text weight="bold">{vin.prevout.value} sats</Text>
                </Box>
              ))}
            </Box>
          </AccordionPanel>
          <AccordionPanel
            label={<Text margin={{ vertical: "small" }}>Outputs</Text>}
          >
            <Box pad="small" background="background-contrast">
              {location.state.tx.vout.map((vout: any, voutIndex: number) => (
                <Box
                  key={`vout-${voutIndex}`}
                  justify="between"
                  margin={{ vertical: "small" }}
                >
                  {typeof vout.value !== "undefined" ? (
                    <>
                      <Text>
                        {truncateInMiddle(
                          Address.fromScriptPubKey(vout.scriptPubKey),
                          20
                        )}
                      </Text>
                      <Text weight="bold">{vout.value} sats</Text>
                    </>
                  ) : (
                    <Box flex>
                      <Box margin={{ bottom: "small" }} justify="between">
                        <Text>Amount out</Text>
                        <Text weight="bold">
                          {location.state.tx.amount}{" "}
                          {`${location.state.tx.ticker}:${location.state.tx.id}`}
                        </Text>
                      </Box>
                      <Box margin={{ top: "small" }} justify="between">
                        <Text>Amount change</Text>
                        <Text weight="bold">
                          {location.state.tx.change}{" "}
                          {`${location.state.tx.ticker}:${location.state.tx.id}`}
                        </Text>
                      </Box>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </AccordionPanel>
        </Accordion>
      </Box>
      <Footer pad="small">
        <Box flex>
          <Box
            pad={{ vertical: "medium", horizontal: "small" }}
            background="background-contrast"
            direction="row"
            justify="between"
            margin={{ vertical: "small", bottom: "large" }}
            flex
          >
            <Text>Fee</Text>
            <Text weight="bold">{location.state.tx.fee} sats</Text>
          </Box>
          <Box direction="row" flex justify="between" gap="large">
            <Button
              secondary
              label="Reject"
              style={{ width: "100%" }}
              onClick={goBack}
            />
            <Button
              primary
              label="Send"
              style={{ width: "100%" }}
              onClick={onSend}
            />
          </Box>
        </Box>
      </Footer>
    </Layout>
  );
};