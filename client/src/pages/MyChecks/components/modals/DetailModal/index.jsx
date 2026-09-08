import { CustomDialog } from '../../../../../components/dialog/CustomDialog'
import {
        Box,
        CircularProgress,
        Fade,
        Paper,
        Popper,
        Typography
} from '@mui/material'
import { CustomButton } from '../../../../../components/buttons/CustomButton'
import { styles } from '../../../styles'
import {
        ClearedIcon,
        PrintIcon,
        MailboxIcon,
        EmailIcon,
        CheckDeleteIcon,
        VoiceIcon
} from '../../../../../components/Icons'
import dayjs from 'dayjs'
import { getStatusColor } from '../../../utils/getStatusColor'

import TagViewer from '../../TagViewer'
import { AttachmentItem } from '../../AttachmentItem'
import { useState } from 'react'
import { AlertModal } from '../AlertModal'

export const DetailModal = ({
        open,
        onClose,
        checkData,
        handleEmailClick,
        onCleared,
        onPrint,
        onDelete,
        isPrinting = false,
        handleVoid,
        tags,
        onMail,
        triggerOnCloseOnActions = true
}) => {
        const [attachmentsAnchorEL, setAttachmentsAnchorEl] = useState(null)
        const [openAlertDialog, setOpenAlertDialog] = useState({
                open: false,
                type: ''
        })
        const handleDelete = () => {
                onDelete()
                if (triggerOnCloseOnActions) onClose()
        }
        const handleMail = () => {
                onMail()
                if (triggerOnCloseOnActions) onClose()
        }
        const handleEmail = () => {
                handleEmailClick()
                if (triggerOnCloseOnActions) onClose()
        }
        const handlePrint = () => {
                onPrint()
        }
        const handleCleared = () => {
                setOpenAlertDialog({ open: true, type: 'cleared' })
        }

        const handleConfirmAlert = (type) => {
                if (type === 'cleared') {
                        onCleared()
                }
                if (triggerOnCloseOnActions) onClose()
        }

        return (
                <CustomDialog
                        open={open}
                        onClose={onClose}
                        width="650px"
                        title="Checks Details"
                        sx={styles.detailModal}
                        content={
                                <Box>
                                        <Typography color="#00000099" sx={{ mb: '24px' }}>
                                                View generated check details
                                        </Typography>

                                        <Box sx={styles.detailContainer}>
                                                <Box sx={styles.detailItem}>
                                                        <Typography sx={styles.detailTitle}>Check No.</Typography>
                                                        <Typography sx={styles.detailValue}>
                                                                {checkData && checkData.checkNumber}
                                                        </Typography>
                                                </Box>
                                                <Box sx={styles.detailItem}>
                                                        <Typography sx={styles.detailTitle}>Amount</Typography>
                                                        <Typography sx={styles.detailValue}>
                                                                {checkData && checkData.amount}
                                                        </Typography>
                                                </Box>

                                                <Box sx={styles.detailItem}>
                                                        <Typography sx={styles.detailTitle}>Bank Account</Typography>
                                                        <Typography sx={styles.detailValue}>
                                                                {checkData && checkData.bank?.bankName}
                                                        </Typography>
                                                </Box>

                                                <Box sx={styles.detailItem}>
                                                        <Typography sx={styles.detailTitle}>Payee Name</Typography>
                                                        <Typography sx={styles.detailValue}>
                                                                {checkData && checkData.payee?.name}
                                                        </Typography>
                                                </Box>

                                                <Box sx={styles.detailItem}>
                                                        <Typography sx={styles.detailTitle}>Issued Date</Typography>
                                                        <Typography sx={styles.detailValue}>
                                                                {checkData && dayjs(checkData.issuedDate).format('MM/DD/YYYY')}
                                                        </Typography>
                                                </Box>

                                                <Box sx={styles.detailItem}>
                                                        <Typography sx={styles.detailTitle}>Status</Typography>
                                                        <Typography sx={styles.detailValue}>
                                                                <CustomButton
                                                                        size="small"
                                                                        sx={{
                                                                                width: '110px',
                                                                                color: getStatusColor(checkData && checkData.status),
                                                                                backgroundColor: `${getStatusColor(
                                                                                        checkData && checkData.status
                                                                                )}0D`,
                                                                                border: `1px solid ${getStatusColor(
                                                                                        checkData && checkData.status
                                                                                )}`,
                                                                                '&:hover': {
                                                                                        backgroundColor: `${getStatusColor(
                                                                                                checkData && checkData.status
                                                                                        )}1A`,
                                                                                        border: `1px solid ${getStatusColor(
                                                                                                checkData && checkData.status
                                                                                        )}`
                                                                                }
                                                                        }}
                                                                >
                                                                        {checkData && checkData.status}
                                                                </CustomButton>
                                                        </Typography>
                                                </Box>
                                                <TagViewer tags={tags} row={checkData} mode="detail" />

                                                <Box sx={styles.detailItem}>
                                                        <Typography sx={styles.detailTitle}>Account Nickname</Typography>
                                                        <Typography sx={styles.detailValue}>
                                                                {checkData && checkData.bank?.accountNickName}
                                                        </Typography>
                                                </Box>
                                                <Box sx={styles.detailItem}>
                                                        <Typography sx={styles.detailTitle}>Attachments</Typography>
                                                        <Box
                                                                sx={{
                                                                        ...styles.detailValue,
                                                                        display: 'flex',
                                                                        gap: '12px',
                                                                        alignItems: 'center'
                                                                }}
                                                        >
                                                                {(checkData?.attachments || [])
                                                                        .slice(0, 2)
                                                                        .map((attachment, index) => (
                                                                                <AttachmentItem
                                                                                        key={'attachment_detail_show' + index}
                                                                                        attachment={attachment}
                                                                                />
                                                                        ))}
                                                                {(checkData?.attachments || []).length > 2 && (
                                                                        <Box>
                                                                                <Typography
                                                                                        sx={{ color: '#000000DE', cursor: 'pointer' }}
                                                                                        onMouseEnter={(event) => {
                                                                                                setAttachmentsAnchorEl(event.currentTarget)
                                                                                        }}
                                                                                        onMouseLeave={() => {
                                                                                                setAttachmentsAnchorEl(null)
                                                                                        }}
                                                                                >
                                                                                        +{(checkData?.attachments || []).length - 2}
                                                                                </Typography>

                                                                                <Popper
                                                                                        open={Boolean(attachmentsAnchorEL)}
                                                                                        anchorEl={attachmentsAnchorEL}
                                                                                        placement="bottom"
                                                                                        style={{ zIndex: 9999 }}
                                                                                        transition
                                                                                        modifiers={[
                                                                                                {
                                                                                                        name: 'offset',
                                                                                                        options: {
                                                                                                                offset: [0, 8]
                                                                                                        }
                                                                                                }
                                                                                        ]}
                                                                                >
                                                                                        {({ TransitionProps }) => (
                                                                                                <Fade {...TransitionProps} timeout={200}>
                                                                                                        <Paper
                                                                                                                sx={{ ...styles.tagTablePaper, minWidth: '230px' }}
                                                                                                        >
                                                                                                                {(checkData?.attachments?.slice(2) || [])?.map(
                                                                                                                        (attachment, index) => (
                                                                                                                                <AttachmentItem
                                                                                                                                        key={'attachment_detail' + index}
                                                                                                                                        attachment={attachment}
                                                                                                                                />
                                                                                                                        )
                                                                                                                )}
                                                                                                        </Paper>
                                                                                                </Fade>
                                                                                        )}
                                                                                </Popper>
                                                                        </Box>
                                                                )}
                                                        </Box>
                                                </Box>
                                        </Box>

                                        {openAlertDialog.open && (
                                                <AlertModal
                                                        open={openAlertDialog.open}
                                                        onClose={() =>
                                                                setOpenAlertDialog({ open: false, type: 'cleared' })
                                                        }
                                                        checkData={checkData}
                                                        onConfirm={() => handleConfirmAlert(openAlertDialog.type)}
                                                        type={openAlertDialog.type}
                                                />
                                        )}
                                </Box>
                        }
                        actions={
                                <Box sx={styles.actionsContainer}>
                                        {checkData.permissions.canDelete && (
                                                <CustomButton
                                                        startIcon={<CheckDeleteIcon color="#FF4D4F" />}
                                                        variant="outlined"
                                                        sx={styles.actionDeleteButton}
                                                        onClick={handleDelete}
                                                >
                                                        Delete
                                                </CustomButton>
                                        )}
                                        {checkData.permissions.canMail && (
                                                <CustomButton
                                                        startIcon={<MailboxIcon width="16px" height="16px" />}
                                                        variant="outlined"
                                                        sx={styles.actionButton}
                                                        onClick={handleMail}
                                                >
                                                        Mail
                                                </CustomButton>
                                        )}
                                        {checkData.permissions.canEmail && (
                                                <CustomButton
                                                        startIcon={<EmailIcon color="#000000DE" />}
                                                        variant="outlined"
                                                        sx={styles.actionButton}
                                                        onClick={handleEmail}
                                                >
                                                        Email
                                                </CustomButton>
                                        )}

                                        {checkData.permissions.canPrint && (
                                                <CustomButton
                                                        disabled={isPrinting}
                                                        startIcon={<PrintIcon color="#000000DE" />}
                                                        variant="outlined"
                                                        sx={styles.actionButton}
                                                        onClick={handlePrint}
                                                        endIcon={isPrinting && <CircularProgress size={'14px'} />}
                                                >
                                                        Print
                                                </CustomButton>
                                        )}
                                        {checkData.permissions.canVoid && (
                                                <CustomButton
                                                        variant="outlined"
                                                        startIcon={<VoiceIcon color="#FF4D4F" />}
                                                        sx={styles.actionVoidButton}
                                                        onClick={handleVoid}
                                                >
                                                        Void
                                                </CustomButton>
                                        )}
                                        {checkData.permissions.canClear && (
                                                <CustomButton
                                                        startIcon={<ClearedIcon color="#FFF" />}
                                                        variant="outlined"
                                                        color="primary"
                                                        onClick={handleCleared}
                                                >
                                                        Cleared Check
                                                </CustomButton>
                                        )}
                                </Box>
                        }
                />
        )
}
