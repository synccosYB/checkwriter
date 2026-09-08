import { useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Formik } from 'formik'
import FormComponents from '../../shared/forms'
import { TwitterPicker } from 'react-color'
import ButtonComponent from '../../shared/ButtonComponent'
import { Button, Popover } from '@mui/material'
import useUpdateGroup from '../../../API/group/useUpdateGroup'
import useCreateGroup from '../../../API/group/useCreateGroup'

const colors = [
        '#FFD480',
        '#FFB873',
        '#FF8C64',
        '#FF5733',
        '#C7F2A7',
        '#008000',
        '#41E2BA',
        '#80C1FF',
        '#6699FF',
        '#5489FF',
        '#9370DB',
        '#BA55D3',
        '#FF69B4'
]

const EditGroup = (props) => {
        const { mutate: updateGroup } = useUpdateGroup()
        const { mutate: addGroup } = useCreateGroup()
        const groupData = useSelector((state) => state.appData.groups)
        const [submitted, setSubmitted] = useState(false)

        const ref = useRef(null)

        const [selectedColor, setSelectedColor] = useState(
                props.edit ? props.groupColor : '#6699FF'
        )

        const [changedColor, setChangedColor] = useState(false)
        const [anchorEl, setAnchorEl] = useState(null)

        const close = (res) => {
                if (res != null) {
                        props.onClose(res.data)
                } else {
                        props.onClose(null)
                }
        }

        const initialValues = {
                group_name: props.edit ? props.groupName : ''
        }

        const validate = (values) => {
                const errors = {}

                if (!values.group_name) {
                        errors.group_name = '*Group name is required'
                }

                if ((groupData?.data || []).some((obj) => obj.name === values.group_name)) {
                        errors.group_name = '*Group with same name already exists.'
                }

                return errors
        }

        const changeSelectedColor = (color) => {
                if (props.edit) {
                        if (props.color !== selectedColor) {
                                setChangedColor(true)
                        } else {
                                setChangedColor(false)
                        }
                }
                setSelectedColor(color)
        }

        const handleClick = (event) => {
                setAnchorEl(event.currentTarget)
        }

        const handleClose = () => {
                setAnchorEl(null)
        }

        const handleSubmit = async () => {
                if (!submitted) {
                        setSubmitted(true)
                        let group_name = ref.current.values['group_name']
                        let color = selectedColor
                        let body = {
                                name: group_name,
                                color: color
                        }

                        try {
                                if (props.edit) {
                                        updateGroup({ id: props.groupId, body }, { onSuccess: () => close() })
                                } else {
                                        addGroup(body, { onSuccess: () => close() })
                                }

                        } catch (err) {
                                setSubmitted(false)
                        }
                }
        }

        return (
                <Formik
                        initialValues={initialValues}
                        validate={validate}
                        onSubmit={handleSubmit}
                        innerRef={ref}
                >
                        {({ handleSubmit, values, dirty, isValid }) => (
                                <div className="container p-5">
                                        <div className=" d-flex align-items-start flex-row">
                                                <Button
                                                        className="color-box me-3 d-flex align-items-center justify-content-center"
                                                        onClick={handleClick}
                                                        sx={{
                                                                minWidth: 'auto'
                                                        }}
                                                >
                                                        <div className="grid-view-icon">
                                                                <div
                                                                        className="dot"
                                                                        style={{
                                                                                backgroundColor: selectedColor || 'transparent'
                                                                        }}
                                                                ></div>
                                                                <div
                                                                        className="dot"
                                                                        style={{
                                                                                backgroundColor: selectedColor || 'transparent'
                                                                        }}
                                                                ></div>
                                                                <div
                                                                        className="dot"
                                                                        style={{
                                                                                backgroundColor: selectedColor || 'transparent'
                                                                        }}
                                                                ></div>
                                                                <div
                                                                        className="dot"
                                                                        style={{
                                                                                backgroundColor: selectedColor || 'transparent'
                                                                        }}
                                                                ></div>
                                                        </div>
                                                </Button>
                                                <Popover
                                                        id="simple-popover"
                                                        open={anchorEl !== null ? true : false}
                                                        anchorEl={anchorEl}
                                                        onClose={handleClose}
                                                        anchorOrigin={{
                                                                vertical: 'bottom',
                                                                horizontal: 'left'
                                                        }}
                                                >
                                                        <TwitterPicker
                                                                colors={colors}
                                                                onChange={(color) => {
                                                                        changeSelectedColor(color.hex)
                                                                        handleClose()
                                                                }}
                                                                color={selectedColor}
                                                        />
                                                </Popover>
                                                <div className="col-auto" style={{ width: '420px' }}>
                                                        <FormComponents
                                                                name="group_name"
                                                                type="text"
                                                                label="Group Name"
                                                                control="input"
                                                        />
                                                </div>
                                        </div>
                                        <div className="row">
                                                <div className="row">
                                                        <div className="d-flex align-items-center justify-content-center mt-3 mb-0">
                                                                <ButtonComponent
                                                                        text="Cancel"
                                                                        type="button"
                                                                        variant="light"
                                                                        extraClass="me-3"
                                                                        onClick={() => {
                                                                                close(null)
                                                                        }}
                                                                />
                                                                <ButtonComponent
                                                                        text={submitted ? 'Saving...' : props.title}
                                                                        type="submit"
                                                                        variant="dark"
                                                                        disabled={!((dirty && isValid) || changedColor)}
                                                                        onClick={handleSubmit}
                                                                />
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        )}
                </Formik>
        )
}

export default EditGroup
