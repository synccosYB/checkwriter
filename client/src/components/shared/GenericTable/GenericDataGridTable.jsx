import { DataGrid } from '@mui/x-data-grid';

const GenericDataGridTable = ({
	columnData,
	expandedColumnData,
	modifiedData,
	count,
	isLoading,
	initialfilter
}) => {
    return (
        <div style={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={modifiedData}
                columns={columnData}
                initialState={{
                pagination: {
                    paginationModel: { page: 0, pageSize: 5 },
                },
                }}
                pageSizeOptions={[5, 10]}
                checkboxSelection
            />
        </div>
    )
}

export default GenericDataGridTable