import { type ButtonHTMLAttributes } from "react";
import { cn } from "../utils";

const variants = {
  primary: "bg-blue-500 text-white hover:bg-blue-600",
  secondary: "bg-zinc-800 text-white hover:bg-zinc-700",
  ghost: "border border-zinc-800 text-zinc-200 hover:bg-zinc-900"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export const Button = ({ className, variant = "primary", ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
