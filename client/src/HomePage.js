import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import Typewriter from "typewriter-effect"
import { Grid, Button, Container, Typography } from "@mui/material"
import theme from "./config/theme"

const HomePage = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Container>
        <Grid container>
          <Grid item xs={12} md={10} sx={{ mt: 10 }}>
            <div>
              <Typography
                variant="h1"
                fontWeight="fontWeightBold"
                sx={{
                  fontSize: {
                    xs: "3.5rem",
                    sm: "4rem",
                    md: "4.5rem",
                    lg: "6rem",
                  },
                }}
              >
                Investing Journal
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} md={10} sx={{ mt: 5 }}>
            <div>
              <Typography
                variant="h4"
                fontWeight="fontWeightRegular"
                sx={{
                  fontSize: {
                    xs: "1.1rem",
                    sm: "1.5rem",
                    md: "1.75rem",
                    lg: "2.125rem",
                  },
                }}
              >
                Journal out your wealth creation {String.fromCodePoint(0x1f4dd)}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} md={8} sx={{ mt: "4px" }}>
            <div style={{ minHeight: "90px" }}>
              <Typography
                variant="h4"
                sx={{
                  fontSize: {
                    xs: "1.1rem",
                    sm: "1.5rem",
                    md: "1.75rem",
                    lg: "2.125rem",
                  },
                }}
              >
                <Typewriter
                  options={{
                    strings: [
                      "Know your investments better.",
                      "Create timelined thesis for why you hold the companies you hold.",
                      "Get rid of those buy and sell calls.",
                    ],
                    autoStart: true,
                    deleteSpeed: 2,
                    delay: 30,
                    loop: true,
                  }}
                />
              </Typography>
            </div>
          </Grid>
          <Grid item xs={10} md={6} sx={{ mt: 6 }}>
            <div className="login-btn-div">
              <Button
                component={Link}
                to="/login"
                sx={{
                  background: theme.palette.primary.main,
                  color: "white",
                  width: {
                    xs: "150px",
                    sm: "200px",
                  },
                  fontSize: {
                    xs: "0.9rem",
                    sm: "1.1rem",
                  },
                  textDecoration: "none",
                }}
              >
                Login
              </Button>
            </div>
          </Grid>
        </Grid>
      </Container>
    </motion.section>
  )
}

export default HomePage
