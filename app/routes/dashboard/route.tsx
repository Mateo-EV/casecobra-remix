import { getKindeSession } from "@kinde-oss/kinde-remix-sdk"
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { z } from "zod"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/ui/table"
import {
  getLastMonthTotalAmount,
  getLastWeekTotalAmount,
  getWeeklyOrders,
  updateOrder
} from "~/db/actions"
import { OrderStatus } from "~/db/schema"
import { formatPrice } from "~/utils/price"
import { StatusDropdown } from "./StatusDropdown"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { getUser } = await getKindeSession(request)
  const user = await getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL)
    throw new Response("Not found", { status: 404 })

  const [weeklyOrders, lastWeekSum, lastMonthSum] = await Promise.all([
    getWeeklyOrders(),
    getLastWeekTotalAmount(),
    getLastMonthTotalAmount()
  ])

  return json({
    weeklyOrders,
    lastWeekSum: Number(lastWeekSum),
    lastMonthSum: Number(lastMonthSum)
  })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const validator = z.object({
    id: z.string(),
    status: z.nativeEnum(OrderStatus)
  })

  const formdata = await request.formData()

  const { success, data: order } = validator.safeParse(
    Object.fromEntries(formdata)
  )

  if (!success) {
    throw new Response("Data Invalid", { status: 400 })
  }

  await updateOrder(order.id, { status: order.status })

  return json({ success: true })
}

const WEEKLY_GOAL = 500
const MONTHLY_GOAL = 2500

export default function DashboardPage() {
  const { weeklyOrders, lastWeekSum, lastMonthSum } =
    useLoaderData<typeof loader>()

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <div className="max-w-7xl w-full mx-auto flex flex-col sm:gap-4 sm:py-4">
        <div className="flex flex-col gap-16">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Last Week</CardDescription>
                <CardTitle className="text-4xl">
                  {formatPrice(lastWeekSum)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  of {formatPrice(WEEKLY_GOAL)} goal
                </div>
              </CardContent>
              <CardFooter>
                <Progress value={(lastWeekSum * 100) / WEEKLY_GOAL} />
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Last Month</CardDescription>
                <CardTitle className="text-4xl">
                  {formatPrice(lastMonthSum)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  of {formatPrice(MONTHLY_GOAL)} goal
                </div>
              </CardContent>
              <CardFooter>
                <Progress value={(lastMonthSum * 100) / MONTHLY_GOAL} />
              </CardFooter>
            </Card>
          </div>

          <h1 className="text-4xl font-bold tracking-tight">Incoming orders</h1>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Purchase date
                </TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {weeklyOrders.map(order => (
                <TableRow key={order.id} className="bg-accent">
                  <TableCell>
                    <div className="font-medium">
                      {order.shippingAddress?.name}
                    </div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {order.user.email}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <StatusDropdown id={order.id} orderStatus={order.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(order.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
