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

window.addEventListener('SendTokens', function (event) {
  // eslint-disable-next-line no-undef
  chrome.runtime.sendMessage(
    {
      message: {action:'SendTokens',params:event.detail},
    },
    function () {})
})

window.addEventListener('SignPsbt', function (event) {
  // eslint-disable-next-line no-undef
  chrome.runtime.sendMessage(
    {
      message: {action:'SignPsbt',params:event.detail},
    },
    function () {})
})

window.addEventListener('SignMessage', function (event) {
  // eslint-disable-next-line no-undef
  chrome.runtime.sendMessage(
    {
      message: {action:'SignMessage',params:event.detail},
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

window.addEventListener('VerifyMessage', function (event) {
  // eslint-disable-next-line no-undef
  chrome.runtime.sendMessage(
    {
      message: {action:'VerifyMessage',params:event.detail},
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

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener(
  function(request) {
    if(request.message.includes("ReturnSendTokens")){
      const customEvent = new CustomEvent("ReturnSendTokens", {
        detail: { message: request.message }
      });
      window.dispatchEvent(customEvent);
    }
  }
);

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener(
  function(request) {
    if(request.message.includes("ReturnSignPsbt")){
      const customEvent = new CustomEvent("ReturnSignPsbt", {
        detail: { message: request.message }
      });
      window.dispatchEvent(customEvent);
    }
  }
);

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener(
  function(request) {
    if(request.message.includes("ReturnSignMessage")){
      const customEvent = new CustomEvent("ReturnSignMessage", {
        detail: { message: request.message }
      });
      window.dispatchEvent(customEvent);
    }
  }
);

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener(
  function(request) {
    if(request.message.includes("ReturnVerifyMessage")){
      const customEvent = new CustomEvent("ReturnVerifyMessage", {
        detail: { message: request.message }
      });
      window.dispatchEvent(customEvent);
    }
  }
);