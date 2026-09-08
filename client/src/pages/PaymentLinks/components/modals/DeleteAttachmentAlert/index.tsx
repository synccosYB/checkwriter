import React from 'react';
import { Box, Typography, Dialog, DialogContent, DialogActions, IconButton, DialogTitle, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DeleteIcon } from '../../../../../components/Icons';
import { styles } from '../../../styles';
import { CustomButton } from '../../../../../components/buttons/CustomButton';

interface DeleteAttachmentAlertProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteAttachmentAlert: React.FC<DeleteAttachmentAlertProps> = ({
  open,
  onClose,
  onConfirm
}) => {
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
              <DeleteIcon />
            </Box>
          </Box>
        </Box>
        <Typography sx={{ ...styles.dialogTitle, xs: { mb: '19px' }, mb: '30px' }} align="center">
          Delete Attachment?
        </Typography>
        <Typography sx={styles.dialogContent} color="text.secondary" align="center">
          Are you sure you want to delete this file? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={styles.dialogActions}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={styles.cancelButton}
        >
          Cancel
        </Button>
        <CustomButton
          variant="contained"
          onClick={onConfirm}
          sx={{ ...styles.confirmButton, width: 'auto' }}

        >
          Delete
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAttachmentAlert;