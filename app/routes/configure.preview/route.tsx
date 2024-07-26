import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json, useActionData, useLoaderData } from "@remix-run/react"
import { useEffect } from "react"
import { createCheckoutSession } from "~/.server/checkout"
import { toast } from "~/components/ui/use-toast"
import { getConfiguration } from "~/db/actions"
import { DesignPreview } from "./DesignPreview"
import { ServerError } from "~/.server/server-error"

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    return await createCheckoutSession(request)
  } catch (error) {
    if (error instanceof ServerError) {
      return json({ error: error.message }, { status: error.status })
    } else {
      return json(
        { error: "There was an internal error. Please try again or later." },
        { status: 500 }
      )
    }
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const id = url.searchParams.get("id")

  if (!id) {
    throw new Response("Not found", { status: 404 })
  }

  const configuration = await getConfiguration(id)

  if (!configuration) {
    throw new Response("Not found", { status: 404 })
  }

  return { configuration }
}

export default function ConfigurePreviewPage() {
  const { configuration } = useLoaderData<typeof loader>()
  const previewPageRes = useActionData<typeof action>()

  useEffect(() => {
    if (previewPageRes?.error) {
      toast({
        title: "Something went wrong",
        description: "There was an error on our end. Please try again.",
        variant: "destructive"
      })
    }
  }, [previewPageRes?.error])

  return <DesignPreview configuration={configuration} />
}
