import React from "react"
import { Chip } from "@mui/material"
import theme from "../../config/theme"

const FileUploadChip = (props) => {
  let { uniqueChipIdentifier, fileName, fileLocationUrl, onDelete } = props
  const handleClick = () => {
    window.open(fileLocationUrl, "_blank")
  }

  if (fileName.length > 35) {
    let fileExt = fileName.split(".").pop()
    fileName = fileName.substring(0, 25) + "...." + fileExt
  }

  return (
    <Chip
      label={fileName}
      variant="outlined"
      onClick={handleClick}
      onDelete={() => onDelete(uniqueChipIdentifier)}
      sx={{
        mr: 1,
        mt: "6px",
        mb: "6px",
        color: theme.palette.background.default,
        backgroundColor: theme.palette.primary.main,
        "&.MuiButtonBase-root:hover": {
          color: theme.palette.background.default,
          backgroundColor: theme.palette.primary.main,
        },
        ".MuiSvgIcon-root": {
          color: "#E8E8E8",
        },
        ".MuiSvgIcon-root:hover": {
          color: "#fff",
        },
      }}
    />
  )
}

export default FileUploadChip
