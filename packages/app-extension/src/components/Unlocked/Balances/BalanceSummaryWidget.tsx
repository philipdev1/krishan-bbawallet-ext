import { Skeleton, Typography } from "@mui/material";
import { formatUSD } from "@coral-xyz/common";
import { styles, useCustomTheme, HOVER_OPACITY } from "@coral-xyz/themes";
import {
  totalBalance as totalBalanceSelector,
  useLoader,
} from "@coral-xyz/recoil";

const useStyles = styles((theme) => ({
  button: {
    color: "#fff",
    "&:hover": {
      opacity: 1,
    },
    "&:hover p": {
      opacity: HOVER_OPACITY,
    },
  },
  balancesHeaderContainer: {
    paddingLeft: "24px",
    paddingRight: "24px",
    marginTop: "24px",
    width: "100%",
    borderRadius: "12px",
  },
  headerLabel: {
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: "24px",
  },
  totalBalance: {
    fontWeight: 600,
    fontSize: "40px",
    lineHeight: "36px",
    color: "inherit",
  },
  positive: {
    color: `${theme.custom.colors.positive} !important`,
    fontSize: "12px",
    lineHeight: "24px",
  },
  negative: {
    color: theme.custom.colors.negative,
    fontSize: "12px",
    lineHeight: "24px",
  },
}));

export function BalanceSummaryWidget() {
  const theme = useCustomTheme();
  const classes = useStyles();
  const [{ totalBalance, totalChange, percentChange }, _, isLoading] =
    useLoader(totalBalanceSelector, {
      totalBalance: 0,
      totalChange: 0,
      percentChange: 0,
    });
  return (
    <div style={{ display: "flex" }}>
      <div
        className={classes.balancesHeaderContainer}
        style={{
          textAlign: "center",
          marginLeft: "12px",
          marginRight: "12px",
          borderRadius: "12px",
        }}
      >
        <Typography
          className={classes.totalBalance}
          style={{
            color: theme.custom.colors.fontColor,
          }}
        >
          {isLoading ? (
            <Skeleton
              sx={{ backgroundColor: theme.custom.colors.balanceSkeleton }}
            />
          ) : (
            formatUSD(totalBalance)
          )}
        </Typography>
        <div
          style={{
            display: "flex",
            marginTop: "16px",
          }}
        >
          <div style={{ flex: 1 }} />
          <Typography
            style={{
              color:
                totalChange === 0
                  ? theme.custom.colors.neutral
                  : totalChange < 0
                  ? theme.custom.colors.negative
                  : theme.custom.colors.positive,
              paddingLeft: "0px",
              paddingRight: "0px",
              paddingTop: "2px",
              paddingBottom: "2px",
              marginRight: "12px",
              lineHeight: "24px",
            }}
          >
            {isLoading ? (
              <Skeleton
                width="100px"
                sx={{ backgroundColor: theme.custom.colors.balanceSkeleton }}
              />
            ) : (
              <>
                {totalChange > 0 ? "+" : ""}
                {formatUSD(totalChange)}
              </>
            )}
          </Typography>

          <Typography
            style={{
              color:
                totalChange === 0
                  ? theme.custom.colors.neutral
                  : totalChange < 0
                  ? theme.custom.colors.negative
                  : theme.custom.colors.positive,
              paddingLeft: "8px",
              paddingRight: "8px",
              paddingTop: "2px",
              paddingBottom: "2px",
              backgroundColor: isLoading
                ? undefined
                : totalChange === 0
                ? theme.custom.colors.balanceChangeNeutral
                : totalChange < 0
                ? theme.custom.colors.balanceChangeNegative
                : theme.custom.colors.balanceChangePositive,
              borderRadius: "28px",
              lineHeight: "24px",
            }}
          >
            {isLoading ? (
              <Skeleton
                width="100px"
                sx={{ backgroundColor: theme.custom.colors.balanceSkeleton }}
              />
            ) : (
              <>
                {totalChange > 0 ? "+" : ""}
                {Number.isFinite(percentChange)
                  ? `${percentChange.toFixed(2)}%`
                  : "0.00%"}
              </>
            )}
          </Typography>
          <div style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  );
}
