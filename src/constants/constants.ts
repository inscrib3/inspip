export const constants = {
  bitcoin_indexer: {
    main: "https://api.blockcypher.com/v1/btc/main",
    testnet: "https://api.blockcypher.com/v1/btc/test3",
    api: {
      unspents: "/addrs/:address?unspentOnly=true&before=:before",
    },
  },
  pipe_indexer: {
    main: "https://indexer.inspip.com",
    testnet: "https://indexer-testnet.inspip.com",
    api: {
      unspents: "/utxo/by-address/:address?limit=:limit&page=:page"
    },
  },
  ordinals_indexer: {
    main: "https://api.hiro.so",
    testnet: "https://api.hiro.so",
    api: {
      unspents: "/ordinals/v1/inscriptions?limit=:limit&offset=:offset&address=:address"
    },
  },
  utxo_dummy_value: 546,
};