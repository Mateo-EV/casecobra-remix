import {
  boolean,
  integer,
  numeric,
  pgTable,
  timestamp,
  varchar
} from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { InferSelectModel, relations } from "drizzle-orm"

export enum OrderStatus {
  fulfilled = "fulfilled",
  shipped = "shipped",
  awaiting_shipment = "awaiting_shipment"
}

export enum PhoneModel {
  iphonex = "iphonex",
  iphone11 = "iphone11",
  iphone12 = "iphone12",
  iphone13 = "iphone13",
  iphone14 = "iphone14",
  iphone15 = "iphone15"
}

export enum CaseMaterial {
  silicone = "silicone",
  polycarbonate = "polycarbonate"
}

export enum CaseFinish {
  smooth = "smooth",
  textured = "textured"
}

export enum CaseColor {
  black = "black",
  blue = "blue",
  rose = "rose"
}

const id = varchar("id", { length: 191 })
  .primaryKey()
  .notNull()
  .$defaultFn(() => createId())

export const configurations = pgTable("configuration", {
  id,
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  imageUrl: varchar("imageUrl", { length: 191 }).notNull(),
  color: varchar("color", { length: 20 }).$type<CaseColor>(),
  model: varchar("model", { length: 20 }).$type<PhoneModel>(),
  material: varchar("material", { length: 20 }).$type<CaseMaterial>(),
  finish: varchar("finish", { length: 20 }).$type<CaseFinish>(),
  croppedImageUrl: varchar("croppedImageUrl", { length: 191 })
})

export const configurationsRelations = relations(
  configurations,
  ({ many }) => ({
    orders: many(orders)
  })
)

export type Configuration = InferSelectModel<typeof configurations>

export const orders = pgTable("order", {
  id,
  configurationId: varchar("configurationId", { length: 191 }).notNull(),
  userId: varchar("userId", { length: 191 }).notNull(),
  shippingAddressId: varchar("shippingAddressId", { length: 191 }),
  billingAddressId: varchar("billingAddressId", { length: 191 }),
  amount: numeric("amount", { precision: 8, scale: 2 })
    .$type<number>()
    .notNull(),
  isPaid: boolean("isPaid").notNull().default(false),
  status: varchar("status", { length: 20 })
    .$type<OrderStatus>()
    .notNull()
    .default(OrderStatus.awaiting_shipment),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const ordersRelations = relations(orders, ({ one }) => ({
  configuration: one(configurations, {
    fields: [orders.configurationId],
    references: [configurations.id]
  }),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  }),
  shippingAddress: one(shippingAddresses, {
    fields: [orders.shippingAddressId],
    references: [shippingAddresses.id]
  }),
  billingAddress: one(billingAddresses, {
    fields: [orders.billingAddressId],
    references: [billingAddresses.id]
  })
}))

export type Order = InferSelectModel<typeof orders>

export const users = pgTable("users", {
  id,
  email: varchar("email", { length: 191 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders)
}))

export type User = InferSelectModel<typeof users>

export const shippingAddresses = pgTable("shipping_addresses", {
  id,
  name: varchar("name", { length: 191 }).notNull(),
  street: varchar("street", { length: 191 }).notNull(),
  city: varchar("city", { length: 191 }).notNull(),
  postalCode: varchar("postalCode", { length: 191 }).notNull(),
  country: varchar("country", { length: 191 }).notNull(),
  state: varchar("state", { length: 191 }),
  phoneNumber: varchar("phoneNumber", { length: 191 })
})

export const shippingAddressesRelations = relations(
  shippingAddresses,
  ({ many }) => ({
    orders: many(orders)
  })
)

export type ShippingAddress = InferSelectModel<typeof shippingAddresses>

export const billingAddresses = pgTable("billing_addresses", {
  id,
  name: varchar("name", { length: 191 }).notNull(),
  street: varchar("street", { length: 191 }).notNull(),
  city: varchar("city", { length: 191 }).notNull(),
  postalCode: varchar("postalCode", { length: 191 }).notNull(),
  country: varchar("country", { length: 191 }).notNull(),
  state: varchar("state", { length: 191 }),
  phoneNumber: varchar("phoneNumber", { length: 191 })
})

export const billingAddressesRelations = relations(
  billingAddresses,
  ({ many }) => ({
    orders: many(orders)
  })
)

export type billingAddress = InferSelectModel<typeof billingAddresses>
