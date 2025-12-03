import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

export const Sheet = SheetPrimitive.Root
export const SheetTrigger = SheetPrimitive.Trigger

export function SheetContent({ side = "right", className, ...props }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <SheetPrimitive.Content
        className={cn(
          "fixed top-0 h-full w-64 bg-white p-6 shadow-lg transition-transform",
          side === "right" ? "right-0" : "left-0",
          className
        )}
        {...props}
      />
    </SheetPrimitive.Portal>
  )
}
