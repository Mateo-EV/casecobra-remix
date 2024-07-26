import "@fontsource/recursive/latin.css"
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk"
import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node"
import {
  isRouteErrorResponse,
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  useRouteLoaderData
} from "@remix-run/react"
import { Footer } from "./components/Footer"
import { Navbar } from "./components/Navbar"
import { Toaster } from "./components/ui/toaster"
import "./tailwind.css"
import { AuthProvider } from "./providers/AuthProvider"
import { constructMetadata } from "./utils/metadata"

export const meta: MetaFunction = constructMetadata()

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { getUser } = await getKindeSession(request)
  const user = await getUser()

  if (!user) return json({ user: null })

  return json({
    user: { ...user, isAdmin: user.email === process.env.ADMIN_EMAIL }
  })
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root")

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="font-body">
        <AuthProvider user={data?.user || null}>
          <Navbar />
          <main className="flex grainy-light flex-col min-h-[calc(100vh-3.5rem-1px)]">
            <div className="flex-1 flex flex-col h-full">{children}</div>
            <Footer />
          </main>
        </AuthProvider>
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </>
    )
  }

  return <h1>Error!</h1>
}

export default function App() {
  return <Outlet />
}
