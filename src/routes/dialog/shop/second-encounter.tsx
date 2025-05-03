import { DialogComponent } from "~/components/dialogs/Dialog";
import { setDefaultShopDialogConfig, shopkeeperInfos } from ".";
import { useNavigate } from "@solidjs/router";
import { useFlags } from "~/contexts/flags";
import { makeDialog } from "~/game/dialog/dialog";

export default function ShopSecondEncounterDialog() {
  const navigate = useNavigate();
  const { getFlag } = useFlags();

  return (
    <DialogComponent
      dialog={makeDialog([
        {
          id: "second-encounter",
          title: () =>
            getFlag("npc.shopkeeper.gotName")
              ? shopkeeperInfos.firstName
              : "Shopkeeper",
          text: () => (
            <blockquote>
              Hi again !<br />
              What can I do for you today ?
            </blockquote>
          ),
          enterFunction: setDefaultShopDialogConfig,
        },
        {
          text: () => <pre>The shop is under development</pre>,
        },
      ])}
      onDialogStop={() => navigate("/map")}
    />
  );
}
