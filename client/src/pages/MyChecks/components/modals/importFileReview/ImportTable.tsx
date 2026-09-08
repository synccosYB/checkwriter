import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  SelectChangeEvent,
  Input,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  AttachmentIcon,
  CheckBoxCheckedIcon,
  CheckBoxUncheckedIcon,
  SkipIcon,
} from "../../../../../components/Icons";

// Dummy data examples for testing different validation states
export const dummyOriginalRows = [
  {
    rowNo: "01",
    checkNo: "Auto",
    amount: "", // Empty original amount
    payeeName: "Abraham Sabel",
    memo: "Client Invoice Attachment.pdf",
    invoiceId: "100245",
  },
  {
    rowNo: "02",
    checkNo: "Auto",
    amount: "$22AB", // Invalid original amount with letters
    payeeName: "Abraham Sabel",
    memo: "Client Invoice Attachment.pdf",
    invoiceId: "100245",
  },
  {
    rowNo: "03",
    checkNo: "Auto",
    amount: "$240", // Valid original amount
    payeeName: "Abraham Sabel",
    memo: "Client Invoice Attachment.pdf",
    invoiceId: "100244",
  },
  {
    rowNo: "04",
    checkNo: "Auto",
    amount: "XYZ", // Invalid original amount - non-numeric
    payeeName: "Robert Sabel",
    memo: "Consulting Fee",
    invoiceId: "100246",
  },
  {
    rowNo: "05",
    checkNo: "Auto",
    amount: "$150.75", // Valid original amount with decimals
    payeeName: "Jane Smith",
    memo: "Design Services",
    invoiceId: "100247",
  },
];

export const dummyEditRows = [
  {
    rowNo: "01",
    checkNo: "Auto",
    amount: "$240", // User edited amount
    payeeName: "Robert Sabel", // User selected different payee
    memo: "Client Invoice Attachment.pdf",
    invoiceId: "100244",
  },
  {
    rowNo: "02",
    checkNo: "Auto",
    amount: "ss", // User hasn't fixed the invalid amount yet
    payeeName: "Abraham Sabel",
    memo: "Client Invoice Attachment.pdf",
    invoiceId: "100245",
  },
  {
    rowNo: "03",
    checkNo: "Auto",
    amount: "$240", // User kept the valid amount
    payeeName: "Abraham Sabel",
    memo: "client", // User edited memo
    invoiceId: "100244",
  },
  {
    rowNo: "04",
    checkNo: "Auto",
    amount: "$22AB", // User entered invalid amount
    payeeName: "Robert Sabel",
    memo: "Consulting Fee",
    invoiceId: "100246",
  },
  {
    rowNo: "05",
    checkNo: "Auto",
    amount: "$150.75", // User kept valid amount
    payeeName: "Jane Smith",
    memo: "Design Services",
    invoiceId: "100247",
  },
];

export const dummyPayeeOptions = [
  "Abraham Sabel",
  "Robert Sabel",
  "Jane Smith",
  "John Doe",
  "Mary Johnson",
];

interface Column {
  id: string;
  label: string;
}

interface RowData {
  rowNo: string;
  checkNo: string;
  amount: string;
  payeeName: string;
  memo: string;
  invoiceId: string;
  [key: string]: string;
}

interface OriginalRowData {
  rowNo: string;
  checkNo: string;
  amount: string;
  payeeName: string;
  memo: string;
  invoiceId: string;
  [key: string]: string;
}

interface EditCell {
  row: number | null;
  col: string | null;
}

interface PayeeDropdownState {
  row: number | null;
  open: boolean;
}

interface ImportTableProps {
  columns: Column[];
  editRows: RowData[];
  originalRows?: OriginalRowData[]; // Original data for display
  skippedRows?: number[]; // Array of skipped row indices
  editCell: EditCell;
  handleCellClick: (rowIdx: number, colId: string) => void;
  handleInputChange: (rowIdx: number, colId: string, value: string) => void;
  handleInputBlur: () => void;
  handleInputKeyDown: (e: React.KeyboardEvent) => void;
  isAmountInvalid: (val: string) => boolean;
  isPayeeInvalid: (val: string) => boolean;
  isCheckNoInvalid: (val: string, rowIdx: number) => boolean;
  payeeDropdownOpen: PayeeDropdownState;
  payeeDropdownRef: React.RefObject<HTMLDivElement | null>;
  payeeOptions: string[];
  handlePayeeSelect: (rowIdx: number, value: string) => void;
  handleAddNewPayee: (rowIdx: number) => void;
  handlePayeeDropdownOpen?: (rowIdx: number) => void;
  modalStyles: { [key: string]: any };
  selectedRows?: number[];
  handleSelectRow?: (idx: number) => void;
  handleSelectAllRows?: (checked: boolean) => void;
  actionsRenderer?: (row: RowData, idx: number) => React.ReactNode;
  isEditable?: boolean;
  checkNoGeneration?: "auto" | "manual";
  showDualValuesNonEditable?: boolean;
}

const ImportTable: React.FC<ImportTableProps> = ({
  columns,
  editRows,
  originalRows = [],
  skippedRows = [],
  editCell,
  handleCellClick,
  handleInputChange,
  handleInputBlur,
  handleInputKeyDown,
  isAmountInvalid,
  isPayeeInvalid,
  isCheckNoInvalid,
  payeeDropdownOpen,
  payeeDropdownRef,
  payeeOptions,
  handlePayeeSelect,
  handleAddNewPayee,
  handlePayeeDropdownOpen,
  modalStyles,
  selectedRows = [],
  handleSelectRow,
  handleSelectAllRows,
  actionsRenderer,
  isEditable = true,
  checkNoGeneration = "auto",
  showDualValuesNonEditable = false,
}) => {
  // Helper for select all checkbox
  const allSelected =
    editRows.length > 0 && selectedRows.length === editRows.length;
  const someSelected =
    selectedRows.length > 0 && selectedRows.length < editRows.length;

  // Helper for safe amount validation
  const safeIsAmountInvalid = (val: string | number): boolean => {
    if (typeof val === "string" || typeof val === "number") {
      return isAmountInvalid(val.toString());
    }
    return false;
  };

  const handlePayeeChange = (
    rowIdx: number,
    event: SelectChangeEvent<string>
  ) => {
    if (event.target.value !== "__add_new__") {
      handlePayeeSelect(rowIdx, event.target.value);
    }
  };

  // Get original value for a row and column
  const getOriginalValue = (idx: number, colId: string): string => {
    if (originalRows[idx]) {
      return originalRows[idx][colId] || "";
    }
    return "";
  };

  // Check if row is skipped
  const isRowSkipped = (idx: number): boolean => {
    return skippedRows.includes(idx);
  };

  return (
    <TableContainer sx={modalStyles.tableContainer}>
      <Table stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            {/* Selection checkbox */}
            {handleSelectRow && handleSelectAllRows ? (
              <TableCell padding="checkbox">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(e) => handleSelectAllRows(e.target.checked)}
                  icon={<CheckBoxUncheckedIcon />}
                  indeterminateIcon={<CheckBoxUncheckedIcon />}
                  checkedIcon={<CheckBoxCheckedIcon />}
                  sx={{
                    py: "0px",
                  }}
                />
              </TableCell>
            ) : (
              <TableCell padding="checkbox" />
            )}
            {columns.map((col) => (
              <TableCell key={col.id}>{col.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {editRows.map((row, idx) => {
            const isSkipped = isRowSkipped(idx);

            return (
              <TableRow key={idx}>
                {/* Row selection checkbox */}
                {handleSelectRow && handleSelectAllRows ? (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRows.includes(idx)}
                      onChange={() => handleSelectRow(idx)}
                      sx={modalStyles.tableCheckbox}
                      icon={<CheckBoxUncheckedIcon />}
                      checkedIcon={<CheckBoxCheckedIcon />}
                    />
                  </TableCell>
                ) : (
                  <TableCell padding="checkbox" />
                )}
                {columns.map((col) => {
                  if (col.id === "amount") {
                    const isInvalid = safeIsAmountInvalid(row.amount);
                    const originalValue = getOriginalValue(idx, col.id);
                    const isOriginalEmpty =
                      !originalValue || originalValue.trim() === "";
                    const isOriginalInvalid =
                      originalValue && safeIsAmountInvalid(originalValue);

                    return (
                      <TableCell key={col.id} sx={modalStyles.tableCell}>
                        {isSkipped ||
                        (!isEditable && !showDualValuesNonEditable) ? (
                          // Skipped row or non-editable table without dual values - show static value only
                          <span
                            style={{
                              color: isInvalid ? "#EF4444" : undefined,
                            }}
                          >
                            {row.amount || "Empty"}
                          </span>
                        ) : showDualValuesNonEditable && !isEditable ? (
                          // Non-editable dual values display
                          <Box sx={modalStyles.dualValueCell}>
                            {/* Original value (non-editable) */}
                            <Box sx={modalStyles.editableValueContainer}>
                              {isOriginalEmpty ? (
                                <Typography
                                  sx={{
                                    ...modalStyles.originalValue,
                                    color: "#EF4444",
                                  }}
                                >
                                  Empty
                                </Typography>
                              ) : isOriginalInvalid ? (
                                <Typography
                                  sx={{
                                    ...modalStyles.originalValue,
                                    color: "#EF4444",
                                  }}
                                >
                                  {originalValue}
                                </Typography>
                              ) : (
                                <Typography sx={modalStyles.originalValue}>
                                  {originalValue}
                                </Typography>
                              )}
                            </Box>

                            {/* Current/edited value (non-editable) */}
                            <Box sx={modalStyles.editableValueContainer}>
                              <Typography
                                sx={{
                                  ...modalStyles.editedValue,
                                  color: isInvalid ? "#EF4444" : "#000",
                                }}
                              >
                                {row.amount || "Empty"}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={modalStyles.dualValueCell}>
                            {/* Original value (non-editable) */}
                            <Box sx={modalStyles.editableValueContainer}>
                              {isOriginalEmpty ? (
                                <Typography
                                  sx={{
                                    ...modalStyles.originalValue,
                                    color: "#EF4444",
                                  }}
                                >
                                  Empty
                                </Typography>
                              ) : isOriginalInvalid ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      ...modalStyles.originalValue,
                                      color: "#EF4444",
                                    }}
                                  >
                                    {originalValue}
                                  </Typography>
                                  <Tooltip
                                    title={
                                      <span>
                                        Invalid Characters
                                        <br />
                                        please enter a number.
                                      </span>
                                    }
                                    placement="top"
                                    arrow
                                    componentsProps={{
                                      tooltip: { sx: modalStyles.tooltip },
                                    }}
                                  >
                                    <span
                                      style={{
                                        ...modalStyles.infoIcon,
                                        marginLeft: 0,
                                      }}
                                    >
                                      ⓘ
                                    </span>
                                  </Tooltip>
                                </Box>
                              ) : (
                                <Typography sx={modalStyles.originalValue}>
                                  {originalValue}
                                </Typography>
                              )}
                            </Box>

                            {/* Editable value */}
                            <Box sx={modalStyles.editableValueContainer}>
                              <Input
                                value={row.amount}
                                onChange={(e) =>
                                  handleInputChange(
                                    idx,
                                    "amount",
                                    e.target.value
                                  )
                                }
                                sx={{
                                  ...modalStyles.editableInput,
                                  ...modalStyles.editableInputAmount,
                                  borderColor: isInvalid
                                    ? "#EF4444"
                                    : "#D1D5DB",
                                }}
                                disableUnderline
                                placeholder="Enter amount"
                              />
                              {isInvalid && (
                                <Tooltip
                                  title={
                                    <span>
                                      Invalid Characters
                                      <br />
                                      please enter a number.
                                    </span>
                                  }
                                  placement="top"
                                  arrow
                                  componentsProps={{
                                    tooltip: { sx: modalStyles.tooltip },
                                  }}
                                >
                                  <span style={modalStyles.infoIcon}>ⓘ</span>
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        )}
                      </TableCell>
                    );
                  }
                  if (col.id === "payeeName") {
                    const isInvalid = isPayeeInvalid(row.payeeName);
                    const originalValue = getOriginalValue(idx, col.id);

                    return (
                      <TableCell key={col.id} sx={modalStyles.tableCell}>
                        {isSkipped ||
                        (!isEditable && !showDualValuesNonEditable) ? (
                          // Skipped row or non-editable table without dual values - show static value only
                          <span
                            style={{
                              color: isInvalid ? "#EF4444" : undefined,
                            }}
                          >
                            {row.payeeName}
                          </span>
                        ) : showDualValuesNonEditable && !isEditable ? (
                          // Non-editable dual values display
                          <Box sx={modalStyles.dualValueCell}>
                            {/* Original value (non-editable) */}
                            <Typography sx={modalStyles.originalValue}>
                              {originalValue || row.payeeName}
                            </Typography>

                            {/* Current/edited value (non-editable) */}
                            <Box sx={modalStyles.editableValueContainer}>
                              <Typography
                                sx={{
                                  ...modalStyles.editedValue,
                                  color: isInvalid ? "#EF4444" : "#000",
                                }}
                              >
                                {row.payeeName}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={modalStyles.dualValueCell}>
                            {/* Original value (non-editable) */}
                            <Typography sx={modalStyles.originalValue}>
                              {originalValue || row.payeeName}
                            </Typography>

                            {/* Editable value */}
                            <Box sx={modalStyles.editableValueContainer}>
                              <Select
                                value={row.payeeName}
                                onChange={(e) => handlePayeeChange(idx, e)}
                                IconComponent={KeyboardArrowDownIcon}
                                sx={{
                                  ...modalStyles.payeeSelect,
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: isInvalid
                                      ? "#EF4444"
                                      : "#D1D5DB",
                                  },
                                }}
                                displayEmpty
                              >
                                {payeeOptions.map((opt) => (
                                  <MenuItem
                                    key={opt}
                                    value={opt}
                                    sx={{ fontSize: "12px" }}
                                  >
                                    {opt}
                                  </MenuItem>
                                ))}
                                <MenuItem
                                  value="__add_new__"
                                  onClick={() => handleAddNewPayee(idx)}
                                  sx={modalStyles.addNewMenuItem}
                                >
                                  <Typography
                                    sx={modalStyles.addNewMenuItemPlusIcon}
                                  >
                                    +
                                  </Typography>{" "}
                                  Add New Payee
                                </MenuItem>
                              </Select>
                              {isInvalid && (
                                <Tooltip
                                  title={
                                    <span>
                                      Payee name doesn't match with any existing
                                      records.
                                      <br />
                                      You can select existing payee name or
                                      create a new one.
                                    </span>
                                  }
                                  placement="bottom-start"
                                  arrow
                                  componentsProps={{
                                    tooltip: { sx: modalStyles.tooltip },
                                  }}
                                >
                                  <span style={modalStyles.infoIcon}>ⓘ</span>
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        )}
                      </TableCell>
                    );
                  }
                  if (col.id === "memo" || col.id === "invoiceId") {
                    const originalValue = getOriginalValue(idx, col.id);

                    return (
                      <TableCell key={col.id} sx={modalStyles.tableCell}>
                        {isSkipped ||
                        (!isEditable && !showDualValuesNonEditable) ? (
                          // Skipped row or non-editable table without dual values - show static value only
                          <span>{row[col.id]}</span>
                        ) : showDualValuesNonEditable && !isEditable ? (
                          // Non-editable dual values display
                          <Box sx={modalStyles.dualValueCell}>
                            {/* Original value (non-editable) */}
                            <Typography sx={modalStyles.originalValue}>
                              {originalValue || row[col.id]}
                            </Typography>

                            {/* Current/edited value (non-editable) */}
                            <Box sx={modalStyles.editableValueContainer}>
                              <Typography
                                sx={{
                                  ...modalStyles.editedValue,
                                }}
                              >
                                {row[col.id]}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={modalStyles.dualValueCell}>
                            {/* Original value (non-editable) */}
                            <Typography sx={modalStyles.originalValue}>
                              {originalValue || row[col.id]}
                            </Typography>

                            {/* Editable value */}
                            <Box sx={modalStyles.editableValueContainer}>
                              <Input
                                value={row[col.id]}
                                onChange={(e) =>
                                  handleInputChange(idx, col.id, e.target.value)
                                }
                                sx={{
                                  ...modalStyles.editableInput,
                                  ...(col.id === "memo"
                                    ? modalStyles.editableInputMemo
                                    : modalStyles.editableInputInvoice),
                                }}
                                disableUnderline
                                placeholder={
                                  col.id === "memo"
                                    ? "Enter memo"
                                    : "Enter invoice ID"
                                }
                              />
                            </Box>
                          </Box>
                        )}
                      </TableCell>
                    );
                  }
                  if (col.id === "checkNo") {
                    // Check No shows only single value (Auto or number) - no dual value structure
                    const isCheckNoEditable =
                      isEditable && checkNoGeneration === "manual";
                    const isInvalid =
                      isCheckNoEditable &&
                      isCheckNoInvalid &&
                      isCheckNoInvalid(row[col.id], idx);

                    return (
                      <TableCell key={col.id} sx={modalStyles.tableCell}>
                        {isSkipped || !isEditable ? (
                          // Skipped row or non-editable table - show static value only
                          <span>{row[col.id] || "Auto"}</span>
                        ) : isCheckNoEditable ? (
                          // Manual check number with input
                          <Box sx={modalStyles.editableValueContainer}>
                            <input
                              value={row[col.id]}
                              onChange={(e) =>
                                handleInputChange(idx, col.id, e.target.value)
                              }
                              style={{
                                ...modalStyles.editableInput,
                                ...modalStyles.editableInputCheckNo,
                                borderColor: isInvalid ? "#EF4444" : "#D1D5DB",
                              }}
                              placeholder="Check #"
                            />
                            {isInvalid && (
                              <Tooltip
                                title={
                                  <span>
                                    {!row[col.id] || row[col.id].trim() === ""
                                      ? "Check number cannot be empty."
                                      : "This check number already exists in the database."}
                                  </span>
                                }
                                placement="top"
                                arrow
                                componentsProps={{
                                  tooltip: { sx: modalStyles.tooltip },
                                }}
                              >
                                <span style={modalStyles.infoIcon}>ⓘ</span>
                              </Tooltip>
                            )}
                          </Box>
                        ) : (
                          // Auto check number - just show "Auto"
                          <span>Auto</span>
                        )}
                      </TableCell>
                    );
                  }
                  if (col.id === "rowNo") {
                    // Row No is non-editable and auto-generated
                    return (
                      <TableCell key={col.id} sx={modalStyles.tableCell}>
                        <span>{row[col.id]}</span>
                      </TableCell>
                    );
                  }
                  if (col.id === "actions") {
                    return (
                      <TableCell
                        key={col.id}
                        sx={{
                          ...modalStyles.tableCell,
                        }}
                      >
                        {actionsRenderer ? (
                          actionsRenderer(row, idx)
                        ) : (
                          <Box sx={modalStyles.actionsCell}>
                            <IconButton size="small">
                              <AttachmentIcon
                                width="18px"
                                height="18px"
                                color="#1e3a5f"
                              />
                            </IconButton>
                            <Tooltip
                              title={
                                <span>
                                  Skip this row from current import.
                                  <br />
                                  You can restore it later.
                                </span>
                              }
                              placement="top"
                              arrow
                              componentsProps={{
                                tooltip: { sx: modalStyles.tooltip },
                              }}
                            >
                              <IconButton size="small">
                                <SkipIcon
                                  width="20px"
                                  height="20px"
                                  color="#1e3a5f"
                                />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </TableCell>
                    );
                  }
                  // Default
                  return (
                    <TableCell key={col.id} sx={modalStyles.tableCell}>
                      {row[col.id]}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ImportTable;
