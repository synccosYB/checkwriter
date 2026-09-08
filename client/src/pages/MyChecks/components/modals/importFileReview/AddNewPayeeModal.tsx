import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Button,
  Input,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styles } from "./styles";

interface AddNewPayeeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (payeeName: string) => void;
}

const AddNewPayeeModal: React.FC<AddNewPayeeModalProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [value, setValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
    if (!open) setValue("");
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      onSave(value.trim());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow:
            "0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)",
        },
      }}
    >
      <Box sx={styles.addPayeeModalContainer}>
        <Box sx={styles.addPayeeModalHeader}>
          <Typography sx={styles.addPayeeModalTitle}>Add New Payee</Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: "#6B7280",
              padding: 1,
              "&:hover": {
                backgroundColor: "#F3F4F6",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </Box>
        <Typography sx={styles.addPayeeModalLabel}>Payee Name</Typography>
        <Input
          ref={inputRef}
          value={value}
          type="text"
          onChange={handleChange}
          sx={styles.addPayeeModalInput}
          placeholder="Enter payee name"
          onKeyDown={handleKeyDown}
          disableUnderline
        />
        <Box sx={styles.addPayeeModalActions}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={styles.addPayeeModalCancelBtn}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => value.trim() && onSave(value.trim())}
            sx={styles.addPayeeModalSaveBtn}
            disabled={!value.trim()}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default AddNewPayeeModal;
