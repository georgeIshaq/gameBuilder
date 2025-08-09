"use client";

import { useRouter } from "next/navigation";
import { PromptInput, PromptInputActions } from "@/components/ui/prompt-input";
import { FrameworkSelector } from "@/components/framework-selector";
import Image from "next/image";
import LogoSvg from "@/logo.svg";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExampleButton } from "@/components/ExampleButton";
import { UserButton } from "@stackframe/stack";
import { UserApps } from "@/components/user-apps";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PromptInputTextareaWithTypingAnimation } from "@/components/prompt-input";
import { Gamepad2, Sparkles, Zap, Rocket } from "lucide-react";

const queryClient = new QueryClient();

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState("phaser");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setIsLoading(true);

    router.push(
      `/app/new?message=${encodeURIComponent(prompt)}&template=${framework}`
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex w-full justify-between items-center p-6">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-purple-400" />
            <h1 className="text-xl font-bold text-white">
              AI Game Forge
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <UserButton />
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main heading with gradient text */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent leading-tight">
              Forge Epic Games
              <br />
              <span className="text-4xl sm:text-5xl md:text-6xl">with AI Magic</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform your ideas into playable HTML5 games instantly. No coding required—just describe your vision and watch it come to life.
            </p>

            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 text-purple-300">
                <Sparkles className="w-5 h-5" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 text-blue-300">
                <Zap className="w-5 h-5" />
                <span>Instant Playable</span>
              </div>
              <div className="flex items-center gap-2 text-pink-300">
                <Rocket className="w-5 h-5" />
                <span>Phaser Engine</span>
              </div>
            </div>

            {/* Game creation input */}
            <div className="w-full max-w-2xl relative">
              <div className="relative w-full overflow-hidden">
                <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl relative z-10 border border-white/20 transition-all duration-300 hover:border-white/30 shadow-2xl">
                  <PromptInput
                    leftSlot={
                      <FrameworkSelector
                        value={framework}
                        onChange={setFramework}
                      />
                    }
                    isLoading={isLoading}
                    value={prompt}
                    onValueChange={setPrompt}
                    onSubmit={handleSubmit}
                    className="relative z-10 border-none bg-transparent shadow-none focus-within:border-white/40 focus-within:ring-1 focus-within:ring-white/30 transition-all duration-200 ease-in-out text-white placeholder:text-gray-300"
                  >
                    <PromptInputTextareaWithTypingAnimation />
                    <PromptInputActions>
                      <Button
                        variant={"ghost"}
                        size="sm"
                        onClick={handleSubmit}
                        disabled={isLoading || !prompt.trim()}
                        className="h-8 text-sm bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-none shadow-lg"
                      >
                        <span className="hidden sm:inline">
                          🎮 Forge Game ⏎
                        </span>
                        <span className="sm:hidden">🎮 Forge ⏎</span>
                      </Button>
                    </PromptInputActions>
                  </PromptInput>
                </div>
              </div>
            </div>

            {/* Game examples */}
            <Examples setPrompt={setPrompt} />
          </div>
        </div>

        {/* User Apps Section */}
        <div className="relative z-10 border-t border-purple-500/20 bg-black/10 backdrop-blur-sm">
          <UserApps />
        </div>
      </main>
    </QueryClientProvider>
  );
}

function Examples({ setPrompt }: { setPrompt: (text: string) => void }) {
  return (
    <div className="mt-8">
      <p className="text-gray-300 text-center mb-4 text-sm">Try these game ideas:</p>
      <div className="flex flex-wrap justify-center gap-3 px-2">
        <ExampleButton
          text="🧛 Vampire Survivors"
          promptText="Create a vampire survivors style game where I control a character that auto-attacks enemies while dodging hordes of monsters. Add weapon upgrades and experience points."
          onClick={(text) => {
            console.log("Example clicked:", text);
            setPrompt(text);
          }}
        />
        <ExampleButton
          text="🏃 Endless Runner"
          promptText="Build an endless runner game where the player jumps over obstacles and collects coins. Make it progressively faster with a score system."
          onClick={(text) => {
            console.log("Example clicked:", text);
            setPrompt(text);
          }}
        />
        <ExampleButton
          text="👾 Space Shooter"
          promptText="Create a space shooter game where I pilot a ship, shoot enemies, and dodge bullets. Add power-ups and boss battles."
          onClick={(text) => {
            console.log("Example clicked:", text);
            setPrompt(text);
          }}
        />
        <ExampleButton
          text="🎯 Reaction Game"
          promptText="Make a simple reaction time game where players click targets as fast as possible. Track high scores and add different challenge modes."
          onClick={(text) => {
            console.log("Example clicked:", text);
            setPrompt(text);
          }}
        />
      </div>
    </div>
  );
}
