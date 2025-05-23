import { useState, useEffect } from "react";
import { IconButton, Typography, Modal } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { useCustomTheme, styles } from "@coral-xyz/themes";
import { useActiveWallets, useBlockchainLogo } from "@coral-xyz/recoil";
import { Blockchain } from "@coral-xyz/common";
import { walletAddressDisplay, SecondaryButton } from "../../../common";
import { useDrawerContext } from "../../../common/Layout/Drawer";
import { WithCopyTooltip } from "../../../common/WithCopyTooltip";
import { useNavStack } from "../../../common/Layout/NavStack";
import { CloseButton } from "../../../common/Layout/Drawer";
import { TextField } from "../../../common";

export function Deposit({ ...props }: any) {
  if (props.blockchain) {
    return <_Deposit {...props} />;
  }
  return <DepositMultichain {...props} />;
}

function DepositMultichain({ ...props }: any) {
  const theme = useCustomTheme();
  const nav = useNavStack();
  const { close } = useDrawerContext();
  const activeWallets = useActiveWallets();

  useEffect(() => {
    nav.setStyle({
      borderBottom: "none",
    });
  }, []);
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "12px",
        paddingBottom: "16px",
      }}
    >
      <div
        style={{
          flex: 1,
        }}
      >
        {activeWallets.map(({ blockchain, name, publicKey }) => (
          <BlockchainDepositCard
            key={blockchain}
            blockchain={blockchain}
            name={name}
            publicKey={publicKey}
          />
        ))}
      </div>
      <SecondaryButton label="Close" onClick={() => close()} />
    </div>
  );
}

function BlockchainDepositCard({
  blockchain,
  name,
  publicKey,
}: {
  blockchain: Blockchain;
  name: string;
  publicKey: string;
}) {
  const theme = useCustomTheme();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipOpenModal, setTooltipOpenModal] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const blockchainLogo = useBlockchainLogo(blockchain);
  const blockchainDisplay =
    blockchain.slice(0, 1).toUpperCase() + blockchain.slice(1);

  const onCopy = () => {
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 1000);
    navigator.clipboard.writeText(publicKey.toString());
  };
  const onCopyModal = () => {
    setTooltipOpenModal(true);
    setTimeout(() => setTooltipOpenModal(false), 1000);
    navigator.clipboard.writeText(publicKey.toString());
  };
  const onQrCode = () => {
    setShowQrCode(true);
  };

  return (
    <>
      <div
        style={{
          marginBottom: "12px",
          borderRadius: "8px",
          padding: "16px",
          background: theme.custom.colors.nav,
          border: `${theme.custom.colors.borderFull}`,
        }}
      >
        <Typography
          style={{
            color: theme.custom.colors.fontColor,
            fontWeight: 500,
          }}
        >
          Your {blockchainDisplay} address
        </Typography>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Typography
              style={{
                fontWeight: 500,
                fontSize: "14px",
                marginTop: "6px",
                marginBottom: "6px",
                color: theme.custom.colors.secondary,
              }}
            >
              {`${name} (${walletAddressDisplay(publicKey)})`}
            </Typography>
            <img
              src={blockchainLogo}
              style={{
                width: "14px",
                borderRadius: "2px",
              }}
            />
          </div>
          <div style={{ display: "flex" }}>
            <IconButton
              disableRipple
              onClick={() => onQrCode()}
              style={{
                backgroundColor: theme.custom.colors.bg2,
                padding: "10px",
                marginRight: "6px",
                width: "40px",
                height: "40px",
              }}
            >
              <QrCodeIcon
                style={{
                  color: theme.custom.colors.fontColor,
                  width: "20px",
                  height: "20px",
                }}
              />
            </IconButton>
            <WithCopyTooltip tooltipOpen={tooltipOpen}>
              <IconButton
                disableRipple
                onClick={() => onCopy()}
                style={{
                  backgroundColor: theme.custom.colors.bg2,
                  padding: "10px",
                  width: "40px",
                  height: "40px",
                }}
              >
                <ContentCopyIcon
                  style={{
                    color: theme.custom.colors.fontColor,
                    width: "20px",
                    height: "20px",
                  }}
                />
              </IconButton>
            </WithCopyTooltip>
          </div>
        </div>
      </div>
      <Modal open={showQrCode} onClose={() => setShowQrCode(false)}>
        <div
          style={{
            width: "300px",
            height: "325px",
            top: "50%",
            left: "50%",
            position: "absolute",
            transform: "translate(-50%, -50%)",
            backgroundColor: theme.custom.colors.nav,
            margin: 0,
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
              }}
            >
              <CloseButton
                buttonStyle={{ position: "relative" }}
                onClick={() => setShowQrCode(false)}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    marginRight: "8px",
                  }}
                >
                  <img
                    src={blockchainLogo}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "2px",
                    }}
                  />
                </div>
                <Typography
                  style={{
                    fontSize: "22px",
                    color: theme.custom.colors.fontColor,
                  }}
                >
                  {blockchainDisplay}
                </Typography>
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: "24px",
                  marginBottom: "16px",
                }}
              >
                <QrCode data={publicKey.toString()} />
              </div>
              <WithCopyTooltip tooltipOpen={tooltipOpenModal}>
                <div style={{ display: "relative" }}>
                  <IconButton
                    disableRipple
                    style={{
                      padding: 0,
                      textTransform: "none",
                      display: "flex",
                      flexDirection: "column",
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                    onClick={() => onCopyModal()}
                  >
                    <Typography
                      style={{
                        textAlign: "center",
                        color: theme.custom.colors.fontColor,
                        fontSize: "16px",
                      }}
                    >
                      {name}
                    </Typography>
                    <Typography
                      style={{
                        textAlign: "center",
                        color: theme.custom.colors.secondary,
                      }}
                    >
                      ({walletAddressDisplay(publicKey)})
                    </Typography>
                  </IconButton>
                </div>
              </WithCopyTooltip>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

const useStyles = styles((theme) => ({
  subtext: {
    width: "264px",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "16px",
    color: theme.custom.colors.secondary,
    size: "14px",
    fontWeight: 500,
    fontSize: "14px",
    textAlign: "center",
    lineHeight: "20px",
  },
  depositTextFieldRoot: {
    margin: 0,
    "& .MuiOutlinedInput-root": {
      paddingRight: 0,
      "& fieldset": {
        border: `${theme.custom.colors.borderFull} !important`,
        paddingLeft: 0,
        paddingRight: 0,
      },
      "&.Mui-focused fieldset": {
        borderColor: `${theme.custom.colors.primaryButton} !important`,
      },
    },
    "& .MuiOutlinedInput-input": {
      cursor: "pointer",
      color: theme.custom.colors.secondary,
    },
    "&:hover .MuiOutlinedInput-root": {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  copyIcon: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  copyContainer: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  copyButton: {
    background: "transparent",
    padding: 0,
  },
  copyButtonLabel: {
    color: theme.custom.colors.brandColor,
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "24px",
    textTransform: "none",
  },
}));

export function _Deposit({ ...props }: any) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const activeWallets = useActiveWallets();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const activeWallet = activeWallets.find(
    (w) => w.blockchain === props.blockchain
  );

  if (!activeWallet) {
    return <></>;
  }

  const walletDisplay =
    activeWallet.publicKey.toString().slice(0, 12) +
    "..." +
    activeWallet.publicKey
      .toString()
      .slice(activeWallet.publicKey.toString().length - 12);

  const onCopy = () => {
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 1000);
    navigator.clipboard.writeText(activeWallet.publicKey.toString());
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: "64px",
          marginBottom: "80px",
          width: "180px",
        }}
      >
        <QrCode
          data={activeWallet.publicKey.toString()}
          style={{ width: "180px", height: "180px", padding: "7.83px" }}
        />
      </div>
      <div>
        <Typography
          style={{
            fontSize: "16px",
            textAlign: "center",
            marginBottom: "8px",
            color: theme.custom.colors.fontColor,
          }}
        >
          {activeWallet.name}
        </Typography>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "0 12px",
          }}
        >
          <WithCopyTooltip tooltipOpen={tooltipOpen}>
            <div
              onClick={() => onCopy()}
              style={{ width: "100%" }}
              className={classes.copyContainer}
            >
              <TextField
                value={walletDisplay}
                rootClass={classes.depositTextFieldRoot}
                endAdornment={
                  <ContentCopyIcon
                    className={classes.copyIcon}
                    style={{
                      pointerEvents: "none",
                      color: theme.custom.colors.secondary,
                      position: "absolute",
                      right: "17px",
                    }}
                  />
                }
                inputProps={{
                  readOnly: true,
                }}
              />
            </div>
          </WithCopyTooltip>
        </div>
      </div>
      <div>
        <Typography className={classes.subtext}>
          {activeWallet.blockchain === Blockchain.BBA && (
            <>This address can only receive BBA and BPE tokens on Solana.</>
          )}
          {activeWallet.blockchain === Blockchain.SOLANA && (
            <>This address can only receive SOL and SPL tokens on Solana.</>
          )}
          {activeWallet.blockchain === Blockchain.ETHEREUM && (
            <>This address can only receive ETH and ERC20 tokens on Ethereum.</>
          )}
        </Typography>
      </div>
    </div>
  );
}

export function QrCode({
  data,
  style,
}: {
  data: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        height: "148px",
        width: "148px",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        padding: "8px",
        ...style,
      }}
    >
      <img src={`https://qr.backpack.workers.dev/qz=0?${data}`} alt={data} />
    </div>
  );
}
