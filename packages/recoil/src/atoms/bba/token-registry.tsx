import { atom, selector } from "recoil";
import { TokenListProvider, TokenInfo } from "@bbachain/token-registry";
import { WSOL_MINT, SOL_NATIVE_MINT } from "@coral-xyz/common";

export const SOL_LOGO_URI =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png";

export const splTokenRegistry = atom<Map<string, TokenInfo> | null>({
  key: "splTokenRegistry",
  default: selector({
    key: "splTokenRegistryDefault",
    get: async () => {
      const tokens = await new TokenListProvider().resolve();
      const tokenList = tokens
        .filterByClusterSlug("mainnet") // TODO: get network atom.
        .getList();
      const tokenMap = tokenList.reduce((map, item) => {
        if (item.address === WSOL_MINT) {
          map.set(item.address, { ...item, symbol: "wSOL" });
        } else {
          map.set(item.address, item);
        }
        return map;
      }, new Map());
      tokenMap.set(SOL_NATIVE_MINT, {
        name: "Solana",
        address: SOL_NATIVE_MINT,
        chainId: 101,
        decimals: 9,
        symbol: "SOL",
        logoURI: SOL_LOGO_URI,
        extensions: {
          coingeckoId: "solana",
        },
      });
      return tokenMap;
    },
  }),
});
