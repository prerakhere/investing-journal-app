import { createTheme } from "@mui/material/styles"

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 500,
      md: 800,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    background: {
      default: "#fffbf1",
    },
    primary: {
      light: "#37474f",
      main: "#263238",
      dark: "#263238",
      contrastText: "#fff",
    },
    secondary: {
      light: "#ffecb3",
      main: "#ffe082",
      dark: "#ffd54f",
      contrastText: "#263238",
    },
  },
  typography: {
    fontFamily: "Inter",
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 700,
  },
  shape: {
    borderRadius: 2,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          padding: "10px",
        },
        fullWidth: {
          maxWidth: "300px",
        },
      },
      defaultProps: {
        disableRipple: true,
        variant: "contained",
        color: "primary",
      },
    },
    MuiTextField: {
      defaultProps: {
        InputLabelProps: {
          shrink: true,
          variant: "standard",
          disableAnimation: true,
        },
      },
    },
    MuiCardActionArea: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          "&: hover": {
            background: "#263238",
            color: "#263238",
          },
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          animationDuration: "550ms",
        },
      },
      defaultProps: {
        disableShrink: true,
        thickness: "5",
      },
    },
  },
})

export default theme
