import { getKindeSession } from "@kinde-oss/kinde-remix-sdk"
import { json, LoaderFunctionArgs } from "@remix-run/node"
import { getOrderData } from "~/db/actions"
import { ThankYou } from "./ThankYou"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const orderId = url.searchParams.get("orderId")

  if (!orderId) {
    throw new Response("Not found", { status: 404 })
  }

  const { getUser } = await getKindeSession(request)
  const user = await getUser()

  if (!user?.id || !user.email) {
    throw new Response("Not found", { status: 404 })
  }

  const order = await getOrderData(orderId, user.id)

  if (!order) throw new Response("Not found", { status: 404 })

  if (order.isPaid) {
    return json({ order })
  } else {
    return json({ order: null })
  }
}

export default function ThankYouPage() {
  return <ThankYou />
}
