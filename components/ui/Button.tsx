import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90", // Use primary color token, text-primary-foreground, and Tailwind's opacity modifier for hover
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground", // Use input border, background, accent tokens
        ghost: "hover:bg-accent hover:text-accent-foreground", // Use accent tokens
        // Add other variants like secondary, destructive, link as needed, using tokens
        // secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-2xl px-md py-sm", // Use spacing tokens: h-10 -> h-2xl, px-4 -> px-md, py-2 -> py-sm
        sm: "h-xl px-base", // Use spacing tokens: h-8 -> h-xl, px-3 -> px-base
        // lg: "h-11 rounded-md px-8", // Example for a larger size using tokens
        icon: "h-2xl w-2xl p-sm", // Use spacing tokens: h-10 -> h-2xl, w-10 -> w-2xl, p-2 -> p-sm
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export * from "./Button"
