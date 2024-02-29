(function () {
  window.inspip = window.inspip || {};
  
  window.inspip.connect = function () {
    const event = new CustomEvent("ConnectWallet");
    window.dispatchEvent(event);
    return new Promise((resolve,reject) => {
      const eventListener = (event) => {
        if (event.type === "ReturnConnectWalletInfo") {
          window.removeEventListener("ReturnConnectWalletInfo", eventListener);
          const address = event.detail.message.split(';')[1];
          const pubkey = event.detail.message.split(';')[2];
          resolve({address,pubkey});
        }
        if (event.type === "ClientRejectConnectWalletInfo") {
          window.removeEventListener("ClientRejectConnectWalletInfo", eventListener);
          reject(new Error("ConnectWallet rejected by client"));
        }
      };

      window.addEventListener("ReturnConnectWalletInfo", eventListener);
      window.addEventListener("ClientRejectConnectWalletInfo", eventListener);
    });
  };

  window.inspip.sendBitcoin = function (toAddress, satoshi, feerate) {
    const message = {toAddress,satoshi:satoshi.toString(),feerate:feerate.toString()};
    const event = new CustomEvent("SendBitcoin", {detail: message});
    window.dispatchEvent(event);

    return new Promise((resolve) => {
      const eventListener = (event) => {
        if (event.type === "ReturnSendBitcoin") {
          window.removeEventListener("ReturnSendBitcoin", eventListener);
          const txId = event.detail.message.split(";")[1];
          resolve(txId);
        }
      };

      window.addEventListener("ReturnSendBitcoin", eventListener);
    });
  };

  window.inspip.sendTokens = function (ticker, id, toAddress, amount, feerate) {
    const message = {ticker, id, toAddress, amount:amount.toString(), feerate:feerate.toString()};
    const event = new CustomEvent("SendTokens", {detail: message});
    window.dispatchEvent(event);

    return new Promise((resolve) => {
      const eventListener = (event) => {
        if (event.type === "ReturnSendTokens") {
          window.removeEventListener("ReturnSendTokens", eventListener);
          const txId = event.detail.message.split(";")[1];
          resolve(txId);
        }
      };

      window.addEventListener("ReturnSendTokens", eventListener);
    });
  };

  window.inspip.signPsbt = function (psbt, toSignInputs, autoFinalized) {
    const message = {psbt, toSignInputs:JSON.stringify(toSignInputs), autoFinalized:autoFinalized.toString()};
    const event = new CustomEvent("SignPsbt", {detail: message});
    window.dispatchEvent(event);

    return new Promise((resolve,reject) => {
      const eventListener = (event) => {
        if (event.type === "ReturnSignPsbt") {
          window.removeEventListener("ReturnSignPsbt", eventListener);
          const signed = event.detail.message.split(';')[1];
          resolve(signed);
        }
        if (event.type === "ReturnErrorOnSignPsbt") {
          window.removeEventListener("ReturnErrorOnSignPsbt", eventListener);
          const error = event.detail.message.split(';')[1];
          reject(new Error(error));
        }
        if (event.type === "ClientRejectSignPsbt") {
          window.removeEventListener("ClientRejectSignPsbt", eventListener);
          reject(new Error("SignPsbt rejected by client"));
        }
      };

      window.addEventListener("ReturnSignPsbt", eventListener);
      window.addEventListener("ReturnErrorOnSignPsbt", eventListener);
      window.addEventListener("ClientRejectSignPsbt", eventListener);
    });
  };

  window.inspip.signMessage = function (msg) {
    const message = {msg};
    const event = new CustomEvent("SignMessage", {detail: message});
    window.dispatchEvent(event);

    return new Promise((resolve,reject) => {
      const eventListener = (event) => {
        if (event.type === "ReturnSignMessage") {
          window.removeEventListener("ReturnSignMessage", eventListener);
          const signature = event.detail.message.split(';')[1];
          resolve(signature);
        }
        if (event.type === "ReturnErrorOnSignMessage") {
          window.removeEventListener("ReturnErrorOnSignMessage", eventListener);
          reject(new Error("Error on SignMessage event occurred."));
        }
        if (event.type === "ClientRejectSignMessage") {
          window.removeEventListener("ClientRejectSignMessage", eventListener);
          reject(new Error("SignMessage rejected by client"));
        }
      };

      window.addEventListener("ReturnSignMessage", eventListener);
      window.addEventListener("ReturnErrorOnSignMessage", eventListener);
      window.addEventListener("ClientRejectSignMessage", eventListener);
    });
  };

  window.inspip.verifySign = function (msg, signature) {
    const message = {msg, signature};
    const event = new CustomEvent("VerifySign", {detail: message});
    window.dispatchEvent(event);

    return new Promise((resolve,reject) => {
      const eventListener = (event) => {
        if (event.type === "ReturnVerifySign") {
          window.removeEventListener("ReturnVerifySign", eventListener);
          const result = event.detail.message.split(';')[1] === "true" ? true : false;
          resolve(result);
        }
        if (event.type === "ReturnErrorOnVerifySign") {
          window.removeEventListener("ReturnErrorOnVerifySign", eventListener);
          reject(new Error("Error on VerifySign event occurred."));
        }
      };

      window.addEventListener("ReturnVerifySign", eventListener);
      window.addEventListener("ReturnErrorOnVerifySign", eventListener);
    });
  };
})();
