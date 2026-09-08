import React from 'react';
// Import icons from react-icons
import { 
  FaRegFilePdf, 
  FaRegFileImage, 
  FaRegFileWord, 
  FaRegFileExcel,
  FaRegFileAudio,
  FaRegFileVideo,
  FaRegFileArchive,
  FaRegFileCode,
  FaRegFilePowerpoint,
  FaRegFile
} from 'react-icons/fa';

/**
 * Get the appropriate icon for a file based on its MIME type or extension
 * @param {Object} file - File object with name and type properties
 * @param {Object} options - Options for icon customization
 * @param {string} options.size - Icon size (default: '16px')
 * @param {string} options.className - Additional CSS classes
 * @returns {JSX.Element} - React component with the appropriate icon
 */
export const getFileIcon = (file, options = {}) => {
  const { size = '16px', className = '' } = options;
  
  // Get file extension and mime type
  const fileName = file.filename || '';
  const fileExtension = fileName.split('.').pop().toLowerCase();
  
  // Get MIME type from file object
  const mimeType = file.mimeType || '';
  
  // Default style for icons
  const iconStyle = { 
    fontSize: size,
    color: '#607D8B' // Default color
  };
  
  // Determine icon based on MIME type or extension
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(fileExtension)) {
    return <FaRegFileImage style={{...iconStyle, color : '#00000099'}} className={className} />;
  } else if (mimeType === 'application/pdf' || fileExtension === 'pdf') {
    return <FaRegFilePdf style={{...iconStyle, color : '#00000099'}} className={className} />;
  } else if (
    mimeType.includes('word') || 
    mimeType === 'application/msword' || 
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ['doc', 'docx', 'rtf', 'odt'].includes(fileExtension)
  ) {
    return <FaRegFileWord style={{...iconStyle, color : '#00000099'}} className={className} />;
  } else if (
    mimeType.includes('spreadsheet') || 
    mimeType === 'application/vnd.ms-excel' || 
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'text/csv' ||
    ['xls', 'xlsx', 'csv', 'ods'].includes(fileExtension)
  ) {
    return <FaRegFileExcel style={{...iconStyle, color : '#00000099'}} className={className} />;
  } else if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(fileExtension)) {
    return <FaRegFileAudio style={{...iconStyle, color : '#00000099'}} className={className} />;
  } else if (mimeType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'].includes(fileExtension)) {
    return <FaRegFileVideo style={{...iconStyle, color : '#00000099'}} className={className} />;
  } else if (
    mimeType.includes('zip') || 
    mimeType.includes('compressed') || 
    ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(fileExtension)
  ) {
    return <FaRegFileArchive style={{...iconStyle, color : '#00000099'}} className={className} />;
  } else if (
    mimeType.includes('presentation') || 
    mimeType === 'application/vnd.ms-powerpoint' || 
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    ['ppt', 'pptx', 'odp'].includes(fileExtension)
  ) {
    return <FaRegFilePowerpoint style={{...iconStyle, color : '#00000099'}} className={className} />;
  } else if (['html', 'css', 'js', 'jsx', 'ts', 'tsx', 'json', 'xml', 'php', 'py', 'java', 'c', 'cpp', 'cs', 'rb'].includes(fileExtension)) {
    return <FaRegFileCode style={{...iconStyle, color : '#00000099'}} className={className} />;
  }
  
  // Default icon for unknown file types
  return <FaRegFile style={{...iconStyle, color : '#00000099'}} className={className} />;
};

/**
 * Format file size in a human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
