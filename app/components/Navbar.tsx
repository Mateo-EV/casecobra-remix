import { Link } from "@remix-run/react"
import { MaxWidthWrapper } from "./MaxWidthWrapper"
import { buttonVariants } from "./ui/button"
import { ArrowRightIcon } from "lucide-react"
import { type KindeUser } from "@kinde-oss/kinde-remix-sdk/types"

type NavbarProps = {
  user: (KindeUser & { isAdmin: boolean }) | null
}

export const Navbar = ({ user }: NavbarProps) => {
  return (
    <nav className="sticky z-50 h-14 inset-x-0 top-0 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link
            to="/"
            className="flex z-40 font-semibold"
            unstable_viewTransition
            prefetch="viewport"
          >
            case <span className="text-green-600">cobra</span>
          </Link>

          <div className="h-full flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/kinde-auth/logout"
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                  reloadDocument
                >
                  Sign out
                </Link>
                {user.isAdmin ? (
                  <Link
                    to="/dashboard"
                    className={buttonVariants({ size: "sm", variant: "ghost" })}
                  >
                    Dashboard ✨
                  </Link>
                ) : null}
                <Link
                  to="/configure/upload"
                  className={buttonVariants({
                    size: "sm",
                    className: "hidden sm:flex items-center gap-1"
                  })}
                >
                  Create case
                  <ArrowRightIcon className="ml-1.5 size-5" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/kinde-auth/register"
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                  reloadDocument
                >
                  Sign up
                </Link>
                <Link
                  to="/kinde-auth/login"
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                  reloadDocument
                >
                  Login
                </Link>

                <div className="h-8 w-px bg-zinc-200 hidden sm:block" />

                <Link
                  to="/configure/upload"
                  unstable_viewTransition
                  prefetch="viewport"
                  className={buttonVariants({
                    size: "sm",
                    className: "hidden sm:flex items-center gap-1"
                  })}
                >
                  Create case
                  <ArrowRightIcon className="ml-1.5 size-5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  )
}
