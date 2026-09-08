import React from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DisconnectQuickbooksAlertIcon } from "../../../../../components/Icons";
import { styles } from '../../../styles';

interface DisconnectAlertProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DisconnectAlert: React.FC<DisconnectAlertProps> = ({ open, onClose, onConfirm }) => {
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
              <DisconnectQuickbooksAlertIcon color="white" width='57px' height='57px' />
            </Box>
          </Box>
        </Box>
        <Typography sx={{ ...styles.dialogTitle, xs: { mb: '19px' }, mb: '30px' }} align="center"  >
          Disconnect QuickBooks?
        </Typography>
        <Typography sx={styles.dialogContent} color="text.secondary" align="center"  >
          Are you sure you want to disconnect your QuickBooks account? This will stop all sync activity between QuickBooks and this system. Your existing mapped payees and data will remain saved, but no new data will be synced.
        </Typography>

      </DialogContent>
      <DialogActions sx={styles.deleteDialogActions}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={styles.cancelButton}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{ ...styles.confirmButton, width: 'auto' }}
        >
          Disconnect
        </Button>
      </DialogActions>
    </Dialog>
  );
};
