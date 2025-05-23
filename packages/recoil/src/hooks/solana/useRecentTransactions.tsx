import { Blockchain } from "@coral-xyz/common";
import { useRecoilValue } from "recoil";
import * as atoms from "../../atoms";

export function useRecentTransactions(
  blockchain: Blockchain,
  address: string,
  contractAddresses?: Array<string>
) {
  if (blockchain === Blockchain.SOLANA) {
    return useRecoilValue(atoms.recentSolanaTransactions({ address }));
  } else if (blockchain === Blockchain.ETHEREUM) {
    return useRecoilValue(
      atoms.recentEthereumTransactions({ address, contractAddresses })
    );
  }
  throw new Error("invalid blockchain");
}

export function useRecentSolanaTransactions({ address }: { address: string }) {
  return useRecoilValue(atoms.recentSolanaTransactions({ address }));
}

export function useRecentBbaTransactions({ address }: { address: string }) {
  return useRecoilValue(atoms.recentBbaTransactions({ address }));
}

export function useRecentEthereumTransactions({
  address,
  contractAddresses,
}: {
  address: string;
  contractAddresses?: Array<string>;
}) {
  return useRecoilValue(
    atoms.recentEthereumTransactions({ address, contractAddresses })
  );
}
