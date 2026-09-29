import { Navigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import PublicLoadingScreen from "../components/layout/PublicLoadingScreen";

export default function PublicRoute({

    children,

}) {

    const {

        user,

        loading,

    } = useAuth();

    if (loading)

        return <PublicLoadingScreen />;

    if (user)

        return <Navigate to="/dashboard" replace />;

    return children;

}