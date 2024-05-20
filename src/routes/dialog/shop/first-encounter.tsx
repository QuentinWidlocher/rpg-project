import { DialogComponent } from "~/components/dialogs/Dialog";
import { setDefaultShopDialogConfig, shopkeeperInfos } from ".";
import { createStore } from "solid-js/store";
import { useFlags } from "~/contexts/flags";
import { PartialDialog, makeDialog } from "~/game/dialog/dialog";

export default function ShopKeeperFirstEncounterDialog() {
  const [state, setState] = createStore<Partial<{ waited: boolean }>>({})
  const { getFlag, setFlag } = useFlags()

  return <DialogComponent dialog={makeDialog([
    {
      id: 'first-encounter',
      title: () => getFlag('npc.shopkeeper.gotName') ? shopkeeperInfos.firstName : "Shopkeeper",
      text: () => (<>
        <p>Facing you is a female dwarf with dense, frizzy hairs(including her beard).</p>
        <p>She doesn't seem to have noticed you yet, as she's busy organizing shelves and updating her inventory. </p>
      </>),
      choices: [
        { text: () => "*Feign cough*" },
        { text: () => '"Excuse me ?"' }
      ],
      enterFunction: setDefaultShopDialogConfig
    },
    {
      text: () => (<>
        <blockquote>OH !</blockquote>

        <p>She jumps and quickly turns to face you</p>

        <blockquote>
          Sorry here !<br /> You surprised me, I was so absorbed in my work I didn't hear you coming in.<br />
          Where you waiting here for a long time ?
        </blockquote>
      </>),
      choices: [
        { text: () => "Not at all", effect: () => setState('waited', false) },
        { text: () => "Actually yes", effect: () => setState('waited', true) }
      ],
    },
    {
      id: "questions-about-services",
      text: () => (<>
        <p>She looks {state.waited ? 'worried.' : 'relieved'}</p>

        <blockquote>
          {state.waited ? 'Oh my gods, sorry for that...' : 'Phew !'}<br />
          By the way, name's {shopkeeperInfos.firstName}. <br />
          Tell me, what can I do for you ?
        </blockquote>
      </>),
      choices: [
        { text: () => "I need to buy supplies", effect: (props) => props.setNext('buy-explanation') },
        { text: () => "I need to sell stuff", effect: (props) => props.setNext('sell-explanation') }
      ],
      enterFunction: () => setFlag('npc.shopkeeper.gotName')
    },
    {
      id: "buy-explanation",
      enterFunction: (props) => {
        if (props.isFrom('sell-explanation')) {
          props.setNext('after-explanations')
        }
      },
      text: (props) => <>
        <blockquote>
          {props.isFrom('questions-about-services') ? 'Of course !' : 'But you can also buy things.'}<br />
          You can find everything you need here !
        </blockquote>

        <p>She marks {props.isFrom('sell-explanation') ? 'another' : 'a'} short pause.</p>

        <blockquote>
          I mean, *almost* everything haha
        </blockquote>
      </>,
    },
    {
      id: "sell-explanation",
      enterFunction: (props) => {
        if (!props.isFrom('buy-explanation')) {
          props.setNext('buy-explanation')
        }
      },
      text: (props) => <>
        <blockquote>
          {props.isFrom('questions-about-services') ? 'Of course !' : 'But you can also sell me things.'}<br />
          I buy pretty much anything from adventurers.
        </blockquote>

        <p>
          She marks {props.isFrom('buy-explanation') ? 'another' : 'a'} short pause.
        </p>

        <blockquote><em>Almost</em> everything</blockquote>

        <p>She grins.</p>
      </>,
    },
    {
      id: "after-explanations",
      text: () => <>
        <blockquote>Anyway, let me now if you need anything !</blockquote>
        {state.waited ? <blockquote>And sorry again for earlier.</blockquote> : null}
      </>,
      exitFunction: () => setFlag('npc.shopkeeper.greeted')
    }
  ])} />
}
