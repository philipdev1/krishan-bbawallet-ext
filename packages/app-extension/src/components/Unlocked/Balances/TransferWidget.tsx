import {
  Blockchain,
  SOL_NATIVE_MINT,
  ETH_NATIVE_MINT,
} from "@coral-xyz/common";
import { Typography } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";
import { SwapProvider } from "@coral-xyz/recoil";
import { ArrowUpward, ArrowDownward, SwapHoriz } from "@mui/icons-material";
import { WithHeaderButton } from "./TokensWidget/Token";
import { Deposit } from "./TokensWidget/Deposit";
import { SendLoader, Send } from "./TokensWidget/Send";
import { useNavStack } from "../../common/Layout/NavStack";
import type { Token } from "../../common/TokenTable";
import { SearchableTokenTables } from "../../common/TokenTable";
import { Swap, SelectToken } from "../../Unlocked/Swap";

export function TransferWidget({
  blockchain,
  address,
}: {
  blockchain?: Blockchain;
  address?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        width: blockchain !== Blockchain.ETHEREUM ? "191px" : "120px",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <ReceiveButton blockchain={blockchain} />
      <div style={{ width: "16px" }} />
      <SendButton blockchain={blockchain} address={address} />
      {blockchain !== Blockchain.ETHEREUM && (
        <>
          <div style={{ width: "16px" }} />
          <SwapButton blockchain={blockchain} address={address} />
        </>
      )}
    </div>
  );
}

function SwapButton({
  blockchain,
  address,
}: {
  blockchain?: Blockchain;
  address?: string;
}) {
  const theme = useCustomTheme();
  return (
    <SwapProvider blockchain={blockchain} tokenAddress={address}>
      <TransferButton
        label={"Swap"}
        labelComponent={
          <SwapHoriz
            style={{
              color: theme.custom.colors.fontColor,
              display: "flex",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
        }
        routes={[
          {
            name: "swap",
            component: (props: any) => <Swap {...props} />,
            title: `Swap`,
            props: {
              blockchain,
            },
          },
          {
            title: `Select Token`,
            name: "select-token",
            component: (props: any) => <SelectToken {...props} />,
          },
        ]}
      />
    </SwapProvider>
  );
}

function SendButton({
  blockchain,
  address,
}: {
  blockchain?: Blockchain;
  address?: string;
}) {
  const theme = useCustomTheme();
  return (
    <TransferButton
      label={"Send"}
      labelComponent={
        <ArrowUpward
          style={{
            color: theme.custom.colors.fontColor,
            display: "flex",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      }
      routes={
        blockchain && address
          ? [
              {
                name: "send",
                component: (props: any) => <SendLoader {...props} />,
                title: `Send`,
                props: {
                  blockchain,
                  address,
                },
              },
            ]
          : [
              {
                name: "select-token",
                component: SendToken,
                title: "Select token",
              },
              {
                name: "send",
                component: (props: any) => <Send {...props} />,
                title: "",
              },
            ]
      }
    />
  );
}

function ReceiveButton({ blockchain }: { blockchain?: Blockchain }) {
  const theme = useCustomTheme();
  return (
    <TransferButton
      label={"Receive"}
      labelComponent={
        <ArrowDownward
          style={{
            color: theme.custom.colors.fontColor,
            display: "flex",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      }
      routes={[
        {
          component: Deposit,
          title: "Deposit",
          name: "deposit",
          props: {
            blockchain,
          },
        },
      ]}
    />
  );
}

function TransferButton({
  label,
  labelComponent,
  routes,
}: {
  label: string;
  labelComponent: any;
  routes: Array<{ props?: any; component: any; title: string; name: string }>;
}) {
  const theme = useCustomTheme();
  return (
    <div
      className="mx-2 flex flex-1 flex-col items-center rounded-xl bg-white p-4"
      style={{
        width: "52px",
        height: "70px",
      }}
    >
      <WithHeaderButton
        className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
        label={""}
        labelComponent={labelComponent}
        routes={routes}
      />
      <Typography
        className="h-6 w-6 rounded-full bg-green-100"
        style={{
          color: theme.custom.colors.secondary,
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: "20px",
          textAlign: "center",
        }}
      >
        {label}
      </Typography>
    </div>
  );
}

function SendToken() {
  const { push } = useNavStack();

  const onClickRow = (blockchain: Blockchain, token: Token) => {
    push("send", { blockchain, token });
  };

  return (
    <SearchableTokenTables
      onClickRow={onClickRow}
      customFilter={(token: Token) => {
        if (token.mint && token.mint === SOL_NATIVE_MINT) {
          return true;
        }
        if (token.address && token.address === ETH_NATIVE_MINT) {
          return true;
        }
        return !token.nativeBalance.isZero();
      }}
    />
  );
}
