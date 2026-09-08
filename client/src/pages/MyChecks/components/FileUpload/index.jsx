import { Box, Typography } from '@mui/material'
import { styles } from '../../styles'
import { useRef, useState } from 'react'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import { DocumentIcon } from '../../../../components/Icons'
import { AttachmentsModal } from '../modals'

const FileUpload = ({ index, attachments, handleDropFile, handleSaveFile }) => {
        const [openAttachmentsModal, setOpenAttachmentsModal] = useState(false)
        const [isDragging, setIsDragging] = useState(false)
        const [loading, setLoading] = useState(false)
        const fileInputRef = useRef(null)
        const handleDragEnter = (e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragging(true)
        }

        const handleDragLeave = (e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragging(false)
        }

        const handleDragOver = (e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragging(true)
        }

        const handleDrop = (e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragging(false)

                const droppedFiles = Array.from(e.dataTransfer.files)
                if (droppedFiles.length > 0) {
                        const files = processFiles(droppedFiles)
                        handleDropFile(files)
                }
        }

        const handleFileInput = (e) => {
                const selectedFiles = Array.from(e.target.files)
                if (selectedFiles.length > 0) {
                        processFiles(selectedFiles)
                        e.target.value = ''
                }
        }

        const processFiles = (newFiles) => {
                const processedFiles = newFiles.map((file) => {
                        const url = URL.createObjectURL(file)
                        return {
                                filename: file.name,
                                size: file.size,
                                type: file.type,
                                description: '',
                                url: url,
                                file: file,
                                id: Date.now() + Math.random().toString(36).substr(2, 9)
                        }
                })
                return processedFiles
        }

        const handleSaveAttachments = async (
                filesToUpload,
                filesToDelete,
                filesToUpdate
        ) => {
                setLoading(true)
                await handleSaveFile(filesToUpload, filesToDelete, filesToUpdate)
                setOpenAttachmentsModal(false)
                setLoading(false)
        }

        return (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                        <Box
                                sx={{
                                        ...styles.addAttachmentButton,
                                        borderColor: attachments.length > 0 ? '#1e3a5f' : '#00000099',
                                        borderStyle: isDragging ? 'dashed' : 'dashed',
                                        borderWidth: isDragging ? '2px' : '1px',
                                        backgroundColor: isDragging ? '#F0F9FF' : 'transparent'
                                }}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => setOpenAttachmentsModal(true)}
                        >
                                <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileInput}
                                        style={{ display: 'none' }}
                                        multiple
                                />
                                <DocumentIcon
                                        color={attachments.length > 0 ? '#1e3a5f' : '#00000099'}
                                />
                                <Typography
                                        sx={{
                                                fontSize: '18px',
                                                color: attachments.length > 0 ? '#1e3a5f' : '#00000099',
                                                lineHeight: 'normal'
                                        }}
                                >
                                        {attachments && attachments.length > 0
                                                ? `${attachments.length} Attachments`
                                                : 'Add Attachments'}
                                </Typography>
                                <AttachFileOutlinedIcon
                                        sx={{
                                                fontSize: '20px',
                                                color: attachments.length > 0 ? '#1e3a5f' : '#00000099',
                                                rotate: '45deg'
                                        }}
                                />
                        </Box>
                        <AttachmentsModal
                                open={openAttachmentsModal}
                                onClose={() => setOpenAttachmentsModal(false)}
                                title="Add Attachments"
                                handleSave={handleSaveAttachments}
                                attachments={attachments}
                                loading={loading}
                        />
                </Box>
        )
}

export default FileUpload
