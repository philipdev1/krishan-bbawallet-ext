import { useRecoilValue, useRecoilValueLoadable, Loadable } from "recoil";
import { PublicKey, Connection } from "@bbachain/web3.js";
import { SolanaContext, BackgroundClient } from "@coral-xyz/common";
import * as atoms from "../../atoms";
import { useSplTokenRegistry } from "./useSplTokenRegistry";
import { useActiveSolanaWallet } from "../wallet";
import { useBackgroundClient } from "../client";
import { useBbaCommitment } from ".";

export function useSolanaConnectionUrl(): string {
  return useRecoilValue(atoms.bbaConnectionUrl)!;
}

export function useAnchorContext(): any {
  return useRecoilValue(atoms.anchorContext);
}

export function useAnchorContextLoadable(): Loadable<any> {
  return useRecoilValueLoadable(atoms.anchorContext);
}

export function useSolanaCtx(): SolanaContext {
  const { publicKey } = useActiveSolanaWallet();
  const { tokenClient, provider } = useAnchorContext();
  const registry = useSplTokenRegistry();
  const commitment = useBbaCommitment();
  const backgroundClient = useBackgroundClient();
  return {
    walletPublicKey: new PublicKey(publicKey),
    tokenClient,
    registry,
    commitment,
    backgroundClient,
    connection: provider.connection,
  };
}

export function useConnectionBackgroundClient(): BackgroundClient {
  return useRecoilValue(atoms.connectionBackgroundClient);
}

export type SolanaConnectionContext = {
  connection: Connection;
  connectionUrl: string;
  setConnectionUrl: (url: string) => void;
};
