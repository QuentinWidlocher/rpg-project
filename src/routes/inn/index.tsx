import { DialogComponent } from "~/components/dialogs/Dialog";
import { Scene, makeDialog } from "~/game/dialog/dialog";
import { shopkeeperInfos } from "../dialog/shop";
import { useFlags } from "~/contexts/flags";
import { useNavigate } from "@solidjs/router";
import { usePlayerStore } from "~/contexts/player";
import { longRest } from "~/game/character/character";
import { Choice } from "~/game/dialog/choices";
import { formatCp, sp } from "~/utils/currency";

export default function Inn() {
  const navigate = useNavigate();
  const { getFlag, setFlag } = useFlags();
  const player = usePlayerStore();

  const cost = sp(5)

  const setDefaultInnDialogConfig = (props => {
    props.setIllustration({
      character: "/characters/innkeeper.webp",
      background: "/backgrounds/inn.png",
    });
  }) satisfies Scene["enterFunction"];

  const restChoice = {
    text: `I'll take a room for tonight (-${formatCp(cost, { style: 'short' })}, rest until tomorrow)`,
    condition: () => player.value.money >= cost ? true : ({ success: false, tooltip: "You don't have enough money." }),
    visibleOnFail: true,
    effect: () => {
      setFlag("npc.inn.restedOnce");

      player.set('money', prev => prev - cost)

      longRest(player);
      alert("You feel well rested.");
      navigate("/map");
    },
  } satisfies Choice;

  return (
    <DialogComponent
      onDialogStop={() => navigate('/map')}
      dialog={makeDialog([
        {
          id: "first-encounter",
          title: () =>
            getFlag("npc.inn.gotName") ? shopkeeperInfos.firstName : "Innkeeper",
          text: () => (
            <>
              <blockquote>Hello there ! What can I do for you ?</blockquote>

              <p>
                A large human greets you from all the way behind the counter. He looks
                tired but jovial.
              </p>
            </>
          ),
          choices: [
            getFlag("npc.inn.restedOnce") == true ? restChoice : undefined,
            {
              text: () => "How much for a room ?",
              effect: props => props.setNext("room"),
              condition: () => getFlag("npc.inn.restedOnce") == false,
            },
            {
              text: () => "Nothing, I was just visiting",
              effect: props => props.setNext("goodbye"),
            },
          ],
          enterFunction: setDefaultInnDialogConfig,
        },
        {
          id: "room",
          text: () => (
            <>
              <blockquote>
                Only {formatCp(cost)} for the night, interested ?
              </blockquote>
            </>
          ),
          choices: [
            restChoice,
            {
              text: () => "No sorry, I'll go now",
              effect: props => props.setNext("goodbye"),
            },
          ],
        },
        {
          id: "goodbye",
          text: () => (
            <>
              <blockquote>Alright then, take care !</blockquote>
            </>
          ),
        },
      ])}
    />
  );
}
