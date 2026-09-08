import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, IconButton, Button, CircularProgress } from "@mui/material";
import { CustomDialog } from "../../../../../components/dialog/CustomDialog";
import { CustomButton } from "../../../../../components/buttons/CustomButton";
import { CheckDeleteIcon, EditIcon } from "../../../../../components/Icons";
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { styles } from "../../../styles";
import { CustomTable } from "../../../../../components/table/CustomTable";
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { DeleteAttachmentAlert } from "../DeleteAttachmentAlert";
import { EditAttachmentDescriptionModal } from "../EditAttachmentDescriptionModal";
import { getFileIcon } from "../../../../MyChecks/utils/fileUtils";
import { useDownloadAttachment } from "../../../../../API/attachments/useDownloadAttachment";
import { downloadFromUrl } from "../../../../../utils/helpers/downloadFromUrl";

// interface FileData {
//   id: string;
//   name: string;
//   size: number;
//   type: string;
//   url?: string;
//   file?: File;
//   description?: string;
// }

// interface AttachmentsModalProps {
//   open: boolean;
//   onClose: () => void;
//   handleSave: (files: FileData[]) => void;
//   attachments?: FileData[];
//   title?: string;
// }

export const AttachmentsModal = ({
  open,
  onClose,
  handleSave,
  attachments = [],
  title = "Add Attachments",
  loading = false
}) => {
 const [files, setFiles] = useState(attachments || []);
   const [filesToDelete, setFilesToDelete] = useState([]);
   const {mutateAsync: getAttachment} = useDownloadAttachment()
   // Reset files state when attachments prop changes or modal opens
   useEffect(() => {
     if (open) {
       setFiles(attachments || []);
       setFilesToDelete([]);
       setIsDirty(false);
     }
   }, [attachments, open]);
   const [isDragging, setIsDragging] = useState(false);
   const [openAlertModal, setOpenAlertModal] = useState(false)
   const [openEditDescriptionModal, setOpenEditDescriptionModal] = useState(false);
   const [isDirty, setIsDirty] = useState(false);
   const [deleteId, setDeleteId] = useState(null);
   const [desId, setDesId] = useState(null);
   const [unsavedWarning, setUnsavedWarning] = useState(false);
   const fileInputRef = useRef(null);
 
   const handleDragEnter = (e) => {
     e.preventDefault();
     e.stopPropagation();
     setIsDragging(true);
   };
 
   const handleDragLeave = (e) => {
     e.preventDefault();
     e.stopPropagation();
     setIsDragging(false);
   };
 
   const handleDragOver = (e) => {
     e.preventDefault();
     e.stopPropagation();
     setIsDragging(true);
   };
 
   const handleDrop = (e) => {
     e.preventDefault();
     e.stopPropagation();
     setIsDragging(false);
 
     const droppedFiles = Array.from(e.dataTransfer.files);
     if (droppedFiles.length > 0) {
       processFiles(droppedFiles);
       setIsDirty(true);
     }
   };
 
   const handleFileInput = (e) => {
     const selectedFiles = Array.from(e.target.files);
     if (selectedFiles.length > 0) {
       processFiles(selectedFiles);
       // Reset the file input value so the same file can be selected again
       e.target.value = '';
       setIsDirty(true);
     }
   };
 
   const processFiles = (newFiles) => {
     const processedFiles = newFiles.map(file => {
       // Create URL for preview
       const url = URL.createObjectURL(file);
       return {
         filename: file.name,
         size: file.size,
         type: file.type,
         url: url,
         file: file,
         description: '',
         _id: Date.now() + Math.random().toString(36).substr(2, 9) // Add unique ID
       };
     });
 
     setFiles(prevFiles => [...prevFiles, ...processedFiles]);
     setIsDirty(true);
   };
 
   const removeFile = (fileId) => {
     setFiles(prevFiles => {
       // Find the file with the matching ID
       const fileIndex = prevFiles.findIndex(file => file._id === fileId);
       if (fileIndex === -1) return prevFiles; // File not found
 
       const updatedFiles = [...prevFiles];
 
       if (!updatedFiles[fileIndex]?.url) {
         setFilesToDelete([...filesToDelete, fileId]);
       }
 
       // Release the object URL to avoid memory leaks
       if (updatedFiles[fileIndex]?.url) {
         URL.revokeObjectURL(updatedFiles[fileIndex].url);
       }
 
       // Remove the file
       updatedFiles.splice(fileIndex, 1);
       return updatedFiles;
     });
     setIsDirty(true);
   };
   const handleSaveAttachments = async () => {
     let filesToUpload = [];
     let filesToUpdate = [];
     files.forEach(file => {
       if (file.url) {
         filesToUpload.push(file);
       } else {
         let existingFile = attachments.find(attachment => attachment._id === file._id);
         if(existingFile.description !== file.description) {
           filesToUpdate.push(file);
         }
       }
     })
     await handleSave(filesToUpload,filesToDelete, filesToUpdate);
     onClose();
   };
 
   const handleDescriptionSave = (des) => {
     setFiles(prevFiles => {
       return prevFiles.map(file => {
         if (file._id === desId) {
           return { ...file, description: des };
         }
         return file;
       });
     });
     setIsDirty(true);
     setOpenEditDescriptionModal(false);
   }
 
   const handleDownloadFile = async (file) => {
     // Create a download link
     const link = document.createElement('a');
     
     // If it's a file object with a URL (from newly uploaded files)
     if (file.url) {
       // Set the download attributes
       link.href = file.url;
       link.download = file.filename;
       
       // Append to body, click, and remove
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
     }else{
       const res = await getAttachment(file._id);
       downloadFromUrl(res.result.url, file.filename);
     }
     
   };
 
   const renderCell = (row, column) => {
     switch (column.id) {
       case 'name':
         return (
           <Box sx={{ 
             display: 'flex', 
             alignItems: 'center',
             gap: 1 
           }}>
             <Box sx={{ 
               width: '16px', 
               height: '16px', 
               flexShrink: 0,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center'
             }}>
               {getFileIcon(row, { size: '16px' })}
             </Box>
             <Typography sx={styles.fileNameTable}>
               {row.filename}
             </Typography>
           </Box>
         )
       case 'description':
         return (
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <IconButton onClick = {() => {
               setDesId(row._id);
               setOpenEditDescriptionModal(true);
             }}>
               <EditIcon color="#00000099" />
             </IconButton>
             <Typography sx={{ fontSize: '16px', color: '#000000DE' }}>{row.description ? row.description : '-'}</Typography>
           </Box>
         )
       case "action":
         return (
           <Box>
             <IconButton onClick={() => handleDownloadFile(row)}>
               <FileDownloadOutlinedIcon sx={{ fontSize: '16px' }} />
             </IconButton>
             <IconButton onClick={() => {
               setDeleteId(row._id);
               setOpenAlertModal(true);
             }}>
               <CheckDeleteIcon color="#FF4D4F" />
             </IconButton>
           </Box>
         )
       default:
         return row[column.id];
     }
   }
 
   const renderHeaderCell = (column) => {
     switch (column.label) {
       case "File Name":
         return <Typography sx={{ textAlign: 'left', pl: 2, fontWeight: '600' }}>{column.label}</Typography>
       case "Description":
         return <Typography sx={{ textAlign: 'left', pl: 2, fontWeight: '600' }}>{column.label}</Typography>
       default:
         return column.label
     }
   }
 
   const handleClose = () => {
     if (isDirty) {
       setUnsavedWarning(true);
     } else {
       onClose();
     }
   }

  return (
    <>
      <CustomDialog
        open={open}
        onClose={onClose}
        title={title}
        width='765px'
        content={
          <Box>
            <Box
              sx={{
                border: isDragging ? '2px dashed #3EA5F9' : '2px dashed #1e3a5f',
                backgroundColor: isDragging ? '#F0F9FF' : '#F9FAFB',
                ...styles.attachmentDragDrop
              }}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <CloudUploadOutlinedIcon sx={{ fontSize: '32px', color: '#1e3a5f', mb: 1 }} />
                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#1e3a5f', mb: 1 }}>
                  Drag and drop files here
                </Typography>
                <Typography sx={{ fontSize: '14px', color: '#00000099', mb: 2 }}>
                  or
                </Typography>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileInput}
                />
                <CustomButton
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </CustomButton>
              </Box>
            </Box>

            {files.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <CustomTable
                  columns={[
                    { id: 'name', label: 'File Name', width: '30%' },
                    { id: 'description', label: 'Description', width: '50%' },
                    { id: 'action', label: 'Action', width: '20%' },
                  ]}
                  data={files}
                  renderCell={renderCell}
                  renderHeaderCell={renderHeaderCell}
                  isCenteredCells={true}
                />
              </Box>
            )}
          </Box>
        }
        actions={
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={styles.cancelButton}

            >
              Cancel
            </Button>
            <CustomButton
              variant="contained"
              onClick={handleSaveAttachments}
              disabled={loading}
              endIcon={loading && <CircularProgress size={14}/>}
            >
              Save
            </CustomButton>
          </Box>
        }
      />

      <DeleteAttachmentAlert
        open={openAlertModal}
        onClose={() => setOpenAlertModal(false)}
        onConfirm={() => {
          if (deleteId) {
            removeFile(deleteId);
            setOpenAlertModal(false);
          }
        }}
      />

      <EditAttachmentDescriptionModal
        open={openEditDescriptionModal}
        onClose={() => setOpenEditDescriptionModal(false)}
        onSave={handleDescriptionSave}
        description={files.find(file => file.id === desId)?.description || ''}
      />
    </>
  );
};

export default AttachmentsModal;