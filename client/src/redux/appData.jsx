import { createSlice } from '@reduxjs/toolkit'

const appData = createSlice({
        name: 'appData',
        initialState: {
                banks: { data: [], isLoading: true },
                payees: { data: [], isLoading: true },
                addresses: { data: [], isLoading: true },
                checks: { data: [], isLoading: true },
                PaymentLinks: { data: [], isLoading: true },
                tags: { data: [], isLoading: true },
                groups: { data: [], isLoading: true },
                organizations: { data: [], isLoading: true },
                userData: { data: {}, isLoading: true },
                selectedOrganization: null
        },
        reducers: {
                updateAppData: (state, action) => {
                        const { payload } = action
                        const { key, data } = payload
                        return {
                                ...state,
                                [key]: { data: [...data], isLoading: false }
                        }
                },
                updateUserData: (state, action) => {
                        const { payload } = action
                        return {
                                ...state,
                                userData: { data: { ...payload }, isLoading: false }
                        }
                },
                updateTagsData: (state, action) => {
                        const { payload } = action
                        return {
                                ...state,
                                tags: { data: [...payload], isLoading: false }
                        }
                },
                updateGroupsData: (state, action) => {
                        const { payload } = action
                        return {
                                ...state,
                                groups: { data: [...payload], isLoading: false }
                        }
                },
                updateAddresses: (state, action) => {
                        const { payload } = action
                        const { data } = payload

                        return {
                                ...state,
                                addresses: { data: [...data], isLoading: false }
                        }
                },
                updateOrganizationData: (state, action) => {
                        const { payload } = action
                        return {
                                ...state,
                                organizations: { data: [...payload], isLoading: false }
                        }
                },
                updateSelectedOrganization: (state, action) => {
                        const { payload } = action
                        return {
                                ...state,
                                selectedOrganization: payload
                        }
                },
                emptyAppData: (state, action) => {
                        return {
                                ...state,
                                banks: { data: [], isLoading: true },
                                payees: { data: [], isLoading: true },
                                addresses: { data: [], isLoading: true },
                                checks: { data: [], isLoading: true },
                                tags: { data: [], isLoading: true },
                                groups: { data: [], isLoading: true },
                                organizations: { data: [], isLoading: true },
                                userData: { data: {}, isLoading: true }
                        }
                }
        }
})

export const {
        updateAppData,
        updateUserData,
        updateAddresses,
        updateTagsData,
        updateGroupsData,
        updateOrganizationData,
        emptyAppData,
        updateSelectedOrganization
} = appData.actions

export default appData.reducer
