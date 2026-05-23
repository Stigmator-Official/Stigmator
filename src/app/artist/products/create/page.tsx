import { redirect } from "next/navigation"

// This page has been consolidated into /artist/garments/create
// Redirecting to maintain backward compatibility
export default function ProductCreateRedirect() {
  redirect("/artist/garments/create")
}
