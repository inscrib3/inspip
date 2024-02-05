var scriptElement = document.createElement('script');

// eslint-disable-next-line no-undef
scriptElement.src = chrome.runtime.getURL('inject.js');

document.head.appendChild(scriptElement);

window.addEventListener('SendBitcoin', function (event) {
  // eslint-disable-next-line no-undef
  chrome.runtime.sendMessage(
    {
      message: {action:'SendBitcoin',params:event.detail},
    },
    function () {})
})

window.addEventListener('ConnectWallet', function (event) {
  // eslint-disable-next-line no-undef
  chrome.runtime.sendMessage(
    {
      message: {action:'ConnectWallet',params:event.detail},
    },
    function () {})
})

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener(
  function(request) {
    // Handle the message from background.js
    if(request.message.includes("ReturnConnectWalletInfo")){
      const customEvent = new CustomEvent("ReturnConnectWalletInfo", {
        detail: { message: request.message }
      });
      window.dispatchEvent(customEvent);
    }
  }
);

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener(
  function(request) {
    if(request.message.includes("ReturnSendBitcoin")){
      const customEvent = new CustomEvent("ReturnSendBitcoin", {
        detail: { message: request.message }
      });
      window.dispatchEvent(customEvent);
    }
  }
);
