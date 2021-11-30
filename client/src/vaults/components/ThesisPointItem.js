import React from "react"
import { Link } from "react-router-dom"
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Link as MaterialLink,
} from "@mui/material"
import AttachmentIcon from "@mui/icons-material/Attachment"
import { makeStyles } from "@mui/styles"
import theme from "../../config/theme"

const useStyles = makeStyles((theme) => ({
  thesisPointCard: {
    [theme.breakpoints.down("sm")]: {
      width: 215,
    },
    [theme.breakpoints.down("500") && theme.breakpoints.up("430")]: {
      width: 270,
    },
    [theme.breakpoints.down("md") && theme.breakpoints.up("sm")]: {
      width: 330,
    },
    [theme.breakpoints.down("lg") && theme.breakpoints.up("md")]: {
      width: 360,
    },
    [theme.breakpoints.down("xl") && theme.breakpoints.up("lg")]: {
      width: 420,
    },
  },
  thesisPointTitle: {
    [theme.breakpoints.down("sm")]: {
      fontSize: 20,
    },
  },
  thesisPointDescription: {
    [theme.breakpoints.down("sm")]: {
      fontSize: 14,
    },
  },
}))

const ThesisPointItem = (props) => {
  const classes = useStyles()
  let {
    id,
    vaultId,
    thesisPointTitle,
    thesisPointDescription,
    thesisPointAttachmentsCount,
  } = props

  if (thesisPointTitle.length > 60) {
    thesisPointTitle = thesisPointTitle.substring(0, 55) + "...."
  }
  if (thesisPointDescription.length > 90) {
    thesisPointDescription = thesisPointDescription.substring(0, 85) + "...."
  }
  let attachments = ""
  if (thesisPointAttachmentsCount > 0) {
    if (thesisPointAttachmentsCount === 1) {
      attachments = `1 attachment`
    } else attachments = `${thesisPointAttachmentsCount} attachments`
  }
  return (
    <MaterialLink
      underline="none"
      component={Link}
      to={`/vaults/${vaultId}/${id}`}
      key={id}
    >
      <Card
        className={classes.thesisPointCard}
        sx={{
          backgroundColor: "transparent",
          border: `2px solid ${theme.palette.primary.main}`,
        }}
        elevation={1}
        onClick={(e) => <Link />}
      >
        <CardActionArea>
          <CardContent>
            <Typography
              className={classes.thesisPointTitle}
              variant="h5"
              sx={{
                color: theme.palette.primary.main,
                fontSize: {
                  xs: "1.25rem",
                  sm: "1.5rem",
                },
              }}
              fontWeight="fontWeightMedium"
            >
              {thesisPointTitle}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.primary.main,
                fontSize: {
                  xs: "0.8rem",
                  sm: "0.875rem",
                },
              }}
              fontWeight="fontWeightLight"
            >
              {thesisPointAttachmentsCount > 0 ? (
                <AttachmentIcon
                  fontSize="small"
                  sx={{ verticalAlign: "bottom", pr: "4px" }}
                />
              ) : (
                ""
              )}
              {attachments}
            </Typography>
            <br />
            <Typography
              className={classes.thesisPointDescription}
              variant="body1"
              sx={{
                fontSize: {
                  xs: "0.9rem",
                  sm: "1rem",
                },
              }}
            >
              {thesisPointDescription}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </MaterialLink>
  )
}

export default ThesisPointItem
