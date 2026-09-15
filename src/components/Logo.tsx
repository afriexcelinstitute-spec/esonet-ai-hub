import { Link } from "@tanstack/react-router";

import logo from "@/assets/esonet-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
  size = "md",
}: {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const heights = { sm: "h-8", md: "h-10", lg: "h-14" };

  return (
    <Link to="/" className={cn("flex items-center gap-3", className)}>
      <img
        src={logo.url}
        alt="Esonet Concept AI Skill Training logo"
        className={cn(heights[size], "w-auto object-contain")}
      />
      {showText && (
        <span className="hidden flex-col leading-tight sm:flex">
          <span className="font-display text-base font-bold tracking-tight">Esonet Concept</span>
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            AI Skill Training
          </span>
        </span>
      )}
    </Link>
  );
}
