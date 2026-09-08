import React, { useState, useEffect } from 'react'
import {
        Dialog,
        DialogTitle,
        DialogContent,
        DialogActions,
        TextField,
        Button,
        IconButton,
        Box,
        Typography,
        CircularProgress,
        FormControl,
        InputLabel,
        Select,
        MenuItem,
        Chip,
        Divider,
        Alert,
        ToggleButton,
        ToggleButtonGroup
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PeopleIcon from '@mui/icons-material/People'
import FilterListIcon from '@mui/icons-material/FilterList'
import SendIcon from '@mui/icons-material/Send'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { useSendMassEmail, useMassEmailCount, useMassEmailPreview } from '../../../../../API/admin/useSendMassEmail'

const SUBSCRIPTION_OPTIONS = [
        { value: '', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'trialing', label: 'Trialing' },
        { value: 'canceled', label: 'Canceled' },
        { value: 'past_due', label: 'Past Due' },
        { value: 'unpaid', label: 'Unpaid' },
        { value: 'expired', label: 'Expired' },
        { value: 'none', label: 'None' }
]

const ROLE_OPTIONS = [
        { value: '', label: 'All Roles' },
        { value: 'user', label: 'User' },
        { value: 'superadmin', label: 'Super Admin' }
]

const MassEmailModal = ({ open, onClose, totalUserCount }) => {
        const [subject, setSubject] = useState('')
        const [body, setBody] = useState('')
        const [recipientScope, setRecipientScope] = useState('all')
        const [filterRole, setFilterRole] = useState('')
        const [filterSubscription, setFilterSubscription] = useState('')
        const [step, setStep] = useState('compose')

        const { mutate: sendMassEmail, isPending: isSending } = useSendMassEmail()
        const { mutate: getCount, isPending: isCounting, data: countData } = useMassEmailCount()
        const { mutate: getPreview, isPending: isLoadingPreview, data: previewData } = useMassEmailPreview()

        const recipientCount = countData?.recipientCount ?? null

        const hasActiveFilters = recipientScope === 'filtered' && (filterRole !== '' || filterSubscription !== '')

        const buildFilter = () => {
                if (recipientScope !== 'filtered') return {}
                const f = {}
                if (filterRole) f.role = filterRole
                if (filterSubscription) f.subscriptionStatus = filterSubscription
                return f
        }

        useEffect(() => {
                if (step === 'confirm') {
                        const f = {}
                        if (recipientScope === 'filtered') {
                                if (filterRole) f.role = filterRole
                                if (filterSubscription) f.subscriptionStatus = filterSubscription
                        }
                        getCount({ filter: f })
                        getPreview({ subject: subject.trim(), body: body.trim() })
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [step])

        const handleNext = () => {
                if (!subject.trim() || !body.trim()) return
                setStep('confirm')
        }

        const handleBack = () => {
                setStep('compose')
        }

        const handleSend = () => {
                const payload = {
                        subject: subject.trim(),
                        body: body.trim(),
                        filter: buildFilter()
                }

                sendMassEmail(payload, {
                        onSuccess: () => {
                                setStep('success')
                        }
                })
        }

        const handleReset = () => {
                setSubject('')
                setBody('')
                setRecipientScope('all')
                setFilterRole('')
                setFilterSubscription('')
                setStep('compose')
        }

        const handleClose = () => {
                handleReset()
                onClose()
        }

        const getFilterSummary = () => {
                const parts = []
                if (filterRole) {
                        const roleLabel = ROLE_OPTIONS.find((r) => r.value === filterRole)?.label || filterRole
                        parts.push(`Role: ${roleLabel}`)
                }
                if (filterSubscription) {
                        const statusLabel = SUBSCRIPTION_OPTIONS.find((o) => o.value === filterSubscription)?.label || filterSubscription
                        parts.push(`Subscription: ${statusLabel}`)
                }
                return parts
        }

        const recipientLabel =
                step === 'success' && recipientCount != null
                        ? `${recipientCount.toLocaleString()} user${recipientCount !== 1 ? 's' : ''}`
                        : recipientScope === 'all' && totalUserCount != null
                                ? `All ${totalUserCount.toLocaleString()} users`
                                : recipientScope === 'filtered' && !hasActiveFilters
                                        ? 'All users (no filters applied)'
                                        : 'Filtered users'

        return (
                <Dialog
                        open={open}
                        onClose={handleClose}
                        maxWidth={step === 'confirm' ? 'md' : 'sm'}
                        fullWidth
                        PaperProps={{
                                sx: { borderRadius: '12px' }
                        }}
                >
                        <DialogTitle
                                sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        pb: 1
                                }}
                        >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PeopleIcon fontSize="small" color="primary" />
                                        <Typography variant="h6" component="span" fontWeight={600}>
                                                Send Mass Email
                                        </Typography>
                                </Box>
                                <IconButton
                                        size="small"
                                        onClick={handleClose}
                                        disabled={isSending}
                                        aria-label="Close"
                                >
                                        <CloseIcon fontSize="small" />
                                </IconButton>
                        </DialogTitle>

                        <Divider />

                        {step === 'compose' && (
                                <>
                                        <DialogContent sx={{ pt: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                                <Box>
                                                        <Typography
                                                                variant="subtitle2"
                                                                color="text.secondary"
                                                                gutterBottom
                                                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                                        >
                                                                <FilterListIcon fontSize="inherit" />
                                                                Recipients
                                                        </Typography>

                                                        <ToggleButtonGroup
                                                                value={recipientScope}
                                                                exclusive
                                                                onChange={(_, v) => v && setRecipientScope(v)}
                                                                size="small"
                                                                sx={{ mb: 1.5 }}
                                                        >
                                                                <ToggleButton value="all">All Users</ToggleButton>
                                                                <ToggleButton value="filtered">Filtered</ToggleButton>
                                                        </ToggleButtonGroup>

                                                        {recipientScope === 'filtered' && (
                                                                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
                                                                        <FormControl size="small" sx={{ minWidth: 160 }}>
                                                                                <InputLabel>Role</InputLabel>
                                                                                <Select
                                                                                        value={filterRole}
                                                                                        label="Role"
                                                                                        onChange={(e) => setFilterRole(e.target.value)}
                                                                                >
                                                                                        {ROLE_OPTIONS.map((opt) => (
                                                                                                <MenuItem key={opt.value} value={opt.value}>
                                                                                                        {opt.label}
                                                                                                </MenuItem>
                                                                                        ))}
                                                                                </Select>
                                                                        </FormControl>

                                                                        <FormControl size="small" sx={{ minWidth: 190 }}>
                                                                                <InputLabel>Subscription Status</InputLabel>
                                                                                <Select
                                                                                        value={filterSubscription}
                                                                                        label="Subscription Status"
                                                                                        onChange={(e) => setFilterSubscription(e.target.value)}
                                                                                >
                                                                                        {SUBSCRIPTION_OPTIONS.map((opt) => (
                                                                                                <MenuItem key={opt.value} value={opt.value}>
                                                                                                        {opt.label}
                                                                                                </MenuItem>
                                                                                        ))}
                                                                                </Select>
                                                                        </FormControl>
                                                                </Box>
                                                        )}

                                                        {hasActiveFilters && (
                                                                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1 }}>
                                                                        {getFilterSummary().map((part) => (
                                                                                <Chip key={part} label={part} size="small" variant="outlined" />
                                                                        ))}
                                                                </Box>
                                                        )}
                                                </Box>

                                                <Divider />

                                                <TextField
                                                        label="Subject"
                                                        required
                                                        fullWidth
                                                        size="small"
                                                        value={subject}
                                                        onChange={(e) => setSubject(e.target.value)}
                                                        inputProps={{ maxLength: 200 }}
                                                        placeholder="e.g. Important update to your account"
                                                />

                                                <TextField
                                                        label="Message"
                                                        required
                                                        fullWidth
                                                        multiline
                                                        rows={7}
                                                        value={body}
                                                        onChange={(e) => setBody(e.target.value)}
                                                        placeholder="Write your message here..."
                                                        inputProps={{ maxLength: 10000 }}
                                                />
                                        </DialogContent>

                                        <Divider />

                                        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                                                <Button
                                                        onClick={handleClose}
                                                        variant="outlined"
                                                        sx={{
                                                                textTransform: 'none',
                                                                borderColor: '#E5E7EB',
                                                                color: '#374151',
                                                                '&:hover': { borderColor: '#D1D5DB' }
                                                        }}
                                                >
                                                        Cancel
                                                </Button>
                                                <Button
                                                        variant="contained"
                                                        onClick={handleNext}
                                                        disabled={!subject.trim() || !body.trim()}
                                                        endIcon={<SendIcon />}
                                                        sx={{
                                                                textTransform: 'none',
                                                                backgroundColor: '#204464',
                                                                '&:hover': { backgroundColor: '#1a3850' }
                                                        }}
                                                >
                                                        Review & Send
                                                </Button>
                                        </DialogActions>
                                </>
                        )}

                        {step === 'confirm' && (
                                <>
                                        <DialogContent sx={{ pt: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                <Alert
                                                        severity="info"
                                                        icon={<PeopleIcon />}
                                                        sx={{ alignItems: 'center' }}
                                                >
                                                        <Typography variant="body2">
                                                                This email will be sent to{' '}
                                                                <strong>
                                                                        {isCounting
                                                                                ? '...'
                                                                                : recipientCount != null
                                                                                        ? `${recipientCount.toLocaleString()} user${recipientCount !== 1 ? 's' : ''}`
                                                                                        : recipientLabel}
                                                                </strong>.
                                                                {recipientScope === 'filtered' && !hasActiveFilters && (
                                                                        <> No filters are active, so all users will receive it.</>
                                                                )}
                                                        </Typography>
                                                </Alert>

                                                {hasActiveFilters && (
                                                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                                                                {getFilterSummary().map((part) => (
                                                                        <Chip key={part} label={part} size="small" variant="outlined" />
                                                                ))}
                                                        </Box>
                                                )}

                                                <Typography variant="subtitle2" color="text.secondary">
                                                        Email Preview
                                                </Typography>

                                                <Box
                                                        sx={{
                                                                border: '1px solid',
                                                                borderColor: 'divider',
                                                                borderRadius: 1.5,
                                                                overflow: 'hidden',
                                                                backgroundColor: '#f0f1f5',
                                                                minHeight: 300
                                                        }}
                                                >
                                                        {isLoadingPreview ? (
                                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                                                                        <CircularProgress size={32} />
                                                                </Box>
                                                        ) : previewData?.html ? (
                                                                <iframe
                                                                        srcDoc={previewData.html}
                                                                        title="Email Preview"
                                                                        sandbox=""
                                                                        style={{
                                                                                width: '100%',
                                                                                height: '450px',
                                                                                border: 'none',
                                                                                display: 'block'
                                                                        }}
                                                                />
                                                        ) : (
                                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                                Unable to load preview
                                                                        </Typography>
                                                                </Box>
                                                        )}
                                                </Box>
                                        </DialogContent>

                                        <Divider />

                                        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                                                <Button
                                                        onClick={handleBack}
                                                        variant="outlined"
                                                        disabled={isSending}
                                                        sx={{
                                                                textTransform: 'none',
                                                                borderColor: '#E5E7EB',
                                                                color: '#374151',
                                                                '&:hover': { borderColor: '#D1D5DB' }
                                                        }}
                                                >
                                                        Back
                                                </Button>
                                                <Button
                                                        onClick={handleSend}
                                                        variant="contained"
                                                        disabled={isSending || isCounting || isLoadingPreview || !previewData?.html || recipientCount === 0}
                                                        sx={{
                                                                textTransform: 'none',
                                                                backgroundColor: '#204464',
                                                                '&:hover': { backgroundColor: '#1a3850' }
                                                        }}
                                                        endIcon={
                                                                isSending ? (
                                                                        <CircularProgress size={14} color="inherit" />
                                                                ) : <SendIcon />
                                                        }
                                                >
                                                        {isSending
                                                                ? 'Sending...'
                                                                : `Send to ${recipientCount != null ? recipientCount.toLocaleString() : '...'} User${recipientCount !== 1 ? 's' : ''}`}
                                                </Button>
                                        </DialogActions>
                                </>
                        )}

                        {step === 'success' && (
                                <>
                                        <DialogContent sx={{ pt: 4, pb: 2, textAlign: 'center' }}>
                                                <CheckCircleOutlineIcon
                                                        sx={{ fontSize: 64, color: '#059669', mb: 2 }}
                                                />
                                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                                        Mass Email Initiated
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                        Your email is being sent to{' '}
                                                        <strong>{recipientCount?.toLocaleString()}</strong> recipient
                                                        {recipientCount !== 1 ? 's' : ''} in the background.
                                                        Individual sends are logged to each user's email history.
                                                </Typography>
                                        </DialogContent>

                                        <Divider />

                                        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'center' }}>
                                                <Button
                                                        onClick={handleClose}
                                                        variant="contained"
                                                        sx={{
                                                                textTransform: 'none',
                                                                backgroundColor: '#204464',
                                                                '&:hover': { backgroundColor: '#1a3850' }
                                                        }}
                                                >
                                                        Done
                                                </Button>
                                        </DialogActions>
                                </>
                        )}
                </Dialog>
        )
}

export default MassEmailModal
