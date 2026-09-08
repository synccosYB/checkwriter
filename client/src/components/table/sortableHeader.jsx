import { useCallback, useState } from 'react'
import { Box } from '@mui/material'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'

/**
 * Reusable column-sort hook that mirrors MyChecks' UX:
 * clicking the same column cycles null -> desc -> asc -> null.
 * `null` means "use the server's default ordering".
 */
export function useColumnSort(sortableColumnIds) {
        const [sort, setSort] = useState(null)

        const handleSortClick = useCallback(
                (columnId) => {
                        if (!sortableColumnIds.has(columnId)) return
                        setSort((prev) => {
                                if (!prev || prev.sortBy !== columnId) {
                                        return { sortBy: columnId, sortOrder: 'desc' }
                                }
                                if (prev.sortOrder === 'desc') {
                                        return { sortBy: columnId, sortOrder: 'asc' }
                                }
                                return null
                        })
                },
                [sortableColumnIds]
        )

        return { sort, setSort, handleSortClick }
}

/**
 * Renders a clickable sortable header label with the same asc/desc/none
 * indicator UX as MyChecks. Falls back to plain `label` when not sortable.
 */
export const SortableHeaderLabel = ({
        column,
        label,
        sort,
        sortableColumnIds,
        onSortClick
}) => {
        if (!sortableColumnIds.has(column.id)) return label

        const isActive = sort?.sortBy === column.id
        const direction = isActive ? sort.sortOrder : null
        let SortIcon
        if (direction === 'asc') {
                SortIcon = ArrowUpwardIcon
        } else if (direction === 'desc') {
                SortIcon = ArrowDownwardIcon
        } else {
                SortIcon = UnfoldMoreIcon
        }

        const labelText =
                typeof column.label === 'string' ? column.label : column.id

        return (
                <Box
                        role="button"
                        tabIndex={0}
                        aria-label={`Sort by ${labelText} (${
                                direction === 'asc'
                                        ? 'ascending'
                                        : direction === 'desc'
                                        ? 'descending'
                                        : 'unsorted'
                        })`}
                        onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        onSortClick(column.id)
                                }
                        }}
                        onClick={(e) => {
                                e.stopPropagation()
                                onSortClick(column.id)
                        }}
                        sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer',
                                userSelect: 'none',
                                color: isActive ? 'primary.main' : 'inherit',
                                '&:hover': { opacity: 0.8 }
                        }}
                >
                        {label}
                        <SortIcon sx={{ fontSize: 14, opacity: isActive ? 1 : 0.5 }} />
                </Box>
        )
}
