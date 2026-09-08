import React, { useEffect, useState } from 'react'
import * as Yup from 'yup'
import BasicDetails from './BasicDetails'
import Address from './Address'

import UserPreferences from './UserPreferences'
import CarrierAccounts from './CarrierAccounts'
import useUserInfo from '../../../../API/users/useUserInfo'
import useUpdateUser from '../../../../API/users/useUpdateUser'

function GeneralSettings() {
        const { data: userData } = useUserInfo()
        const { mutate: updateUser } = useUpdateUser()

        const [initialValues, setInitialValues] = useState(null)

        const validationSchema = Yup.object({
                email: Yup.string().email('Incorrect Email'),
                firstName: Yup.string(),
                lastName: Yup.string(),
                middleName: Yup.string(),
                phone: Yup.string(),
                dateOfBirth: Yup.date()
        })

        const onSubmit = async (values) => {
                updateUser({
                        ...values,
                        email: values.email.toLowerCase()
                })
        }

        useEffect(() => {
                if (userData && Object.keys(userData).length !== 0) {
                        setInitialValues({
                                email: userData?.email || '',
                                firstName: userData?.firstName || '',
                                middleName: userData?.middleName || '',
                                lastName: userData?.lastName || '',
                                dateOfBirth: userData?.dateOfBirth || new Date(),
                                phone: userData?.phone || ''
                        })
                }
        }, [userData])

        return (
                <div>
                        {initialValues ? (
                                <>
                                        <BasicDetails
                                                initialValues={initialValues}
                                                validationSchema={validationSchema}
                                                onSubmit={onSubmit}
                                        />
                                        <Address />
                                        <UserPreferences />
                                        <CarrierAccounts />
                                </>
                        ) : null}
                </div>
        )
}

export default GeneralSettings
