import { cn } from "~/lib/shadcn"

type PhoneProps = React.ComponentPropsWithoutRef<"div"> & {
  img: string
  dark?: boolean
}

export const Phone = ({
  img,
  dark = false,
  className,
  ...props
}: PhoneProps) => {
  return (
    <div
      className={cn(
        "relative pointer-events-none z-50 overflow-hidden",
        className
      )}
      {...props}
    >
      <img
        src={
          dark
            ? "/phone-template-dark-edges.png"
            : "/phone-template-white-edges.png"
        }
        alt="phone_image"
      />

      <div className="absolute -z-10 inset-0">
        <img
          className="object-cover min-w-full min-h-full"
          src={img}
          alt="overlaying_phone_image"
        />
      </div>
    </div>
  )
}
