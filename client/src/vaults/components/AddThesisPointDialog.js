import React, { useReducer, useContext, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Typography,
  Dialog,
  Button,
  IconButton,
  AppBar,
  Toolbar,
  Slide,
  TextField,
  Container,
  Grid,
  Skeleton,
  CircularProgress,
} from "@mui/material"
import { LoadingButton } from "@mui/lab"
import { styled } from "@mui/material/styles"
import CloseIcon from "@mui/icons-material/Close"
import { useHttpClient } from "../../shared/hooks/http-hook"
import { AuthContext } from "../../shared/context/auth-context"
import theme from "../../config/theme"
import FileUploadChip from "./FileUploadChip"

const initialState = {
  selectedFilesToUpload: [],
  thesisPointTitle: "",
  thesisPointDescription: "",
  uploadedFiles: [],
  isUploadingFile: false,
  isDeletingFile: false,
  isSavingThesis: false,
  showThesisPointTitleError: false,
  numberOfSelectedFiles: 0,
}

function addThesisPointDialogReducer(state, action) {
  switch (action.type) {
    case "form field": {
      return {
        ...state,
        [action.fieldName]: action.payload,
      }
    }
    case "error: thesis point title empty": {
      return {
        ...state,
        showThesisPointTitleError: true,
      }
    }
    case "remove thesis point title error": {
      return {
        ...state,
        showThesisPointTitleError: false,
      }
    }
    case "set saving thesis to true": {
      return {
        ...state,
        isSavingThesis: true,
      }
    }
    case "close add thesis point dialog": {
      return {
        ...state,
        numberOfSelectedFiles: 0,
        selectedFilesToUpload: [],
        uploadedFiles: [],
        thesisPointTitle: "",
        thesisPointDescription: "",
        isDeletingFile: false,
        isSavingThesis: false,
        isUploadingFile: false,
        showThesisPointTitleError: false,
      }
    }
    case "set uploading file to true": {
      return {
        ...state,
        isUploadingFile: true,
      }
    }
    case "set uploading file to false": {
      return {
        ...state,
        isUploadingFile: false,
      }
    }
    case "set uploaded file": {
      return {
        ...state,
        uploadedFiles: [
          ...action.payload.uploadedFiles,
          ...action.payload.filesArr,
        ],
      }
    }
    case "upload button handler clean up": {
      return {
        ...state,
        selectedFilesToUpload: [],
        numberOfSelectedFiles: 0,
      }
    }
    case "set files on file input change": {
      return {
        ...state,
        selectedFilesToUpload: [...action.payload],
        numberOfSelectedFiles: action.payload.length,
      }
    }
    case "set is deleting file to true": {
      return {
        ...state,
        isDeletingFile: true,
      }
    }
    case "set is deleting file to false": {
      return {
        ...state,
        isDeletingFile: false,
      }
    }
    case "set files after deleting an uploaded file": {
      return {
        ...state,
        uploadedFiles: [...action.payload],
        isDeletingFile: false,
      }
    }
    default:
      return state
  }
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})
const Input = styled("input")({
  display: "none",
})

const AddThesisPointDialog = (props) => {
  const { vault_name, openDialog, setOpenDialog, shouldRerender, rerender } =
    props
  const navigate = useNavigate()
  let { vaultId } = useParams()
  const { sendRequest } = useHttpClient()

  const auth = useContext(AuthContext)
  const selectedFilesRef = useRef()
  const [state, dispatch] = useReducer(
    addThesisPointDialogReducer,
    initialState
  )
  const {
    selectedFilesToUpload,
    thesisPointTitle,
    thesisPointDescription,
    uploadedFiles,
    isUploadingFile,
    isDeletingFile,
    isSavingThesis,
    showThesisPointTitleError,
    numberOfSelectedFiles,
  } = state
  const currDate = new Date().toString().substring(4, 15)
  const formattedDate = currDate.slice(0, 6) + "," + currDate.slice(6)

  const onSaveBtnClick = async (e) => {
    e.preventDefault()
    if (thesisPointTitle.length === 0) {
      dispatch({ type: "error: thesis point title empty" })
      return
    }
    dispatch({ type: "set saving thesis to true" })
    try {
      await sendRequest(
        `http://localhost:5004/api/vaults/${vaultId}`,
        "POST",
        JSON.stringify({
          thesis_point_title: thesisPointTitle,
          thesis_point_description: thesisPointDescription,
          thesis_point_attachments: uploadedFiles,
        }),
        {
          Authorization: "Bearer " + auth.token,
          "Content-Type": "application/json",
        }
      )
      dispatch({ type: "close add thesis point dialog" })
      selectedFilesRef.current.value = ""
      setOpenDialog(false)
      shouldRerender(!rerender)
      navigate(`/vaults/${vaultId}`, { replace: true })
    } catch (err) {
      if (err.message === "") {
      }
    }
  }

  const uploadBtnHandler = () => {
    let filesArr = []
    dispatch({ type: "set uploading file to true" })
    Promise.all(
      selectedFilesToUpload.map(async (file) => {
        let data = new FormData()
        data.append("fileInputField", file, file.name)
        try {
          let fileResponseData = await sendRequest(
            `http://localhost:5004/api/vaults/${vaultId}/upload`,
            "POST",
            data,
            {
              Authorization: "Bearer " + auth.token,
            }
          )
          filesArr.push(fileResponseData)
          dispatch({
            type: "set uploaded file",
            payload: { uploadedFiles, filesArr },
          })
        } catch (err) {}
      })
    ).then(() => {
      dispatch({ type: "set uploading file to false" })
    })
    dispatch({ type: "upload button handler clean up" })
    selectedFilesRef.current.value = ""
  }

  const onFilesInputChange = (e) => {
    let fileArr = Array.from(e.target.files)
    dispatch({ type: "set files on file input change", payload: fileArr })
  }

  const closeAddThesisPointDialog = async () => {
    await discardUploadedFiles()
    selectedFilesRef.current.value = ""
    setOpenDialog(false)
    dispatch({ type: "close add thesis point dialog" })
  }

  const discardUploadedFiles = async () => {
    if (uploadedFiles.length > 0) {
      try {
        await sendRequest(
          `http://localhost:5004/api/vaults/${vaultId}/upload/discard`,
          "DELETE",
          JSON.stringify({
            uploadedFiles,
          }),
          {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.token,
          }
        )
      } catch (err) {}
    }
  }

  const deleteUploadedFile = async (fileName) => {
    dispatch({ type: "set is deleting file to true" })
    try {
      const responseData = await sendRequest(
        `http://localhost:5004/api/vaults/${vaultId}/upload`,
        "DELETE",
        JSON.stringify({
          fileName,
          uploadedFiles,
        }),
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        }
      )
      dispatch({
        type: "set files after deleting an uploaded file",
        payload: responseData.updatedUploadedFiles,
      })
    } catch (err) {
      dispatch({ type: "set is deleting file to false" })
    }
  }
  const onThesisPointTitleChangeHandler = (e) => {
    dispatch({
      type: "form field",
      fieldName: "thesisPointTitle",
      payload: e.target.value,
    })
    if (thesisPointTitle.length + 1 > 0) {
      dispatch({ type: "remove thesis point title error" })
    }
  }
  const onThesisPointDescChangeHandler = (e) => {
    dispatch({
      type: "form field",
      fieldName: "thesisPointDescription",
      payload: e.target.value,
    })
  }
  return (
    <>
      <Dialog fullScreen open={openDialog} TransitionComponent={Transition}>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={closeAddThesisPointDialog}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {vault_name}
            </Typography>
            <LoadingButton
              onClick={onSaveBtnClick}
              disabled={isUploadingFile || isDeletingFile}
              loading={isSavingThesis}
              sx={{
                color: theme.palette.primary.main,
                backgroundColor: "#fff",
                "&: hover": {
                  background: "#fff",
                },
              }}
            >
              SAVE
            </LoadingButton>
          </Toolbar>
        </AppBar>
        <Container>
          <Grid container sx={{ mt: 5 }} justifyContent="center">
            <Grid container item xs={12} sm={11} md={9} lg={8}>
              <Grid item xs={12}>
                <Typography variant="body1">{formattedDate}</Typography>
              </Grid>
              <Grid item xs={12} sx={{ mt: 4 }}>
                <TextField
                  fullWidth
                  id="standard-basic"
                  label="Thesis Point Title"
                  variant="standard"
                  value={thesisPointTitle}
                  onChange={(e) => onThesisPointTitleChangeHandler(e)}
                  error={showThesisPointTitleError}
                  helperText={
                    showThesisPointTitleError
                      ? "Please enter a title for your thesis point"
                      : ""
                  }
                />
              </Grid>
              <Grid item xs={12} sx={{ mt: 5 }}>
                <TextField
                  variant="filled"
                  id="outlined-multiline-static"
                  label="Thesis Point Description"
                  multiline
                  rows={6}
                  value={thesisPointDescription}
                  onChange={(e) => onThesisPointDescChangeHandler(e)}
                  fullWidth
                />
              </Grid>
              <Grid item container xs={12} sx={{ mt: 5 }}>
                <Grid item xs={12} sx={{ mb: 1 }}>
                  <Typography variant="body1" fontWeight="fontWeightMedium">
                    Upload Attachments
                  </Typography>
                </Grid>
                <Grid item>
                  <label htmlFor="contained-button-file">
                    <Input
                      accept="image/*,application/pdf,
                    application/msword,
                    application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                    application/vnd.ms-powerpoint,
                    application/vnd.openxmlformats-officedocument.presentationml.presentation"
                      id="contained-button-file"
                      multiple
                      type="file"
                      name="fileInputField"
                      onChange={onFilesInputChange}
                      ref={selectedFilesRef}
                    />
                    <Button component="span" disabled={isUploadingFile}>
                      Select Files
                    </Button>
                  </label>
                </Grid>
                <Grid item sx={{ ml: 2 }}>
                  <LoadingButton
                    onClick={uploadBtnHandler}
                    loading={isUploadingFile}
                    disabled={selectedFilesToUpload.length === 0}
                  >
                    Upload
                  </LoadingButton>
                </Grid>
              </Grid>
              {numberOfSelectedFiles > 0 && (
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    {numberOfSelectedFiles === 1
                      ? `1 file selected`
                      : `${numberOfSelectedFiles} files selected`}
                    . Click upload to preview.
                  </Typography>
                </Grid>
              )}

              {uploadedFiles.length === 0 &&
                selectedFilesToUpload.length === 0 &&
                !isUploadingFile && (
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ color: "gray" }}>
                      No uploaded files
                    </Typography>
                  </Grid>
                )}
              {uploadedFiles.length > 0 && (
                <Grid item xs={12} sx={{ mt: 3 }}>
                  <Typography variant="body1">Uploaded Files:</Typography>
                </Grid>
              )}
              {isUploadingFile && (
                <Grid item sx={{ mt: 1 }}>
                  <Skeleton variant="text" width="250px" height="44px" />
                  <Skeleton variant="text" width="250px" height="44px" />
                  <Skeleton variant="text" width="250px" height="44px" />
                </Grid>
              )}
              <Grid item xs={12} sx={{ mt: "3px" }}>
                {isDeletingFile && (
                  <CircularProgress sx={{ mt: 1 }} size={28} />
                )}
                {!isUploadingFile &&
                  !isDeletingFile &&
                  uploadedFiles.length > 0 &&
                  uploadedFiles.map((uploadedFile) => (
                    <FileUploadChip
                      key={uploadedFile.key}
                      uniqueChipIdentifier={uploadedFile.key}
                      fileName={uploadedFile.originalname}
                      fileLocationUrl={uploadedFile.fileLocationUrl}
                      onDelete={deleteUploadedFile}
                    />
                  ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Dialog>
    </>
  )
}

export default AddThesisPointDialog
