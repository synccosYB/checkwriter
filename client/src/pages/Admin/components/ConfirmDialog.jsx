import {
  Button,
  CircularProgress
} from '@mui/material'
import { CustomDialog } from '../../../components/dialog/CustomDialog'
import { CustomButton } from '../../../components/buttons/CustomButton'

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  variant = 'error'
}) => {
  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title={title}
      content={message}
      actions={
        <>
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={isLoading}
            sx={{
              fontSize: '14px',
              height: '40px',
              color: '#204464',
              border: 'none',
              '&:hover': { border: 'none', backgroundColor: 'rgba(0,0,0,0.04)' }
            }}
          >
            {cancelLabel}
          </Button>
          <CustomButton
            variant="outlined"
            color={variant}
            onClick={onConfirm}
            disabled={isLoading}
            endIcon={isLoading ? <CircularProgress size={14} /> : null}
          >
            {confirmLabel}
          </CustomButton>
        </>
      }
    />
  )
}
