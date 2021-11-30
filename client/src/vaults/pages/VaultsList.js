import React, { useState, useEffect, useContext } from "react"
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

const VaultsList = () => {
  const auth = useContext(AuthContext)
  const { isLoading, sendRequest } = useHttpClient()
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [showVaultNameError, setShowVaultNameError] = useState(false)
  const [vaultName, setVaultName] = useState("")
  const [vaultSector, setVaultSector] = useState("")
  const [loadedVaults, setLoadedVaults] = useState([])
  const [hasNoVaults, setHasNoVaults] = useState(false)

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
          setLoadedVaults(responseData.vaults)
          setHasNoVaults(false)
        }
        if (responseData.message) {
          setHasNoVaults(true)
        }
      } catch (err) {}
    }
    fetchVaults()
  }, [sendRequest, auth.token])

  const addVaultHandler = () => {
    setOpenAddDialog(true)
  }

  const cancelActionHandler = () => {
    setVaultName("")
    setVaultSector("")
    setShowVaultNameError(false)
    setOpenAddDialog(false)
  }

  const addVaultSubmitHandler = async (event) => {
    event.preventDefault()
    if (vaultName.length === 0) {
      setShowVaultNameError(true)
      return
    }
    setHasNoVaults(false)
    try {
      setOpenAddDialog(false)
      setVaultName("")
      setVaultSector("")
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
        setLoadedVaults(responseData.vaults)
        setHasNoVaults(false)
      } catch (err) {}
    })()
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
              cancelActionHandler={cancelActionHandler}
            >
              <Grid container item xs={12} justifyContent="space-around">
                <Grid item xs={10} sm={5}>
                  <TextField
                    variant="standard"
                    label="Vault Name"
                    value={vaultName}
                    onChange={(e) => {
                      if (vaultName.length + 1 > 0) setShowVaultNameError(false)
                      setVaultName(e.target.value)
                    }}
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
                    onChange={(e) => setVaultSector(e.target.value)}
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
