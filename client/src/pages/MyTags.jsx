import PageHeader from '../components/shared/PageHeader'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import {
        Accordion,
        AccordionDetails,
        AccordionSummary,
        IconButton,
        Menu,
        MenuItem,
        Skeleton,
        Tooltip
} from '@mui/material'

import {
        AddOutlined,
        DeleteOutlineOutlined,
        PostAddOutlined
} from '@mui/icons-material'
import ButtonComponent from '../components/shared/ButtonComponent'
import { useState } from 'react'
import FormModalMUI from '../components/shared/Modals/FormModalMUI'
import AddTag from '../components/views/forms/AddTag'
import EditGroup from '../components/views/forms/EditGroup'
import AddGroup from '../components/views/forms/AddGroup'
import { ArrowDropDown } from '@mui/icons-material'
import useTags from '../API/tags/useTags'
import useGroups from '../API/group/useGroups'
import useDeleteTag from '../API/tags/useDeleteTag'
import useUpdateTag from '../API/tags/useUpdateTag'
import useUserInfo from '../API/users/useUserInfo'
import useTagsMigration from '../API/tags/useTagsMigration'

const MyTags = () => {
        const { data: tagsData } = useTags()
        const { data: groupsData } = useGroups()
        const tags = Array.isArray(tagsData) ? tagsData : []
        const groups = Array.isArray(groupsData) ? groupsData : []

        const { mutate: deleteTag } = useDeleteTag()
        const { mutate: updateTag } = useUpdateTag()
        const { mutate: migrateTags } = useTagsMigration()

        const { data: userData } = useUserInfo()

        const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
        const [isEditModalOpen, setEditModalOpen] = useState(false)
        const [isEditGroupModalOpen, setEditGroupModalOpen] = useState(false)
        const [isAddGroupModalOpen, setAddGroupModalOpen] = useState(false)

        const [deleteTagId, setDeleteTagId] = useState('')
        const [deleteTagName, setDeleteTagName] = useState('')
        const [isDeleteTagSubmitted, setDeleteTagSubmitted] = useState(false)

        const [editTag, setEditTag] = useState(false)
        const [editTagId, setEditTagId] = useState('')
        const [editTagName, setEditTagName] = useState('')
        const [editTagColor, setEditTagColor] = useState('')

        const [editGroup, setEditGroup] = useState(false)
        const [editGroupId, setEditGroupId] = useState('')
        const [editGroupName, setEditGroupName] = useState('')
        const [editGroupColor, setEditGroupColor] = useState('')

        const [title, setTitle] = useState('')

        const openAddGroupModal = (group) => {
                if (group != null) {
                } else {
                        setAddGroupModalOpen(true)
                }
        }

        const closeAddGroupModal = () => {
                setAddGroupModalOpen(false)
        }

        const openEditTagModal = (tag) => {
                if (tag != null) {
                        setEditTagId(tag?._id)
                        setEditTagName(tag?.name)
                        setEditTagColor(tag?.color)
                        setTitle('Save')
                        setEditTag(true)
                } else {
                        setTitle('Create Tag')
                        setEditTag(false)
                }

                setEditModalOpen(true)
        }

        const closeEditTagModal = () => {
                setEditModalOpen(false)
        }

        const openEditGroupModal = (group) => {
                if (group) {
                        setEditGroupId(group?._id)
                        setEditGroupName(group?.name)
                        setEditGroupColor(group.color)
                        setTitle('Save')
                        setEditGroup(true)
                        setEditGroupModalOpen(true)
                } else {
                        setTitle('Create Group')
                        setEditGroup(false)
                        setEditGroupModalOpen(true)
                }
        }

        const closeEditGroupModal = () => {
                setEditGroupModalOpen(false)
        }

        const openDeleteTagModal = () => {
                setDeleteModalOpen(true)
        }

        const closeDeleteTagModal = () => {
                setDeleteModalOpen(false)
        }
        const setDeleteTag = (tag) => {
                setDeleteTagId(tag?._id)
                setDeleteTagName(tag?.name)

                openDeleteTagModal()
        }

        const deleteUserTag = async () => {
                if (!isDeleteTagSubmitted) {
                        setDeleteTagSubmitted(true)

                        deleteTag(deleteTagId, {
                                onSuccess: () => {
                                        closeDeleteTagModal()
                                }
                        })

                        setDeleteTagSubmitted(false)
                }
        }

        const [anchorEl, setAnchorEl] = useState(null)
        const [tagToChangeGroup, setTagToChangeGroup] = useState(null)
        const open = Boolean(anchorEl)
        const setTagToChange = (event, tag) => {
                setTagToChangeGroup({
                        _id: tag._id,
                        color: tag.color,
                        name: tag.name,
                        group: tag.group ? tag.group : null
                })
                setAnchorEl(event.currentTarget)
        }

        const changeGroup = async (group_id) => {
                let body = {
                        group: group_id
                }
                updateTag(
                        { id: tagToChangeGroup._id, body },
                        {
                                onSuccess: () => {
                                        setAnchorEl(null)
                                        setTagToChangeGroup(null)
                                }
                        }
                )
        }

        const menuClose = () => {
                setAnchorEl(null)
                setTagToChangeGroup(null)
        }

        const getRenderedTags = (
                tags,
                extraClass = '',
                isInGroup = false,
                groupId
        ) => {
                return tags
                        ?.filter((i) => (!isInGroup ? !i.group : i.group) && i.group === groupId)
                        .map((tag, index) => {
                                return (
                                        <li key={index}>
                                                <div
                                                        className={`card px-3 py-1 ms-2 mt-2 mb-2 tag-card ${extraClass}`}
                                                        style={{
                                                                border: '1px solid #D7D7D7',
                                                                borderRadius: '4px'
                                                        }}
                                                        onClick={(event) => {
                                                                openEditTagModal(tag)
                                                                event.stopPropagation()
                                                        }}
                                                >
                                                        <div className="row d-flex align-items-center justify-content-between">
                                                                <div className="col">
                                                                        <div className=" d-flex align-items-center justify-content-start">
                                                                                <div className="d-flex align-items-center justify-content-center tag-dot-div">
                                                                                        <div
                                                                                                className="dot_bigger"
                                                                                                style={{ backgroundColor: tag?.color }}
                                                                                        />
                                                                                </div>

                                                                                <p className="fs-12 mb-0">{tag?.name}</p>
                                                                        </div>
                                                                </div>
                                                                <div className="col">
                                                                        <div className="tag-menu">
                                                                                <div className="row d-flex align-items-center justify-content-end text-secondary">
                                                                                        <div className="col-auto px-1">
                                                                                                <Tooltip title="Edit">
                                                                                                        <IconButton
                                                                                                                onClick={(event) => {
                                                                                                                        openEditTagModal(tag)
                                                                                                                        event.stopPropagation()
                                                                                                                }}
                                                                                                        >
                                                                                                                <EditOutlinedIcon />
                                                                                                        </IconButton>
                                                                                                </Tooltip>
                                                                                        </div>
                                                                                        <div
                                                                                                className="col-auto px-1"
                                                                                                style={{ display: tag?.inUse ? 'none' : 'block' }}
                                                                                        >
                                                                                                <Tooltip title="Delete">
                                                                                                        <IconButton
                                                                                                                onClick={(event) => {
                                                                                                                        setDeleteTag(tag)
                                                                                                                        event.stopPropagation()
                                                                                                                }}
                                                                                                        >
                                                                                                                <DeleteOutlinedIcon />
                                                                                                        </IconButton>
                                                                                                </Tooltip>
                                                                                        </div>
                                                                                        <div className="col-auto px-1">
                                                                                                <Tooltip
                                                                                                        title={isInGroup ? 'Change Group' : 'Add to Group'}
                                                                                                >
                                                                                                        <IconButton
                                                                                                                id="basic-button"
                                                                                                                aria-controls={open ? 'basic-menu' : undefined}
                                                                                                                aria-haspopup="true"
                                                                                                                aria-expanded={open ? 'true' : undefined}
                                                                                                                onClick={(event) => {
                                                                                                                        setTagToChange(event, tag)
                                                                                                                        event.stopPropagation()
                                                                                                                }}
                                                                                                        >
                                                                                                                <PostAddOutlined />
                                                                                                        </IconButton>
                                                                                                </Tooltip>
                                                                                        </div>
                                                                                </div>{' '}
                                                                        </div>
                                                                </div>
                                                        </div>
                                                </div>
                                        </li>
                                )
                        })
        }

        const getRenderedGroup = () => {
                return (
                        <div className="tags-list-container">
                                <ul style={{ listStyle: 'none' }} className="ms-3 me-5 tags-list">
                                        {groups?.map((group, index) => {
                                                return (
                                                        <li key={index}>
                                                                <div className={`card px-2 ms-2 mb-2 border-0 `}>
                                                                        <div className="row d-flex align-items-center justify-content-between p-0">
                                                                                <div className="col-12 px-1">
                                                                                        <Accordion
                                                                                                key={index}
                                                                                                sx={{
                                                                                                        boxShadow: 'none'
                                                                                                }}
                                                                                        >
                                                                                                <AccordionSummary
                                                                                                        expandIcon={<ArrowDropDown />}
                                                                                                        className="tag-card"
                                                                                                        sx={{
                                                                                                                alignItems: 'center',
                                                                                                                border: '1px solid #D7D7D7',
                                                                                                                borderRadius: '4px',
                                                                                                                '&.Mui-expanded': {
                                                                                                                        minHeight: 'auto',
                                                                                                                        backgroundColor: '#eaeaea'
                                                                                                                },
                                                                                                                '& .MuiAccordionSummary-content': {
                                                                                                                        margin: '4px 0',
                                                                                                                        '&.Mui-expanded': {
                                                                                                                                margin: '4px 0'
                                                                                                                        }
                                                                                                                }
                                                                                                        }}
                                                                                                >
                                                                                                        <div className="row d-flex align-items-center justify-content-start w-100">
                                                                                                                {group?.color ? (
                                                                                                                        <>
                                                                                                                                <div className="col-6">
                                                                                                                                        <div className="col-auto">
                                                                                                                                                <div className="d-flex align-items-center">
                                                                                                                                                        <div className="grid-view-icon">
                                                                                                                                                                <div
                                                                                                                                                                        className="dot"
                                                                                                                                                                        style={{
                                                                                                                                                                                backgroundColor:
                                                                                                                                                                                        group?.color || 'transparent'
                                                                                                                                                                        }}
                                                                                                                                                                ></div>
                                                                                                                                                                <div
                                                                                                                                                                        className="dot"
                                                                                                                                                                        style={{
                                                                                                                                                                                backgroundColor:
                                                                                                                                                                                        group?.color || 'transparent'
                                                                                                                                                                        }}
                                                                                                                                                                ></div>
                                                                                                                                                                <div
                                                                                                                                                                        className="dot"
                                                                                                                                                                        style={{
                                                                                                                                                                                backgroundColor:
                                                                                                                                                                                        group?.color || 'transparent'
                                                                                                                                                                        }}
                                                                                                                                                                ></div>
                                                                                                                                                                <div
                                                                                                                                                                        className="dot"
                                                                                                                                                                        style={{
                                                                                                                                                                                backgroundColor:
                                                                                                                                                                                        group?.color || 'transparent'
                                                                                                                                                                        }}
                                                                                                                                                                ></div>
                                                                                                                                                        </div>

                                                                                                                                                        <div className="col-auto ms-2">
                                                                                                                                                                <p className="fs-12 mb-0">
                                                                                                                                                                        {group?.name}
                                                                                                                                                                </p>
                                                                                                                                                        </div>
                                                                                                                                                </div>
                                                                                                                                        </div>
                                                                                                                                </div>
                                                                                                                                <div className="col-6">
                                                                                                                                        <div className="tag-menu">
                                                                                                                                                <div className="row d-flex align-items-center justify-content-end text-secondary">
                                                                                                                                                        <div className="col-auto">
                                                                                                                                                                <Tooltip title="Edit">
                                                                                                                                                                        <IconButton
                                                                                                                                                                                onClick={() => {
                                                                                                                                                                                        openEditGroupModal(group)
                                                                                                                                                                                }}
                                                                                                                                                                        >
                                                                                                                                                                                <EditOutlinedIcon />
                                                                                                                                                                        </IconButton>
                                                                                                                                                                </Tooltip>
                                                                                                                                                        </div>
                                                                                                                                                        {/* <div className="col-auto">
                                                                                                                                                <Tooltip title="Delete">
                                                                                                                                                        <IconButton
                                                                                                                                                                onClick={() => {
                                                                                                                                                                        setDeleteTag(group)
                                                                                                                                                                }}
                                                                                                                                                        >
                                                                                                                                                                <DeleteOutlinedIcon />
                                                                                                                                                        </IconButton>
                                                                                                                                                </Tooltip>
                                                                                                                                        </div> */}
                                                                                                                                                </div>
                                                                                                                                        </div>
                                                                                                                                </div>
                                                                                                                        </>
                                                                                                                ) : (
                                                                                                                        <Skeleton
                                                                                                                                variant="rectangular"
                                                                                                                                width={210}
                                                                                                                                height={15}
                                                                                                                                sx={{
                                                                                                                                        borderRadius: '3px',
                                                                                                                                        marginLeft: '1rem',
                                                                                                                                        marginTop: '10px !important',
                                                                                                                                        marginBottom: '8px'
                                                                                                                                }}
                                                                                                                        />
                                                                                                                )}
                                                                                                        </div>
                                                                                                </AccordionSummary>
                                                                                                <AccordionDetails
                                                                                                        sx={{
                                                                                                                padding: '0rem 2rem 8px',
                                                                                                                paddingRight: '0'
                                                                                                        }}
                                                                                                >
                                                                                                        {group && getRenderedTags(tags, '', true, group?._id)}
                                                                                                </AccordionDetails>
                                                                                        </Accordion>
                                                                                </div>
                                                                        </div>
                                                                </div>
                                                        </li>
                                                )
                                        })}
                                        <Menu
                                                id="basic-menu"
                                                anchorEl={anchorEl}
                                                open={open}
                                                onClose={menuClose}
                                                MenuListProps={{
                                                        'aria-labelledby': 'basic-button'
                                                }}
                                        >
                                                {groups?.map((group, index) => {
                                                        return tagToChangeGroup?.group !== group?._id ? (
                                                                <MenuItem
                                                                        onClick={() => {
                                                                                changeGroup(group?._id)
                                                                        }}
                                                                        key={index}
                                                                >
                                                                        {group?.color ? (
                                                                                <>
                                                                                        <div className="col-6">
                                                                                                <div className="col-auto">
                                                                                                        <div className="d-flex align-items-center">
                                                                                                                <div className="grid-view-icon">
                                                                                                                        <div
                                                                                                                                className="dot"
                                                                                                                                style={{
                                                                                                                                        backgroundColor: group?.color || 'transparent'
                                                                                                                                }}
                                                                                                                        ></div>
                                                                                                                        <div
                                                                                                                                className="dot"
                                                                                                                                style={{
                                                                                                                                        backgroundColor: group?.color || 'transparent'
                                                                                                                                }}
                                                                                                                        ></div>
                                                                                                                        <div
                                                                                                                                className="dot"
                                                                                                                                style={{
                                                                                                                                        backgroundColor: group?.color || 'transparent'
                                                                                                                                }}
                                                                                                                        ></div>
                                                                                                                        <div
                                                                                                                                className="dot"
                                                                                                                                style={{
                                                                                                                                        backgroundColor: group?.color || 'transparent'
                                                                                                                                }}
                                                                                                                        ></div>
                                                                                                                </div>

                                                                                                                <div className="col-auto ms-2">
                                                                                                                        <p className="fs-12 mb-0">{group?.name}</p>
                                                                                                                </div>
                                                                                                        </div>
                                                                                                </div>
                                                                                        </div>
                                                                                        <div className="col-6">
                                                                                                <div className="tag-menu">
                                                                                                        <div className="row d-flex align-items-center justify-content-end text-secondary">
                                                                                                                <div className="col-auto">
                                                                                                                        <Tooltip title="Edit">
                                                                                                                                <IconButton
                                                                                                                                        onClick={() => {
                                                                                                                                                openEditTagModal(group)
                                                                                                                                        }}
                                                                                                                                >
                                                                                                                                        <EditOutlinedIcon />
                                                                                                                                </IconButton>
                                                                                                                        </Tooltip>
                                                                                                                </div>
                                                                                                        </div>
                                                                                                </div>
                                                                                        </div>
                                                                                </>
                                                                        ) : null}
                                                                </MenuItem>
                                                        ) : null
                                                })}

                                                {tagToChangeGroup?.group !== null && (
                                                        <MenuItem
                                                                onClick={() => {
                                                                        changeGroup(null)
                                                                }}
                                                        >
                                                                <div className="col-auto ms-2">
                                                                        <p className="fs-12 mb-0">Remove from group</p>
                                                                </div>
                                                        </MenuItem>
                                                )}

                                                {
                                                        <MenuItem onClick={() => openEditGroupModal(null)}>
                                                                <div className="col-auto ms-2">
                                                                        <p className="fs-12 mb-0">
                                                                                <AddOutlined /> Add to new group
                                                                        </p>
                                                                </div>
                                                        </MenuItem>
                                                }
                                        </Menu>

                                        {!!tags?.length && getRenderedTags(tags)}
                                </ul>
                        </div>
                )
        }

        return (
                <>
                        <div className="container pt-3">
                                <PageHeader
                                        text="My Tags"
                                        info="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                                />

                                <div className="row d-flex justify-content-end mb-4">
                                        <div
                                                className="col-auto"
                                                style={{
                                                        display: userData?.role === 'superadmin' ? 'block' : 'none'
                                                }}
                                        ></div>
                                        <div className="col-auto">
                                                <ButtonComponent
                                                        text="New Group"
                                                        variant="light"
                                                        icon={<AddOutlined />}
                                                        type="button"
                                                        click={() => {
                                                                openAddGroupModal()
                                                        }}
                                                />
                                        </div>
                                        <div className="col-auto">
                                                <ButtonComponent
                                                        text="New Tag"
                                                        variant="dark"
                                                        icon={<AddOutlined />}
                                                        type="button"
                                                        click={() => {
                                                                openEditTagModal(null)
                                                        }}
                                                />
                                        </div>
                                </div>
                                {getRenderedGroup()}
                        </div>

                        {isDeleteModalOpen && (
                                <FormModalMUI
                                        onClose={closeDeleteTagModal}
                                        open={isDeleteModalOpen}
                                        maxWidth="sm"
                                        // onSave={onSubmit}
                                >
                                        <div className="container">
                                                <div className="">
                                                        <div className="d-flex align-items-center justify-content-center txt-danger mt-3 mb-2">
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
                                                                <div className="row">
                                                                        <p className="text-center m-0 mb-2">
                                                                                Are you sure you want to delete tag: "
                                                                                {<b>{deleteTagName}</b>}"?
                                                                        </p>
                                                                </div>
                                                        </div>
                                                </div>
                                        </div>

                                        <div className="d-flex align-items-center justify-content-center mt-3 mb-4">
                                                <ButtonComponent
                                                        text="Cancel"
                                                        type="button"
                                                        variant="light"
                                                        click={closeDeleteTagModal}
                                                        extraClass="me-3"
                                                />
                                                <ButtonComponent
                                                        text={isDeleteTagSubmitted ? 'Deleting...' : 'Delete'}
                                                        type="submit"
                                                        variant="danger"
                                                        click={deleteUserTag}
                                                />
                                        </div>
                                </FormModalMUI>
                        )}

                        <FormModalMUI
                                title={editTag ? 'Edit Tag' : 'Create Tag'}
                                open={isEditModalOpen}
                                onClose={closeEditTagModal}
                                maxWidth="sm"
                        >
                                <AddTag
                                        onClose={closeEditTagModal}
                                        title={title}
                                        tagName={editTagName}
                                        tagId={editTagId}
                                        tagColor={editTagColor}
                                        edit={editTag}
                                />
                        </FormModalMUI>

                        <FormModalMUI
                                title="Edit Group"
                                open={isEditGroupModalOpen}
                                onClose={closeEditGroupModal}
                                maxWidth="sm"
                        >
                                <EditGroup
                                        onClose={closeEditGroupModal}
                                        title={title}
                                        groupName={editGroupName}
                                        groupId={editGroupId}
                                        groupColor={editGroupColor}
                                        tag={tagToChangeGroup}
                                        edit={editGroup}
                                />
                        </FormModalMUI>

                        <FormModalMUI
                                title="Create Group"
                                open={isAddGroupModalOpen}
                                onClose={closeAddGroupModal}
                                maxWidth="sm"
                        >
                                {/* pass groups there */}
                                <AddGroup onClose={closeAddGroupModal} groups={[]} />
                        </FormModalMUI>
                </>
        )
}

export default MyTags
