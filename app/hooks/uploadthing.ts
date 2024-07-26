import { useState } from "react"

type useUploadthingActions = {
  onClientUploadComplete?: (data: Record<string, string | number>) => void
  onUploadProgress?: (p: number) => void
}

export const useUploadthing = (
  url: "/configure/upload?_data=routes/configure.upload",
  { onClientUploadComplete, onUploadProgress }: useUploadthingActions
) => {
  const [isUploading, setIsUploading] = useState(false)

  const startUpload = async (
    acceptedFiles: File[],
    data: Record<string, unknown>
  ) => {
    const formdata = new FormData()
    const [file] = acceptedFiles

    formdata.append("file", file)

    for (const key in data) {
      if (typeof data[key] === "string" || typeof data[key] === "number") {
        formdata.append(key, data[key].toString())
      }
    }

    setIsUploading(true)

    await new Promise((res, rej) => {
      const XHR = new XMLHttpRequest()
      XHR.open("POST", url)
      XHR.addEventListener("readystatechange", async () => {
        if (XHR.readyState == XMLHttpRequest.DONE) {
          onClientUploadComplete?.(JSON.parse(XHR.responseText))
          res(undefined)
        }
      })

      XHR.addEventListener("loadend", () => {
        setIsUploading(false)
        onUploadProgress?.(0)
      })

      XHR.addEventListener("error", () => {
        rej(XHR.responseText)
      })

      XHR.upload.addEventListener("error", () => {
        setIsUploading(false)
        onUploadProgress?.(0)
      })

      if (onUploadProgress) {
        XHR.upload.addEventListener("progress", e => {
          if (e.lengthComputable) {
            onUploadProgress((e.loaded / e.total) * 100)
          }
        })
      }
      XHR.send(formdata)
    })
  }

  return { startUpload, isUploading }
}
