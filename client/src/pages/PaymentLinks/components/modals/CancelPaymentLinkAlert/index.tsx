import React from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { PaymentCancelIcon } from "../../../../../components/Icons";
import { styles } from '../../../styles';

interface CancelPaymentLinkAlertProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const CancelPaymentLinkAlert: React.FC<CancelPaymentLinkAlertProps> = ({ open, onClose, onConfirm }) => {
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
        <Box sx={styles.alertIconContainer}>
          <Box sx={styles.alertIconBorder}>
            <Box sx={styles.alertIconMain}>
              <PaymentCancelIcon color = "white" width = '57px' height = '57px' />
            </Box>
          </Box>
        </Box>
        <Typography sx={{ ...styles.dialogTitle, xs: { mb: '19px' }, mb: '30px' }} align="center"  >
          Cancel Payment Link?
        </Typography>
        <Typography sx={styles.dialogContent} color="text.secondary" align="center"  >
          Are you sure you want to cancel this payment link?
          Once canceled, the recipient will no longer be able to make a payment using this link.
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
          Cancel Payment Link?
        </Button>
      </DialogActions>
    </Dialog>
  );
};
