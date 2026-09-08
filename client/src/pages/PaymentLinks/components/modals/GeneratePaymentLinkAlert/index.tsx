import React, { useState } from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, TextField, Snackbar, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { PaymentCopyLinkIcon, PaymentLinkIcon } from "../../../../../components/Icons";
import { styles } from '../../../styles';

interface GeneratePaymentLinkAlertProps {
  open: boolean;
  link: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const GeneratePaymentLinkAlert: React.FC<GeneratePaymentLinkAlertProps> = ({ open, onClose, onConfirm, link }) => {
  const [showCopyAlert, setShowCopyAlert] = useState<boolean>(false);

  const handleCopyLink = () => {
    // Copy link to clipboard
    navigator.clipboard.writeText(link)
      .then(() => {
        // Show success alert
        setShowCopyAlert(true);
        // Call onConfirm callback
        onConfirm();
      })
      .catch((err) => {
        console.error('Failed to copy link: ', err);
      });
  };

  const handleCloseAlert = () => {
    setShowCopyAlert(false);
  };

  return (
    <>
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
            <Box sx={{...styles.alertIconBorder, backgroundColor: '#1e3a5f4D'}}>
              <Box sx={{...styles.alertIconMain, backgroundColor: '#1e3a5f'}}>
                <PaymentLinkIcon />
              </Box>
            </Box>
          </Box>
          <Typography sx={{ ...styles.dialogTitle, xs: { mb: '19px' }, mb: '30px' }} align="center">
            Payment Link Generated
          </Typography>
          <Typography sx={styles.dialogContent} color="text.secondary" align="center">
            Share the link below with your recipient to collect the payment.
          </Typography>

          <Box sx={{px: '100px', my: '24px'}}>
            <TextField
              fullWidth
              name="recipientName"
              value={link}
              disabled
              sx={{
                ...styles.input,
                width: '100%',
              }}
            />
          </Box>

        </DialogContent>
        <DialogActions sx={styles.deleteDialogActions}>          
          <Button
            onClick={handleCopyLink}
            variant="contained"
            sx={{ ...styles.confirmButton, width: 'auto', gap: '10px' }}
          >
            <PaymentCopyLinkIcon color="white" /> Copy Link
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={showCopyAlert} 
        autoHideDuration={3000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default GeneratePaymentLinkAlert;
