import { LoaderFunctionArgs } from "@remix-run/node"
import { Outlet } from "@remix-run/react"
import { MaxWidthWrapper } from "~/components/MaxWidthWrapper"
import { Steps } from "~/components/Steps"

export const loader = ({ request }: LoaderFunctionArgs) => {
  if (request.url.endsWith("/configure")) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    })
  }

  return null
}

export default function Layout() {
  return (
    <MaxWidthWrapper className="flex-1 flex flex-col">
      <Steps />
      <Outlet />
    </MaxWidthWrapper>
  )
}
