import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  DialogProps as MuiDialogProps,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styles } from './styles';

// Create a custom interface that doesn't extend DialogProps
interface CustomDialogProps {
  open: boolean;
  onClose: (event: React.MouseEvent<HTMLButtonElement>) => void;
  modalIcon?: React.ReactNode;
  title?: React.ReactNode;
  content: React.ReactNode;
  actions?: React.ReactNode;
  width?: string | undefined;
  // Add any other DialogProps you want to support
  maxWidth?: MuiDialogProps['maxWidth'];
  fullWidth?: boolean;
  fullScreen?: boolean;
  TransitionComponent?: MuiDialogProps['TransitionComponent'];
  TransitionProps?: MuiDialogProps['TransitionProps'];
  disableEscapeKeyDown?: boolean;
  PaperProps?: MuiDialogProps['PaperProps'];
  sx?: MuiDialogProps['sx'];
}

export const CustomDialog: React.FC<CustomDialogProps> = ({
  open,
  onClose,
  modalIcon,
  title,
  content,
  actions,
  width,
  // Extract other DialogProps
  maxWidth = null,
  fullWidth,
  fullScreen,
  TransitionComponent,
  TransitionProps,
  disableEscapeKeyDown,
  PaperProps = {},
  sx,
  ...otherProps
}) => {
  // Merge PaperProps with our default styles
  const mergedPaperProps = {
    ...PaperProps,
    sx: { 
      ...styles.paper, 
      minWidth: { xs: '400px', sm: width },
      ...(PaperProps.sx || {})
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      TransitionComponent={TransitionComponent}
      TransitionProps={TransitionProps}
      disableEscapeKeyDown={disableEscapeKeyDown}
      PaperProps={mergedPaperProps}
      sx={sx}
      {...otherProps}
    >
      <Box sx={styles.header}>
        <DialogTitle sx={styles.title}>
          {modalIcon && modalIcon} {title}
        </DialogTitle>
        <IconButton
          onClick={(e) => onClose(e)}
          sx={styles.closeButton}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={styles.content}>
        {content}
      </DialogContent>
      {actions && (
        <DialogActions sx={styles.actions}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CustomDialog;
