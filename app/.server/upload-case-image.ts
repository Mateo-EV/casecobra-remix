import {
  json,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData
} from "@remix-run/node"
import sharp from "sharp"
import { createConfiguration, updateConfiguration } from "~/db/actions"
import { utapi } from "~/lib/uploadthing"

export default async function uploadCaseImage(request: Request) {
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 4 * 1024 * 1024
  })

  const formData = await unstable_parseMultipartFormData(request, uploadHandler)
  const file = formData.get("file")
  const configId = formData.get("configId")

  if (!file || !(file instanceof File)) {
    throw new Response("Invalid file", { status: 400 })
  }

  const fileData = await utapi.uploadFiles(file)

  if (!fileData.data) {
    throw new Response("Something went wrong", { status: 500 })
  }

  const { width, height } = await sharp(await file.arrayBuffer()).metadata()

  if (!configId || typeof configId !== "string") {
    const configuration = await createConfiguration({
      imageUrl: fileData.data.url,
      height: height || 500,
      width: width || 500
    })

    return json({ configId: configuration.id })
  } else {
    const updatedConfiguration = await updateConfiguration(configId, {
      croppedImageUrl: fileData.data.url
    })

    return json({ configId: updatedConfiguration.id })
  }
}
