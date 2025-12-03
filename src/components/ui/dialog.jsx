import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger

export function DialogContent({
  className,
  overlayClassName,
  hideClose = false,
  unstyled = false,
  children,
  ...props
}) {
  const baseClassName = unstyled
    ? className
    : cn(
        "fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg",
        className
      )

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn("fixed inset-0 bg-black/40 backdrop-blur-sm", overlayClassName)}
      />
      <DialogPrimitive.Content className={baseClassName} {...props}>
        {children}

        {!hideClose && (
          <DialogPrimitive.Close className="absolute right-4 top-4 text-neutral-500 hover:text-neutral-700">
            <X size={18} />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
