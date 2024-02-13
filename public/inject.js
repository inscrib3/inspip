(function () {
  window.inspip = window.inspip || {};
  
  window.inspip.connect = function () {
    const event = new CustomEvent("ConnectWallet");
    window.dispatchEvent(event);
    return new Promise((resolve) => {
      const eventListener = (event) => {
        if (event.type === "ReturnConnectWalletInfo") {
          window.removeEventListener("ReturnConnectWalletInfo", eventListener);
          const address = event.detail.message.split(';')[1];
          const pubkey = event.detail.message.split(';')[2];
          resolve({address,pubkey});
        }
      };

      window.addEventListener("ReturnConnectWalletInfo", eventListener);
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

    return new Promise((resolve) => {
      const eventListener = (event) => {
        if (event.type === "ReturnSignPsbt") {
          window.removeEventListener("ReturnSignPsbt", eventListener);
          const signed = event.detail.message.split(';')[1];
          resolve(signed);
        }
      };

      window.addEventListener("ReturnSignPsbt", eventListener);
    });
  };

  window.inspip.signMessage = function (msg) {
    const message = {msg};
    const event = new CustomEvent("SignMessage", {detail: message});
    window.dispatchEvent(event);

    return new Promise((resolve) => {
      const eventListener = (event) => {
        if (event.type === "ReturnSignMessage") {
          window.removeEventListener("ReturnSignMessage", eventListener);
          const signature = event.detail.message.split(';')[1];
          resolve(signature);
        }
      };

      window.addEventListener("ReturnSignMessage", eventListener);
    });
  };

  window.inspip.verifySign = function (msg, signature) {
    const message = {msg, signature};
    const event = new CustomEvent("VerifySign", {detail: message});
    window.dispatchEvent(event);

    return new Promise((resolve) => {
      const eventListener = (event) => {
        if (event.type === "ReturnVerifySign") {
          window.removeEventListener("ReturnVerifySign", eventListener);
          const result = event.detail.message.split(';')[1] === "true" ? true : false;
          resolve(result);
        }
      };

      window.addEventListener("ReturnVerifySign", eventListener);
    });
  };
})();
