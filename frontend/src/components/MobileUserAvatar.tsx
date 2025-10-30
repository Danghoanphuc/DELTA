// frontend/src/components/MobileUserAvatar.tsx
import Logout from "./auth/Logout";
import { Settings } from "lucide-react";
import UserAvatarFallback from "@/components/UserAvatarFallback";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/components/ui/popover";
import { Link } from "react-router-dom";

export function MobileUserAvatar() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="lg:hidden fixed top-4 left-4 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <button className="w-10 h-10 rounded-full overflow-hidden shadow-lg hover:ring-blue-400 transition-all focus:outline-none ">
            <UserAvatarFallback
              name={user?.displayName || user?.username || "G"}
              size={40}
              bgColor="bg-indigo-100"
              textColor="text-indigo-600"
              src={user?.avatarUrl}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="start"
          className="w-60 p-4 rounded-2xl shadow-xl bg-white border border-gray-100 mt-2"
          sideOffset={8}
        >
          <div className="flex items-center space-x-3 mb-4 border-b pb-3">
            <UserAvatarFallback
              name={user?.displayName || user?.username || "G"}
              size={40}
              bgColor="bg-indigo-100"
              textColor="text-indigo-600"
              src={user?.avatarUrl}
            />
            <div className="flex-1 min-w-0">
              <p
                className="font-semibold text-sm truncate"
                title={user?.displayName}
              >
                {user?.displayName || user?.username}
              </p>
              <p className="text-xs text-gray-500 truncate" title={user?.email}>
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <Link
              to="/settings"
              className="text-left text-sm px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Settings size={16} />
              Cài đặt tài khoản
            </Link>
            <hr className="my-1 border-gray-200" />
            <Logout />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
