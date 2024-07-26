import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate
} from "@remix-run/react"
import { useEffect } from "react"
import { z } from "zod"
import { getConfiguration, updateConfiguration } from "~/db/actions"
import { CaseColor, CaseFinish, CaseMaterial, PhoneModel } from "~/db/schema"
import { DesignConfigurator } from "./DesignConfigurator"

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

export const action = async ({ request }: ActionFunctionArgs) => {
  const validator = z.object({
    color: z.nativeEnum(CaseColor),
    finish: z.nativeEnum(CaseFinish),
    material: z.nativeEnum(CaseMaterial),
    model: z.nativeEnum(PhoneModel),
    configId: z.string()
  })

  const formdata = await request.formData()

  const { success, data: config } = validator.safeParse(
    Object.fromEntries(formdata)
  )

  if (!success) {
    throw new Response("Data Invalid", { status: 400 })
  }

  const { configId, ...configData } = config

  await updateConfiguration(configId, configData)

  return json({ success: true })
}

export default function ConfigureDesignPage() {
  const {
    configuration: { id, width, height, imageUrl }
  } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigate = useNavigate()

  useEffect(() => {
    if (actionData?.success) {
      navigate(`/configure/preview?id=${id}`, { unstable_viewTransition: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData?.success])

  return (
    <DesignConfigurator
      configId={id}
      imageDimensions={{ width, height }}
      imageUrl={imageUrl}
    />
  )
}
