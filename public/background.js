console.log('This is the background page.');
console.log('Put the background scripts here.');

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.message.action === 'SendBitcoin') {
    // Create a new tab with options page
    console.log('SendBitcoin InBackground', request.message.params)
    const params = request.message.params;
    // eslint-disable-next-line no-undef
    chrome.windows.create({
      type: 'popup',
      url: `index.html#?action=SendBitcoin&feerate=${params.feerate}&toAddress=${params.toAddress}&satoshi=${params.satoshi}`,
      width: 400,
      height: 600,
    });
  }
  if (request.message.action === 'ConnectWallet') {
    // Create a new tab with options page
    console.log('ConnectWallet InBackground', request.message.params)
    // eslint-disable-next-line no-undef
    chrome.windows.create({
      type: 'popup',
      url: `index.html#?action=ConnectWallet`,
      width: 400,
      height: 600,
    });
  }
  if (request.message.includes('ReturnConnectWalletInfo')) {
    console.log('ReturnConnectWalletInfo in background: ',request.message)
    // eslint-disable-next-line no-undef
    chrome.tabs.query({ active: true }, function(tabs) {
        // eslint-disable-next-line no-undef
        chrome.tabs.sendMessage(tabs[0].id, { message: request.message });
    });
  }
});
