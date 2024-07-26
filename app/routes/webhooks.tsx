import { ActionFunctionArgs, json } from "@remix-run/node"
import type Stripe from "stripe"
import { setOrderSessionPaid } from "~/db/actions"
import { stripe } from "~/lib/stripe"
import { Resend } from "resend"
import OrderReceivedEmail from "~/components/email/OrderReceivedEmail"

const resend = new Resend()

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const body = await request.text()

    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return new Response("Invalid signature", { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === "checkout.session.completed") {
      if (!event.data.object.customer_details?.email) {
        throw new Error("Missing user email")
      }

      const session = event.data.object as Stripe.Checkout.Session

      const { userId, orderId } = session.metadata || {
        userId: null,
        orderId: null
      }

      if (!userId || !orderId) {
        throw new Error("Invalid request metadata")
      }

      const billingAddressData = session.customer_details!.address!
      const shippingAddressData = session.shipping_details!.address!

      const updatedOrder = await setOrderSessionPaid({
        session,
        orderId,
        billingAddressData,
        shippingAddressData
      })

      await resend.emails.send({
        from: "CaseCobra <riojamatthew@gmail.com>",
        to: event.data.object.customer_details.email,
        subject: "Thanks for your order!",
        react: OrderReceivedEmail({
          orderId,
          orderDate: updatedOrder.createdAt.toLocaleDateString(),
          shippingAddress: updatedOrder.shippingAddress
        })
      })
    }

    return json({ result: event, ok: true })
  } catch (error) {
    console.error(error)
    return json({ message: "Something went wrong" }, { status: 500 })
  }
}
