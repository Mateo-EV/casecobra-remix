import { ActionFunctionArgs } from "@remix-run/node"
import { useNavigate, useNavigation } from "@remix-run/react"
import {
  ImageIcon,
  Loader2Icon,
  MousePointerSquareDashedIcon
} from "lucide-react"
import { useState } from "react"
import Dropzone, { FileRejection } from "react-dropzone-esm"
import uploadCaseImage from "~/.server/upload-case-image"
import { Progress } from "~/components/ui/progress"
import { toast } from "~/components/ui/use-toast"
import { useUploadthing } from "~/hooks/uploadthing"
import { cn } from "~/lib/shadcn"

export const action = async ({ request }: ActionFunctionArgs) =>
  uploadCaseImage(request)

export default function ConfigureUpload() {
  const [isDragOver, setIsDragOver] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const navigate = useNavigate()
  const navigation = useNavigation()

  const { startUpload, isUploading } = useUploadthing(
    "/configure/upload?_data=routes/configure.upload",
    {
      onClientUploadComplete: data => {
        const configId = data.configId
        navigate(`/configure/design?id=${configId}`, {
          unstable_viewTransition: true
        })
      },
      onUploadProgress(p) {
        setUploadProgress(p)
      }
    }
  )

  const onDropRejected = (rejectedFiles: FileRejection[]) => {
    const [file] = rejectedFiles

    setIsDragOver(false)

    toast({
      title: `${file.file.type} type is not supported.`,
      description: "Please choose a PNG, JPG, or JPEG image instead.",
      variant: "destructive"
    })
  }

  const onDropAccepted = (acceptedFiles: File[]) => {
    startUpload(acceptedFiles, { configId: undefined })

    setIsDragOver(false)
  }

  const isPending = navigation.state === "loading"

  return (
    <div
      className={cn(
        "relative size-full flex-1 my-16 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl flex justify-center flex-col items-center",
        {
          "ring-blue-900/25 bg-blue-900/10": isDragOver
        }
      )}
    >
      <Dropzone
        onDropRejected={onDropRejected}
        onDropAccepted={onDropAccepted}
        accept={{
          "image/png": [".png"],
          "image/jpeg": [".jpeg"],
          "image/jpg": [".jpg"]
        }}
        onDragEnter={() => setIsDragOver(true)}
        onDragLeave={() => setIsDragOver(false)}
      >
        {({ getRootProps, getInputProps }) => (
          <div
            className="h-full w-full flex-1 flex flex-col items-center justify-center"
            {...getRootProps()}
          >
            <input {...getInputProps()} name="file" />
            {isDragOver ? (
              <MousePointerSquareDashedIcon className="size-6 text-zinc-500 mb-2" />
            ) : isUploading || isPending ? (
              <Loader2Icon className="animate-spin size-6 text-zinc-500 mb-2" />
            ) : (
              <ImageIcon className="size-6 text-zinc-500 mb-2" />
            )}
            <div className="flex flex-col justify-center mb-2 text-sm text-zinc-700">
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <p>Uploading...</p>
                  <Progress
                    value={uploadProgress}
                    className="mt-2 w-40 h-2 bg-gray-300"
                  />
                </div>
              ) : isPending ? (
                <div className="flex flex-col items-center">
                  <p>Redirecting, please wait...</p>
                </div>
              ) : isDragOver ? (
                <p>
                  <span className="font-semibold">Drop file</span> to upload
                </p>
              ) : (
                <p>
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
              )}
            </div>

            {isPending ? null : (
              <p className="text-xs text-zinc-500">PNG, JPG, JPEG</p>
            )}
          </div>
        )}
      </Dropzone>
    </div>
  )
}
