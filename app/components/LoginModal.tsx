import { Link } from "@remix-run/react"
import { buttonVariants } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "./ui/dialog"

type LoginModalProps = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const LoginModal = ({ isOpen, setIsOpen }: LoginModalProps) => {
  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent className="absolute z-[9999999]">
        <DialogHeader>
          <div className="relative mx-auto size-24 mb-2">
            <img
              src="/snake-1.png"
              alt="snake_image"
              className="object-contain size-full"
            />
          </div>
          <DialogTitle className="text-3xl text-center font-bold tracking-tight text-gray-900">
            Log in to continue
          </DialogTitle>
          <DialogDescription className="text-base text-center py-2">
            <span className="font-medium text-zinc-900">
              Your configuration was saved!
            </span>{" "}
            Please login or create an account to complete your purchase.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 divide-x divide-gray-200">
          <Link
            to="/kinde-auth/login"
            className={buttonVariants({ variant: "outline" })}
            reloadDocument
          >
            Login
          </Link>
          <Link
            to="/kinde-auth/register"
            className={buttonVariants({ variant: "default" })}
            reloadDocument
          >
            Sign up
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
