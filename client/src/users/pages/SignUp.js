import React, { useState, useContext } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Container, Grid, Typography, Paper, TextField } from "@mui/material"
import { LoadingButton } from "@mui/lab"
import { useHttpClient } from "../../shared/hooks/http-hook"
import { AuthContext } from "../../shared/context/auth-context"

const SignUp = () => {
  const auth = useContext(AuthContext)
  const { isLoading, sendRequest } = useHttpClient()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [showNameError, setShowNameError] = useState(false)
  const [showPasswordError, setShowPasswordError] = useState(false)
  const [showEmailError, setShowEmailError] = useState(false)

  const signUpSubmitHandler = async (event) => {
    event.preventDefault()
    if (name.length === 0 || password.length < 6 || email.length === 0) {
      if (password.length < 6) setShowPasswordError(true)
      if (name.length === 0) setShowNameError(true)
      if (email.length === 0) {
        setEmailError("Email can't be empty")
        setShowEmailError(true)
      }
      return
    }
    try {
      const responseData = await sendRequest(
        "http://localhost:5004/api/users/signup",
        "POST",
        JSON.stringify({
          name: name,
          email: email,
          password: password,
        }),
        {
          "Content-Type": "application/json",
        }
      )

      auth.login(responseData.userId, responseData.token)
    } catch (err) {
      if (err.message === "User already exists") {
        setEmailError("You have this email registered. Login instead.")
        setShowEmailError(true)
      }
    }
  }
  const onNameChangeHandler = (e) => {
    setName(e.target.value)
    if (name.length + 1 > 0) setShowNameError(false)
  }

  const onEmailChangeHandler = (e) => {
    setEmail(e.target.value)
    if (email.length + 1 > 0) setShowEmailError(false)
  }

  const onPasswordChangeHandler = (e) => {
    setPassword(e.target.value)
    if (password.length + 1 >= 6) setShowPasswordError(false)
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
          onSubmit={signUpSubmitHandler}
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
                  <Typography variant="h4">Sign Up</Typography>
                </div>
              </Grid>
              <Grid item xs={11} sx={{ mt: 5 }}>
                <TextField
                  fullWidth
                  variant="standard"
                  id="name"
                  name="name"
                  value={name}
                  type="text"
                  label="Name"
                  onChange={(e) => onNameChangeHandler(e)}
                  error={showNameError}
                  helperText={showNameError ? "Name can't be empty" : ""}
                />
              </Grid>
              <Grid item xs={11} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  variant="standard"
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
                  fullWidth
                  variant="standard"
                  id="password"
                  type="password"
                  name="password"
                  label="Password"
                  value={password}
                  onChange={(e) => onPasswordChangeHandler(e)}
                  error={showPasswordError}
                  helperText={
                    showPasswordError
                      ? "Password must be at least 6 characters long"
                      : ""
                  }
                />
              </Grid>
              <Grid item xs={12} sx={{ mt: 5 }}>
                <div style={{ textAlign: "center" }}>
                  <LoadingButton
                    style={{ minWidth: 180 }}
                    type="submit"
                    loading={isLoading}
                  >
                    Sign Up
                  </LoadingButton>
                </div>
                <div style={{ textAlign: "center", marginTop: 8 }}>
                  <Link to="/login">
                    <Typography variant="body2">
                      Already have an account? Sign in
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

export default SignUp
