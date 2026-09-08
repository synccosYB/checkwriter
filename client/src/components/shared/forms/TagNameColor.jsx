import { Formik, Form } from 'formik'
import { useState } from 'react'
import FormComponents from '.'
import { TwitterPicker } from 'react-color'
import * as Yup from 'yup'
import {
        CancelOutlined,
        DeleteOutlineOutlined,
        GridViewOutlined
} from '@mui/icons-material'
import { Button, IconButton, Popover } from '@mui/material'
import { useSelector } from 'react-redux'

const TagNameColor = ({
        tagName,
        tagColor,
        label,
        hasDelete,
        removeTag,
        changeColor,
        changeName,
        setValid
}) => {
        const groupData = useSelector((state) => state.appData.groups)
        const tagsData = useSelector((state) => state.appData.tags)

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

        const [anchorEl, setAnchorEl] = useState(null)

        const [selectedColor, setSelectedColor] = useState(tagColor)

        const initialValues = {
                tagName: ''
        }

        const validate = (values) => {
                const errors = {}

                if (!values.tagName) {
                        if (label === 'Group Name') {
                                errors.tagName = '*Group name is required'
                        } else {
                                errors.tagName = '*Tag name is required'
                        }
                }

                if (label === 'Group Name') {
                        if ((groupData?.data || []).some((obj) => obj.name === values.tagName)) {
                                errors.tagName = '*Group with same name already exists.'
                        }
                } else {
                        if ((tagsData?.data || []).some((obj) => obj.name === values.tagName)) {
                                errors.tagName = '*Tag with same name already exists.'
                        }
                }

                if(Object.keys(errors).length > 0){
                        setValid(false)
                } else {
                        setValid(true)
                }

                return errors
        }

        const handleClick = (event) => {
                setAnchorEl(event.currentTarget)
        }

        const handleClose = () => {
                setAnchorEl(null)
        }

        const changeSelectedColor = (color) => {
                changeColor(color)
                setSelectedColor(color)
        }

        return (
                <Formik initialValues={initialValues} validate={validate}>
                        {({ values, setFieldValue, isValid }) => {
                                return (
                                        <Form>
                                                <div className="container">
                                                        <div className=" d-flex align-items-start flex-row">
                                                                <Button
                                                                        className="color-box me-3 d-flex align-items-center justify-content-center"
                                                                        onClick={handleClick}
                                                                        aria-describedby="simple-popover"
                                                                        sx={{
                                                                                minWidth: 'auto'
                                                                        }}
                                                                >
                                                                        <div className="click-color-div">
                                                                                {label === 'Group Name' ? (
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
                                                                                ) : (
                                                                                        <div
                                                                                                className="single_color_picker_tag"
                                                                                                style={{ backgroundColor: selectedColor }}
                                                                                        />
                                                                                )}
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

                                                                <div className="w-100 d-flex align-items-start justify-content-between">
                                                                        <div className="w-100">
                                                                                <FormComponents
                                                                                        name="tagName"
                                                                                        type="text"
                                                                                        label={label}
                                                                                        control="input"
                                                                                        onChange={(e) => {
                                                                                                setFieldValue('tagName', e.target.value)
                                                                                                changeName(e.target.value)
                                                                                        }}
                                                                                />
                                                                        </div>

                                                                        {hasDelete ? (
                                                                                <div className="col-auto">
                                                                                        <IconButton
                                                                                                onClick={removeTag}
                                                                                                sx={{
                                                                                                        marginLeft: 2
                                                                                                }}
                                                                                        >
                                                                                                <DeleteOutlineOutlined
                                                                                                        sx={{
                                                                                                                color: 'red'
                                                                                                        }}
                                                                                                />
                                                                                        </IconButton>
                                                                                </div>
                                                                        ) : null}
                                                                </div>
                                                        </div>
                                                </div>
                                        </Form>
                                )
                        }}
                </Formik>
        )
}

export default TagNameColor
