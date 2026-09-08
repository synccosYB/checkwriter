import React from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styles } from '../../../styles';

interface ConnectStripeAccountProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConnectStripeAccountAlert: React.FC<ConnectStripeAccountProps> = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: styles.dialog
      }}
    >
      <Box sx={styles.dialogHeader}>
        <DialogTitle sx={styles.dialogTitle}>
        </DialogTitle>
        <IconButton
          onClick={onClose}
          sx={styles.dialogCloseButton}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 0 }}>
        <Typography sx={{ ...styles.dialogTitle, xs: { mb: '19px' }, mb: '30px' }} align="center"  >
          Strip account not connected
        </Typography>
        <Typography sx={styles.dialogContent} color="text.secondary" align="center"  >
          Please connect your stripe account to create payment links.
        </Typography>

      </DialogContent>
      <DialogActions sx={styles.deleteDialogActions}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={styles.cancelButton}
        >
          Go Back
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{...styles.confirmButton, width: 'auto'}}
        >
          Connect 
        </Button>
      </DialogActions>
    </Dialog>
  );
};
