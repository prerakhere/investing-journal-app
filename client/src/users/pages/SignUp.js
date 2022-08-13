import React, { useReducer, useContext } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Container, Grid, Typography, Paper, TextField } from "@mui/material"
import { LoadingButton } from "@mui/lab"
import { useHttpClient } from "../../shared/hooks/http-hook"
import { AuthContext } from "../../shared/context/auth-context"

const initialState = {
  name: "",
  email: "",
  password: "",
  nameError: "",
  emailError: "",
  passwordError: "",
  showNameError: "",
  showEmailError: false,
  showPasswordError: false,
}

function signUpReducer(state, action) {
  switch (action.type) {
    case "form field": {
      return {
        ...state,
        [action.fieldName]: action.payload,
      }
    }
    case "error: name empty": {
      return {
        ...state,
        nameError: "Name can't be empty",
        showNameError: true,
      }
    }
    case "remove name error": {
      return {
        ...state,
        showNameError: false,
      }
    }
    case "error: account already exists": {
      return {
        ...state,
        emailError: "You already have an account. Login instead.",
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

const SignUp = () => {
  const auth = useContext(AuthContext)
  const { isLoading, sendRequest } = useHttpClient()
  const [state, dispatch] = useReducer(signUpReducer, initialState)
  const {
    name,
    email,
    password,
    nameError,
    emailError,
    passwordError,
    showNameError,
    showEmailError,
    showPasswordError,
  } = state

  const signUpSubmitHandler = async (event) => {
    event.preventDefault()
    if (name.length === 0 || password.length < 6 || email.length === 0) {
      if (name.length === 0) dispatch({ type: "error: name empty" })
      if (email.length === 0) dispatch({ type: "error: email empty" })
      if (password.length < 6)
        dispatch({ type: "error: insufficient password characters" })
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
        dispatch({ type: "error: account already exists" })
      }
    }
  }
  const onNameChangeHandler = (e) => {
    dispatch({
      type: "form field",
      fieldName: "name",
      payload: e.target.value,
    })
    if (name.length + 1 > 0) dispatch({ type: "remove name error" })
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
    if (password.length + 1 >= 6) dispatch({ type: "remove password error" })
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
            onSubmit={signUpSubmitHandler}
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
                    helperText={showNameError ? nameError : ""}
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
      </Grid>
    </Container>
  )
}

export default SignUp
