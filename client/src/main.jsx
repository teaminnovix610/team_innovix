import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import AuthProvider from "./context/AuthContext";

import App from "./App";
import "./index.css";

import queryClient from "./lib/queryClient";

ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>

    <App />

</AuthProvider>
        </QueryClientProvider>
    </BrowserRouter>
);