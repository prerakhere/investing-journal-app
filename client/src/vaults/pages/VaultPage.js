import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  Suspense,
  lazy,
} from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Button,
  Container,
  Grid,
  Skeleton,
  Typography,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material"
import {
  Timeline,
  TimelineSeparator,
  TimelineDot,
  TimelineItem,
  TimelineContent,
  TimelineConnector,
  TimelineOppositeContent,
} from "@mui/lab"
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from "@mui/icons-material"
import { AuthContext } from "../../shared/context/auth-context"
import { useHttpClient } from "../../shared/hooks/http-hook"
import DialogForm from "../../shared/components/DialogForm/DialogForm"
// import AddThesisPointDialog from "../components/AddThesisPointDialog"
import ThesisPointItem from "../components/ThesisPointItem"

const AddThesisPointDialog = lazy(() =>
  import(
    /* webpackChunkName: "AddThesisPointDialog" */ "../components/AddThesisPointDialog"
  )
)

const initialState = {
  vaultName: "",
  editedVaultName: "",
  vaultSector: "",
  editedVaultSector: "",
  showVaultNameError: false,
  loadedThesisPoints: [],
}

function vaultPageReducer(state, action) {
  switch (action.type) {
    case "form-field": {
      return {
        ...state,
        [action.fieldName]: action.payload,
      }
    }
    case "set vault details on initial fetch": {
      return {
        ...state,
        vaultName: action.payload.vault.vault_name,
        editedVaultName: action.payload.vault.vault_name,
        vaultSector: action.payload.vault.vault_sector,
        editedVaultSector: action.payload.vault.vault_sector,
        loadedThesisPoints: [...action.payload.thesis],
      }
    }
    case "error: edited vault name empty": {
      return {
        ...state,
        showVaultNameError: true,
      }
    }
    case "update new vault name and sector": {
      return {
        ...state,
        vaultName: action.payload.vault.vault_name,
        editedVaultName: action.payload.vault.vault_name,
        vaultSector: action.payload.vault.vault_sector,
        editedVaultSector: action.payload.vault.vault_sector,
      }
    }
    case "remove vault name error": {
      return {
        ...state,
        showVaultNameError: false,
      }
    }
    default:
      return state
  }
}
const VaultPage = () => {
  const navigate = useNavigate()
  let { vaultId } = useParams()
  const { isLoading, sendRequest } = useHttpClient()
  const auth = useContext(AuthContext)

  const [state, dispatch] = useReducer(vaultPageReducer, initialState)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openAddThesisPointDialog, setOpenAddThesisPointDialog] =
    useState(false)
  const [rerender, setRerender] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const {
    vaultName,
    editedVaultName,
    vaultSector,
    editedVaultSector,
    showVaultNameError,
    loadedThesisPoints,
  } = state

  useEffect(() => {
    const fetchVaultDetails = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5004/api/vaults/${vaultId}`,
          "GET",
          null,
          {
            Authorization: "Bearer " + auth.token,
          }
        )
        console.log("------")
        console.log(responseData)
        dispatch({
          type: "set vault details on initial fetch",
          payload: responseData,
        })
      } catch (err) {}
    }
    fetchVaultDetails()
  }, [sendRequest, auth.token, vaultId, rerender])

  const shouldRerender = (rerender) => {
    setRerender(rerender)
  }
  const addThesisBtnHandler = () => {
    setOpenAddThesisPointDialog(true)
  }

  // edit handlers
  const editVaultHandler = () => {
    setAnchorEl(null)
    setOpenEditDialog(true)
  }

  const onEditVaultNameChangeHandler = (e) => {
    dispatch({
      type: "form field",
      fieldName: "editedVaultName",
      payload: e.target.value,
    })
    if (editedVaultName.length + 1 > 0) {
      dispatch({ type: "remove vault name error" })
    }
  }

  const onEditVaultSectorChangeHandler = (e) => {
    dispatch({
      type: "form field",
      fieldName: "editedVaultSector",
      payload: e.target.value,
    })
  }
  const editVaultSubmitHandler = async (e) => {
    e.preventDefault()
    if (editedVaultName.length === 0) {
      dispatch({ type: "error: edited vault name empty" })
      return
    }
    try {
      setOpenEditDialog(false)
      const responseData = await sendRequest(
        `http://localhost:5004/api/vaults/${vaultId}`,
        "PATCH",
        JSON.stringify({
          vault_name: editedVaultName,
          vault_sector: editedVaultSector,
        }),
        {
          Authorization: "Bearer " + auth.token,
          "Content-Type": "application/json",
        }
      )
      dispatch({
        type: "update new vault name and sector",
        payload: responseData,
      })
    } catch (err) {}
  }
  // delete handlers
  const deleteVaultHandler = () => {
    setAnchorEl(null)
    setOpenDeleteDialog(true)
  }
  const handleOptionsBtnClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleOnOptionsBtnClose = () => {
    setAnchorEl(null)
  }
  const deleteVaultSubmitHandler = async (event) => {
    event.preventDefault()
    setOpenDeleteDialog(false)
    try {
      await sendRequest(
        `http://localhost:5004/api/vaults/${vaultId}`,
        "DELETE",
        null,
        {
          Authorization: "Bearer " + auth.token,
        }
      )
      navigate("/vaults", { replace: true })
    } catch (err) {}
  }
  const cancelActionHandler = () => {
    if (openDeleteDialog) setOpenDeleteDialog(false)
    if (openEditDialog) setOpenEditDialog(false)
  }
  const openMenu = Boolean(anchorEl)
  const optionsBtnId = openMenu ? "simple-optionsBtn" : undefined
  return (
    <>
      <Container>
        <Grid container justifyContent="center">
          <Grid container item xs={12} md={8} justifyContent="center">
            <Grid item container justifyContent="space-between" sx={{ mt: 4 }}>
              <Grid item xs={9}>
                <Typography variant="h3" fontWeight="fontWeightBold">
                  {isLoading && <Skeleton variant="text" width="190px" />}
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight="fontWeightBold"
                  sx={{
                    fontSize: {
                      xs: "1.75rem",
                      sm: "2.125rem",
                    },
                  }}
                >
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
                      <MenuItem onClick={editVaultHandler}>
                        <EditIcon fontSize="small" sx={{ mr: "3px" }} />
                        Edit Vault
                      </MenuItem>
                      <MenuItem onClick={deleteVaultHandler}>
                        <DeleteIcon fontSize="small" sx={{ mr: "3px" }} />
                        Delete Vault
                      </MenuItem>
                    </Menu>
                  </Grid>
                </Grid>
              )}
            </Grid>

            <Grid item xs={12} sx={{ mb: 1 }}>
              <Typography variant="body2">
                {isLoading && <Skeleton variant="text" width="90px" />}
                {!isLoading && vaultSector}
              </Typography>
            </Grid>
            <Grid item container justifyContent="space-between" sx={{ mt: 3 }}>
              <Grid item>
                <Typography
                  variant="h4"
                  fontWeight="fontWeightBold"
                  sx={{
                    fontSize: {
                      xs: "1.75rem",
                      sm: "2.05rem",
                    },
                  }}
                >
                  {isLoading && (
                    <Skeleton variant="text" width="150px" height="50px" />
                  )}
                  {!isLoading && "Thesis"}
                </Typography>
              </Grid>
              <Grid item>
                {!isLoading && (
                  <Button
                    onClick={addThesisBtnHandler}
                    sx={{
                      fontSize: {
                        xs: "0.8rem",
                        sm: "0.85rem",
                      },
                      p: {
                        xs: "6px",
                        sm: "7px",
                        md: "10px",
                      },
                    }}
                  >
                    <AddIcon fontSize="small" sx={{ mr: "3px" }} />
                    Add Thesis Point
                  </Button>
                )}
              </Grid>
            </Grid>
            <Grid
              container
              item
              xs={12}
              sx={{ mt: 2 }}
              justifyContent="flex-start"
            >
              <Grid item container xs={12} justifyContent="flex-start">
                {isLoading && (
                  <>
                    <Grid item xs={10} md={9} sx={{ mt: 2 }}>
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height="100px"
                      />
                    </Grid>
                    <Grid item xs={10} md={9} sx={{ mt: 2 }}>
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height="100px"
                      />
                    </Grid>
                    <Grid item xs={10} md={9} sx={{ mt: 2 }}>
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height="100px"
                      />
                    </Grid>
                  </>
                )}
                <Timeline sx={{ alignItems: "flex-start", pl: 0, pr: 0 }}>
                  {!isLoading &&
                    loadedThesisPoints &&
                    loadedThesisPoints.map((thesisPoint) => (
                      <TimelineItem
                        key={thesisPoint.id}
                        sx={{ "&::before": { display: "none" } }}
                      >
                        <Grid item xs={2} sm={3}>
                          <TimelineOppositeContent sx={{ mr: 2, pr: 0 }}>
                            <Typography
                              variant="body2"
                              fontWeight="fontWeightLight"
                            >
                              {thesisPoint.thesis_point_date_created}
                            </Typography>
                          </TimelineOppositeContent>
                        </Grid>
                        <TimelineSeparator>
                          <TimelineDot />
                          <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent sx={{ pr: 0 }}>
                          <Grid item xs={10} sm={9}>
                            <ThesisPointItem
                              key={thesisPoint.id}
                              id={thesisPoint.id}
                              vaultId={vaultId}
                              vaultName={vaultName}
                              thesisPointDateCreated={
                                thesisPoint.thesis_point_date_created
                              }
                              thesisPointTitle={thesisPoint.thesis_point_title}
                              thesisPointDescription={
                                thesisPoint.thesis_point_description
                              }
                              thesisPointAttachmentsCount={
                                thesisPoint.thesis_point_attachments.length
                              }
                            />
                          </Grid>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                </Timeline>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <DialogForm
          title="Delete vault"
          dialogContentText="Are you sure you want to delete this vault?"
          openDialog={openDeleteDialog}
          setOpenDialog={setOpenDeleteDialog}
          takeActionBtn="Delete"
          cancelBtn="Cancel"
          takeActionSubmitHandler={deleteVaultSubmitHandler}
          cancelActionHandler={cancelActionHandler}
        ></DialogForm>
        <DialogForm
          title="Edit Vault"
          dialogContentText="Begin by adding the company name and sector"
          openDialog={openEditDialog}
          setOpenDialog={setOpenEditDialog}
          takeActionBtn="Save"
          cancelBtn="Cancel"
          takeActionSubmitHandler={editVaultSubmitHandler}
          cancelActionHandler={cancelActionHandler}
        >
          <Grid container item xs={12} justifyContent="space-around">
            <Grid item xs={10} sm={5}>
              <TextField
                variant="standard"
                label="Vault Name"
                value={editedVaultName}
                onChange={(e) => onEditVaultNameChangeHandler(e)}
                error={showVaultNameError}
                helperText={showVaultNameError ? "Vault must have a name!" : ""}
              />
            </Grid>
            <Grid item xs={10} sm={5}>
              <TextField
                variant="standard"
                label="Vault Sector"
                value={editedVaultSector}
                onChange={(e) => onEditVaultSectorChangeHandler(e)}
              />
            </Grid>
          </Grid>
        </DialogForm>
        <Suspense fallback={<div></div>}>
          {openAddThesisPointDialog && (
            <AddThesisPointDialog
              vault_name={vaultName}
              openDialog={openAddThesisPointDialog}
              setOpenDialog={setOpenAddThesisPointDialog}
              shouldRerender={shouldRerender}
              rerender={rerender}
            />
          )}
        </Suspense>
      </Container>
    </>
  )
}

export default VaultPage
