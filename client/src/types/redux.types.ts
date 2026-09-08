import { AlertColor } from "@mui/material"

export interface RootState {
    snackbarState: {
        open: boolean
        message: string
        severity: AlertColor
    }
    loginLogout: {
        isLoggedIn: boolean
    }
    appData:{
        selectedOrganization: string
    }
}