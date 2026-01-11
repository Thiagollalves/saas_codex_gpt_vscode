import { type HTMLAttributes } from "react";
import { cn } from "../utils";

export const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("animate-pulse rounded-xl bg-zinc-800/60", className)}
    {...props}
  />
);
