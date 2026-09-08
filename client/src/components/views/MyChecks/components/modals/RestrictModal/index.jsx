import React from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import { styles } from "./styles";

export const RestrictModal = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: styles.dialog,
      }}
    >
      <Box sx={styles.dialogHeader}>
        <DialogTitle sx={styles.dialogTitle}></DialogTitle>
        <IconButton onClick={onClose} sx={styles.dialogCloseButton}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={styles.restrictedIconContainer}>
          <Box sx={styles.restrictedIconBorder}>
            <Box sx={styles.restrictedIconMain}>
              <NotInterestedIcon sx={{ color: "#fff" }} fontSize="57px" />
            </Box>
          </Box>
        </Box>
        <Typography
          sx={{ ...styles.dialogTitle, xs: { mb: "19px" }, mb: "30px" }}
          align="center"
        >
          Mailing Feature Unavailable
        </Typography>
        <Typography sx={styles.dialogContent} color = "text.secondary" align="center">
          This feature is only available with a paid subscription.
          <br /> Upgrade now to unlock mailing access.
        </Typography>
      </DialogContent>
      <DialogActions sx={styles.deleteDialogActions}>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={styles.confirmButton}
        >
          Upgrade Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};
