import {
        Box,
        Checkbox,
        Divider,
        MenuItem,
        Select,
        SelectChangeEvent,
        Typography
} from '@mui/material'
import { styles } from '../../styles'
import { TagIcon } from '../../../../components/Icons'
import useTags from '../../../../API/tags/useTags'
import useGroups from '../../../../API/group/useGroups'

type Props = {
        errors?: Record<string, any>
        values?: string[]
        touched?: Record<string, any>
        onChange?: (event: SelectChangeEvent<string[]>) => void
        name?: string
        [key: string]: any
}

function TagsSelector({
        values = [],
        errors,
        touched,
        onChange,
        ...rest
}: Props) {
        const { data: tagsData } = useTags()
        const { data: groupsData } = useGroups()
        const tags = Array.isArray(tagsData) ? tagsData : []
        const groups = Array.isArray(groupsData) ? groupsData : []

        const handleTagSelection = (tagId: string) => (event: React.MouseEvent) => {
                event.stopPropagation()

                const filteredValue = values.filter((id) => id !== undefined && id !== null && id !== '') 
                if (!filteredValue) return

                
                const newValues = filteredValue.includes(tagId)
                        ? filteredValue.filter((id) => id !== tagId)
                        : [...filteredValue, tagId]

                const syntheticEvent = {
                        target: { value: newValues, name: 'tags' }
                } as SelectChangeEvent<string[]>

                if (onChange) {
                        onChange(syntheticEvent)
                }
        }

        return (
                <Box sx={styles.checkBottomItemContainer}>
                        <Typography sx={styles.checkBottomItemlabel}>Tags</Typography>
                        <Select
                                fullWidth
                                name="tags"
                                value={values as string[]}
                                displayEmpty
                                multiple
                                renderValue={(selected) => {
                                        if (!selected || selected.length === 0) {
                                                return (
                                                        <Typography sx={{ color: 'text.secondary' }}>
                                                                Select Tags
                                                        </Typography>
                                                )
                                        }
                                        return (
                                                <Box
                                                        sx={{
                                                                display: 'flex',
                                                                gap: '12px',
                                                                alignItems: 'center'
                                                        }}
                                                >
                                                        {selected.slice(0, 3).map((tag, index) => (
                                                                <Box key={'tag_input' + index} sx={styles.selectTagItem}>
                                                                        <Box
                                                                                sx={{
                                                                                        ...styles.tag,
                                                                                        backgroundColor: tags?.find((val) => val._id === tag)
                                                                                                ?.color
                                                                                }}
                                                                        />
                                                                        {tags?.find((t) => t._id === tag)?.name}
                                                                </Box>
                                                        ))}
                                                        {selected.length > 3 && (
                                                                <Typography sx={{ color: '#000000DE' }}>
                                                                        +{selected.length - 3}
                                                                </Typography>
                                                        )}
                                                </Box>
                                        )
                                }}
                                error={touched?.tags && !!errors?.tags}
                                sx={{ ...styles.select, width: '100% !important' }}
                                MenuProps={{
                                        sx: {
                                                '& .MuiMenu-paper': {
                                                        width: '210px',
                                                        minWidth: '210px !important'
                                                }
                                        },
                                        anchorOrigin: {
                                                vertical: 'bottom',
                                                horizontal: 'right'
                                        },
                                        transformOrigin: {
                                                vertical: 'top',
                                                horizontal: 'right'
                                        }
                                }}
                                {...rest}
                        >
                                <Box sx={{ ...styles.tagItem, my: 1, ml: '30px' }}>
                                        <TagIcon />
                                        <Typography sx={styles.tagTitle}>Other Tags</Typography>
                                </Box>
                                {tags
                                        .filter((i) => !i.group)
                                        .map((tag, index) => (
                                                <MenuItem
                                                        key={`ungrouped-${tag._id}`}
                                                        value={tag._id}
                                                        onClick={handleTagSelection(tag._id)}
                                                >
                                                        <Box sx={styles.tagItem}>
                                                                <Checkbox checked={values.includes(tag._id)} />
                                                                <Box
                                                                        sx={{
                                                                                ...styles.tag,
                                                                                backgroundColor: tag?.color
                                                                        }}
                                                                />
                                                                <Typography sx={styles.tagText}>{tag?.name}</Typography>
                                                        </Box>
                                                </MenuItem>
                                        ))}
                                <Divider sx={{ m: 0 }} />
                                {groups.map((group) => (
                                        <Box key={`group-${group._id}`}>
                                                <Box sx={{ ...styles.tagItem, my: 1, ml: '30px' }}>
                                                        <TagIcon />
                                                        <Typography sx={styles.tagTitle}>{group.name}</Typography>
                                                </Box>

                                                {tags
                                                        .filter((i) => i.group === group._id)
                                                        .map((tag, index) => (
                                                                <MenuItem
                                                                        key={`grouped-${tag._id}`}
                                                                        value={tag._id}
                                                                        onClick={handleTagSelection(tag._id)}
                                                                >
                                                                        <Box sx={styles.tagItem}>
                                                                                <Checkbox checked={values.includes(tag._id)} />
                                                                                <Box
                                                                                        sx={{
                                                                                                ...styles.tag,
                                                                                                backgroundColor: tag.color
                                                                                        }}
                                                                                />
                                                                                <Typography sx={styles.tagText}>{tag.name}</Typography>
                                                                        </Box>
                                                                </MenuItem>
                                                        ))}
                                        </Box>
                                ))}
                        </Select>
                        {touched?.tags && errors?.tags && (
                                <Typography color="error" sx={styles.errorText}>
                                        {errors?.tags}
                                </Typography>
                        )}
                </Box>
        )
}

export default TagsSelector
