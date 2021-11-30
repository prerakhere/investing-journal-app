import React, { useState, useEffect, useContext, useRef } from "react"
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
  const [selectedFilesToUpload, setSelectedFilesToUpload] = useState([])
  const [thesisPointTitle, setThesisPointTitle] = useState(thesis_point_title)
  const [thesisPointDescription, setThesisPointDescription] = useState(
    thesis_point_description
  )
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [loadedFiles, setLoadedFiles] = useState([])
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [isDeletingFile, setIsDeletingFile] = useState(false)
  const [isSavingThesis, setIsSavingThesis] = useState(false)
  const [showThesisPointTitleError, setShowThesisPointTitleError] =
    useState(false)
  const [numberOfSelectedFiles, setNumberOfSelectedFiles] = useState(0)

  useEffect(() => {
    setThesisPointTitle(thesis_point_title)
    setThesisPointDescription(thesis_point_description)
    setLoadedFiles([...thesis_point_attachments])
  }, [
    thesis_point_title,
    thesis_point_description,
    thesis_point_attachments,
    openDialog,
  ])

  const onSaveBtnClick = async (e) => {
    e.preventDefault()
    if (thesisPointTitle.length === 0) {
      setShowThesisPointTitleError(true)
      return
    }
    setIsSavingThesis(true)
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
      setNumberOfSelectedFiles(0)
      setSelectedFilesToUpload([])
      setUploadedFiles([])
      setLoadedFiles([])
      setThesisPointTitle("")
      setThesisPointDescription("")
      setIsDeletingFile(false)
      setIsSavingThesis(false)
      setOpenDialog(false)
      shouldRerender(!rerender)
    } catch (err) {}
  }
  const uploadBtnHandler = () => {
    // e.preventDefault()
    let filesArr = []
    setIsUploadingFile(true)
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
              // Accept: "application/json",
              //   "Content-Type": `multipart/form-data`,
              // "Content-Type": "application/json",
              Authorization: "Bearer " + auth.token,
            }
          )
          filesArr.push(fileResponseData)
          setUploadedFiles([...filesArr])
          setLoadedFiles([...loadedFiles, ...filesArr])
          // // setUploadedFiles([])
        } catch (err) {}
      })
    ).then(() => setIsUploadingFile(false))

    setSelectedFilesToUpload([])
    setNumberOfSelectedFiles(0)
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
    setIsDeletingFile(true)
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
        setUploadedFiles([...responseData.updatedUploadedFiles])
        const filteredLoadedFiles = loadedFiles.filter(
          (loadedFile) => loadedFile.key !== fileName
        )
        setIsDeletingFile(false)
        setLoadedFiles([...filteredLoadedFiles])
      } catch (err) {
        setIsDeletingFile(false)
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
        setIsDeletingFile(false)
        setLoadedFiles([...responseData.updatedLoadedFiles])
      } catch (err) {
        setIsDeletingFile(false)
      }
    }
  }
  const onFilesInputChange = (e) => {
    let fileArr = Array.from(e.target.files)
    setSelectedFilesToUpload(fileArr)
    setNumberOfSelectedFiles(fileArr.length)
  }

  const closeEditThesisPointDialog = async () => {
    if (thesisPointTitle.length === 0) {
      setShowThesisPointTitleError(true)
      return
    }
    await discardUploadedFiles()
    setIsUploadingFile(false)
    selectedFilesRef.current.value = ""
    setSelectedFilesToUpload([])
    setUploadedFiles([])
    setLoadedFiles([])
    setThesisPointTitle("")
    setNumberOfSelectedFiles(0)
    setThesisPointDescription("")
    setShowThesisPointTitleError(false)
    setIsDeletingFile(false)
    setIsSavingThesis(false)
    setOpenDialog(false)
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
                  onChange={(e) => {
                    if (thesisPointTitle.length + 1 > 0)
                      setShowThesisPointTitleError(false)
                    setThesisPointTitle(e.target.value)
                  }}
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
                  onChange={(e) => setThesisPointDescription(e.target.value)}
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
