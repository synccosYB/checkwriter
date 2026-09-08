import React from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { RemapAlertIcon } from "../../../../../components/Icons";
import { styles } from '../../../styles';

interface RemapAlertProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mapType: 'bank' | 'payee';
}

export const RemapAlert: React.FC<RemapAlertProps> = ({ open, onClose, onConfirm, mapType }) => {
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
          <Box sx={{...styles.alertIconBorder, backgroundColor: '#1e3a5f4D'}}>
            <Box sx={{...styles.alertIconMain, backgroundColor: '#1e3a5f'}}>
              <RemapAlertIcon color="white" width='57px' height='57px' />
            </Box>
          </Box>
        </Box>
        <Typography sx={{ ...styles.dialogTitle, xs: { mb: '19px' }, mb: '30px' }} align="center"  >
          Remap This {mapType === 'payee' ? 'Payee' : 'Bank'}?
        </Typography>
        <Typography sx={styles.dialogContent} color="text.secondary" align="center"  >
          Are you sure you want to remap this payee?<br />Remapping this payee will only affect future transactions. Previously processed transactions will retain their original mapping.
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
          Continue Remap
        </Button>
      </DialogActions>
    </Dialog>
  );
};
