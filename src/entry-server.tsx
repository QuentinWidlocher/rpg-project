// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
	<StartServer
		document={({ assets, children, scripts }) => (
			<html lang="en">
				<head>
					<title>RPG Project</title>
					<meta charset="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<meta name="description" content="RPG Project" />
					<link rel="icon" href="/favicon.ico" sizes="48x48" />
					<link rel="icon" href="/icon.svg" sizes="any" type="image/svg+xml" />
					<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
					<meta name="theme-color" content="#ffffff" />
					<link rel="manifest" href="/_build/manifest.webmanifest" />
					{assets}
				</head>
				<body>
					<div id="app">{children}</div>
					{scripts}
				</body>
			</html>
		)}
	/>
));
