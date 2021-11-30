import React, { useState, useContext } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

import { Container, Grid, Typography, Paper, TextField } from "@mui/material"
import { LoadingButton } from "@mui/lab"
import { useHttpClient } from "../../shared/hooks/http-hook"
import { AuthContext } from "../../shared/context/auth-context"

const Login = () => {
  const auth = useContext(AuthContext)
  const { isLoading, sendRequest } = useHttpClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showEmailError, setShowEmailError] = useState(false)
  const [showPasswordError, setShowPasswordError] = useState(false)

  const loginSubmitHandler = async (event) => {
    event.preventDefault()
    if (password.length < 6 || email.length === 0) {
      if (password.length < 6) {
        setPasswordError("Password must contain at least 6 characters")
        setShowPasswordError(true)
      }
      if (email.length === 0) {
        setEmailError("Email can't be empty")
        setShowEmailError(true)
      }
      return
    }
    try {
      const responseData = await sendRequest(
        "http://localhost:5004/api/users/login",
        "POST",
        JSON.stringify({
          email: email,
          password: password,
        }),
        {
          "Content-Type": "application/json",
        }
      )
      auth.login(responseData.userId, responseData.token)
    } catch (err) {
      if (err.message === "User not found") {
        setEmailError("You don't have an account yet. Sign up instead.")
        setShowEmailError(true)
      }
      if (err.message === "Incorrect Password") {
        setPasswordError("Incorrect Password!")
        setShowPasswordError(true)
      }
    }
  }

  const onEmailChangeHandler = (e) => {
    setEmail(e.target.value)
    if (email.length + 1 > 0) setShowEmailError(false)
  }

  const onPasswordChangeHandler = (e) => {
    setPassword(e.target.value)
    if (
      passwordError === "Password must contain at least 6 characters" &&
      password.length + 1 >= 6
    ) {
      setPasswordError("")
      setShowPasswordError(false)
    }
    if (passwordError === "Incorrect Password!") {
      setPasswordError("")
      setShowPasswordError(false)
    }
  }
  return (
    <Container>
      <Grid
        container
        style={{ minHeight: "100vh" }}
        alignItems="center"
        justifyContent="center"
      >
        <motion.form
          initial={{ opacity: 0, x: "10vw" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          onSubmit={loginSubmitHandler}
        >
          <Paper style={{ padding: 30, minWidth: 300, maxWidth: 350 }}>
            <Grid
              item
              container
              xs={12}
              alignItems="center"
              justifyContent="center"
            >
              <Grid item xs={12}>
                <div style={{ textAlign: "center" }}>
                  <Typography variant="h4">Login</Typography>
                </div>
              </Grid>
              <Grid item xs={11} sx={{ mt: 5 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  id="email"
                  name="email"
                  value={email}
                  type="email"
                  label="Email"
                  onChange={(e) => onEmailChangeHandler(e)}
                  error={showEmailError}
                  helperText={showEmailError ? emailError : ""}
                />
              </Grid>
              <Grid item xs={11} sx={{ mt: 2 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  id="password"
                  type="password"
                  name="password"
                  label="Password"
                  value={password}
                  onChange={(e) => onPasswordChangeHandler(e)}
                  error={showPasswordError}
                  helperText={showPasswordError ? passwordError : ""}
                />
              </Grid>
              <Grid item xs={12} sx={{ mt: 5 }}>
                <div style={{ textAlign: "center" }}>
                  <LoadingButton
                    style={{ minWidth: 180 }}
                    type="submit"
                    loading={isLoading}
                  >
                    Login
                  </LoadingButton>
                </div>
                <div style={{ textAlign: "center", marginTop: 8 }}>
                  <Link to="/signup">
                    <Typography variant="body2">
                      Don't have an account? Sign up
                    </Typography>
                  </Link>
                </div>
              </Grid>
            </Grid>
          </Paper>
        </motion.form>
      </Grid>
    </Container>
  )
}

export default Login
