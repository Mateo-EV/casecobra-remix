import { cn } from "~/lib/shadcn"

type MaxWidthWrapperProps = React.ComponentPropsWithoutRef<"div">

export const MaxWidthWrapper = ({
  className,
  children,
  ...props
}: MaxWidthWrapperProps) => {
  return (
    <div
      className={cn(
        "h-full mx-auto w-full max-w-screen-xl px-2.5 md:px-20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
