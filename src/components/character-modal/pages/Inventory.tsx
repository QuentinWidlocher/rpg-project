import { Equipment } from "~/components/inventory/Equipment";
import { usePlayer } from "~/contexts/player";

export default function InventoryPage() {
	const { player, setPlayer } = usePlayer();

	return (
		<Equipment
			inventory={player.inventory}
			setInventory={(...args: any[]) => setPlayer("inventory", ...(args as [any]))}
		/>
	);
}
