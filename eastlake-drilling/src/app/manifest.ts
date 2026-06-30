import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "East Lake Drilling",
    short_name: "East Lake",
    description:
      "Professional borehole drilling and water solutions in Johannesburg and Gauteng, South Africa.",
    start_url: "/",
    display: "standalone",
    background_color: "#FCFCFC",
    theme_color: "#0089F7",
    icons: [
      {
        src: "/images/favicon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}