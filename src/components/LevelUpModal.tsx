import { usePlayer } from "~/contexts/player";
import Layout from "./Layout";
import { useModal } from "~/contexts/modal";
import { AbilityByClassByLevel } from "~/game/character/classes/classes";
import { AnyAbility } from "~/game/character/actions";
import { CONTINENT_NAME, COUNTRY_NAME } from "~/constants";

function getLevelUpMessage(level: number) {
	switch (level) {
		case 2:
			return "You realize that all your life you have been coasting along as if you were in a dream. Suddenly, facing the trials of the last few days, you have come alive.";
		case 3:
			return "You realize that you are catching on to the secret of success. It's just a matter of concentration.";
		case 4:
			return "You've done things the hard way. But without taking risks, taking responsibility for failure... how could you have understood?";
		case 5:
			return "Everything you do is just a bit easier, more instinctive, more satisfying. It is as though you had suddenly developed keen senses and instincts.";
		case 6:
			return `You've learned a lot about ${COUNTRY_NAME}... and about yourself. It's hard to believe how ignorant you were, but now you have so much more to learn.`;
		case 7:
			return "You resolve to continue pushing yourself. Perhaps there's more to you than you thought.";
		case 8:
			return "The secret does seem to be hard work, yes, but it's also a kind of blind passion, an inspiration.";
		case 9:
			return "So that's how it works. You plod along, putting one foot before the other, look up, and suddenly, there you are. Right where you wanted to be all along.";
		case 10:
			return "You woke today with a new sense of purpose. You're no longer afraid of failure. Failure is just an opportunity to learn something new.";
		case 11:
			return "Being smart doesn't hurt. And a little luck now and then is nice. But the key is patience and hard work.";
		case 12:
			return "You can't believe how easy it is. You just have to go... a little crazy. And then, suddenly, it all makes sense, and everything you do turns to gold.";
		case 13:
			return "It's the most amazing thing. Yesterday it was hard, and today it is easy. Just a good night's sleep, and yesterday's mysteries are today's masteries.";
		case 14:
			return "Today you wake up, full of energy and ideas, and you know, somehow, that overnight everything has changed. What a difference a day makes.";
		case 15:
			return `Now you just stay at your peak as long as you can. There's no one stronger in ${CONTINENT_NAME}, but there's always someone younger... a new challenger.`;
		case 16:
			return "You've been trying too hard, thinking too much. Relax. Trust your instincts. Just be yourself. Do the little things, and the big things take care of themselves.";
		case 17:
			return "Life isn't over. You can still get smarter, or cleverer, or more experienced, or meaner... but your body and soul just aren't going to get any younger.";
		case 18:
			return "With the life you've been living, the punishment your body has taken... there are limits, and maybe you've reached them. Is this what it's like to grow old?";
		case 19:
			return "You're really good. Maybe the best. And that's why it's so hard to get better. But you just keep trying, because that's the way you are.";
		case 20:
			return "By superhuman effort, you can avoid slipping backwards for a while. But one day, you'll lose a step, or drop a beat, or miss a detail... and you'll be gone forever.";
		default:
			return "The results of hard work and dedication always look like luck. But you know you've earned every ounce of your success.";
	}
}

export default function LevelUpModal(props: {
	newAbilities: (AnyAbility & { whatChanged?: string })[];
	maxHp: { before: number; after: number };
}) {
	const { close } = useModal();
	const { player, setPlayer } = usePlayer();

	return (
		<Layout title={`You're level ${player.level}`}>
			<div class="flex flex-col gap-5">
				<p class="text-lg mb-5 italic">{getLevelUpMessage(player.level)}</p>
				<div class="flex justify-between">
					<strong class="text-lg">Your maximum health increased :</strong>
					<span class="text-xl">
						{props.maxHp.before} → {props.maxHp.after}
					</span>
				</div>
				<div>
					<ul>
						{props.newAbilities.map((newAbility, i) => (
							<li class="collapse join-item bg-base-100">
								<input type="radio" name="ability" checked={i == 0} />
								<div class="collapse-title text-xl font-medium pr-3">
									<div class="flex justify-between items-center">
										<span>
											{newAbility.whatChanged ? `${newAbility.title} changed` : `You can now use ${newAbility.title} !`}
										</span>
									</div>
								</div>
								{newAbility.whatChanged ?? newAbility.description ? (
									<div class="collapse-content">{newAbility.whatChanged ?? newAbility.description}</div>
								) : null}
							</li>
						))}
					</ul>
				</div>
			</div>
			<button class="btn btn-neutral mt-auto" onClick={() => close()}>
				Go back
			</button>
		</Layout>
	);
}
