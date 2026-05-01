"use client";

import { useState } from "react";

import AnnaDemoModal from "./AnnaDemoModal";

type Variant = "primary" | "onDark";

export default function AnnaDemoLauncher({
  label = "Hear Anna pick up",
  variant = "primary",
}: {
  label?: string;
  variant?: Variant;
}) {
  const [open, setOpen] = useState(false);
  const className =
    variant === "onDark"
      ? "btn btn-anna btn-lg btn-anna-onDark"
      : "btn btn-anna btn-lg";

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        <span className="btn-anna-dot" aria-hidden /> {label}
      </button>
      <AnnaDemoModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
