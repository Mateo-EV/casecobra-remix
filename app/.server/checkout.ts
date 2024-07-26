import { getKindeSession } from "@kinde-oss/kinde-remix-sdk"
import { redirectDocument } from "@remix-run/react"
import { BASE_PRICE, PRODUCT_PRICES } from "~/config/products"
import {
  createOrder,
  getConfiguration,
  getOrderByUserAndConfiguration
} from "~/db/actions"
import { CaseFinish, CaseMaterial, Order } from "~/db/schema"
import { stripe } from "~/lib/stripe"
import { ServerError } from "./server-error"

export const createCheckoutSession = async (request: Request) => {
  const url = new URL(request.url)
  const id = url.searchParams.get("id")

  if (!id) {
    throw new ServerError("Something went wrong", 400)
  }

  const configuration = await getConfiguration(id)

  if (!configuration) {
    throw new ServerError("Something went wrong", 400)
  }

  const { getUser } = await getKindeSession(request)
  const user = await getUser()

  if (!user) {
    throw new ServerError("You must be logged in", 401)
  }

  const { finish, material } = configuration

  let price = BASE_PRICE
  if (finish === CaseFinish.textured) price += PRODUCT_PRICES.finish.textured
  if (material === CaseMaterial.polycarbonate)
    price += PRODUCT_PRICES.material.polycarbonate

  let order: Order | undefined = undefined

  const existingOrder = await getOrderByUserAndConfiguration(
    user.id,
    configuration.id
  )

  if (existingOrder) {
    order = existingOrder
  } else {
    order = await createOrder({
      amount: price / 100,
      userId: user.id,
      configurationId: configuration.id
    })
  }

  const product = await stripe.products.create({
    name: "Custom iPhoneCase",
    images: [configuration.imageUrl],
    default_price_data: {
      currency: "USD",
      unit_amount: price
    }
  })

  const stripeSession = await stripe.checkout.sessions.create({
    success_url: `${process.env.SERVER_URL}/thank-you?orderId=${order.id}`,
    cancel_url: `${process.env.SERVER_URL}/configure/preview?id=${configuration.id}`,
    payment_method_types: ["card"],
    mode: "payment",
    shipping_address_collection: {
      allowed_countries: ["US"]
    },
    metadata: {
      userId: user.id,
      orderId: order.id
    },
    line_items: [
      {
        price: product.default_price as string,
        quantity: 1
      }
    ]
  })

  if (!stripeSession.url) {
    throw new ServerError("Unable to retrieve payment URL.", 500)
  }

  return redirectDocument(stripeSession.url)
}
