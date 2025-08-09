"use client";

import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { templates } from "@/lib/templates";

type FrameworkSelectorProps = {
  value?: keyof typeof templates;
  onChange: (value: keyof typeof templates) => void;
  className?: string;
};

export function FrameworkSelector({
  value = "nextjs",
  onChange,
  className,
}: FrameworkSelectorProps) {
  return (
    <div className={cn("relative", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-2 px-2 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 shadow-none backdrop-blur-sm"
            style={{ boxShadow: "none" }}
          >
            <Image
              src={templates[value].logo}
              alt={templates[value].name}
              width={16}
              height={16}
              className="opacity-90"
            />
            {templates[value].name}
            <ChevronDownIcon className="h-3 w-3 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="min-w-[8rem] !shadow-none border border-white/20 bg-gray-900/95 backdrop-blur-md"
          style={{ boxShadow: "none" }}
        >
          {Object.entries(templates).map(([key, template]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => onChange(key)}
              className="gap-2 text-xs text-white hover:bg-white/10 focus:bg-white/10"
            >
              <Image
                src={template.logo}
                alt={template.name}
                width={16}
                height={16}
                className="opacity-90"
              />
              {templates[key].name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
