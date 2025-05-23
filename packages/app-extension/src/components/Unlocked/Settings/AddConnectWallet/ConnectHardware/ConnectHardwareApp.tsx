import { Box } from "@mui/material";
import { Blockchain } from "@coral-xyz/common";
import {
  Header,
  HeaderIcon,
  PrimaryButton,
  SubtextParagraph,
} from "../../../../common";
import { EthereumIcon, SolanaIcon, BbaIcon } from "../../../../common/Icon";

export function ConnectHardwareApp({
  blockchain,
  onNext,
}: {
  blockchain: Blockchain;
  onNext: () => void;
}) {
  const header = {
    [Blockchain.SOLANA]: { icon: <SolanaIcon />, text: "Open the Solana app" },
    [Blockchain.BBA]: { icon: <BbaIcon />, text: "Open the BBA app" },
    [Blockchain.ETHEREUM]: {
      icon: <EthereumIcon />,
      text: "Open the Ethereum app",
    },
  }[blockchain];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ margin: "0 24px" }}>
        <HeaderIcon icon={header.icon} />
        <Header text={header.text} />
        <SubtextParagraph>
          Make sure your wallet remains connected.
        </SubtextParagraph>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <PrimaryButton label="Next" onClick={onNext} />
      </Box>
    </Box>
  );
}
