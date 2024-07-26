import { and, eq, type InferInsertModel } from "drizzle-orm"
import {
  billingAddresses,
  configurations,
  orders,
  shippingAddresses,
  users
} from "./schema"
import { db } from "."
import type Stripe from "stripe"
import { createId } from "@paralleldrive/cuid2"

export const createConfiguration = async (
  data: InferInsertModel<typeof configurations>
) => {
  const [res] = await db.insert(configurations).values(data).returning()
  return res
}

export const updateConfiguration = async (
  id: string,
  data: Partial<InferInsertModel<typeof configurations>>
) => {
  const [res] = await db
    .update(configurations)
    .set(data)
    .where(eq(configurations.id, id))
    .returning()
  return res
}

export const getConfiguration = (id: string) =>
  db.query.configurations.findFirst({
    where: eq(configurations.id, id)
  })

export const createOrder = async (data: InferInsertModel<typeof orders>) => {
  const [res] = await db.insert(orders).values(data).returning()
  return res
}

export const updateOrder = async (
  id: string,
  data: Partial<InferInsertModel<typeof orders>>
) => {
  const [res] = await db
    .update(orders)
    .set(data)
    .where(eq(orders.id, id))
    .returning()
  return res
}

export const getOrderByUserAndConfiguration = (
  userId: string,
  configurationId: string
) =>
  db.query.orders.findFirst({
    where: and(
      eq(orders.configurationId, configurationId),
      eq(orders.userId, userId)
    )
  })

export const getUser = (id: string) =>
  db.query.users.findFirst({
    where: eq(users.id, id)
  })

export const createUser = async (data: InferInsertModel<typeof users>) => {
  const [res] = await db.insert(users).values(data).returning()
  return res
}

export const setOrderSessionPaid = ({
  session,
  shippingAddressData,
  billingAddressData,
  orderId
}: {
  session: Stripe.Checkout.Session
  shippingAddressData: Stripe.Address
  billingAddressData: Stripe.Address
  orderId: string
}) => {
  return db.transaction(async tx => {
    const shippingAddressId = createId()
    await tx.insert(shippingAddresses).values({
      id: shippingAddressId,
      name: session.customer_details!.name!,
      city: shippingAddressData.city!,
      country: shippingAddressData.country!,
      postalCode: shippingAddressData.postal_code!,
      street: shippingAddressData.line1!,
      state: shippingAddressData.state
    })

    const billingAddressId = createId()
    await tx.insert(billingAddresses).values({
      id: billingAddressId,
      name: session.customer_details!.name!,
      city: billingAddressData.city!,
      country: billingAddressData.country!,
      postalCode: billingAddressData.postal_code!,
      street: billingAddressData.line1!,
      state: billingAddressData.state
    })

    await tx
      .update(orders)
      .set({ isPaid: true, shippingAddressId, billingAddressId })
      .where(eq(orders.id, orderId))
  })
}
