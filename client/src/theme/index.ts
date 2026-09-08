import { createTheme, type Shadows } from '@mui/material/styles'

const palette = {
  primary: {
    main: '#1e3a5f',
    dark: '#152d4a',
    light: '#31527f',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#e8a838',
    dark: '#c98e24',
    light: '#f1c46d',
    contrastText: '#1a1a2e',
  },
  background: {
    default: '#f5f7fa',
    paper: '#ffffff',
  },
  text: {
    primary: '#1a1a2e',
    secondary: '#5b6472',
    disabled: '#96a0ad',
  },
  divider: '#d9e0e8',
  success: {
    main: '#2e7d5b',
    light: '#e8f5e9',
    dark: '#1b5e3b',
  },
  warning: {
    main: '#e8a838',
    light: '#fff8e1',
    dark: '#c98e24',
  },
  error: {
    main: '#d44040',
    light: '#fdecea',
    dark: '#b02a2a',
  },
  info: {
    main: '#31527f',
    light: '#e8eef6',
    dark: '#1e3a5f',
  },
}

const typography = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  h1: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.3, color: palette.text.primary },
  h2: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.3, color: palette.text.primary },
  h3: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3, color: palette.text.primary },
  h4: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.4, color: palette.text.primary },
  h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4, color: palette.text.primary },
  h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.4, color: palette.text.primary },
  subtitle1: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5, color: palette.text.primary },
  subtitle2: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.5, color: palette.text.secondary },
  body1: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.6, color: palette.text.primary },
  body2: { fontSize: '0.8125rem', fontWeight: 400, lineHeight: 1.6, color: palette.text.secondary },
  button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none' as const },
  caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.5, color: palette.text.secondary },
  overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const },
}

const shadows = [
  'none',
  '0px 1px 3px rgba(0,0,0,0.04), 0px 1px 2px rgba(0,0,0,0.06)',
  '0px 2px 4px rgba(0,0,0,0.04), 0px 1px 3px rgba(0,0,0,0.06)',
  '0px 4px 6px rgba(0,0,0,0.04), 0px 2px 4px rgba(0,0,0,0.06)',
  '0px 6px 10px rgba(0,0,0,0.05), 0px 3px 6px rgba(0,0,0,0.06)',
  '0px 8px 16px rgba(0,0,0,0.06), 0px 4px 8px rgba(0,0,0,0.04)',
  '0px 10px 20px rgba(0,0,0,0.06), 0px 5px 10px rgba(0,0,0,0.04)',
  '0px 12px 24px rgba(0,0,0,0.07), 0px 6px 12px rgba(0,0,0,0.04)',
  '0px 14px 28px rgba(0,0,0,0.08), 0px 7px 14px rgba(0,0,0,0.04)',
  '0px 16px 32px rgba(0,0,0,0.08), 0px 8px 16px rgba(0,0,0,0.04)',
  '0px 18px 36px rgba(0,0,0,0.09), 0px 9px 18px rgba(0,0,0,0.05)',
  '0px 20px 40px rgba(0,0,0,0.09), 0px 10px 20px rgba(0,0,0,0.05)',
  '0px 22px 44px rgba(0,0,0,0.10), 0px 11px 22px rgba(0,0,0,0.05)',
  '0px 24px 48px rgba(0,0,0,0.10), 0px 12px 24px rgba(0,0,0,0.05)',
  '0px 26px 52px rgba(0,0,0,0.10), 0px 13px 26px rgba(0,0,0,0.05)',
  '0px 28px 56px rgba(0,0,0,0.11), 0px 14px 28px rgba(0,0,0,0.05)',
  '0px 30px 60px rgba(0,0,0,0.11), 0px 15px 30px rgba(0,0,0,0.06)',
  '0px 32px 64px rgba(0,0,0,0.11), 0px 16px 32px rgba(0,0,0,0.06)',
  '0px 34px 68px rgba(0,0,0,0.12), 0px 17px 34px rgba(0,0,0,0.06)',
  '0px 36px 72px rgba(0,0,0,0.12), 0px 18px 36px rgba(0,0,0,0.06)',
  '0px 38px 76px rgba(0,0,0,0.13), 0px 19px 38px rgba(0,0,0,0.06)',
  '0px 40px 80px rgba(0,0,0,0.13), 0px 20px 40px rgba(0,0,0,0.06)',
  '0px 42px 84px rgba(0,0,0,0.14), 0px 21px 42px rgba(0,0,0,0.07)',
  '0px 44px 88px rgba(0,0,0,0.14), 0px 22px 44px rgba(0,0,0,0.07)',
  '0px 46px 92px rgba(0,0,0,0.15), 0px 23px 46px rgba(0,0,0,0.07)',
] as Shadows

const theme = createTheme({
  palette,
  typography,
  shadows,
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background.default,
          fontFamily: typography.fontFamily,
          color: palette.text.primary,
        },
        '*': {
          boxSizing: 'border-box',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'none' as const,
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          backgroundColor: palette.primary.main,
          '&:hover': {
            backgroundColor: palette.primary.dark,
          },
        },
        containedSecondary: {
          backgroundColor: palette.secondary.main,
          color: palette.text.primary,
          '&:hover': {
            backgroundColor: palette.secondary.dark,
          },
        },
        outlined: {
          borderColor: palette.divider,
          color: palette.text.primary,
          '&:hover': {
            backgroundColor: '#f0f2f5',
            borderColor: '#bcc3ce',
          },
        },
        text: {
          color: palette.text.primary,
          '&:hover': {
            backgroundColor: '#f0f2f5',
          },
        },
        sizeSmall: {
          padding: '4px 12px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '12px 28px',
          fontSize: '1rem',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined' as const,
        size: 'small' as const,
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#fff',
            '& fieldset': {
              borderColor: palette.divider,
              transition: 'border-color 0.2s ease',
            },
            '&:hover fieldset': {
              borderColor: '#bcc3ce',
            },
            '&.Mui-focused fieldset': {
              borderColor: palette.primary.main,
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#fff',
          '& fieldset': {
            borderColor: palette.divider,
          },
          '&:hover fieldset': {
            borderColor: '#bcc3ce',
          },
          '&.Mui-focused fieldset': {
            borderColor: palette.primary.main,
            borderWidth: '2px',
          },
        },
        input: {
          padding: '10px 14px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          color: palette.text.secondary,
          '&.Mui-focused': {
            color: palette.primary.main,
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: `1px solid ${palette.divider}`,
          boxShadow: shadows[2],
          transition: 'box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: shadows[4],
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
        elevation1: {
          boxShadow: shadows[2],
        },
        elevation2: {
          boxShadow: shadows[3],
        },
        elevation3: {
          boxShadow: shadows[4],
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.8125rem',
        },
        filled: {
          backgroundColor: '#eef1f5',
          color: palette.text.primary,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: shadows[8],
          padding: 0,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: shadows[3],
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: palette.text.primary,
          borderBottom: `1px solid ${palette.divider}`,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: shadows[5],
          border: `1px solid ${palette.divider}`,
          marginTop: 4,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          padding: '8px 16px',
          borderRadius: 6,
          margin: '2px 6px',
          '&:hover': {
            backgroundColor: '#f0f2f5',
          },
          '&.Mui-selected': {
            backgroundColor: `${palette.primary.main}10`,
            '&:hover': {
              backgroundColor: `${palette.primary.main}18`,
            },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: palette.primary.dark,
          color: '#fff',
          fontSize: '0.75rem',
          borderRadius: 8,
          padding: '6px 12px',
          boxShadow: shadows[4],
        },
        arrow: {
          color: palette.primary.dark,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 44,
        },
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          backgroundColor: palette.primary.main,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 600,
          fontSize: '0.875rem',
          minHeight: 44,
          padding: '10px 20px',
          color: palette.text.secondary,
          '&.Mui-selected': {
            color: palette.primary.main,
          },
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: '0.875rem',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: '0.875rem',
          fontWeight: 500,
          alignItems: 'center',
        },
        standardSuccess: {
          backgroundColor: palette.success.light,
          color: palette.success.dark,
        },
        standardError: {
          backgroundColor: palette.error.light,
          color: palette.error.dark,
        },
        standardWarning: {
          backgroundColor: palette.warning.light,
          color: palette.warning.dark,
        },
        standardInfo: {
          backgroundColor: palette.info.light,
          color: palette.info.dark,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid #f0f2f5`,
          padding: '12px 16px',
          fontSize: '0.875rem',
        },
        head: {
          fontWeight: 600,
          color: palette.text.secondary,
          backgroundColor: '#f8f9fb',
          whiteSpace: 'nowrap' as const,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f8f9fb',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: palette.divider,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: palette.primary.main,
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.875rem',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#f0f2f5',
          },
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: shadows[5],
          border: `1px solid ${palette.divider}`,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: palette.primary.main,
            '& + .MuiSwitch-track': {
              backgroundColor: palette.primary.main,
            },
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: palette.divider,
          '&.Mui-checked': {
            color: palette.primary.main,
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: palette.divider,
          '&.Mui-checked': {
            color: palette.primary.main,
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: '#eef1f5',
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: palette.primary.main,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&:hover': {
            backgroundColor: '#f0f2f5',
          },
        },
      },
    },
  },
})

export const dataGridStyles = {
  border: 'none',
  borderRadius: '12px',
  '--unstable_DataGrid-radius': '12px',
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#f8f9fb',
    borderBottom: `1px solid ${palette.divider}`,
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 600,
    fontSize: '0.8125rem',
    color: palette.text.secondary,
  },
  '& .MuiDataGrid-cell': {
    borderBottom: '1px solid #f0f2f5',
    fontSize: '0.875rem',
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: '#f8f9fb',
  },
  '& .MuiDataGrid-row.Mui-selected': {
    backgroundColor: `${palette.primary.main}0a`,
  },
  '& .MuiDataGrid-row.Mui-selected:hover': {
    backgroundColor: `${palette.primary.main}14`,
  },
  '& .MuiDataGrid-footerContainer': {
    borderTop: `1px solid ${palette.divider}`,
  },
}

export const authFormStyles = {
  label: {
    color: palette.text.secondary,
    marginBottom: '6px',
    fontSize: '0.8125rem',
    fontWeight: 500,
  },
  inputField: {
    '& .MuiOutlinedInput-root': {
      height: '44px',
      '& fieldset': {
        borderRadius: '10px',
        borderColor: '#e0e4ea',
      },
      '&:hover fieldset': {
        borderColor: '#bcc3ce',
      },
      '&.Mui-focused fieldset': {
        borderColor: palette.primary.main,
        borderWidth: '2px',
        boxShadow: `0 0 0 3px ${palette.primary.main}18`,
      },
    },
    '& .MuiInputBase-input': {
      color: palette.text.primary,
      padding: '12px 14px',
      fontSize: '0.875rem',
      '&::placeholder': {
        color: palette.text.disabled,
        opacity: 1,
      },
    },
  },
  checkboxStyles: {
    '&.Mui-checked': {
      color: palette.primary.main,
    },
    '& .MuiSvgIcon-root': {
      fontSize: 20,
    },
    color: palette.divider,
    p: 0.5,
  },
  errorMessage: {
    color: palette.error.main,
    fontSize: '0.75rem',
    mt: 0.5,
  },
  checkbox: {
    '&.Mui-checked': {
      color: palette.primary.main,
    },
    '& .MuiSvgIcon-root': {
      fontSize: 18,
    },
  },
  buttons: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    height: '46px',
    background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.light} 100%)`,
    borderRadius: '10px',
    color: palette.primary.contrastText,
    fontWeight: 600,
    fontSize: '0.9375rem',
    textTransform: 'none',
    border: 'none',
    '&:hover': {
      background: `linear-gradient(135deg, ${palette.primary.dark} 0%, ${palette.primary.main} 100%)`,
      boxShadow: `0 4px 12px ${palette.primary.main}40`,
    },
    '&:disabled': {
      background: '#e0e4ea',
      color: palette.text.disabled,
    },
  },
  requiredStar: {
    color: palette.primary.main,
  },
}

export default theme
