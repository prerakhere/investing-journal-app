import React, { Suspense, lazy } from "react"
import { AnimatePresence } from "framer-motion"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { GlobalStyles } from "@mui/material"
import theme from "./config/theme"

import { AuthContext } from "./shared/context/auth-context"
import { useAuth } from "./shared/hooks/auth-hook"
import MainNavigation from "./shared/components/navigation/MainNavigation"
// import VaultsList from './vaults/pages/VaultsList';
import { CircularProgress } from "@mui/material"
// import VaultPage from './vaults/pages/VaultPage';
// import HomePage from './HomePage';
// import Login from './users/pages/Login';
// import SignUp from './users/pages/SignUp';
// import ThesisPointPage from './vaults/pages/ThesisPointPage';

const HomePage = lazy(() =>
  import(/* webpackChunkName: "Homepage" */ "./HomePage")
)
const Login = lazy(() =>
  import(/* webpackChunkName: "login" */ "./users/pages/Login")
)
const SignUp = lazy(() =>
  import(/* webpackChunkName: "signup" */ "./users/pages/SignUp")
)
const VaultsList = lazy(() =>
  import(/* webpackChunkName: "VaultList" */ "./vaults/pages/VaultsList")
)
const VaultPage = lazy(() =>
  import(/* webpackChunkName: "VaultPage" */ "./vaults/pages/VaultPage")
)
const ThesisPointPage = lazy(() =>
  import(
    /* webpackChunkName: "ThesisPointPage" */ "./vaults/pages/ThesisPointPage"
  )
)

const App = () => {
  const { token, login, logout, userId } = useAuth()
  let routes
  if (token) {
    routes = (
      <Suspense
        fallback={
          <div
            style={{
              display: "flex",
              width: "100vw",
              height: "100vh",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress size={28} style={{ margin: "0 auto" }} />
          </div>
        }
      >
        <Routes>
          <Route path="/vaults" element={<VaultsList />} />
          <Route path="/vaults/new" element={<p>new vault</p>} />
          <Route path="/vaults/:vaultId" element={<VaultPage />} />
          <Route
            path="/vaults/:vaultId/:thesisPointId"
            element={<ThesisPointPage />}
          />
          <Route path="/*" element={<Navigate to="/vaults" />} />
        </Routes>
      </Suspense>
    )
  } else {
    routes = (
      <Suspense fallback={<div></div>}>
        <AnimatePresence>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/*" element={<Navigate replace to="/" />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        login: login,
        logout: logout,
      }}
    >
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <GlobalStyles
            styles={{
              body: {
                backgroundColor: theme.palette.background.default,
              },
            }}
          />
          {token && <MainNavigation />}
          {routes}
        </ThemeProvider>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

export default App
