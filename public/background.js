// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener(async (request) => {
  if (request.message.action === 'SendBitcoin') {
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
    // eslint-disable-next-line no-undef
    chrome.windows.create({
      type: 'popup',
      url: `index.html#?action=ConnectWallet`,
      width: 400,
      height: 600,
    });
  }
  if (request.message.includes('ReturnConnectWalletInfo')) {
    // eslint-disable-next-line no-undef
    chrome.tabs.query({ active: true }, function(tabs) {
        // eslint-disable-next-line no-undef
        chrome.tabs.sendMessage(tabs[0].id, { message: request.message });
    });
  }
  if (request.message.includes('ReturnSendBitcoin')) {
    // eslint-disable-next-line no-undef
    chrome.tabs.query({ active: true }, function(tabs) {
        // eslint-disable-next-line no-undef
        chrome.tabs.sendMessage(tabs[0].id, { message: request.message });
    });
  }
});
