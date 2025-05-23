import { Scene } from "~/game/dialog/dialog";

export const setDefaultInnDialogConfig = (props => {
	props.setIllustration({
		background: "/backgrounds/inn.webp",
		character: "/characters/innkeeper.png",
	});
}) satisfies Scene<any>["enterFunction"];

export const innkeeperInfos = {
	firstName: "Zantien",
	lastName: "Eldithas",
} as const;
