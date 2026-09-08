import React, { useState } from 'react';
import { Box, Typography, Button, TextField } from "@mui/material";
import { CustomDialog } from "../../../../../components/dialog/CustomDialog";
import { CustomButton } from "../../../../../components/buttons/CustomButton";
import { styles } from '../../../styles';

interface AddNewModalProps {
  open: boolean;
  onClose: (newbank:any | null | undefined) => void;
  onSave: (data: string) => void;
  mapType: 'payee' | 'bank';
}

export const AddNewModal: React.FC<AddNewModalProps> = ({ 
  open, 
  onClose, 
  onSave, 
  mapType
}) => {
  const [data, setData] = useState<string>("");
  
  const handleSave = (): void => {
    onSave(data);
    // Don't reset des here, let the effect handle it when the modal reopens
  }

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      width='500px'
      title={`Add New ${mapType === 'payee' ? 'Payee' : 'Bank Account'}`}
      content={
        <Box>
          <Typography sx={{ fontSize: { xs: '16px', sm: '18px' }, fontWeight: '600', mb: '16px' }}>{mapType === 'payee' ? 'Payee Name' : 'Bank Account'}</Typography>

          <TextField
            fullWidth
            name="name"
            placeholder={`Enter ${mapType === 'payee' ? 'Payee Name' : 'Bank Account'}`}
            value={data}
            onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
              setData(ev.target.value);
            }}
            sx={styles.input}
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
  );
};
