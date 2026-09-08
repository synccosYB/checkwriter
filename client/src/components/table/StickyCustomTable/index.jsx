import { Box, Typography } from '@mui/material'
import { FixedSizeList as List } from 'react-window'
import { styles } from './styles'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

function useRemainingViewportHeight(extraBottom = 0) {
	const ref = useRef(null)
	const [height, setHeight] = useState(400)

	const recalc = () => {
		if (!ref.current) return
		const rect = ref.current.getBoundingClientRect()
		const available = window.innerHeight - rect.top - extraBottom
		setHeight(Math.max(available, 0))
	}

	useLayoutEffect(recalc, [])
	useEffect(() => {
		const onResize = () => recalc()
		const onScroll = () => recalc()
		window.addEventListener('resize', onResize)
		window.addEventListener('orientationchange', onResize)
		window.addEventListener('scroll', onScroll, true)
		return () => {
			window.removeEventListener('resize', onResize)
			window.removeEventListener('orientationchange', onResize)
			window.removeEventListener('scroll', onScroll, true)
		}
	}, [])

	return { ref, height, recalc }
}

export const StickyCustomTable = ({
	columns,
	data,
	renderCell,
	renderHeaderCell,
	height: fallbackHeight = 500,
	rowHeight = 63,
	headerHeight = 56,
	noDataAavailableText = 'No data available',
	renderEmptyRow = null,
	onScroll,
	onRowClick,
	getRowStyle,
	containerSx = {},
	bodyRowSx = {},
	headerCellSx = {}
}) => {
	const { ref, height } = useRemainingViewportHeight(80)
	const listHeight = height || fallbackHeight

	const gridTemplateColumns = columns
		.map((c) => {
			if (c.fixWidth) {
				return c.width
			}
			// If width already contains minmax or other grid functions, use it as is
			if (
				c.width.includes('minmax') ||
				c.width.includes('fr') ||
				c.width.includes('auto')
			) {
				return c.width
			}
			// If width is a pixel value, wrap it in minmax
			if (/\d+px$/.test(c.width)) {
				return `minmax(${c.width}, 1fr)`
			}
			// Otherwise use the width as is
			return c.width
		})
		.join(' ')

	const Inner = React.forwardRef((props, innerRef) => {
		const { style, children, ...rest } = props
		const innerHeight =
			typeof style.height === 'number'
				? style.height + headerHeight
				: `calc(${style.height} + ${headerHeight}px)`
		return (
			<div ref={innerRef} style={{ ...style, height: innerHeight }} {...rest}>
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns,
						position: 'sticky',
						top: 0,
						backgroundColor: '#fff',
						height: headerHeight,
						alignItems: 'center',
						zIndex: 9999,
						...styles.headerRow
					}}
				>
					{columns.map((col, colIndex) =>
						<Box
							key={col.id}
							sx={{
								...styles.headerCell,
								textAlign: col.textAlign || 'center',
								display: 'flex',
								alignItems: 'center',
								justifyContent:
									col.textAlign === 'left'
										? 'flex-start'
										: col.textAlign === 'right'
										? 'flex-end'
										: 'center',
								...(typeof headerCellSx === 'function'
									? headerCellSx(col, colIndex, columns.length)
									: headerCellSx || {})
							}}
						>
						{ renderHeaderCell ? (
							renderHeaderCell(col)
						) : (
							<Typography
								variant="subtitle2"
								sx={{
									fontSize: '12px',
									fontWeight: 600,
									whiteSpace: 'nowrap'
								}}
							>
								{col.label}
							</Typography>
						)}
						</Box>
					)}
				</Box>
				{children}
			</div>
		)
	})
	Inner.displayName = 'Inner'

	const Row = ({ index, style }) => {
		const row = data[index]
		if (!row) return null
		const adjustedStyle = { ...style, top: (style.top || 0) + headerHeight }

		//this function is needed to prevent the row click from being triggered when clicking on interactive elements
		const handleRowClick = (event) => {
			if (!onRowClick) return

			const target = event.target
			const isInteractiveElement = target.closest(
				'button, input, select, a, [role="button"], [role="checkbox"], [data-no-row-click]'
			)

			if (!isInteractiveElement) {
				onRowClick(row)
			}
		}

		const rowStyle = getRowStyle ? getRowStyle(row) : {}
		return (
			<Box
				style={adjustedStyle}
				sx={{
					display: 'grid',
					gridTemplateColumns,
					alignItems: 'center',
					...styles.bodyRow,
					...bodyRowSx,
					...(onRowClick ? { cursor: 'pointer' } : {}),
					...rowStyle
				}}
				onClick={onRowClick ? handleRowClick : undefined}
			>
				{columns.map((col) => {
					return (
						<Box
							key={`${row._id}-${col.id}`}
							sx={{
								textAlign: col.textAlign || 'center',
								...styles.bodyCell,
								display: 'flex',
								alignItems: 'center',
								justifyContent:
									col.textAlign === 'left'
										? 'flex-start'
										: col.textAlign === 'right'
										? 'flex-end'
										: 'center'
							}}
							onClick={(e) => {
								if (col.id === 'checkbox' || col.id === 'contextMenu') {
									e.stopPropagation()
								}
							}}
						>
							{renderCell ? (
								renderCell(row, col)
							) : (
								<Typography
									sx={{
										fontSize: '12px',
										whiteSpace: 'nowrap',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										width: '100%'
									}}
								>
									{row[col.id]?.toString() || '-'}
								</Typography>
							)}
						</Box>
					)
				})}
			</Box>
		)
	}

	return (
		<Box
			ref={ref}
			sx={{
				width: '100%',
				height: listHeight,
				border: '1px solid rgb(229,231,235)',
				borderRadius: '8px',
				overflow: 'hidden',
				...containerSx
			}}
		>
			<List
				height={listHeight}
				itemCount={data.length}
				itemSize={rowHeight}
				width="100%"
				overscanCount={5}
				onScroll={({ scrollOffset }) => {
					if (!onScroll) return
					const totalHeight = data.length * rowHeight
					const viewport = listHeight - headerHeight
					const PRELOAD_ROWS = 3
					const buffer = PRELOAD_ROWS * rowHeight
					onScroll(scrollOffset + viewport >= totalHeight - buffer)
				}}
				innerElementType={Inner}
			>
				{Row}
			</List>

			{renderEmptyRow && data.length === 0 && (
				<Typography sx={{ textAlign: 'center', mt: 2 }}>
					{noDataAavailableText}
				</Typography>
			)}
		</Box>
	)
}
