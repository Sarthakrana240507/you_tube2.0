import { Bell, Menu, Mic, Search, User, VideoIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Channeldialogue from "./channeldialogue";
import { useRouter } from "next/router";

// 🔥 FIXED HOOK IMPORT
import { useAuth } from "@/lib/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();  // ✔ now correct
  const [searchQuery, setSearchQuery] = useState("");
  const [isdialogeopen, setisdialogeopen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-background text-foreground dark:text-white">

      {/* LEFT SECTION */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="p-2">
          <Menu className="w-6 h-6" />
        </Button>

        <Link href="/" className="flex items-center gap-1">
          <div className="bg-red-600 p-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <span className="text-xl font-medium">YourTube</span>
          <span className="text-xs text-gray-400 ml-1">IN</span>
        </Link>
      </div>

      {/* SEARCH BAR - Hidden on mobile, shown on md+ */}
      <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 flex-1 max-w-2xl mx-4">
        <div className="flex flex-1">
          <Input
            type="search"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-l-full focus-visible:ring-0 bg-background text-foreground dark:text-white"
          />
          <Button type="submit" className="px-6 bg-background text-foreground dark:text-white border border-l-0 rounded-r-full">
            <Search className="w-5 h-5" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="p-2 rounded-full bg-secondary/50">
          <Mic className="w-5 h-5" />
        </Button>
      </form>

      {/* MOBILE SEARCH ICON */}
      <div className="flex md:hidden items-center gap-2">
        <Button variant="ghost" size="icon" className="p-2">
          <Search className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="p-2">
          <Mic className="w-5 h-5" />
        </Button>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="p-2"
              onClick={() => {
                if (user?.channelname) {
                  router.push(`/channel/${user._id}`);
                } else {
                  setisdialogeopen(true);
                }
              }}
            >
              <VideoIcon className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" className="p-2">
              <Bell className="w-6 h-6" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-64 bg-background text-foreground dark:text-white" align="end" forceMount>
                <div className="flex items-center gap-3 p-3 border-b border-border">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate">{user.name}</span>
                    <span className="text-xs text-gray-500 truncate">{user.email}</span>
                  </div>
                </div>

                {user?.channelname ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/channel/${user._id}`}>Your channel</Link>
                  </DropdownMenuItem>
                ) : (
                  <div className="px-2 py-1.5">
                    <Button variant="ghost" size="sm" className="w-full p-2 justify-start" onClick={() => setisdialogeopen(true)}>
                      Create Channel
                    </Button>
                  </div>
                )}

                <DropdownMenuItem asChild><Link href="/history">History</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/liked">Liked videos</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/watch-later">Watch later</Link></DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-500">Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button
            className="flex items-center gap-2 p-2 bg-background text-foreground dark:text-white"
            onClick={() => {
              if (typeof window !== "undefined") router.push("/login");  // ✔ SSR safe navigation
            }}
          >
            <User className="w-4 h-4" />
            Sign in
          </Button>
        )}
      </div>

      <Channeldialogue isopen={isdialogeopen} onclose={() => setisdialogeopen(false)} mode="create" />
    </header>
  );
};

export default Header;
