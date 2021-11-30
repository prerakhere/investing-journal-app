import React, { useState, useContext, useRef } from "react"
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
  const [thesisPointTitle, setThesisPointTitle] = useState("")
  const [thesisPointDescription, setThesisPointDescription] = useState("")
  const [numberOfSelectedFiles, setNumberOfSelectedFiles] = useState(0)
  const [selectedFilesToUpload, setSelectedFilesToUpload] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [showThesisPointTitleError, setShowThesisPointTitleError] =
    useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeletingFile, setIsDeletingFile] = useState(false)
  const [isSavingThesis, setIsSavingThesis] = useState(false)
  const currDate = new Date().toString().substring(4, 15)
  const formattedDate = currDate.slice(0, 6) + "," + currDate.slice(6)

  const onSaveBtnClick = async (e) => {
    e.preventDefault()
    if (thesisPointTitle.length === 0) {
      setShowThesisPointTitleError(true)
      return
    }
    setIsSavingThesis(true)
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
      selectedFilesRef.current.value = ""
      setNumberOfSelectedFiles(0)
      setSelectedFilesToUpload([])
      setUploadedFiles([])
      setThesisPointTitle("")
      setThesisPointDescription("")
      setIsDeletingFile(false)
      setIsSavingThesis(false)
      setOpenDialog(false)
      shouldRerender(!rerender)
      navigate(`/vaults/${vaultId}`, { replace: true })
    } catch (err) {}
  }

  const uploadBtnHandler = () => {
    let filesArr = []
    setIsUploading(true)
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
          setUploadedFiles([...uploadedFiles, ...filesArr])
        } catch (err) {}
      })
    ).then(() => setIsUploading(false))
    setSelectedFilesToUpload([])
    setNumberOfSelectedFiles(0)
    selectedFilesRef.current.value = ""
  }

  const onFilesInputChange = (e) => {
    let fileArr = Array.from(e.target.files)
    setSelectedFilesToUpload(fileArr)
    setNumberOfSelectedFiles(fileArr.length)
  }

  const closeAddThesisPointDialog = async () => {
    await discardUploadedFiles()
    setIsUploading(false)
    selectedFilesRef.current.value = ""
    setSelectedFilesToUpload([])
    setUploadedFiles([])
    setThesisPointTitle("")
    setNumberOfSelectedFiles(0)
    setThesisPointDescription("")
    setShowThesisPointTitleError(false)
    setIsDeletingFile(false)
    setIsSavingThesis(false)
    setOpenDialog(false)
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
      setIsDeletingFile(false)
      setUploadedFiles([...responseData.updatedUploadedFiles])
    } catch (err) {}
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
              disabled={isUploading}
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
                  variant="filled"
                  id="outlined-multiline-static"
                  label="Thesis Point Description"
                  multiline
                  rows={6}
                  value={thesisPointDescription}
                  onChange={(e) => setThesisPointDescription(e.target.value)}
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
                    <Button component="span" disabled={isUploading}>
                      Select Files
                    </Button>
                  </label>
                </Grid>
                <Grid item sx={{ ml: 2 }}>
                  <LoadingButton
                    onClick={uploadBtnHandler}
                    loading={isUploading}
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
                !isUploading && (
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
              {isUploading && (
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
                {!isUploading &&
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
