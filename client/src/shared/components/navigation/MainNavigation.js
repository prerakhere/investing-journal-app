import React, { useContext } from "react"
import { AppBar, Box, Toolbar, Typography, Button, Grid } from "@mui/material"
import { AuthContext } from "../../context/auth-context"
import theme from "../../../config/theme"
import { makeStyles } from "@mui/styles"

const useStyles = makeStyles((theme) => ({
  toolbarWrapper: {
    "&.MuiToolbar-gutters": {
      paddingLeft: "10px",
      paddingRight: "10px",
    },
  },
}))
const MainNavigation = () => {
  const classes = useStyles()
  const auth = useContext(AuthContext)
  return (
    <>
      {/* <MainHeader>
        <nav className="main-navigation__header-nav">
          <NavLinks />
        </nav>
      </MainHeader> */}
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="sticky" sx={{ boxShadow: "0px 0px 0px 0px" }}>
          <Toolbar className={classes.toolbarWrapper}>
            <Grid container justifyContent="center">
              <Grid
                container
                item
                xs={12}
                md={11}
                justifyContent="space-between"
              >
                <Grid item>
                  <Typography
                    variant="h5"
                    fontWeight="fontWeightMedium"
                    component="div"
                    sx={{ flexGrow: 1, mt: "3px" }}
                  >
                    Investing Journal
                  </Typography>
                </Grid>
                <Grid item>
                  <Button
                    sx={{
                      color: theme.palette.background.default,
                      border: `1px solid ${theme.palette.background.default}`,
                      p: 1,
                      fontSize: "0.8rem",
                    }}
                    onClick={auth.logout}
                  >
                    LOGOUT
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
      </Box>
    </>
  )
}

export default MainNavigation
