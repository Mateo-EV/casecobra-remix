import { MetaFunction } from "@remix-run/node"

type constructMetadataProps = {
  title?: string
  description?: string
  image?: string
  icons?: string
}

export const constructMetadata = ({
  title = "CaseCobra - Custom High-Quality Phone Cases",
  description = "Create custom high-quality phone cases in seconds",
  image = "/thumbnail.png",
  icons = "/favicon.ico"
}: constructMetadataProps = {}): MetaFunction => {
  return () => [
    {
      title
    },
    { name: "description", content: description },
    {
      property: "og:title",
      content: title
    },
    {
      property: "og:description",
      content: description
    },
    {
      property: "og:image",
      content: image
    },
    {
      name: "twitter:card",
      content: "summary_large_image"
    },
    {
      name: "twitter:title",
      content: title
    },
    {
      name: "twitter:description",
      content: description
    },
    {
      name: "twitter:image",
      content: image
    },
    {
      name: "twitter:creator",
      content: "@Mateo_ballooncr"
    },
    {
      tagName: "link",
      rel: "icon",
      href: icons
    }
  ]
}
