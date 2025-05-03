import { makePersisted } from "@solid-primitives/storage";
import { at } from "lodash-es";
import { ParentProps, createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { Leaves } from "~/utils/types";

export type Flags = Partial<{
  act0: {
    helpedTheOldMan: boolean;
    defeatedTheBandit: boolean;
  };
  cutscene: {
    intro: boolean;
    act0: boolean;
    arena: boolean;
  };
  npc: {
    shopkeeper: {
      greeted: boolean;
      gotName: boolean;
    };
    inn: {
      greeted: boolean;
      gotName: boolean;
      restedOnce: boolean;
    };
  };
}>;

export type FlagName = Leaves<Flags> & {};

export type FlagsContext = {
  getFlag: (flagName: FlagName) => boolean;
  setFlag: (flagName: FlagName, value?: boolean) => void;
};

export const FlagsContext = createContext<FlagsContext>();

export function FlagsProvider(props: ParentProps) {
  const [flags, setFlags] = makePersisted(createStore<Flags>({}), {
    name: "flags",
  });

  const getFlag = (flagName: FlagName) => at<boolean>(flags, flagName)[0] ?? false;

  const setFlag = (flagName: FlagName, value?: boolean) => {
    const fullPath = flagName.split(".");
    let path = [];

    for (const node of fullPath) {
      path.push(node);

      if (path.length == fullPath.length) {
        setFlags(...(path as [any]), value ?? true);
        return;
      }

      if (at(flags, path.join("."))[0] === undefined) {
        setFlags(...(path as [any]), {});
      }
    }
  };
  return <FlagsContext.Provider value={{ getFlag, setFlag }}>{props.children}</FlagsContext.Provider>;
}

export function useFlags() {
  const context = useContext(FlagsContext);

  if (context == null) {
    throw new Error("You must use `useFlags` inside a `<FlagsProvider/>`");
  }

  return context;
}
