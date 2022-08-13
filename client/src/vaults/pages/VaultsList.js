import React, { useState, useEffect, useReducer, useContext } from "react"
import {
  Button,
  Container,
  Grid,
  Typography,
  Divider,
  TextField,
  Skeleton,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import { useHttpClient } from "../../shared/hooks/http-hook"
import { AuthContext } from "../../shared/context/auth-context"
import DialogForm from "../../shared/components/DialogForm/DialogForm"
import VaultItem from "../components/VaultItem"

const initialState = {
  vaultName: "",
  vaultSector: "",
  loadedVaults: [],
  hasNoVaults: false,
  showVaultNameError: false,
}

function vaultsListReducer(state, action) {
  switch (action.type) {
    case "form field": {
      return {
        ...state,
        [action.fieldName]: action.payload,
      }
    }
    case "set loaded vaults": {
      return {
        ...state,
        loadedVaults: [...action.payload],
        hasNoVaults: false,
      }
    }
    case "set no vaults": {
      return {
        ...state,
        hasNoVaults: true,
      }
    }
    case "cancel add vault dialog": {
      return {
        ...state,
        vaultName: "",
        vaultSector: "",
        showVaultNameError: false,
      }
    }
    case "error: vault name empty": {
      return {
        ...state,
        showVaultNameError: true,
      }
    }
    case "remove vault name error": {
      return {
        ...state,
        showVaultNameError: false,
      }
    }
    case "set vault list non-empty": {
      return {
        ...state,
        hasNoVaults: false,
      }
    }
    case "close add vault dialog": {
      return {
        ...state,
        vaultName: "",
        vaultSector: "",
        showVaultNameError: false,
      }
    }
    default:
      return state
  }
}

const VaultsList = () => {
  const auth = useContext(AuthContext)
  const { isLoading, sendRequest } = useHttpClient()
  const [state, dispatch] = useReducer(vaultsListReducer, initialState)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const {
    vaultName,
    vaultSector,
    loadedVaults,
    hasNoVaults,
    showVaultNameError,
  } = state

  useEffect(() => {
    const fetchVaults = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5004/api/vaults`,
          "GET",
          null,
          {
            Authorization: "Bearer " + auth.token,
            "Content-Type": "application/json",
          }
        )
        if (responseData.vaults) {
          dispatch({ type: "set loaded vaults", payload: responseData.vaults })
        }
        if (responseData.message) {
          dispatch({ type: "set no vaults" })
        }
      } catch (err) {}
    }
    fetchVaults()
  }, [sendRequest, auth.token])

  const addVaultHandler = () => {
    setOpenAddDialog(true)
  }

  const cancelAddVaultHandler = () => {
    dispatch({ type: "cancel add vault dialog" })
    setOpenAddDialog(false)
  }

  const addVaultSubmitHandler = async (event) => {
    event.preventDefault()
    if (vaultName.length === 0) {
      dispatch({ type: "error: vault name empty" })
      return
    }
    dispatch({ type: "set vault list non-empty" })
    try {
      setOpenAddDialog(false)
      dispatch({ type: "close add vault dialog" })
      await sendRequest(
        "http://localhost:5004/api/vaults",
        "POST",
        JSON.stringify({
          vault_name: vaultName,
          vault_sector: vaultSector,
        }),
        {
          Authorization: "Bearer " + auth.token,
          "Content-Type": "application/json",
        }
      )
    } catch (err) {}
    ;(async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5004/api/vaults`,
          "GET",
          null,
          {
            Authorization: "Bearer " + auth.token,
            "Content-Type": "application/json",
          }
        )
        dispatch({ type: "set loaded vaults", payload: responseData.vaults })
      } catch (err) {}
    })()
  }

  const onVaultNameChangeHandler = (e) => {
    dispatch({
      type: "form field",
      fieldName: "vaultName",
      payload: e.target.value,
    })
    if (vaultName.length + 1 > 0) dispatch({ type: "remove vault name error" })
  }

  const onVaultSectorChangeHandler = (e) => {
    dispatch({
      type: "form field",
      fieldName: "vaultSector",
      payload: e.target.value,
    })
  }
  return (
    <>
      <Container>
        <Grid container justifyContent="center">
          <Grid container item xs={12} md={8} lg={7} xl={6} sx={{ mt: 6 }}>
            <Grid container item xs={12} justifyContent="space-between">
              <Grid item>
                <Typography
                  variant="h4"
                  fontWeight="fontWeightBold"
                  sx={{
                    fontSize: {
                      xs: "1.8rem",
                      sm: "2.125rem",
                    },
                  }}
                >
                  Your Vaults
                </Typography>
              </Grid>
              <Grid item>
                {!isLoading && (
                  <Button
                    onClick={addVaultHandler}
                    sx={{
                      fontSize: {
                        xs: "0.8rem",
                        sm: "0.85rem",
                        md: "0.9rem",
                      },
                      p: {
                        xs: "6px",
                        sm: "7px",
                        md: "10px",
                      },
                    }}
                  >
                    <AddIcon fontSize="small" sx={{ mr: "3px" }} />
                    Add Vault
                  </Button>
                )}
              </Grid>
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Divider />
              </Grid>
            </Grid>
            <DialogForm
              title="Add Vault"
              dialogContentText="Begin by adding the company name and sector"
              openDialog={openAddDialog}
              setOpenDialog={setOpenAddDialog}
              takeActionBtn="Add"
              cancelBtn="Cancel"
              takeActionSubmitHandler={addVaultSubmitHandler}
              cancelActionHandler={cancelAddVaultHandler}
            >
              <Grid container item xs={12} justifyContent="space-around">
                <Grid item xs={10} sm={5}>
                  <TextField
                    variant="standard"
                    label="Vault Name"
                    value={vaultName}
                    onChange={(e) => onVaultNameChangeHandler(e)}
                    error={showVaultNameError}
                    helperText={
                      showVaultNameError ? "Vault must have a name!" : ""
                    }
                  />
                </Grid>
                <Grid item xs={10} sm={5}>
                  <TextField
                    variant="standard"
                    label="Vault Sector"
                    value={vaultSector}
                    onChange={(e) => onVaultSectorChangeHandler(e)}
                  />
                </Grid>
              </Grid>
            </DialogForm>
            <Grid container item xs={12} sx={{ mt: 2 }}>
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
              {hasNoVaults && (
                <Typography variant="body2">You have no vaults.</Typography>
              )}
              {!isLoading &&
                loadedVaults &&
                loadedVaults.map((vault) => (
                  <Grid item xs={10} md={9} sx={{ mt: 2 }} key={vault.id}>
                    <VaultItem
                      id={vault.id}
                      vaultName={vault.vault_name}
                      vaultSector={vault.vault_sector}
                    />
                  </Grid>
                ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

export default VaultsList
