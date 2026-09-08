import React from 'react'
import { styled } from '@mui/material/styles'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { Dialog } from '@mui/material'

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
	'& .MuiPaper-elevation': {
		borderRadius: '12px'
	},

	'& .MuiDialogContent-root': {
		padding: theme.spacing(2),
		'& .MuiPaper-root': {
			height: '100%'
		}
	}
}))

function BootstrapDialogTitle(props) {
	const { children, onClose, ...other } = props

	return (
		<div className="d-flex align-items-center justify-content-between">
			<DialogTitle
				sx={{ m: 0, p: '16px 16px 0px 16px', fontSize: '1.25rem', fontWeight: '400' }}
				{...other}
			>
				{children}
			</DialogTitle>
			{onClose ? (
				<IconButton
					aria-label="close"
					onClick={onClose}
					sx={{
						position: 'relative',
						right: 10,
						color: (theme) => theme.palette.grey[500]
					}}
				>
					<CloseIcon />
				</IconButton>
			) : null}
		</div>
	)
}

const FormModalMUI = (props) => {
	return (
		<div>
			<BootstrapDialog
				aria-labelledby="customized-dialog-title"
				open={props.open}
				maxWidth={props.maxWidth}
				onClose={props.onClose}
				fullWidth={true}
			>
				{props.title !== undefined ? (
					<BootstrapDialogTitle
						id="customized-dialog-title"
						onClose={props.onClose}
						style={{
							fontWeight: '500',
							...props.styles?.title
						}}
					>
						{props.title}
					</BootstrapDialogTitle>
				) : null}

				<DialogContent
					className="position-relative"
					dividers={props.hideDividers ? false : props.title !== undefined}
				>
					{props.children}
				</DialogContent>
				{/* <DialogActions>
            <ButtonComponent
							text="Save Changes"
							type="submit"
							variant="dark" 
              autoFocus 
              onClick={props.children.onSubmit}>
              Save changes
            </ButtonComponent>
          </DialogActions> */}
			</BootstrapDialog>
		</div>
	)
}

export default FormModalMUI
