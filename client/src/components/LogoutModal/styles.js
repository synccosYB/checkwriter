export const styles = {
  dialog: {
    width: {
      xs: "100%",
      sm: "685px",
    },
    maxWidth: "685px",
    minHeight: "252px",
    borderRadius: "12px",
    m: { xs: 2, sm: 0 },
  },
  dialogHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    px: { xs: 2, sm: 3 },
    pt: { xs: 2, sm: 3 },
    mb: "24px",
  },
  dialogTitle: {
    fontSize: {
      xs: "24px",
      sm: "32px",
    },
    lineHeight: {
      xs: "28px",
      sm: "36px",
    },
    p: 0,
    m: 0,
  },
  dialogCloseButton: {
    p: 0,
    color: "#1e3a5f",
    "& .MuiSvgIcon-root": {
      width: {
        xs: "20px",
        sm: "24px",
      },
      height: {
        xs: "20px",
        sm: "24px",
      },
    },
  },
  dialogContent: {
    px: { xs: 2, sm: 3 },

    fontSize: {
      xs: "14px",
      sm: "18px",
    },
    lineHeight: {
      xs: "20px",
      sm: "24px",
    },
  },
  dialogActions: {
    pt: { xs: 2, sm: 3 },
    pb: { xs: 3, sm: 4 },
    gap: "12px",
    justifyContent: "center",
  },
  logoutButton: {
    fontSize: "14px",
    lineHeight: "20px",
    height: "40px",
    minWidth: "100px",
    color: "black",
    textTransform: "none",
    borderColor: "#F5F5F5",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
      borderColor: "#F5F5F5",
      color: "black",
    },
  },
  primaryButton: {
    fontSize: "14px",
    lineHeight: "20px",
    height: "40px",
    minWidth: "100px",
    textTransform: "none",
    backgroundColor: "#1e3a5f",
    "&:hover": {
      backgroundColor: "#1a3850",
    },
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "120px",
    mb: "16px",
  },
  iconBorder: {
    width: "120px",
    height: "120px",
    backgroundColor: "#F03D3E1D",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  iconMain: {
    width: "100px",
    height: "100px",
    backgroundColor: "#F03D3E",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    "& .MuiSvgIcon-root": {
      color: "#fff",
      width: "50px",
      height: "50px",
    },
  },
};
