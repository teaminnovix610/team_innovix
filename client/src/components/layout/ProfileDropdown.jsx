import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";

import { User, LogOut, ChevronDown } from "lucide-react";

import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

import * as authService from "../../features/auth/services/auth.service";

export default function ProfileDropdown() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch {}

        logout();
        navigate("/login");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full pr-2 pl-1 py-1 hover:bg-slate-100 transition-colors outline-none">
                <Avatar className="ring-2 ring-slate-200">
                    <AvatarFallback className="bg-blue-600 text-white font-semibold">
                        {user.firstName[0]}
                    </AvatarFallback>
                </Avatar>

                <span className="hidden sm:block text-sm font-medium text-slate-700">
                    {user.firstName}
                </span>

                <ChevronDown size={16} className="hidden sm:block text-slate-400" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}