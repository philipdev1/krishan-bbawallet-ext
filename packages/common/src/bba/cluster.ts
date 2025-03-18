export const DEFAULT_SOLANA_CLUSTER =
  "https://api.mainnet-beta.solana.com";

export const DEFAULT_BBA_CLUSTER =
  "https://api-mainnet.bbachain.com";

export const SolanaCluster = {
  MAINNET: DEFAULT_SOLANA_CLUSTER,
  DEVNET: "https://api.devnet.solana.com",
  LOCALNET: "http://localhost:8899",

  DEFAULT: process.env.DEFAULT_SOLANA_CONNECTION_URL || DEFAULT_SOLANA_CLUSTER,
};


export const BbaCluster = {
  MAINNET: DEFAULT_BBA_CLUSTER,
  DEVNET: "https://api.devnet.bbachain.com",
  LOCALNET: "http://localhost:8899",

  DEFAULT: process.env.DEFAULT_BBA_CONNECTION_URL || DEFAULT_BBA_CLUSTER,
};