import React from "react"
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  DialogTitle,
  Button,
} from "@mui/material"

const DialogForm = (props) => {
  const {
    openDialog,
    title,
    dialogContentText,
    children,
    takeActionBtn,
    cancelBtn,
    takeActionSubmitHandler,
    cancelActionHandler,
  } = props
  return (
    <>
      <Dialog open={openDialog}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            {dialogContentText}
          </DialogContentText>
          {children}
        </DialogContent>
        <DialogActions sx={{ mt: 1 }}>
          <Button onClick={(e) => cancelActionHandler(e)}>{cancelBtn}</Button>
          <Button type="submit" onClick={(e) => takeActionSubmitHandler(e)}>
            {takeActionBtn}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DialogForm
