import { configureStore } from '@reduxjs/toolkit'
import loginLogoutReducer from './loginLogout'
import snackbarStateReducer from './snackbarState'
import appDataReducer from './appData'
import updateDataReducer from './updateData'
import alertReducer from './alertSlice';

const rootReducer = {
	loginLogout: loginLogoutReducer,
	snackbarState: snackbarStateReducer,
	appData: appDataReducer,
	updateData: updateDataReducer,
	alert:alertReducer
}

export default configureStore({
	reducer: rootReducer,
	devTools: true,
	
})
