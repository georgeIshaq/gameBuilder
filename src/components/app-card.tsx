"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Trash,
  ExternalLink,
  MoreVertical,
  Play,
  Calendar,
  Gamepad2,
  Sparkles,
  Edit3,
  Eye
} from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteApp } from "@/actions/delete-app";
import { toast } from "sonner";

type AppCardProps = {
  id: string;
  name: string;
  createdAt: Date;
  onDelete?: () => void;
};

export function AppCard({ id, name, createdAt, onDelete }: AppCardProps) {
  const router = useRouter();

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/app/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    await deleteApp(id);
    toast.success("Game deleted successfully");
    if (onDelete) {
      onDelete();
    }
  };

  // Generate a random gradient for each game
  const gradients = [
    "from-purple-500 to-pink-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-green-600",
    "from-orange-500 to-yellow-600",
    "from-red-500 to-pink-600",
    "from-indigo-500 to-purple-600"
  ];
  const gradient = gradients[Math.abs(id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % gradients.length];

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="group relative cursor-pointer">
      {/* Epic glow effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-all duration-500`}></div>
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur-sm opacity-30 group-hover:opacity-60 transition-all duration-500`}></div>

      {/* Main card */}
      <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden group-hover:border-white/30 transition-all duration-500 group-hover:transform group-hover:scale-[1.02] group-hover:-translate-y-1 h-48">

        {/* Card header */}
        <div className="relative p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-xl blur-md opacity-50`}></div>
                <div className={`relative p-3 bg-gradient-to-r ${gradient} rounded-xl shadow-lg`}>
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white truncate group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                  {name || "Untitled Game"}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400">{formatDate(createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Menu button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-lg hover:bg-white/10 focus:outline-none transition-colors opacity-60 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4 text-white" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900/95 backdrop-blur-xl border-white/20">
                <DropdownMenuItem onClick={handleOpen} className="text-white hover:bg-white/10">
                  <Eye className="mr-2 h-4 w-4" />
                  View Game
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpen} className="text-white hover:bg-white/10">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Game
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-400 hover:bg-red-500/20"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient} animate-pulse`}></div>
              <span className="text-xs text-gray-400 font-medium">Ready to play</span>
            </div>
            <Sparkles className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
          </div>
        </div>

        {/* Play button overlay */}
        <Link href={`/app/${id}`} className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-300">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
            <div className={`p-4 bg-gradient-to-r ${gradient} rounded-full shadow-2xl`}>
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
        </Link>

        {/* Subtle animated border */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}></div>
      </div>
    </div>
  );
}
