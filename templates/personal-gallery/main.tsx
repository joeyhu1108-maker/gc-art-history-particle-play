import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PersonalGalleryStarter } from "./PersonalGalleryStarter";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PersonalGalleryStarter />
  </StrictMode>,
);
