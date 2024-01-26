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
})();