"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// On-brand accent presets — no purple per docs/DESIGN.md.
const PRESETS = [
  "#047857", // emerald (default)
  "#1D4ED8", // blue
  "#0F766E", // teal
  "#B45309", // amber
  "#BE123C", // rose
  "#334155", // slate
];

interface BotFieldsProps {
  defaults?: {
    name?: string;
    welcome_message?: string;
    accent_color?: string;
  };
}

export function BotFields({ defaults }: BotFieldsProps) {
  const [color, setColor] = useState(defaults?.accent_color ?? "#047857");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Bot name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaults?.name}
          placeholder="Client Assistant"
          maxLength={60}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="welcome_message">Welcome message</Label>
        <Textarea
          id="welcome_message"
          name="welcome_message"
          defaultValue={
            defaults?.welcome_message ??
            "Hi! Ask me anything about our services, pricing, or deadlines."
          }
          rows={3}
          maxLength={300}
          required
        />
        <p className="text-xs text-muted-foreground">
          The first thing visitors see when they open the chat.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Accent color</Label>
        <div className="flex items-center gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-label={`Use ${preset}`}
              onClick={() => setColor(preset)}
              className={cn(
                "size-7 rounded-full border transition-transform",
                color.toLowerCase() === preset.toLowerCase()
                  ? "border-ink ring-2 ring-offset-2 ring-offset-background"
                  : "border-border hover:scale-105",
              )}
              style={{ backgroundColor: preset }}
            />
          ))}
          <label className="ml-1 inline-flex cursor-pointer items-center">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="size-7 cursor-pointer rounded-md border border-border bg-transparent p-0"
              aria-label="Custom accent color"
            />
          </label>
        </div>
        <input type="hidden" name="accent_color" value={color} />
      </div>
    </div>
  );
}
