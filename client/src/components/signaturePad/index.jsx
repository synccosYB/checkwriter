import React, { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import {
        Box,
        Button,
        IconButton,
        Typography,
        Tooltip,
        Modal
} from '@mui/material'
import { UndoIcon, DownloadIcon } from '../Icons'
import { styles } from './styles'

export const SignaturePad = ({ onChange, value, defaultValue }) => {
        const sigPadRef = useRef(null)
        const [isEmpty, setIsEmpty] = useState(true && !value)
        const [isDrawModalOpen, setIsDrawModalOpen] = useState(false)

        const clear = () => {
                if (defaultValue) {
                        onChange?.(defaultValue)
                        setIsEmpty(false)
                } else {
                        onChange?.(null)
                        setIsEmpty(true)
                }
        }

        const handleSignatureEnd = () => {
                if (sigPadRef.current) {
                        // Check if the signature pad is empty
                        if (sigPadRef.current.isEmpty()) {
                                setIsEmpty(true)
                                onChange?.(null)
                        } else {
                                const signatureData = sigPadRef.current.toDataURL('image/png')
                                onChange?.(signatureData)
                                setIsEmpty(false)
                        }
                        setIsDrawModalOpen(false)
                }
        }

        const handleUpload = (event) => {
                const file = event.target.files?.[0]
                if (file) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                                onChange?.(e.target.result)
                                setIsEmpty(false)
                        }
                        reader.readAsDataURL(file)
                }
        }

        const handleDownload = () => {
                if (!isEmpty && value) {
                        const link = document.createElement('a')
                        link.download = 'signature.png'
                        link.href = value
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                }
        }

        const handleDraw = () => {
                setIsDrawModalOpen(true)
        }

        const handleModalUndo = () => {
                const data = sigPadRef.current?.toData()
                if (data && data.length > 0) {
                        data.pop()
                        sigPadRef.current?.fromData(data)
                }
        }

        return (
                <Box sx={styles.wrapper}>
                        <Box sx={styles.container}>
                                <Tooltip title="Download Signature">
                                        <Button
                                                onClick={handleDownload}
                                                disabled={isEmpty}
                                                sx={styles.downloadButton}
                                        >
                                                <DownloadIcon />
                                        </Button>
                                </Tooltip>
                                <Box sx={styles.tabContainer}>
                                        <Button onClick={handleDraw} sx={styles.tabButton}>
                                                Draw
                                        </Button>
                                        <Button component="label" sx={styles.tabButton}>
                                                Upload
                                                <input
                                                        type="file"
                                                        accept="image/*"
                                                        hidden
                                                        onChange={handleUpload}
                                                />
                                        </Button>
                                </Box>
                                <Box sx={styles.padContainer}>
                                        {value ? (
                                                <Box
                                                        sx={styles.uploadContainer}
                                                        component="label"
                                                        onDrop={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                const file = e.dataTransfer.files[0]
                                                                if (file && file.type.startsWith('image/')) {
                                                                        handleUpload({ target: { files: [file] } })
                                                                }
                                                        }}
                                                        onDragOver={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                e.currentTarget.style.backgroundColor = '#F0F4F8'
                                                        }}
                                                        onDragLeave={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                e.currentTarget.style.backgroundColor = ''
                                                        }}
                                                >
                                                        <img
                                                                src={value ? value : defaultValue}
                                                                alt="Signature"
                                                                style={{
                                                                        width: '100%',
                                                                        height: '100%'
                                                                }}
                                                        />
                                                        <input
                                                                type="file"
                                                                accept="image/*"
                                                                hidden
                                                                onChange={handleUpload}
                                                        />
                                                </Box>
                                        ) : (
                                                <Box
                                                        sx={styles.uploadContainer}
                                                        component="label"
                                                        onDrop={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                const file = e.dataTransfer.files[0]
                                                                if (file && file.type.startsWith('image/')) {
                                                                        handleUpload({ target: { files: [file] } })
                                                                }
                                                        }}
                                                        onDragOver={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                e.currentTarget.style.backgroundColor = '#F0F4F8'
                                                        }}
                                                        onDragLeave={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                e.currentTarget.style.backgroundColor = ''
                                                        }}
                                                >
                                                        <Typography align="center">
                                                                <span style={{ textDecoration: 'underline' }}>Upload</span> a
                                                                signature image{' '}
                                                                <span
                                                                        style={{
                                                                                color: '#1e3a5f',
                                                                                fontWeight: 'bold',
                                                                                textDecoration: 'underline'
                                                                        }}
                                                                >
                                                                        here
                                                                </span>
                                                        </Typography>
                                                        <input
                                                                type="file"
                                                                accept="image/*"
                                                                hidden
                                                                onChange={handleUpload}
                                                        />
                                                </Box>
                                        )}
                                </Box>

                                <hr style={{ width: '80%', border: '1px solid #E5E7EB' }} />

                                {!isEmpty && (
                                        <Box sx={styles.buttonContainer}>
                                                <Box sx={styles.buttonGroup}>
                                                        <Tooltip
                                                                title="Revert to default signature"
                                                                placement="top"
                                                                arrow
                                                                componentsProps={{
                                                                        tooltip: { sx: { ...styles.tooltip } }
                                                                }}
                                                        >
                                                                <IconButton onClick={clear}>
                                                                        <UndoIcon />
                                                                </IconButton>
                                                        </Tooltip>
                                                </Box>
                                        </Box>
                                )}

                                <Modal open={isDrawModalOpen} onClose={() => setIsDrawModalOpen(false)}>
                                        <Box sx={styles.modalContainer}>
                                                <Box sx={styles.canvasContainer}>
                                                        <SignatureCanvas
                                                                ref={sigPadRef}
                                                                dotSize={0.7}
                                                                minWidth={0.7}
                                                                maxWidth={1.4}
                                                                canvasProps={{
                                                                        style: styles.canvas
                                                                }}
                                                        />
                                                        <Tooltip title="Undo last stroke" placement="left" arrow>
                                                                <IconButton onClick={handleModalUndo} sx={styles.undoButton}>
                                                                        <UndoIcon />
                                                                </IconButton>
                                                        </Tooltip>
                                                </Box>
                                                <Box sx={styles.modalActions}>
                                                        <Button onClick={() => setIsDrawModalOpen(false)}>Cancel</Button>
                                                        <Button onClick={handleSignatureEnd} variant="contained">
                                                                Save
                                                        </Button>
                                                </Box>
                                        </Box>
                                </Modal>
                        </Box>
                </Box>
        )
}
