import { Navigate } from "@solidjs/router";

// This index is used for redirecting the user to the correct page
// @TODO We'll need to implement a way to resume a fight or a dialog
export default function Dialog() {
  return <Navigate href="before-fight" />
}
