import React from "react"
import { Link } from "react-router-dom"
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Link as MaterialLink,
} from "@mui/material"
import theme from "../../config/theme"

const VaultItem = (props) => {
  return (
    <>
      <Card
        elevation={1}
        onClick={(e) => <Link />}
        className="vaultCard"
        sx={{
          backgroundColor: "transparent",
          border: `2px solid ${theme.palette.primary.main}`,
        }}
      >
        <CardActionArea>
          <MaterialLink
            underline="none"
            component={Link}
            to={`/vaults/${props.id}`}
          >
            <CardContent>
              <Typography
                gutterBottom
                variant="h5"
                fontWeight="fontWeightMedium"
                component="div"
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: {
                    xs: "1.3rem",
                    sm: "1.5rem",
                  },
                }}
              >
                {props.vaultName}
              </Typography>
              <Typography
                variant="body2"
                color="primary"
                fontWeight="fontWeightLight"
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: {
                    xs: "0.8rem",
                    sm: "0.875rem",
                  },
                }}
              >
                {props.vaultSector}
              </Typography>
            </CardContent>
          </MaterialLink>
        </CardActionArea>
      </Card>
    </>
  )
}

export default VaultItem

/*
useLocation:
- gives access to pathname of url: example currently in /vaults
- same as window.location.pathname
- several other properties

useHistory:
- whole bunch of methods: push, state, etc.
*/
