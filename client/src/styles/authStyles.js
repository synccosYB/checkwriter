export const authColors = {
  navy: '#1a2332',
  navyLight: '#1e3a5f',
  navyDark: '#0f1824',
  slate: '#334155',
  slateLight: '#64748b',
  accent: '#c9953c',
  accentLight: '#d4a85c',
  surface: '#ffffff',
  background: '#f8fafc',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  error: '#dc2626',
  errorLight: '#fef2f2',
  success: '#16a34a',
  successLight: '#f0fdf4',
  focusRing: 'rgba(30, 58, 95, 0.2)',
}

export const authInputSx = {
  '& .MuiOutlinedInput-root': {
    height: '48px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    fontSize: '15px',
    '& fieldset': {
      borderColor: authColors.border,
      transition: 'border-color 0.2s ease',
    },
    '&:hover fieldset': {
      borderColor: authColors.slateLight,
    },
    '&.Mui-focused fieldset': {
      borderColor: authColors.navyLight,
      borderWidth: '2px',
    },
  },
  '& .MuiInputBase-input': {
    color: authColors.textPrimary,
    padding: '12px 14px',
    '&::placeholder': {
      color: authColors.textMuted,
      opacity: 1,
    },
  },
}

export const authLabelSx = {
  color: authColors.textSecondary,
  marginBottom: '6px',
  fontSize: '14px',
  fontWeight: 500,
  letterSpacing: '0.01em',
}

export const authRequiredStar = {
  color: authColors.accent,
}

export const authErrorSx = {
  color: authColors.error,
  fontSize: '12px',
  mt: '4px',
  fontWeight: 500,
}

export const authPrimaryButtonSx = {
  height: '48px',
  width: '100%',
  background: `linear-gradient(135deg, ${authColors.navy} 0%, ${authColors.navyLight} 100%)`,
  borderRadius: '8px',
  color: '#fff',
  fontSize: '15px',
  fontWeight: 600,
  textTransform: 'none',
  letterSpacing: '0.02em',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: `linear-gradient(135deg, ${authColors.navyDark} 0%, ${authColors.navy} 100%)`,
    boxShadow: '0 4px 12px rgba(26, 35, 50, 0.3)',
  },
  '&:disabled': {
    background: authColors.border,
    color: authColors.textMuted,
    boxShadow: 'none',
  },
}

export const authSecondaryButtonSx = {
  height: '48px',
  width: '100%',
  borderRadius: '8px',
  border: `1.5px solid ${authColors.border}`,
  color: authColors.textPrimary,
  fontSize: '15px',
  fontWeight: 600,
  textTransform: 'none',
  backgroundColor: '#fff',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: authColors.background,
    borderColor: authColors.slateLight,
  },
  '&:disabled': {
    borderColor: authColors.border,
    color: authColors.textMuted,
  },
}

export const authCheckboxSx = {
  color: authColors.border,
  '&.Mui-checked': {
    color: authColors.navyLight,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 22,
  },
}

export const authCardSx = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  padding: { xs: '32px 24px', sm: '40px 40px', md: '48px 48px' },
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
}

export const authPageTitleSx = {
  fontSize: { xs: '26px', sm: '30px' },
  fontWeight: 700,
  color: authColors.textPrimary,
  letterSpacing: '-0.02em',
  lineHeight: 1.2,
  mb: 1,
}

export const authPageSubtitleSx = {
  fontSize: '15px',
  color: authColors.textSecondary,
  lineHeight: 1.5,
  mb: 4,
}

export const authDividerSx = {
  display: 'flex',
  alignItems: 'center',
  my: 3,
  '&::before, &::after': {
    content: '""',
    flex: 1,
    height: '1px',
    backgroundColor: authColors.border,
  },
}

export const authDividerTextSx = {
  mx: 2,
  color: authColors.textMuted,
  fontSize: '13px',
  whiteSpace: 'nowrap',
  fontWeight: 500,
}

export const authLinkSx = {
  color: authColors.navyLight,
  textDecoration: 'none',
  fontWeight: 500,
  fontSize: '14px',
  '&:hover': {
    textDecoration: 'underline',
  },
}
