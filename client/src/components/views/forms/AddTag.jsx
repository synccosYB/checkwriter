import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateSnackbar } from '../../../redux/snackbarState'
import { Formik } from 'formik'
import FormComponents from '../../shared/forms'
import { TwitterPicker } from 'react-color'
import ButtonComponent from '../../shared/ButtonComponent'

import { Button, Popover } from '@mui/material'
import useCreateTag from '../../../API/tags/useCreateTag'
import useUpdateTag from '../../../API/tags/useUpdateTag'

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

const AddTag = (props) => {
        const tags = useSelector((state) => state.appData.tags)
        const { mutate: addTag } = useCreateTag()
        const { mutate: updateTag } = useUpdateTag()
        const [submitted, setSubmitted] = useState(false)
        const dispatch = useDispatch()
        const ref = useRef(null)

        const [selectedColor, setSelectedColor] = useState(
                props.edit ? props.tagColor : '#6699FF'
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
                tag_name: props.edit ? props.tagName : ''
        }

        const validate = (values) => {
                const errors = {}

                if (!values.tag_name) {
                        errors.tag_name = '*Tag name is required'
                }

                if ((tags?.data || []).some((obj) => obj.name === values.tag_name)) {
                        errors.tag_name = '*Tag with same name already exists.'
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

        const handleSubmit = async () => {
                if (!submitted) {
                        setSubmitted(true)
                        let tag_name = ref.current.values['tag_name']
                        let color = selectedColor
                        let body = {
                                name: tag_name,
                                color: color
                        }

                        try {
                                if (props.edit) {
                                        updateTag({ id: props.tagId, body }, { onSuccess: () => close() })
                                } else
                                        addTag(body, {
                                                onSuccess: () => {
                                                        close()
                                                }
                                        })
                        } catch (err) {
                                dispatch(
                                        updateSnackbar({
                                                open: true,
                                                severity: 'error',
                                                message: err.response.data.error.userMessage
                                                        ? err.response.data.error.userMessage
                                                        : 'Unable to add tag.'
                                        })
                                )
                        }
                        setSubmitted(false)
                }
        }

        const handleClick = (event) => {
                setAnchorEl(event.currentTarget)
        }

        const handleClose = () => {
                setAnchorEl(null)
        }

        return (
                <Formik
                        initialValues={initialValues}
                        validate={validate}
                        onSubmit={handleSubmit}
                        innerRef={ref}
                >
                        {({ handleSubmit, values, dirty, isValid }) => (
                                <div className="container p-3">
                                        <div className=" d-flex align-items-start flex-row">
                                                <Button
                                                        className="color-box me-3 d-flex align-items-center justify-content-center"
                                                        onClick={handleClick}
                                                        sx={{
                                                                minWidth: 'auto'
                                                        }}
                                                >
                                                        <div
                                                                className="single_color_picker_tag m-0"
                                                                style={{ backgroundColor: selectedColor }}
                                                        />
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
                                                <div className="w-100">
                                                        <FormComponents
                                                                name="tag_name"
                                                                type="text"
                                                                label="Tag Name"
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

export default AddTag
