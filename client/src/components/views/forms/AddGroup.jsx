import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../../redux/snackbarState'

import ButtonComponent from '../../shared/ButtonComponent'

import { Divider, IconButton } from '@mui/material'
import { AddCircleOutlined } from '@mui/icons-material'
import TagNameColor from '../../shared/forms/TagNameColor'

import useCreateGroup from '../../../API/group/useCreateGroup'

import useCreateTag from '../../../API/tags/useCreateTag'
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

const AddGroup = ({ onClose, groups }) => {
	const { mutate: addGroup } = useCreateGroup()
	const { mutate: addTag } = useCreateTag()

	const [submitted, setSubmitted] = useState(false)
	const [tagList, setTagList] = useState([])
	const dispatch = useDispatch()

	const [groupInfo, setGroupInfo] = useState([
		{
			name: '',
			color: colors[Math.floor(Math.random() * colors.length)]
		}
	])

	const addTagToList = () => {
		let color = colors[Math.floor(Math.random() * colors.length)]
		setTagList([...tagList, { name: '', color: color }])
	}

	useEffect(() => {
		addTagToList()
	}, [])

	const removeTagFromList = (index) => {
		const updatedList = [...tagList]
		updatedList.pop()
		setTagList(updatedList)
	}

	const changeTagColor = (color, index) => {
		const updatedList = [...tagList]
		for (let i = 0; i < updatedList.length; i++) {
			if (i === index) {
				updatedList[i]['color'] = color
			}
		}
		setTagList(updatedList)
	}

	const changeTagName = (name, index) => {
		const updatedList = [...tagList]
		for (let i = 0; i < updatedList.length; i++) {
			if (i === index) {
				updatedList[i]['name'] = name
			}
		}
		setTagList(updatedList)
	}

	const changeGroupName = (name) => {
		let info = [...groupInfo]
		info[0]['name'] = name
		setGroupInfo(info)
	}

	const changeGroupColor = (color) => {
		let info = [...groupInfo]
		info[0]['color'] = color
		setGroupInfo(info)
	}

	const [disabled, setDisabled] = useState(true)
	const [valid, setValid] = useState(false)

	useEffect(() => {
		if (
			groupInfo[0]?.name === '' ||
			tagList?.length === 0 ||
			tagList[tagList.length - 1]?.name === '' ||
			!valid
		) {
			setDisabled(true)
		} else {
			setDisabled(false)
		}
	}, [groupInfo, tagList])

	const onSave = async () => {
		if (!submitted) {
			setSubmitted(true)

			let group_name = groupInfo[0]['name']
			let group_color = groupInfo[0]['color']

			if (group_name === '') {
				setSubmitted(false)
				dispatch(
					updateSnackbar({
						open: true,
						severity: 'error',
						message: 'Cannot add group without name.'
					})
				)

				return
			}

			let body = {
				name: group_name,
				color: group_color
			}

			addGroup(body, {
				onSuccess: (res) => {
					const group_id = res._id

					tagList.forEach((tag) => {
						if (tag?.name !== '') {
							const body = {
								name: tag?.name,
								color: tag?.color,
								group: group_id
							}

							addTag(body, {
								onSuccess: () => {
									onClose()
								}
							})
						}
					})
				}
			})

			setSubmitted(false)
		}
	}

	return (
		<div className="container p-3">
			<TagNameColor
				tagName={groupInfo[0]['name']}
				tagColor={groupInfo[0]['color']}
				label="Group Name"
				hasDelete={false}
				changeColor={(color) => {
					changeGroupColor(color)
				}}
				changeName={(name) => {
					changeGroupName(name)
				}}
				setValid={setValid}
			/>
			<Divider component="div" />
			<div className="row justify-content-between mt-3 mb-3">
				<div className="col-auto">
					<p className="fw-bold text-secondary mt-2">Tags</p>
				</div>
				<div className="col-auto">
					<IconButton
						disabled={
							tagList[tagList.length - 1]?.name === '' || !valid ? true : false
						}
						color="success"
					>
						<AddCircleOutlined onClick={addTagToList} />
					</IconButton>
				</div>
			</div>

			<ul style={{ padding: 0 }}>
				{tagList.map((tag, index) => (
					<li key={index} style={{ listStyle: 'none' }}>
						<TagNameColor
							tagName={tag['name']}
							tagColor={tag['color']}
							label="Tag Name"
							hasDelete={index == tagList.length - 1}
							removeTag={() => {
								removeTagFromList(index)
							}}
							changeColor={(color) => {
								changeTagColor(color, index)
							}}
							changeName={(name) => {
								changeTagName(name, index)
							}}
							setValid={setValid}
						/>
					</li>
				))}
			</ul>

			<div className="row">
				<div className="d-flex align-items-center justify-content-center mt-3 mb-0">
					<ButtonComponent
						text="Cancel"
						type="button"
						variant="light"
						extraClass="me-5"
						onClick={onClose}
					/>
					<ButtonComponent
						text="Save Group"
						type="submit"
						variant="dark"
						onClick={onSave}
						disabled={disabled}
					/>
				</div>
			</div>
		</div>
	)
}

export default AddGroup
