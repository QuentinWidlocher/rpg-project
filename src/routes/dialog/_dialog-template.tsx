import { DialogComponent } from "~/components/dialogs/Dialog";
import { makeDialog } from "~/game/dialog/dialog";

export default function Dialog() {
	return <DialogComponent dialog={makeDialog([])} />;
}
