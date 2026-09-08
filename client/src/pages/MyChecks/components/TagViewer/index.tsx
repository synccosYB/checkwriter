import {
        Box,
        Button,
        Fade,
        MenuItem,
        Paper,
        Popper,
        Typography
} from '@mui/material'
import { TagResponse } from '../../../../API/tags/types'
import { useState } from 'react'
import { styles } from '../../styles'

interface Props {
        tags: TagResponse[]
        row: Record<string, any>
        mode: 'table' | 'detail'
}

function TagViewer({ tags: rawTags, row, mode = 'table' }: Props) {
        const tags = Array.isArray(rawTags) ? rawTags : []
        const [tagAnchorEl, setTagAnchorEl] = useState(null)
        const [selectedTags, setSelectedTags] = useState([])

        return mode === 'table' ? (
                <Box display={!row?.tags?.length ? 'none' : 'block'}>
                        <Box
                                sx={{
                                        position: 'relative',
                                        display: 'flex',
                                        justifyContent: 'center'
                                }}
                        >
                                <Button
                                        onMouseEnter={(event) => {
                                                setTagAnchorEl(event.currentTarget)
                                                setSelectedTags(row.tags)
                                        }}
                                        onMouseLeave={() => {
                                                setTagAnchorEl(null)
                                        }}
                                        sx={styles.tagButton}
                                >
                                        <Box sx={{ display: 'flex' }}>
                                                {(row?.tags || []).slice(0, 3).map((tag, index) => (
                                                        <Box
                                                                key={'tag_input_table' + index}
                                                                sx={{
                                                                        ...styles.tag,
                                                                        backgroundColor: tags.find((val) => val._id === tag)?.color,
                                                                        ml: '-2px'
                                                                }}
                                                        />
                                                ))}
                                        </Box>
                                        {row.tags?.length || 0} Tags
                                </Button>
                        </Box>

                        <Popper
                                open={Boolean(tagAnchorEl)}
                                anchorEl={tagAnchorEl}
                                placement="bottom"
                                style={{ zIndex: 9999 }}
                                transition
                                modifiers={[
                                        {
                                                name: 'offset',
                                                options: {
                                                        offset: [0, 8]
                                                }
                                        }
                                ]}
                        >
                                {({ TransitionProps }) => (
                                        <Fade {...TransitionProps} timeout={200}>
                                                <Paper sx={styles.tagTablePaper}>
                                                        {selectedTags?.map((tag, index) => (
                                                                <MenuItem key={index} sx={styles.tagTableItem}>
                                                                        <Box
                                                                                sx={{
                                                                                        ...styles.tag,
                                                                                        backgroundColor: tags.find((val) => val._id === tag)
                                                                                                ?.color
                                                                                }}
                                                                        />
                                                                        {tags?.find((t) => t._id === tag)?.name}
                                                                </MenuItem>
                                                        ))}
                                                </Paper>
                                        </Fade>
                                )}
                        </Popper>
                </Box>
        ) : (
                <Box sx={styles.detailItem} display={!row?.tags?.length ? 'none' : 'block'}>
                        <Typography sx={styles.detailTitle}>Tags</Typography>
                        <Box
                                sx={{
                                        ...styles.detailValue,
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'center'
                                }}
                        >
                                {(row?.tags || []).slice(0, 3).map((tag, index) => (
                                        <Box key={'tag_detail' + index} sx={styles.selectTagItem}>
                                                <Box
                                                        sx={{
                                                                ...styles.tag,
                                                                backgroundColor: tags.find((val) => val._id === tag)?.color
                                                        }}
                                                />
                                                {tags?.find((t) => t._id === tag)?.name}
                                        </Box>
                                ))}
                                {(row?.tags || []).length > 3 && (
                                        <Box>
                                                <Typography
                                                        sx={{ color: '#000000DE', cursor: 'pointer' }}
                                                        onMouseEnter={(event) => {
                                                                setTagAnchorEl(event.currentTarget)
                                                        }}
                                                        onMouseLeave={() => {
                                                                setTagAnchorEl(null)
                                                        }}
                                                >
                                                        +{(row?.tags || []).length - 3}
                                                </Typography>

                                                <Popper
                                                        open={Boolean(tagAnchorEl)}
                                                        anchorEl={tagAnchorEl}
                                                        placement="bottom"
                                                        style={{ zIndex: 9999 }}
                                                        transition
                                                        modifiers={[
                                                                {
                                                                        name: 'offset',
                                                                        options: {
                                                                                offset: [0, 8]
                                                                        }
                                                                }
                                                        ]}
                                                >
                                                        {({ TransitionProps }) => (
                                                                <Fade {...TransitionProps} timeout={200}>
                                                                        <Paper sx={styles.tagTablePaper}>
                                                                                {(row?.tags?.slice(3) || [])?.map((tag, index) => (
                                                                                        <MenuItem key={index} sx={styles.tagTableItem}>
                                                                                                <Box
                                                                                                        sx={{
                                                                                                                ...styles.tag,
                                                                                                                backgroundColor: tags.find((val) => val._id === tag)
                                                                                                                        ?.color
                                                                                                        }}
                                                                                                />
                                                                                                {tags?.find((t) => t._id === tag)?.name}
                                                                                        </MenuItem>
                                                                                ))}
                                                                        </Paper>
                                                                </Fade>
                                                        )}
                                                </Popper>
                                        </Box>
                                )}
                        </Box>
                </Box>
        )
}

export default TagViewer
