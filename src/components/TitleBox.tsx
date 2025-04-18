export default function TitleBox(props: { title: string }) {
	return (
		<section class="[font-variant-caps:small-caps] shadow-md shadow-primary/20 z-20 text-2xl bg-primary py-3 px-5 sm:-mx-5 sm:rounded-xl text-white">
			{props.title}
		</section>
	);
}
