import { ethers, BigNumber } from "ethers";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Checkbox as _Checkbox,
} from "@mui/material";
import {
  styles,
  useCustomTheme,
  CustomTheme,
  HOVER_OPACITY,
} from "@coral-xyz/themes";
import { TextField } from "@coral-xyz/react-xnft-renderer";
import { walletAddressDisplay } from "@coral-xyz/common";

export * from "./List";
export { TextField };
export { walletAddressDisplay } from "@coral-xyz/common";

const useStyles = styles((theme: CustomTheme) => ({
  circle: {
    stroke: "url(#linearColors)",
  },
  leftLabel: {
    color: theme.custom.colors.fontColor,
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
  },
  rightLabel: {
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: "16px",
    color: theme.custom.colors.interactiveIconsActive,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    height: "100%",
  },
  loadingIndicator: {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    color:
      "linear-gradient(113.94deg, #3EECB8 15.93%, #A372FE 58.23%, #FE7D4A 98.98%)",
  },
  button: {
    width: "100%",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: theme.custom.colors.primaryButton,
    "&.Mui-disabled": {
      opacity: 0.5,
      backgroundColor: theme.custom.colors.primaryButton,
    },
    "&:hover": {
      backgroundColor: theme.custom.colors.primaryButton,
    },
  },
  primaryButton: {
    "&:hover": {
      opacity: HOVER_OPACITY,
      background: `${theme.custom.colors.primaryButton} !important`,
      backgroundColor: `${theme.custom.colors.primaryButton} !important,`,
    },
  },
  secondaryButton: {},
  negativeButton: {
    "&:hover": {
      opacity: HOVER_OPACITY,
      background: `${theme.custom.colors.negative} !important`,
      backgroundColor: `${theme.custom.colors.negative} !important,`,
    },
  },
  header: {
    color: theme.custom.colors.fontColor,
    fontSize: "24px",
    fontWeight: 500,
    lineHeight: "32px",
  },
  checkBox: {
    color: theme.custom.colors.primaryButton,
    width: "18px",
    height: "18px",
    "&.Mui-disabled": {
      opacity: 0.5,
    },
  },
  checkBoxRoot: {
    padding: 0,
  },
  checkBoxChecked: {
    color: `${theme.custom.colors.primaryButton} !important`,
    background: "white",
  },
  subtext: {
    color: theme.custom.colors.subtext,
  },
  checkFormButton: {
    display: "flex",
    marginTop: "8px",
    "&:hover": {
      backgroundColor: "transparent !important",
      background: "transparent !important",
      opacity: 0.8,
    },
  },
}));

export function WalletAddress({ publicKey, name, style, nameStyle }: any) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        display: "flex",
        ...style,
      }}
    >
      <Typography style={{ ...nameStyle, marginRight: "8px" }}>
        {name}
      </Typography>
      <Typography style={{ color: theme.custom.colors.secondary }}>
        ({walletAddressDisplay(publicKey)})
      </Typography>
    </div>
  );
}

export function TextFieldLabel({
  leftLabel,
  rightLabel,
  rightLabelComponent,
  style,
}: {
  leftLabel: string;
  rightLabel?: string;
  rightLabelComponent?: React.ReactNode;
  style?: any;
}) {
  const classes = useStyles();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "8px",
        ...style,
      }}
    >
      <Typography className={classes.leftLabel}>{leftLabel}</Typography>
      {rightLabelComponent ? (
        rightLabelComponent
      ) : (
        <Typography className={classes.rightLabel}>{rightLabel}</Typography>
      )}
    </div>
  );
}

export function TokenInputField({
  decimals,
  ...props
}: {
  decimals: number;
} & React.ComponentProps<typeof TextField>) {
  // Truncate token input fields to the native decimals of the token to prevent
  // floats
  const handleTokenInput = (
    amount: string,
    decimals: number,
    setValue: (
      displayAmount: string | null,
      nativeAmount: BigNumber | null
    ) => void
  ) => {
    if (amount !== "") {
      const decimalIndex = amount.indexOf(".");
      const truncatedAmount =
        decimalIndex >= 0
          ? amount.substring(0, decimalIndex) +
            amount.substring(decimalIndex, decimalIndex + decimals + 1)
          : amount;
      setValue(
        truncatedAmount,
        ethers.utils.parseUnits(truncatedAmount, decimals)
      );
    } else {
      setValue(null, null);
    }
  };

  return (
    <TextField
      {...props}
      // Override default TextField setValue with function to truncate decimal inputs
      setValue={(amount: string) => {
        handleTokenInput(amount, decimals, props.setValue);
      }}
    />
  );
}

export function Loading(props: any) {
  const classes = useStyles();
  return (
    <div className={classes.loadingContainer}>
      <>
        <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 to-white">
          <div className="bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),rgba(255,255,255,0))] absolute inset-0"></div>
          <div className="flex flex-col items-center justify-center gap-8 p-6">
            <div className="relative">
              <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-tr from-emerald-200 to-green-200 opacity-50 blur-xl"></div>
              <div className="relative rounded-xl bg-white/80 p-8 shadow-lg backdrop-blur-sm">
                <div className="relative">
                  <div className="h-16 w-16 animate-spin rounded-full bg-gradient-to-tr from-emerald-500 to-green-400">
                    <div className="absolute inset-[3px] rounded-full bg-white"></div>
                  </div>
                  <div className="absolute inset-[6px] animate-pulse rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 blur-sm"></div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-base font-medium text-gray-700">
                Connecting to Wallet
              </p>
              <p className="text-sm text-gray-400">
                Securing your connection...
              </p>
            </div>
          </div>
        </div>
      </>
    </div>
  );
}

export function PrimaryButton({
  buttonLabelStyle,
  label,
  className,
  ...buttonProps
}: {
  buttonLabelStyle?: React.CSSProperties;
  label?: string;
  isSecondary?: boolean;
} & React.ComponentProps<typeof Button>) {
  const theme = useCustomTheme();
  const classes = useStyles();
  return (
    <Button
      disableRipple
      disableElevation
      className={`${classes.button} ${className ?? classes.primaryButton}`}
      variant="contained"
      {...buttonProps}
      style={{
        backgroundColor: theme.custom.colors.primaryButton,
        color: theme.custom.colors.primaryButtonTextColor,
        fontWeight: 500,
        fontSize: "16px",
        lineHeight: "24px",
        textTransform: "none",
        ...buttonProps.style,
      }}
    >
      <Typography
        style={{
          fontWeight: 600,
          ...buttonLabelStyle,
        }}
        className={classes.buttonLabel}
      >
        {label}
      </Typography>
    </Button>
  );
}

export function NegativeButton({ label, onClick, ...buttonProps }: any) {
  const classes = useStyles();
  const theme = useCustomTheme();
  return (
    <PrimaryButton
      className={classes.negativeButton}
      label={label}
      onClick={onClick}
      style={{
        backgroundColor: theme.custom.colors.negative,
      }}
      buttonLabelStyle={{
        color: theme.custom.colors.negativeButtonTextColor,
      }}
      {...buttonProps}
    />
  );
}

export function SecondaryButton({
  buttonLabelStyle,
  label,
  ...buttonProps
}: {
  buttonLabelStyle?: React.CSSProperties;
  label?: string;
} & React.ComponentProps<typeof Button>) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const buttonStyle = {
    backgroundColor: theme.custom.colors.secondaryButton,
    color: theme.custom.colors.secondaryButtonTextColor,
    ...buttonProps.style,
  };
  return (
    <PrimaryButton
      className={classes.secondaryButton}
      buttonLabelStyle={buttonLabelStyle}
      label={label}
      isSecondary={true}
      {...buttonProps}
      style={buttonStyle}
    />
  );
}

export function DangerButton({
  buttonLabelStyle,
  label,
  ...buttonProps
}: {
  buttonLabelStyle?: React.CSSProperties;
  label?: string;
} & React.ComponentProps<typeof Button>) {
  const theme = useCustomTheme();
  const buttonStyle = Object.assign(
    {
      backgroundColor: theme.custom.colors.dangerButton,
      color: "#fff",
    },
    buttonProps.style
  );
  return (
    <PrimaryButton
      style={buttonStyle}
      buttonLabelStyle={buttonLabelStyle}
      label={label}
      {...buttonProps}
    />
  );
}

export function SubtextParagraph({
  children,
  style,
}: {
  children: any;
  style?: React.CSSProperties;
}) {
  const classes = useStyles();
  return (
    <p
      className={classes.subtext}
      style={{ fontWeight: 500, marginTop: "8px", ...style }}
    >
      {children}
    </p>
  );
}

export function Header({
  text,
  style = {},
}: {
  text: string;
  style?: React.CSSProperties;
}) {
  const classes = useStyles();
  return (
    <Typography className={classes.header} style={style}>
      {text}
    </Typography>
  );
}

export function HeaderIcon({
  icon,
  style,
}: {
  icon: any;
  style?: React.CSSProperties;
}) {
  return (
    <Box
      style={{
        display: "block",
        height: "56px",
        width: "56px",
        margin: "8px auto 16px auto",
        ...style,
      }}
    >
      {icon}
    </Box>
  );
}

export function Checkbox({
  checked,
  setChecked = () => {},
  ...checkboxProps
}: {
  checked: boolean;
  setChecked?: (value: boolean) => void;
} & React.ComponentProps<typeof _Checkbox>) {
  const classes = useStyles();
  return (
    <_Checkbox
      disableRipple
      className={classes.checkBox}
      checked={checked}
      onChange={() => setChecked(!checked)}
      classes={{
        checked: classes.checkBoxChecked,
        root: classes.checkBoxRoot,
      }}
      {...checkboxProps}
    />
  );
}

export function CheckboxForm({
  checked,
  setChecked,
  label,
}: {
  checked: boolean;
  setChecked: (value: boolean) => void;
  label: string | React.ReactNode;
}) {
  const classes = useStyles();
  return (
    <Button
      className={classes.checkFormButton}
      style={{
        padding: 0,
        textTransform: "none",
      }}
      onClick={() => setChecked(!checked)}
      disableRipple
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Checkbox
          checked={checked}
          setChecked={setChecked}
          sx={{ padding: 0 }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          marginLeft: "10px",
        }}
      >
        <Typography className={classes.subtext}>{label}</Typography>
      </div>
    </Button>
  );
}
