"use client";

import React from "react";
import { Button } from "./ui/button";

interface ExampleButtonProps {
  text: string;
  promptText: string;
  onClick: (text: string) => void;
  className?: string;
}

export function ExampleButton({
  text,
  promptText,
  onClick,
  className,
}: ExampleButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={`bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 active:scale-95 transition-all duration-200 rounded-full backdrop-blur-sm ${
        className || ""
      }`}
      onClick={() => onClick(promptText)}
      type="button"
    >
      {text}
    </Button>
  );
}
