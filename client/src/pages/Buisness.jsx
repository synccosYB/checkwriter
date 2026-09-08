import React from 'react'
import CompanyForm from '../components/views/organizations/CompanyForm.jsx'
import { useLocation } from 'react-router'
import Tabs from '../components/shared/tabs'
import CompanyPrefrences from '../components/views/organizations/CompanyPrefrences.jsx'
import useOrganizations from '../API/users/organizations/useOrganizations.js'

const Buisness = () => {
        const { data: orgranizations } = useOrganizations()
        const location = useLocation()
        const searchParams = new URLSearchParams(location.search)
        const orgId = searchParams.get('orgId')

        const orgData = orgranizations?.find((item) => item._id === orgId)
        const isUpdate = !!orgData

        const tabsList = [
                {
                        title: 'General Settings',
                        component: <CompanyForm data={orgData} isUpdate={isUpdate} />
                }
        ]

        if (isUpdate) {
                tabsList.push({
                        title: 'Prefrences',
                        component: <CompanyPrefrences orgData={orgData} />
                })
        }

        return (
                <div className="container">
                        <div className="d-flex align-items-center justify-content-between">
                                <h2
                                        className="fw-semibold fs-4 m-0"
                                        style={{
                                                color: '#1a1a2e'
                                        }}
                                >
                                        {isUpdate
                                                ? `Update Organization: ${orgData?.organizationName}`
                                                : 'Create Organization'}
                                </h2>
                        </div>

                        {isUpdate ? (
                                <div className="mt-4">
                                        <Tabs tabsData={tabsList} />
                                </div>
                        ) : (
                                <CompanyForm data={orgData} isUpdate={isUpdate} />
                        )}
                </div>
        )
}

export default Buisness
