import React, { useReducer, useContext } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

import { Container, Grid, Typography, Paper, TextField } from "@mui/material"
import { LoadingButton } from "@mui/lab"
import { useHttpClient } from "../../shared/hooks/http-hook"
import { AuthContext } from "../../shared/context/auth-context"

const initialState = {
  email: "",
  password: "",
  emailError: "",
  passwordError: "",
  showEmailError: false,
  showPasswordError: false,
}

function loginReducer(state, action) {
  switch (action.type) {
    case "form field": {
      return {
        ...state,
        [action.fieldName]: action.payload,
      }
    }
    case "error: account doesn't exist": {
      return {
        ...state,
        emailError: "You don't have an account yet. Sign up instead.",
        showEmailError: true,
      }
    }
    case "error: email empty": {
      return {
        ...state,
        emailError: "Email can't be empty",
        showEmailError: true,
      }
    }
    case "remove email error": {
      return {
        ...state,
        showEmailError: false,
      }
    }
    case "error: incorrect password": {
      return {
        ...state,
        passwordError: "Incorrect Password!",
        showPasswordError: true,
      }
    }
    case "error: insufficient password characters": {
      return {
        ...state,
        passwordError: "Password must contain at least 6 characters",
        showPasswordError: true,
      }
    }
    case "remove password error": {
      return {
        ...state,
        passwordError: "",
        showPasswordError: false,
      }
    }
    default:
      return state
  }
}

const Login = () => {
  const auth = useContext(AuthContext)
  const { isLoading, sendRequest } = useHttpClient()
  const [state, dispatch] = useReducer(loginReducer, initialState)
  const {
    email,
    password,
    emailError,
    passwordError,
    showEmailError,
    showPasswordError,
  } = state

  const loginSubmitHandler = async (event) => {
    event.preventDefault()
    if (password.length < 6 || email.length === 0) {
      if (password.length < 6) {
        dispatch({ type: "error: insufficient password characters" })
      }
      if (email.length === 0) {
        dispatch({ type: "error: email empty" })
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
        dispatch({ type: "error: account doesn't exist" })
      }
      if (err.message === "Incorrect Password") {
        dispatch({ type: "error: incorrect password" })
      }
    }
  }

  const onEmailChangeHandler = (e) => {
    dispatch({
      type: "form field",
      fieldName: "email",
      payload: e.target.value,
    })
    if (email.length + 1 > 0) dispatch({ type: "remove email error" })
  }

  const onPasswordChangeHandler = (e) => {
    dispatch({
      type: "form field",
      fieldName: "password",
      payload: e.target.value,
    })

    if (
      passwordError === "Password must contain at least 6 characters" &&
      password.length + 1 >= 6
    ) {
      dispatch({ type: "remove password error" })
    }
    if (passwordError === "Incorrect Password!") {
      dispatch({ type: "remove password error" })
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
        <Grid
          container
          item
          xs={11}
          sm={8}
          md={5}
          lg={4}
          justifyContent="center"
        >
          <motion.form
            initial={{ opacity: 0, x: "10vw" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            onSubmit={loginSubmitHandler}
          >
            <Paper sx={{ p: "30px", border: "1.5px solid gray" }}>
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
      </Grid>
    </Container>
  )
}

export default Login
