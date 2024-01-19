console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

var scriptElement = document.createElement('script');

// eslint-disable-next-line no-undef
scriptElement.src = chrome.runtime.getURL('injectScript.js');

document.head.appendChild(scriptElement);

window.addEventListener('SendBitcoin', function (event) {
  console.log('SendBitcoin InContentScript',event.detail);
  // eslint-disable-next-line no-undef
  chrome.runtime.sendMessage(
    {
      message: {action:'SendBitcoin',params:event.detail},
    },
    function () {
      console.log('SendBitcoin sent to background script.');
    })
})

window.addEventListener('ConnectWallet', function (event) {
  console.log('ConnectWallet  InContentScript');
  // eslint-disable-next-line no-undef
  chrome.runtime.sendMessage(
    {
      message: {action:'ConnectWallet',params:event.detail},
    },
    function () {
      console.log('ConnectWallet sent to background script.');
    })
})

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // Handle the message from background.js
    console.log('In content script get ReturnConnectWalletInfo from background',request.message);
    const customEvent = new CustomEvent("ReturnConnectWalletInfo", {
      detail: { message: request.message }
    });
    window.dispatchEvent(customEvent);
    // Perform actions in your web app based on the message
  }
);

