import React, { useEffect, useReducer, useContext, useRef } from "react"
import { useParams } from "react-router-dom"
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
import CloseIcon from "@mui/icons-material/Close"
import { styled } from "@mui/material/styles"
import { useHttpClient } from "../../shared/hooks/http-hook"
import { AuthContext } from "../../shared/context/auth-context"
import theme from "../../config/theme"
import FileUploadChip from "./FileUploadChip"

const initialState = {
  selectedFilesToUpload: [],
  thesisPointTitle: "",
  thesisPointDescription: "",
  uploadedFiles: [],
  loadedFiles: [],
  isUploadingFile: false,
  isDeletingFile: false,
  isSavingThesis: false,
  showThesisPointTitleError: false,
  numberOfSelectedFiles: 0,
}

function editThesisPointDialogReducer(state, action) {
  switch (action.type) {
    case "form field": {
      return {
        ...state,
        [action.fieldName]: action.payload,
      }
    }
    case "set initial thesis point details": {
      return {
        ...state,
        thesisPointTitle: action.payload.thesis_point_title,
        thesisPointDescription: action.payload.thesis_point_description,
        loadedFiles: [...action.payload.thesis_point_attachments],
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
    case "close edit thesis point dialog": {
      return {
        ...state,
        numberOfSelectedFiles: 0,
        selectedFilesToUpload: [],
        uploadedFiles: [],
        loadedFiles: [],
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
        uploadedFiles: [...action.payload.filesArr],
        loadedFiles: [
          ...action.payload.loadedFiles,
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
        uploadedFiles: [...action.payload.updatedUploadedFiles],
        loadedFiles: [...action.payload.filteredLoadedFiles],
        isDeletingFile: false,
      }
    }
    case "set files after deleting an already existing file": {
      return {
        ...state,
        loadedFiles: [...action.payload],
        isDeletingFile: false,
      }
    }
    case "set files on file input change": {
      return {
        ...state,
        selectedFilesToUpload: [...action.payload],
        numberOfSelectedFiles: action.payload.length,
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

const EditThesisPointDialog = (props) => {
  const {
    vault_name,
    thesis_point_title,
    thesis_point_description,
    thesis_point_date_created,
    thesis_point_attachments,
    openDialog,
    setOpenDialog,
    shouldRerender,
    rerender,
  } = props
  let { vaultId, thesisPointId } = useParams()
  const selectedFilesRef = useRef()
  const { sendRequest } = useHttpClient()
  const auth = useContext(AuthContext)
  const [state, dispatch] = useReducer(
    editThesisPointDialogReducer,
    initialState
  )

  const {
    selectedFilesToUpload,
    thesisPointTitle,
    thesisPointDescription,
    uploadedFiles,
    loadedFiles,
    isUploadingFile,
    isDeletingFile,
    isSavingThesis,
    showThesisPointTitleError,
    numberOfSelectedFiles,
  } = state

  useEffect(() => {
    dispatch({
      type: "set initial thesis point details",
      payload: {
        thesis_point_title,
        thesis_point_description,
        thesis_point_attachments,
      },
    })
  }, [
    thesis_point_title,
    thesis_point_description,
    thesis_point_attachments,
    openDialog,
  ])

  const onSaveBtnClick = async (e) => {
    e.preventDefault()
    if (thesisPointTitle.length === 0) {
      dispatch({ type: "error: thesis point title empty" })
      return
    }
    dispatch({ type: "set saving thesis to true" })
    try {
      await sendRequest(
        `http://localhost:5004/api/vaults/${vaultId}/${thesisPointId}`,
        "PATCH",
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

      selectedFilesRef.current.value = ""
      setOpenDialog(false)
      shouldRerender(!rerender)
      dispatch({ type: "close edit thesis point dialog" })
    } catch (err) {}
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
            payload: { loadedFiles, filesArr },
          })
        } catch (err) {}
      })
    ).then(() => {
      dispatch({ type: "set uploading file to false" })
    })

    dispatch({ type: "upload button handler clean up" })
    selectedFilesRef.current.value = ""
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
    if (
      uploadedFiles.length &&
      uploadedFiles.filter(function (uploadedFile) {
        return uploadedFile.key === fileName
      }).length > 0
    ) {
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
        const filteredLoadedFiles = loadedFiles.filter(
          (loadedFile) => loadedFile.key !== fileName
        )
        dispatch({
          type: "set files after deleting an uploaded file",
          payload: {
            updatedUploadedFiles: responseData.updatedUploadedFiles,
            filteredLoadedFiles,
          },
        })
      } catch (err) {
        dispatch({ type: "set is deleting file to false" })
      }
    }

    // file in S3 and DB both, loaded files come here
    else {
      try {
        const responseData = await sendRequest(
          `http://localhost:5004/api/vaults/${vaultId}/${thesisPointId}/edit`,
          "DELETE",
          JSON.stringify({
            fileName,
            loadedFiles,
          }),
          {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.token,
          }
        )
        dispatch({
          type: "set files after deleting an already existing file",
          payload: responseData.updatedLoadedFiles,
        })
      } catch (err) {
        dispatch({ type: "set is deleting file to false" })
      }
    }
  }
  const onFilesInputChange = (e) => {
    let fileArr = Array.from(e.target.files)
    dispatch({ type: "set files on file input change", payload: fileArr })
  }

  const closeEditThesisPointDialog = async () => {
    if (thesisPointTitle.length === 0) {
      dispatch({ type: "error: thesis point title empty" })
      return
    }
    await discardUploadedFiles()
    setOpenDialog(false)
    selectedFilesRef.current.value = ""
    dispatch({ type: "close edit thesis point dialog" })
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
              onClick={closeEditThesisPointDialog}
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
                <Typography variant="body1">
                  {thesis_point_date_created}
                </Typography>
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
                  id="outlined-multiline-static"
                  label="Thesis Point Description"
                  variant="filled"
                  multiline
                  rows={6}
                  value={thesisPointDescription}
                  onChange={(e) => onThesisPointDescChangeHandler(e)}
                  fullWidth
                />
              </Grid>
              <Grid container item xs={12} sx={{ mt: 5 }}>
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
                    UPLOAD
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
              {loadedFiles.length === 0 &&
                selectedFilesToUpload.length === 0 &&
                !isUploadingFile && (
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ color: "gray" }}>
                      No uploaded files
                    </Typography>
                  </Grid>
                )}
              {loadedFiles.length > 0 && (
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
                  loadedFiles.length > 0 &&
                  loadedFiles.map((uploadedFile) => (
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

export default EditThesisPointDialog
