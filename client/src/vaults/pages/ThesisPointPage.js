import React, { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Container,
  Grid,
  Typography,
  Divider,
  Button,
  Skeleton,
  Menu,
  MenuItem,
} from "@mui/material"
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from "@mui/icons-material"
import { AuthContext } from "../../shared/context/auth-context"
import { useHttpClient } from "../../shared/hooks/http-hook"
import DialogForm from "../../shared/components/DialogForm/DialogForm"
import EditThesisPointDialog from "../components/EditThesisPointDialog"
import FileChip from "../components/FileChip"

const ThesisPointPage = () => {
  const navigate = useNavigate()
  const { vaultId, thesisPointId } = useParams()
  const { isLoading, sendRequest } = useHttpClient()
  const auth = useContext(AuthContext)
  const [vaultName, setVaultName] = useState("")
  const [thesisPointTitle, setThesisPointTitle] = useState("")
  const [thesisPointDateCreated, setThesisPointDateCreated] = useState("")
  const [thesisPointDescription, setThesisPointDescription] = useState("")
  const [thesisPointAttachments, setThesisPointAttachments] = useState([])
  const [openEditThesisPointDialog, setOpenEditThesisPointDialog] =
    useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [rerender, setRerender] = useState(false)
  const [anchorEl, setAnchorEl] = React.useState(null)
  useEffect(() => {
    const fetchThesisPointDetails = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5004/api/vaults/${vaultId}/${thesisPointId}`,
          "GET",
          null,
          {
            Authorization: "Bearer " + auth.token,
            "Content-Type": "application/json",
          }
        )
        setThesisPointDateCreated(
          responseData.thesisPoint.thesis_point_date_created
        )
        setThesisPointTitle(responseData.thesisPoint.thesis_point_title)
        setThesisPointDescription(
          responseData.thesisPoint.thesis_point_description
        )
        setThesisPointAttachments([
          ...responseData.thesisPoint.thesis_point_attachments,
        ])
      } catch (err) {}
    }
    fetchThesisPointDetails()
  }, [sendRequest, auth.token, vaultId, thesisPointId, rerender])
  useEffect(() => {
    const fetchVaultDetails = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5004/api/vaults/${vaultId}/minimal`,
          "GET",
          null,
          {
            Authorization: "Bearer " + auth.token,
            "Content-Type": "application/json",
          }
        )
        setVaultName(responseData.vault.vault_name)
      } catch (err) {}
    }
    fetchVaultDetails()
  }, [sendRequest, auth.token, vaultId])
  const shouldRerender = (rerender) => {
    setRerender(rerender)
  }
  const handleOptionsBtnClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleOnOptionsBtnClose = () => {
    setAnchorEl(null)
  }
  const editThesisPointHandler = () => {
    setAnchorEl(null)
    setOpenEditThesisPointDialog(true)
  }
  const deleteThesisPointHandler = () => {
    setAnchorEl(null)
    setOpenDeleteDialog(true)
  }
  const deleteThesisPointSubmitHandler = async (e) => {
    e.preventDefault()
    setOpenDeleteDialog(false)
    try {
      const response = await sendRequest(
        `http://localhost:5004/api/vaults/${vaultId}/${thesisPointId}`,
        "DELETE",
        JSON.stringify({
          filesToDelete: thesisPointAttachments,
        }),
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        }
      )
      if (response.message) {
        navigate(`/vaults/${vaultId}`, { replace: true })
      }
    } catch (err) {}
  }
  const deleteThesisPointCancelHandler = () => {
    setOpenDeleteDialog(false)
  }
  const openMenu = Boolean(anchorEl)
  const optionsBtnId = openMenu ? "simple-optionsBtn" : undefined
  return (
    <>
      <Container>
        <Grid container sx={{ mt: 4 }} justifyContent="center">
          <Grid item container xs={12} md={10}>
            <Grid container item xs={12} justifyContent="space-between">
              <Grid item xs={9}>
                <Typography variant="h3" fontWeight="fontWeightMedium">
                  {isLoading && <Skeleton variant="text" width="230px" />}
                  {!isLoading && vaultName}
                </Typography>
              </Grid>
              {!isLoading && (
                <Grid container item xs={2} md={3} justifyContent="flex-end">
                  <Grid item>
                    <Button
                      aria-describedby={optionsBtnId}
                      variant="outlined"
                      onClick={handleOptionsBtnClick}
                      sx={{
                        fontSize: {
                          sx: "1rem",
                          md: "1.5rem",
                        },
                        padding: {
                          xs: "1px",
                          sm: "4px",
                          md: "5px",
                          lg: "6px",
                        },
                      }}
                    >
                      <SettingsIcon fontSize="small" />
                      <ArrowDropDownIcon fontSize="small" />
                    </Button>
                    <Menu
                      id={optionsBtnId}
                      open={openMenu}
                      anchorEl={anchorEl}
                      onClose={handleOnOptionsBtnClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "center",
                      }}
                    >
                      <MenuItem onClick={editThesisPointHandler}>
                        <EditIcon fontSize="small" sx={{ mr: "3px" }} />
                        Edit
                      </MenuItem>
                      <MenuItem onClick={deleteThesisPointHandler}>
                        <DeleteIcon fontSize="small" sx={{ mr: "3px" }} />
                        Delete
                      </MenuItem>
                    </Menu>
                  </Grid>
                </Grid>
              )}
            </Grid>
            <Grid item xs={12} sx={{ mt: 5 }}>
              {isLoading && (
                <Typography variant="h3" fontWeight="fontWeightMedium">
                  <Skeleton variant="text" width="190px" />
                </Typography>
              )}
              <Typography variant="h4" fontWeight="fontWeightMedium">
                {!isLoading && thesisPointTitle}
              </Typography>
            </Grid>
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="body2">
                {isLoading && <Skeleton variant="text" width="90px" />}
                {!isLoading && thesisPointDateCreated}
              </Typography>
            </Grid>
            <Grid item xs={12} sx={{ mt: 2 }}>
              {isLoading && (
                <Skeleton variant="rectangular" width="100%" height="100px" />
              )}
              {!isLoading && thesisPointDescription}
            </Grid>
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h3">
                {isLoading && <Skeleton variant="text" width="90px" />}
              </Typography>
              {!isLoading && <Typography variant="h5">Attachments</Typography>}
              <Divider />
            </Grid>
            <Grid item xs={12} md={10} sx={{ mt: 1 }}>
              {isLoading && (
                <>
                  <Skeleton variant="text" width="250px" height="44px" />
                  <Skeleton variant="text" width="250px" height="44px" />
                  <Skeleton variant="text" width="250px" height="44px" />
                </>
              )}
              {thesisPointAttachments.length === 0 && (
                <Typography variant="body2" sx={{ color: "#A0A0A0" }}>
                  No attachments
                </Typography>
              )}
              {thesisPointAttachments.length > 0 &&
                thesisPointAttachments.map((attachment) => {
                  return (
                    <FileChip
                      key={attachment.key}
                      fileLocationUrl={attachment.fileLocationUrl}
                      fileName={attachment.originalname}
                    />
                  )
                })}
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <DialogForm
        title="Delete thesis point"
        dialogContentText="Are you sure you want to delete this thesis point?"
        openDialog={openDeleteDialog}
        setOpenDialog={setOpenDeleteDialog}
        takeActionBtn="DELETE"
        cancelBtn="CANCEL"
        takeActionSubmitHandler={deleteThesisPointSubmitHandler}
        cancelActionHandler={deleteThesisPointCancelHandler}
      ></DialogForm>
      {!isLoading && (
        <EditThesisPointDialog
          vault_name={vaultName}
          thesis_point_date_created={thesisPointDateCreated}
          thesis_point_title={thesisPointTitle}
          thesis_point_description={thesisPointDescription}
          thesis_point_attachments={thesisPointAttachments}
          openDialog={openEditThesisPointDialog}
          setOpenDialog={setOpenEditThesisPointDialog}
          shouldRerender={shouldRerender}
          rerender={rerender}
        ></EditThesisPointDialog>
      )}
    </>
  )
}

export default ThesisPointPage
