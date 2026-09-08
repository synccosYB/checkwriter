import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

import ButtonComponent from '../components/shared/ButtonComponent'
import { IconButton, Menu, MenuItem } from '@mui/material'
import {
        AddOutlined,
        CorporateFare,
        DeleteOutlineOutlined,
        EditOutlined,
        MoreVert
} from '@mui/icons-material'
import { updateSnackbar } from '../redux/snackbarState'
import { useHistory } from 'react-router'
import PageHeader from '../components/shared/PageHeader'
import GenericTable from '../components/shared/GenericTable/GenericTable'
import FormModalMUI from '../components/shared/Modals/FormModalMUI'
import { updateSelectedOrganization } from '../redux/appData'
import useOrganizations from '../API/users/organizations/useOrganizations'
import useDeleteOrganization from '../API/users/organizations/useDeleteOrganization'
import { MyCookies } from '../utils/cookies/Cookies'

const columnData = [
        {
                key: '',
                value: 'organizationLogo',
                colWidth: '4%'
        },
        {
                key: 'Organization Name',
                value: 'organizationName',
                colWidth: '5%'
        },
        {
                key: 'Entity Type',
                value: 'entityType'
        },
        {
                key: 'Industry Type',
                value: 'industryType'
        },
        { key: 'Actions', value: 'contextMenu', colWidth: '9%' }
]

const ContextMenu = ({ rowData }) => {
        const [anchorEl, setAnchorEl] = React.useState(null)
        const [isModalOpen, setModalOpen] = useState(false)
        const [isSubmitting] = useState(false)
        const { mutate: deleteOrganization } = useDeleteOrganization()

        const history = useHistory()

        const open = Boolean(anchorEl)
        const handleClick = (event) => {
                setAnchorEl(event.currentTarget)
        }
        const handleClose = () => {
                setAnchorEl(null)
        }

        const dispatch = useDispatch()

        const handleDeleteModal = () => {
                setModalOpen(!isModalOpen)
        }

        const deleteUserOrganization = async () => {
                try {
                        deleteOrganization({ id: rowData._id })
                        dispatch(updateSelectedOrganization(null))
                        MyCookies.remove(MyCookies.KEYS.ORGANIZATION)
                        handleDeleteModal()
                } catch (error) {
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        message: 'Unable to delete.',
                                        severity: 'error'
                                })
                        )
                }
        }

        return (
                <>
                        <IconButton
                                aria-controls={open ? 'long-menu' : undefined}
                                aria-expanded={open ? 'true' : undefined}
                                aria-haspopup="true"
                                onClick={handleClick}
                        >
                                <MoreVert />
                        </IconButton>
                        <Menu
                                id="long-menu"
                                MenuListProps={{
                                        'aria-labelledby': 'long-button'
                                }}
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                sx={{
                                        minWidth: 300
                                }}
                        >
                                <MenuItem
                                        sx={{
                                                display: 'flex',
                                                justifyContent: 'start',
                                                alignItems: 'center'
                                        }}
                                >
                                        <button
                                                className="d-flex align-items-center justify-content-start w-100 p-0 border-0 bg-transparent"
                                                onClick={() => {
                                                        handleClose()
                                                        history.push(
                                                                `/dashboard/update-organization?orgId=${rowData._id}`
                                                        )
                                                }}
                                        >
                                                <EditOutlined
                                                        sx={{
                                                                marginRight: '20px'
                                                        }}
                                                />
                                                Edit
                                        </button>
                                </MenuItem>
                                <MenuItem
                                        sx={{
                                                display: 'flex',
                                                justifyContent: 'start',
                                                alignItems: 'center'
                                        }}
                                        onClick={() => {
                                                handleClose()
                                                handleDeleteModal()
                                        }}
                                >
                                        <DeleteOutlineOutlined
                                                sx={{
                                                        marginRight: '20px'
                                                }}
                                        />
                                        Delete
                                </MenuItem>
                        </Menu>

                        {isModalOpen && (
                                <FormModalMUI
                                        onClose={handleDeleteModal}
                                        open={isModalOpen}
                                        maxWidth="sm"
                                >
                                        <div className="container">
                                                <div className="row">
                                                        <div className="row txt-danger pt-3">
                                                                <DeleteOutlineOutlined sx={{ fontSize: '80px' }} />
                                                        </div>
                                                        <div className="col d-flex justify-content-center">
                                                                <div className="row">
                                                                        <h3>
                                                                                <p>
                                                                                        <b>Confirm Deletion?</b>
                                                                                </p>
                                                                        </h3>
                                                                </div>
                                                        </div>
                                                </div>
                                                <div className="row">
                                                        <div className="col d-flex justify-content-center">
                                                                <div className="row text-center">
                                                                        <p>
                                                                                Are you sure you want to delete this Organizationwith name:{' '}
                                                                                <b>{rowData.organizationName}</b>?
                                                                        </p>
                                                                </div>
                                                        </div>
                                                </div>
                                        </div>

                                        <div className="d-flex align-items-center justify-content-center mt-3 mb-5">
                                                <ButtonComponent
                                                        text="Cancel"
                                                        type="button"
                                                        variant="light"
                                                        click={handleDeleteModal}
                                                        extraClass="me-3"
                                                />
                                                <ButtonComponent
                                                        text={isSubmitting ? 'Deleting...' : 'Delete'}
                                                        disabled={isSubmitting}
                                                        type="submit"
                                                        variant="danger"
                                                        click={deleteUserOrganization}
                                                />
                                        </div>
                                </FormModalMUI>
                        )}
                </>
        )
}

const ManageOrganization = () => {
        const { data: organizations, isLoading } = useOrganizations()
        const history = useHistory()

        const makeTableData = (data) => {
                let temp = []
                data.forEach((item) => {
                        let obj = {}

                        obj.organizationName = item?.organizationName || ''

                        obj.entityType = item?.entityType || ''

                        obj.organizationLogo =
                                item?.organizationLogo && item?.organizationLogo !== '' ? (
                                        <img
                                                className="org-logo-small"
                                                src={item?.organizationLogo}
                                                alt="org-logo"
                                        />
                                ) : (
                                        <div className="no-org-logo">
                                                <CorporateFare
                                                        sx={{
                                                                width: '1rem',
                                                                height: '1rem'
                                                        }}
                                                />{' '}
                                        </div>
                                )

                        obj.industryType = item?.industryType || ''

                        obj.contextMenu = (
                                <>
                                        <ContextMenu rowData={item} />
                                </>
                        )
                        temp.push(obj)
                })

                return temp
        }

        return (
                <>
                        <div className="container">
                                <PageHeader
                                        text="Organizations"
                                        info="Please contact at support@synccos.com for queries and support"
                                />
                                <div className="generic-table-container">
                                        <div className="d-flex align-items-center justify-content-end">
                                                <ButtonComponent
                                                        text="New"
                                                        variant="dark"
                                                        icon={<AddOutlined />}
                                                        type="button"
                                                        onClick={() => {
                                                                history.push('/dashboard/create-organization')
                                                        }}
                                                        extraClass="ms-3"
                                                />
                                        </div>
                                        <GenericTable
                                                columnData={columnData}
                                                modifiedData={makeTableData(organizations || [])}
                                                count={organizations?.data?.length || 0}
                                                isLoading={isLoading}
                                                noDataProps={{
                                                        text: 'All the organizations created will be stored here. Create your first Organization!',
                                                        head: 'No Organizations',
                                                        click: () => {
                                                                history.push('/dashboard/create-organization')
                                                        },
                                                        btnText: 'New Organization'
                                                }}
                                        />
                                </div>
                        </div>
                </>
        )
}

export default ManageOrganization
