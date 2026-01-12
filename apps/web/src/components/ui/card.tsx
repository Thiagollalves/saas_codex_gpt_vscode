import { type HTMLAttributes } from "react";
import { cn } from "../utils";

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
      className
    )}
    {...props}
  />
);
