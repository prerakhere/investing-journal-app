import React from "react"
import { AnimatePresence } from "framer-motion"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { GlobalStyles } from "@mui/material"
import theme from "./config/theme"

import { AuthContext } from "./shared/context/auth-context"
import { useAuth } from "./shared/hooks/auth-hook"
import MainNavigation from "./shared/components/navigation/MainNavigation"
import VaultsList from "./vaults/pages/VaultsList"
import VaultPage from "./vaults/pages/VaultPage"
import HomePage from "./HomePage"
import Login from "./users/pages/Login"
import SignUp from "./users/pages/SignUp"
import ThesisPointPage from "./vaults/pages/ThesisPointPage"

const App = () => {
  const { token, login, logout, userId } = useAuth()
  let routes
  if (token) {
    routes = (
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
    )
  } else {
    routes = (
      <AnimatePresence>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/*" element={<Navigate replace to="/" />} />
        </Routes>
      </AnimatePresence>
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
              body: { backgroundColor: theme.palette.background.default },
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
