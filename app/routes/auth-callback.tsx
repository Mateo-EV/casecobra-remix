import { getKindeSession } from "@kinde-oss/kinde-remix-sdk"
import { LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect, useNavigate } from "@remix-run/react"
import { Loader2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { createUser, getUser as getUserFromDb } from "~/db/actions"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { getUser } = await getKindeSession(request)
  const user = await getUser()

  if (!user?.id || !user.email) {
    return redirect("/")
  }

  const existingUser = await getUserFromDb(user.id)

  if (!existingUser) {
    await createUser({
      id: user.id,
      email: user.email
    })
  }

  return json({ auth_callback_success: true })
}

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [configId, setConfigId] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    const configurationId = localStorage.getItem("configurationId")
    setConfigId(configurationId)
  }, [])

  useEffect(() => {
    if (configId) {
      localStorage.removeItem("configurationId")
      navigate(`/configure/preview?id=${configId}`)
    } else {
      navigate("/")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configId])

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2Icon className="size-8 animate-spin text-zinc-500" />
        <h3 className="font-semibold text-xl">Logging you in...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  )
}
