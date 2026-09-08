import { useState, useEffect } from 'react';
import { CustomDialog } from "../../../../../components/dialog/CustomDialog";
import { Box, Typography, Button, TextField } from "@mui/material";
import { CustomButton } from "../../../../../components/buttons/CustomButton";
import { styles } from '../../../styles';

export const EditAttachmentDescriptionModal = ({ open, onClose, onSave, description = "" }) => {
  const [des, setDes] = useState(description);
  
  // Update des state when description prop changes
  useEffect(() => {
    setDes(description);
  }, [description]);
  
  const handleSave = () => {
    onSave(des);
    // Don't reset des here, let the effect handle it when the modal reopens
  }
  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title={'Edit Description'}
      content={
        <Box>
          <Typography sx={styles.checkBottomItemlabel}>Description</Typography>

          <TextField
            fullWidth
            name="description"
            placeholder="Description"
            value={des}
            onChange={(ev) => {
              setDes(ev.target.value)
            }}
            sx={{
              ...styles.input,
              width: '100% !important',
              mt: 1
            }}
          />
        </Box>
      }
      actions={
        <>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={styles.cancelButton}
          >
            Cancel
          </Button>
          <CustomButton
            variant="outlined"
            color="primary"
            onClick={handleSave}
            sx={{minWidth: '100px'}}
          >
            Save
          </CustomButton>
        </>
      }
    />
  )
}
