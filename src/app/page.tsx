"use client";

import { useRouter } from "next/navigation";
import { PromptInput, PromptInputActions } from "@/components/ui/prompt-input";
import { FrameworkSelector } from "@/components/framework-selector";
import Image from "next/image";
import LogoSvg from "@/logo.svg";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ExampleButton } from "@/components/ExampleButton";
import { UserButton } from "@stackframe/stack";
import { UserApps } from "@/components/user-apps";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PromptInputTextareaWithTypingAnimation } from "@/components/prompt-input";
import {
  Gamepad2,
  Sparkles,
  Zap,
  Rocket,
  Star,
  Crown,
  Sword,
  Shield,
  Gem,
  Wand2,
  Target,
  Trophy,
  Flame,
  Bolt,
  Atom
} from "lucide-react";

const queryClient = new QueryClient();

// Floating particles component
function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      opacity: number;
      type: 'star' | 'circle' | 'triangle';
    }> = [];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: ['#8B5CF6', '#06B6D4', '#EC4899', '#F59E0B', '#10B981'][Math.floor(Math.random() * 5)],
        opacity: Math.random() * 0.8 + 0.2,
        type: ['star', 'circle', 'triangle'][Math.floor(Math.random() * 3)] as 'star' | 'circle' | 'triangle'
      });
    }

    function animate() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;

        if (particle.type === 'circle') {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (particle.type === 'star') {
          drawStar(ctx, particle.x, particle.y, particle.size);
        } else {
          drawTriangle(ctx, particle.x, particle.y, particle.size);
        }

        ctx.restore();
      });

      requestAnimationFrame(animate);
    }

    function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
      const spikes = 5;
      const outerRadius = size;
      const innerRadius = size * 0.5;

      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }

    function drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x - size, y + size);
      ctx.lineTo(x + size, y + size);
      ctx.closePath();
      ctx.fill();
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
}

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
      <main className="min-h-screen relative overflow-hidden">
        {/* Epic Gaming Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {/* Animated grid pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.3)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
          </div>

          {/* Floating particles */}
          <FloatingParticles />

          {/* Epic glowing orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-radial from-purple-500/30 via-pink-500/20 to-transparent rounded-full animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-radial from-cyan-500/30 via-blue-500/20 to-transparent rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-radial from-emerald-500/30 via-green-500/20 to-transparent rounded-full animate-pulse" style={{ animationDelay: '4s' }}></div>
            <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-gradient-radial from-orange-500/30 via-yellow-500/20 to-transparent rounded-full animate-pulse" style={{ animationDelay: '6s' }}></div>
          </div>

          {/* Scanning lines effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent h-2 animate-scan"></div>
        </div>

        {/* Epic Gaming Header */}
        <div className="relative z-10 flex w-full justify-between items-center p-6 backdrop-blur-sm bg-black/10 border-b border-purple-500/20">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg blur-sm opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-cyan-600 p-2 rounded-lg">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                AI GAME FORGE
              </h1>
              <p className="text-xs text-purple-300 font-medium tracking-wider">PROFESSIONAL EDITION</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-purple-300">
              <Crown className="w-4 h-4" />
              <span>Pro Builder</span>
            </div>
            <UserButton />
          </div>
        </div>

        {/* Epic Hero Section */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4">
          <div className="text-center max-w-6xl mx-auto">
            {/* Legendary title with epic effects */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 blur-3xl opacity-30 animate-pulse"></div>
              <h1 className="relative text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-4 leading-none">
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                  FORGE
                </span>
                <span className="block bg-gradient-to-r from-cyan-400 via-emerald-400 to-yellow-400 bg-clip-text text-transparent animate-pulse" style={{ animationDelay: '0.5s' }}>
                  EPIC
                </span>
                <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-pulse" style={{ animationDelay: '1s' }}>
                  GAMES
                </span>
              </h1>

              {/* Epic subtitle with gaming elements */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <Sword className="w-8 h-8 text-purple-400 animate-bounce" />
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                  WITH AI MAGIC
                </span>
                <Shield className="w-8 h-8 text-cyan-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>

            {/* Epic description */}
            <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              <span className="text-purple-400">Transform</span> your wildest gaming ideas into
              <span className="text-cyan-400"> playable masterpieces</span> instantly.
              No coding required—just describe your <span className="text-pink-400">legendary vision</span> and watch it come to life!
            </p>

            {/* Epic feature showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 hover:border-purple-400/50 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <Wand2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg font-bold text-purple-300">AI-Powered</span>
                  </div>
                  <p className="text-gray-400 text-sm">Advanced AI creates games from your imagination</p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-400/50 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                      <Bolt className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg font-bold text-cyan-300">Lightning Fast</span>
                  </div>
                  <p className="text-gray-400 text-sm">Instant playable games in seconds</p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-black/40 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6 hover:border-emerald-400/50 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg">
                      <Atom className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg font-bold text-emerald-300">Phaser Engine</span>
                  </div>
                  <p className="text-gray-400 text-sm">Professional game engine under the hood</p>
                </div>
              </div>
            </div>

            {/* Epic Game Creation Portal */}
            <div className="w-full max-w-4xl mx-auto relative">
              <div className="relative w-full overflow-hidden">
                {/* Epic glowing border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 via-cyan-500 to-emerald-500 rounded-3xl blur-sm opacity-75 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 via-cyan-600 to-emerald-600 rounded-3xl blur-md opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                  {/* Epic header bar */}
                  <div className="bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-cyan-900/50 p-4 border-b border-white/10">
                    <div className="flex items-center justify-center gap-3">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        GAME CREATION STUDIO
                      </span>
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                    </div>
                  </div>

                  <div className="p-8">
                    <PromptInput
                      leftSlot={
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg blur-sm opacity-50"></div>
                          <div className="relative">
                            <FrameworkSelector
                              value={framework}
                              onChange={setFramework}
                            />
                          </div>
                        </div>
                      }
                      isLoading={isLoading}
                      value={prompt}
                      onValueChange={setPrompt}
                      onSubmit={handleSubmit}
                      className="relative z-10 border-none bg-transparent shadow-none focus-within:border-purple-400/50 focus-within:ring-2 focus-within:ring-purple-400/30 transition-all duration-300 text-white placeholder:text-gray-300"
                    >
                      <PromptInputTextareaWithTypingAnimation />
                      <PromptInputActions className="pt-4">
                        <Button
                          variant={"ghost"}
                          size="sm"
                          onClick={handleSubmit}
                          disabled={isLoading || !prompt.trim()}
                          className="relative h-12 px-8 text-sm overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 opacity-100 group-hover:opacity-90 transition-opacity"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <span className="relative z-10 flex items-center gap-2 text-white font-bold">
                            <Flame className="w-4 h-4" />
                            <span className="hidden sm:inline">🎮 FORGE EPIC GAME ⏎</span>
                            <span className="sm:hidden">🎮 FORGE ⏎</span>
                            <Flame className="w-4 h-4" />
                          </span>
                        </Button>
                      </PromptInputActions>
                    </PromptInput>
                  </div>
                </div>
              </div>
            </div>

            {/* Game examples */}
            <div className="mt-16">
              <Examples setPrompt={setPrompt} />
            </div>
          </div>
        </div>

        {/* Epic User Apps Section */}
        <div className="relative z-10 border-t border-purple-500/30 bg-gradient-to-r from-black/20 via-purple-900/20 to-black/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent"></div>
          <div className="relative">
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Gem className="w-6 h-6 text-purple-400 animate-pulse" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  YOUR CREATIONS
                </h2>
                <Gem className="w-6 h-6 text-cyan-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              <p className="text-gray-400">Manage your game collection</p>
            </div>
            <UserApps />
          </div>
        </div>
      </main>
    </QueryClientProvider>
  );
}

function Examples({ setPrompt }: { setPrompt: (text: string) => void }) {
  const examples = [
    {
      icon: "🧛",
      title: "Vampire Survivors",
      subtitle: "Horde Survival",
      prompt: "Create a vampire survivors style game where I control a character that auto-attacks enemies while dodging hordes of monsters. Add weapon upgrades and experience points.",
      gradient: "from-red-500 to-purple-600"
    },
    {
      icon: "🏃",
      title: "Endless Runner",
      subtitle: "Infinite Adventure",
      prompt: "Build an endless runner game where the player jumps over obstacles and collects coins. Make it progressively faster with a score system.",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: "👾",
      title: "Space Shooter",
      subtitle: "Galactic War",
      prompt: "Create a space shooter game where I pilot a ship, shoot enemies, and dodge bullets. Add power-ups and boss battles.",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: "🎯",
      title: "Reaction Game",
      subtitle: "Lightning Reflexes",
      prompt: "Make a simple reaction time game where players click targets as fast as possible. Track high scores and add different challenge modes.",
      gradient: "from-emerald-500 to-green-600"
    },
    {
      icon: "🏰",
      title: "Tower Defense",
      subtitle: "Strategic Defense",
      prompt: "Build a tower defense game where I place defensive towers to stop waves of enemies. Include upgrades and different tower types.",
      gradient: "from-orange-500 to-yellow-600"
    },
    {
      icon: "🧩",
      title: "Puzzle Game",
      subtitle: "Mind Bender",
      prompt: "Create a match-3 puzzle game where players swap tiles to make matches. Add special power-ups and cascading effects.",
      gradient: "from-indigo-500 to-purple-600"
    }
  ];

  return (
    <div className="mt-12">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          GAME TEMPLATES
        </h3>
        <p className="text-gray-400">Choose your adventure:</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
        {examples.map((example, index) => (
          <div
            key={index}
            onClick={() => {
              console.log("Example clicked:", example.prompt);
              setPrompt(example.prompt);
            }}
            className="group relative cursor-pointer"
          >
            {/* Enhanced glow effect */}
            <div className={`absolute -inset-1 bg-gradient-to-r ${example.gradient} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-all duration-500`}></div>
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${example.gradient} rounded-3xl blur-sm opacity-30 group-hover:opacity-60 transition-all duration-500`}></div>

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden group-hover:border-white/30 transition-all duration-500 group-hover:transform group-hover:scale-[1.02] group-hover:-translate-y-2">

              {/* Card header with icon */}
              <div className="relative p-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-r ${example.gradient} rounded-2xl blur-md opacity-50`}></div>
                    <div className={`relative text-4xl p-4 bg-gradient-to-r ${example.gradient} rounded-2xl shadow-2xl`}>
                      {example.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                      {example.title}
                    </h4>
                    <p className={`text-sm font-medium bg-gradient-to-r ${example.gradient} bg-clip-text text-transparent`}>
                      {example.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card content */}
              <div className="px-6 pb-6">
                <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                  {example.prompt.substring(0, 120)}...
                </p>

                {/* Action area */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${example.gradient} animate-pulse`}></div>
                    <span className="text-xs text-gray-500 font-medium">Ready to build</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 group-hover:text-white transition-colors">
                    <span className="text-xs font-medium">Create</span>
                    <div className={`p-1.5 rounded-lg bg-gradient-to-r ${example.gradient} opacity-70 group-hover:opacity-100 transition-opacity`}>
                      <Target className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtle animated border */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${example.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
