import * as React from "react"
import { Chip } from "@mui/material"
import theme from "../../config/theme"

const FileChip = (props) => {
  let { fileName, fileLocationUrl } = props
  const handleClick = () => {
    window.open(fileLocationUrl, "_blank")
  }

  if (fileName.length > 40) {
    let fileExt = fileName.split(".").pop()
    fileName = fileName.substring(0, 30) + "...." + fileExt
  }

  return (
    <Chip
      label={fileName}
      variant="outlined"
      onClick={handleClick}
      sx={{
        m: "6px",
        color: theme.palette.background.default,
        backgroundColor: theme.palette.primary.main,
        "&.MuiButtonBase-root:hover": {
          color: theme.palette.background.default,
          backgroundColor: theme.palette.primary.main,
        },
      }}
    />
  )
}

export default FileChip
