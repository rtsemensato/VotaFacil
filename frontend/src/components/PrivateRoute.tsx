import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    return <>{children}</>;
};

export default PrivateRoute; 