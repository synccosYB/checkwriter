import React, { useState } from 'react';
import { Box, Typography, Button, MenuItem, Select, Checkbox, ListItemText, Divider } from "@mui/material";
import { CustomDialog } from "../../../../../components/dialog/CustomDialog";
import { CustomButton } from "../../../../../components/buttons/CustomButton";
import AddIcon from '@mui/icons-material/Add';
import { styles } from '../../../styles';
import { AddNewModal } from '../../../../Bank/components/modals'
import useBanks from '../../../../../API/banks/useBanks';
import usePayees from '../../../../../API/payees/usePayees';
import useMapQuickbook from '../../../../../API/quickbook/useMapQuickbook';
import FormModalMUI from '../../../../../components/shared/Modals/FormModalMUI';
import AddPayee from '../../../../../components/views/forms/AddPayee';

interface MapModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mapType: 'bank' | 'payee';
  quickbookId: string;
}

export const MapModal: React.FC<MapModalProps> = ({
  open,
  onClose,
  onConfirm,
  mapType,
  quickbookId
}) => {

  const [selectedData, setSelectedData] = useState("");
  const [isAddPayeeModalOpen, setAddPayeeModalOpen] = useState(false)
  const [addNewBankModal, setAddNewBankModal] = useState(false) 
	const [showWarning, setWarning] = useState(false)

	const setDirty = (dirty) => {
		
	}

  const { data: bankData } = useBanks({ includeDeactivated: true, checkNumberType: 'auto' })
  const { data: payeedata } = usePayees()

  const {mutate: mapProfile} = useMapQuickbook();

  const payeeInfo = payeedata?.data;
  const bankInfo = bankData?.data?.filter((x) => x.bankPreferences?.checkNoGeneration === 'auto');

  const handleSave = (): void => {
    if(mapType === 'payee'){
      mapProfile({entityType: 'payees', quickbooksId: quickbookId, internalId: selectedData})
    }
    if(mapType === 'bank'){
      mapProfile({entityType: 'banks', quickbooksId: quickbookId, internalId: selectedData})
    }
    onClose();
  }


  const closeAddPayee = (newPayee) => {
		if (newPayee && newPayee?.data) {
			setSelectedData(newPayee?.data._id)
		}
		setAddPayeeModalOpen(false)
	}

  const handleNewBank = (newBank) => {
		if (newBank?.data) {
			setSelectedData(newBank?.data._id)
		}
		setAddNewBankModal(false)
	}

  return (
    <>
    <CustomDialog
      open={open}
      width='450px'
      onClose={onClose}
      title={'Select or Add New'}
      content={
        <Box>
          <Typography sx={{ fontSize: { xs: '16px', sm: '18px' }, fontWeight: '600', mb: '16px' }}>{mapType === 'payee' ? 'Payee Name' : 'Bank Account'}</Typography>
          <Select
            fullWidth
            value={selectedData}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <Typography sx={{ color: "text.secondary" }}>
                    Select {mapType === 'payee' ? 'Payee Name' : 'Bank Account'}
                  </Typography>
                );
              }
              else{
                if(mapType === 'payee') return payeeInfo.find((x) => x._id === selected)?.name
                if(mapType === 'bank') return bankInfo.find((x) => x._id === selected)?.accountName
              }
              return selected;
            }}
            sx={styles.select}
          >
            {
              mapType === 'payee' && payeeInfo ? payeeInfo.map((info) => (
                <MenuItem
                  key={`${info?.name}_filter_recipient`}
                  sx={{ ...styles.subMenuItem, py: 1 }}
                  onClick={() => setSelectedData(info._id)}
                >
                  <Checkbox
                    checked={false}
                  />
                  <Box>
                    <ListItemText primary={info?.name} />
                    <Typography sx={{ color: '#1e3a5f', textDecoration: 'underline', fontSize: '12px' }}>
                      {info?.email}
                    </Typography>
                  </Box>
                </MenuItem>
              )): null
            }
            {
              mapType === 'bank' && bankInfo ? bankInfo?.map((info) => (
                <MenuItem
                  key={`${info?.name}_filter_recipient`}
                  sx={{ ...styles.subMenuItem, py: 1, px: 2 }}
                  onClick={() => setSelectedData(info?._id)}
                >
                  <ListItemText primary={info?.accountName} />
                </MenuItem>
              )): null
            }
            <Divider sx={{ my: 1 }} />

            <MenuItem sx={{ ...styles.subMenuItem,py:'5px', color: '#1e3a5f', gap: 1, pl: 2 }} onClick={() => mapType === 'payee' ? setAddPayeeModalOpen(true) : setAddNewBankModal(true)}>
              <AddIcon />
              <Typography sx={{ fontSize: '16px' }}>
                Add New {mapType === 'payee' ? 'Payee' : 'Bank'}
              </Typography>
            </MenuItem>

          </Select>
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
            sx={{ minWidth: '100px' }}
          >
            Save
          </CustomButton>
        </>
      }
    />
    <AddNewModal open={addNewBankModal} onClose={handleNewBank} bankData={null}/>
     <FormModalMUI
                  title="Add new payee"
                  open={isAddPayeeModalOpen}
                  maxWidth="sm"
                  onClose={() => closeAddPayee(false)}
                  hideDividers={true}
                  styles={{
					title: {
						fontSize: '24px',
						fontWeight: 600,
						color: '#111827',
						mb: 1,
						lineHeight: 1.2
					}
				}}
                >
                  <AddPayee
                    onClose={closeAddPayee}
                    setDirty={setDirty}
                    warning={showWarning}
                    setWarning={setWarning}
                    isEdit={false}
                    payeeData={null}
                    onError={() => {}}
                  />
                </FormModalMUI>
    
    </>
  );
};
