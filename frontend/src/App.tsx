import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./store/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import CreatePoll from "./pages/CreatePoll";
import PollDetails from "./pages/PollDetails";
import AdminPolls from "./pages/AdminPolls";
import styles from './App.module.css';

const App = () => {
  return (
    <div className={styles.container}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/polls/new"
              element={
                <PrivateRoute>
                  <CreatePoll />
                </PrivateRoute>
              }
            />
            <Route
              path="/polls/:id"
              element={
                <PrivateRoute>
                  <PollDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminPolls />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
};

export default App;
