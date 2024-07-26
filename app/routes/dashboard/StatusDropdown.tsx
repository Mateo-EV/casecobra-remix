import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { useFetcher } from "react-router-dom"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu"
import { OrderStatus } from "~/db/schema"
import { cn } from "~/lib/shadcn"

const LABEL_MAP: Record<keyof typeof OrderStatus, string> = {
  awaiting_shipment: "Awaiting Shipment",
  fulfilled: "Fulfilled",
  shipped: "Shipped"
}

type StatusDropdownProps = {
  id: string
  orderStatus: OrderStatus
}

export const StatusDropdown = ({ id, orderStatus }: StatusDropdownProps) => {
  const fetcher = useFetcher({ key: `order-status-${id}` })
  const actualStatus =
    (fetcher.formData?.get("status") as OrderStatus) ?? orderStatus

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-52 flex justify-between items-center"
        >
          {LABEL_MAP[actualStatus]}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-0">
        {Object.keys(OrderStatus).map(status => (
          <DropdownMenuItem
            key={status}
            className={cn(
              "flex text-sm gap-1 items-center p-2.5 cursor-default hover:bg-zinc-100",
              {
                "bg-zinc-100": actualStatus === status
              }
            )}
            onClick={() =>
              fetcher.submit(
                { id, status: status as OrderStatus },
                { method: "POST" }
              )
            }
          >
            <CheckIcon
              className={cn(
                "mr-2 h-4 w-4 text-primary",
                actualStatus === status ? "opacity-100" : "opacity-0"
              )}
            />
            {LABEL_MAP[status as OrderStatus]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
