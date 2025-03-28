import { useRecoilValue } from "recoil";
import { Commitment } from "@bbachain/web3.js";
import * as atoms from "../../atoms";

export function useBbaCommitment(): Commitment {
  return useRecoilValue(atoms.bbaCommitment)!;
}
