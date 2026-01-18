import {
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  History,
  User,
  Library,
  Youtube,
  Settings,
  Flag,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Channeldialogue from "./channeldialogue";
import { useAuth } from "@/lib/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();
  const [isdialogeopen, setisdialogeopen] = useState(false);

  return (
    <aside className="hidden lg:block w-64 h-[calc(100vh-56px)] overflow-y-auto p-2 bg-background text-foreground border-r border-border sticky top-14 custom-scrollbar">
      <nav className="space-y-1">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start text-foreground bg-secondary/50 font-bold">
            <Home className="w-5 h-5 mr-3 text-red-600" />
            Home
          </Button>
        </Link>

        <Link href="/explore">
          <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-secondary/80">
            <Compass className="w-5 h-5 mr-3" />
            Explore
          </Button>
        </Link>

        <Link href="/subscriptions">
          <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-secondary/80">
            <PlaySquare className="w-5 h-5 mr-3" />
            Subscriptions
          </Button>
        </Link>

        <div className="border-t border-border mt-4 pt-4 mb-2 px-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 pb-2">You</h3>
          <Link href="/history">
            <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-secondary/80">
              <History className="w-5 h-5 mr-3" />
              History
            </Button>
          </Link>

          <Link href="/downloads">
            <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-secondary/80">
              <Clock className="w-5 h-5 mr-3" />
              Downloads
            </Button>
          </Link>

          {user && (
            <>
              <Link href="/liked">
                <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-secondary/80">
                  <ThumbsUp className="w-5 h-5 mr-3" />
                  Liked videos
                </Button>
              </Link>

              <Link href="/watch-later">
                <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-secondary/80">
                  <Clock className="w-5 h-5 mr-3" />
                  Watch later
                </Button>
              </Link>

              {user?.channelname ? (
                <Link href={`/channel/${user._id}`}>
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-secondary/80">
                    <User className="w-5 h-5 mr-3" />
                    Your channel
                  </Button>
                </Link>
              ) : (
                <div className="px-2 py-4">
                  <p className="text-xs text-muted-foreground mb-3">Create your own channel to start uploading.</p>
                  <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary/5 font-bold" onClick={() => setisdialogeopen(true)}>
                    Create Channel
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t border-border mt-4 pt-4 px-3 space-y-1">
          <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-secondary/80">
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-secondary/80">
            <Flag className="w-5 h-5 mr-3" />
            Report
          </Button>
          <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-secondary/80">
            <HelpCircle className="w-5 h-5 mr-3" />
            Help
          </Button>
        </div>
      </nav>

      <Channeldialogue isopen={isdialogeopen} onclose={() => setisdialogeopen(false)} mode="create" />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>
    </aside>
  );
};

export default Sidebar;
