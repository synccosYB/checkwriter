import { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { AdminPageWrapper } from '../components/AdminPageWrapper'
import { CustomButton } from '../../../components/buttons/CustomButton'
import {
  useAdminPlatformSettings,
  useAdminUpdatePlatformSettings
} from '../../../API/admin/useAdminPlatformSettings'

const MAILING_PRICE_FIELDS = [
  { key: 'standardMailPrice', label: 'Standard Mail', prefix: '$' },
  { key: 'firstClassMailPrice', label: 'First Class Mail', prefix: '$' },
  { key: 'certifiedMailPrice', label: 'Certified Mail (with Tracking)', prefix: '$' }
]

const LEGACY_MAILING_KEYS = ['priorityMailPrice', 'expressMailPrice', 'internationalMailPrice']

const PlatformSettings = () => {
  const { data, isLoading, error: loadError } = useAdminPlatformSettings()
  const { mutate: updateSettings, isPending: isSaving, error: saveError, isSuccess } = useAdminUpdatePlatformSettings()

  const [generalSettings, setGeneralSettings] = useState({})
  const [mailingPrices, setMailingPrices] = useState({})
  const [validationErrors, setValidationErrors] = useState({})
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (data) {
      let settings = data.settings || data.data || data
      const general = {}
      const pricing = {}

      if (Array.isArray(settings)) {
        const map = {}
        settings.forEach((item) => {
          if (item && item.key) {
            map[item.key] = item.parsedValue !== undefined ? item.parsedValue : item.value
          }
        })
        settings = map
      }

      const mailingKeys = MAILING_PRICE_FIELDS.map((f) => f.key)

      if (typeof settings === 'object') {
        Object.entries(settings).forEach(([key, value]) => {
          if (mailingKeys.includes(key)) {
            pricing[key] = value
          } else if (key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt' && !LEGACY_MAILING_KEYS.includes(key)) {
            general[key] = value
          }
        })
      }

      setGeneralSettings(general)
      setMailingPrices(pricing)
    }
  }, [data])

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess])

  const validatePrices = () => {
    const errors = {}
    MAILING_PRICE_FIELDS.forEach(({ key }) => {
      const val = mailingPrices[key]
      if (val !== undefined && val !== '' && (isNaN(Number(val)) || Number(val) < 0)) {
        errors[key] = 'Must be a valid positive number'
      }
    })
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = () => {
    if (!validatePrices()) return
    const payload = { ...generalSettings, ...mailingPrices }
    updateSettings(payload)
  }

  const handleGeneralChange = (key, value) => {
    setGeneralSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handlePriceChange = (key, value) => {
    const cleaned = value.replace(/[^0-9.]/g, '')
    if (/^\d*\.?\d*$/.test(cleaned)) {
      setMailingPrices((prev) => ({ ...prev, [key]: cleaned }))
      if (validationErrors[key]) {
        setValidationErrors((prev) => { const copy = { ...prev }; delete copy[key]; return copy })
      }
    }
  }

  if (isLoading) {
    return (
      <AdminPageWrapper title="Platform Settings" description="Configure platform-wide settings and mailing prices.">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </AdminPageWrapper>
    )
  }

  const generalEntries = Object.entries(generalSettings)

  return (
    <AdminPageWrapper
      title="Platform Settings"
      description="Configure platform-wide settings and mailing prices. Changes take effect immediately after saving."
    >
      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>Failed to load settings. Please try again.</Alert>
      )}
      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }}>Failed to save settings: {saveError?.message || 'Unknown error'}</Alert>
      )}
      {showSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>Settings saved successfully.</Alert>
      )}

      <Card variant="outlined" sx={{ mb: 3, borderRadius: '12px' }}>
        <CardHeader
          title="Mailing Prices"
          titleTypographyProps={{ fontSize: '18px', fontWeight: 600 }}
          sx={{ pb: 0 }}
        />
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
            {MAILING_PRICE_FIELDS.map(({ key, label, prefix }) => (
              <TextField
                key={key}
                label={label}
                value={mailingPrices[key] ?? ''}
                onChange={(e) => handlePriceChange(key, e.target.value)}
                size="small"
                fullWidth
                error={!!validationErrors[key]}
                helperText={validationErrors[key]}
                InputProps={{
                  startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : null
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {generalEntries.length > 0 && (
        <Card variant="outlined" sx={{ mb: 3, borderRadius: '12px' }}>
          <CardHeader
            title="General Settings"
            titleTypographyProps={{ fontSize: '18px', fontWeight: 600 }}
            sx={{ pb: 0 }}
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {generalEntries.map(([key, value]) => (
                <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ minWidth: 200, fontSize: '14px', fontWeight: 500 }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                  </Typography>
                  <TextField
                    value={typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')}
                    onChange={(e) => handleGeneralChange(key, e.target.value)}
                    size="small"
                    fullWidth
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <CustomButton
          variant="outlined"
          color="primary"
          onClick={handleSave}
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </CustomButton>
      </Box>
    </AdminPageWrapper>
  )
}

export default PlatformSettings
