import { useRecoilValue } from "recoil";
import { Blockchain } from "@coral-xyz/common";
import * as atoms from "../atoms";

export function useBlockchainExplorer(blockchain: Blockchain) {
  switch (blockchain) {
    case Blockchain.ETHEREUM:
      return useRecoilValue(atoms.ethereumExplorer);
    case Blockchain.SOLANA:
      return useRecoilValue(atoms.solanaExplorer);
    case Blockchain.BBA:
      return useRecoilValue(atoms.bbaExplorer);
    default:
      throw new Error(`invalid blockchain ${blockchain}`);
  }
}

export function useBlockchainConnectionUrl(blockchain: Blockchain) {
  switch (blockchain) {
    case Blockchain.ETHEREUM:
      return useRecoilValue(atoms.ethereumConnectionUrl);
    case Blockchain.SOLANA:
      return useRecoilValue(atoms.solanaConnectionUrl);
    case Blockchain.BBA:
      return useRecoilValue(atoms.bbaConnectionUrl);
    default:
      throw new Error(`invalid blockchain ${blockchain}`);
  }
}

export function useBlockchainLogo(blockchain: Blockchain): string {
  switch (blockchain) {
    case Blockchain.ETHEREUM:
      return "./ethereum.png";
    case Blockchain.SOLANA:
      return "/solana.png";
    case Blockchain.BBA:
      return "/bba.png";
    default:
      throw new Error(`invalid blockchain ${blockchain}`);
  }
}

export function useBlockchainTokens(blockchain: Blockchain) {
  return useRecoilValue(atoms.blockchainTokenAddresses(blockchain));
}

export function useBlockchainTokensSorted(blockchain: Blockchain) {
  return useRecoilValue(atoms.blockchainBalancesSorted(blockchain));
}

export function useBlockchainTokenAccount(
  blockchain: Blockchain,
  address: string
): any {
  return useRecoilValue(atoms.blockchainTokenData({ blockchain, address }));
}
