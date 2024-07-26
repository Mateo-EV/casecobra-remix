import { and, desc, eq, gte, sum, type InferInsertModel } from "drizzle-orm"
import type Stripe from "stripe"
import { db } from "."
import {
  billingAddresses,
  configurations,
  orders,
  shippingAddresses,
  users
} from "./schema"

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

export const getOrderData = (id: string, userId: string) =>
  db.query.orders.findFirst({
    where: and(eq(orders.id, id), eq(orders.userId, userId)),
    with: {
      billingAddress: true,
      configuration: true,
      shippingAddress: true
    }
  })

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

export const setOrderSessionPaid = async ({
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
    const [shippingAddressCreated] = await tx
      .insert(shippingAddresses)
      .values({
        name: session.customer_details!.name!,
        city: shippingAddressData.city!,
        country: shippingAddressData.country!,
        postalCode: shippingAddressData.postal_code!,
        street: shippingAddressData.line1!,
        state: shippingAddressData.state
      })
      .returning()

    const [billingAddressCreated] = await tx
      .insert(billingAddresses)
      .values({
        name: session.customer_details!.name!,
        city: billingAddressData.city!,
        country: billingAddressData.country!,
        postalCode: billingAddressData.postal_code!,
        street: billingAddressData.line1!,
        state: billingAddressData.state
      })
      .returning()

    const [orderUpdated] = await tx
      .update(orders)
      .set({
        isPaid: true,
        shippingAddressId: shippingAddressCreated.id,
        billingAddressId: billingAddressCreated.id
      })
      .where(eq(orders.id, orderId))
      .returning()

    return {
      ...orderUpdated,
      shippingAddress: shippingAddressCreated,
      billingAddress: billingAddressCreated
    }
  })
}

export const getWeeklyOrders = () => {
  return db.query.orders.findMany({
    where: and(
      eq(orders.isPaid, true),
      gte(
        orders.createdAt,
        new Date(new Date().setDate(new Date().getDate() - 7))
      )
    ),
    orderBy: [desc(orders.createdAt)],
    with: {
      user: true,
      shippingAddress: true
    }
  })
}

export const getLastWeekTotalAmount = async () => {
  const [res] = await db
    .select({ sum: sum(orders.amount) })
    .from(orders)
    .where(
      and(
        eq(orders.isPaid, true),
        gte(
          orders.createdAt,
          new Date(new Date().setDate(new Date().getDate() - 7))
        )
      )
    )

  return res.sum
}

export const getLastMonthTotalAmount = async () => {
  const [res] = await db
    .select({ sum: sum(orders.amount) })
    .from(orders)
    .where(
      and(
        eq(orders.isPaid, true),
        gte(
          orders.createdAt,
          new Date(new Date().setDate(new Date().getDate() - 30))
        )
      )
    )

  return res.sum
}
