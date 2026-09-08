import { SxProps, Theme } from "@mui/material";

interface ProgressBarStyles {
  progressBarContainer: SxProps<Theme>;
  progressBar: SxProps<Theme>;
  progressBarText: SxProps<Theme>;
}

export const styles: ProgressBarStyles = {
  progressBarContainer: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  progressBar: {
    width: "100%",
    height: { xs: "10px", sm: "16px" },
    backgroundColor: "#E0E0E0",
    borderRadius: "32px",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    minWidth: "100px",
  },
  progressBarText: {
    position: "absolute",
    left: "5px",
    fontWeight: 600,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: { xs: "8px", sm: "9px" },
    color: "#fff",
    lineHeight: "1",
  },
}; 