// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener(async (request) => {
  if (typeof request.message !== 'string') {
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
    if (request.message.action === 'SendTokens') {
      const params = request.message.params;
      // eslint-disable-next-line no-undef
      chrome.windows.create({
        type: 'popup',
        url: `index.html#?action=SendTokens&feerate=${params.feerate}&toAddress=${params.toAddress}&amount=${params.amount}&id=${params.id}&ticker=${params.ticker}`,
        width: 400,
        height: 600,
      });
    }
    if (request.message.action === 'SignPsbt') {
      const params = request.message.params;
      // eslint-disable-next-line no-undef
      chrome.windows.create({
        type: 'popup',
        url: `index.html#?action=SignPsbt&psbt=${params.psbt}&toSignInputs=${params.toSignInputs}&autoFinalized=${params.autoFinalized}`,
        width: 400,
        height: 600,
      });
    }
    if (request.message.action === 'SignMessage') {
      const params = request.message.params;
      // eslint-disable-next-line no-undef
      chrome.windows.create({
        type: 'popup',
        url: `index.html#?action=SignMessage&msg=${params.msg}`,
        width: 400,
        height: 600,
      });
    }
    if (request.message.action === 'VerifySign') {
      const params = request.message.params;
      // eslint-disable-next-line no-undef
      chrome.windows.create({
        type: 'popup',
        url: `index.html#?action=VerifySign&msg=${params.msg}&signature=${params.signature}`,
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
  } else {
    if (request.message.includes('ReturnSendTokens')) {
      // eslint-disable-next-line no-undef
      chrome.tabs.query({ active: true }, function(tabs) {
          // eslint-disable-next-line no-undef
          chrome.tabs.sendMessage(tabs[0].id, { message: request.message });
      });
    }
    if (request.message.includes('ReturnConnectWalletInfo')) {
      // eslint-disable-next-line no-undef
      chrome.tabs.query({ active: true }, function(tabs) {
          // eslint-disable-next-line no-undef
          chrome.tabs.sendMessage(tabs[0].id, { message: request.message });
      });
    }
    if (request.message.includes('ClientRejectConnectWalletInfo')) {
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
    if (request.message.includes('ReturnSignPsbt')) {
      // eslint-disable-next-line no-undef
      chrome.tabs.query({ active: true }, function(tabs) {
          // eslint-disable-next-line no-undef
          chrome.tabs.sendMessage(tabs[0].id, { message: request.message });
      });
    }
    if (request.message.includes('ReturnErrorOnSignPsbt')) {
      // eslint-disable-next-line no-undef
      chrome.tabs.query({ active: true }, function(tabs) {
          // eslint-disable-next-line no-undef
          chrome.tabs.sendMessage(tabs[0].id, { message: request.message });
      });
    }
    if (request.message.includes('ClientRejectSignPsbt')) {
      // eslint-disable-next-line no-undef
      chrome.tabs.query({ active: true }, function(tabs) {
          // eslint-disable-next-line no-undef
          chrome.tabs.sendMessage(tabs[0].id, { message: request.message });
      });
    }
    if (request.message.includes('ReturnSignMessage')) {
      // eslint-disable-next-line no-undef
      chrome.tabs.query({ active: true }, function(tabs) {
          // eslint-disable-next-line no-undef
          chrome.tabs.sendMessage(tabs[0].id, { message: request.message });
      });
    }
    if (request.message.includes('ReturnErrorOnSignMessage')) {
      // eslint-disable-next-line no-undef
      chrome.tabs.query({ active: true }, function(tabs) {
          // eslint-disable-next-line no-undef
          chrome.tabs.sendMessage(tabs[0].id, { message: request.message });
      });
    }
    if (request.message.includes('ClientRejectSignMessage')) {
      // eslint-disable-next-line no-undef
      chrome.tabs.query({ active: true }, function(tabs) {
          // eslint-disable-next-line no-undef
          chrome.tabs.sendMessage(tabs[0].id, { message: request.message });
      });
    }
    if (request.message.includes('ReturnVerifySign')) {
      // eslint-disable-next-line no-undef
      chrome.tabs.query({ active: true }, function(tabs) {
          // eslint-disable-next-line no-undef
          chrome.tabs.sendMessage(tabs[0].id, { message: request.message });
      });
    }
    if (request.message.includes('ReturnErrorOnVerifySign')) {
      // eslint-disable-next-line no-undef
      chrome.tabs.query({ active: true }, function(tabs) {
          // eslint-disable-next-line no-undef
          chrome.tabs.sendMessage(tabs[0].id, { message: request.message });
      });
    }
  }
});