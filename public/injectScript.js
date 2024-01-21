(function () {
  // Define the connect function
  window.inspip = window.inspip || {};
  
  window.inspip.connect = function () {
    const event = new CustomEvent("ConnectWallet");
    window.dispatchEvent(event);
    //in somehow must await until the return of ReturnConnectWalletInfo and then return the values
    return new Promise((resolve) => {
      const eventListener = (event) => {
        if (event.type === "ReturnConnectWalletInfo") {
          window.removeEventListener("ReturnConnectWalletInfo", eventListener);
          console.log('success!!!',event.detail)
          resolve(event.detail); // Resolve the promise with the returned value
        }
      };

      window.addEventListener("ReturnConnectWalletInfo", eventListener);
    });
  };

  window.inspip.sendBitcoin = function (toAddress, satoshi, feerate) {
    const message = {toAddress,satoshi,feerate};
    //must convert satoshi in BTC before send btc = satoshi * Math.pow(10, -8)
    const event = new CustomEvent("SendBitcoin", {detail: message});
    window.dispatchEvent(event);
  };
})();