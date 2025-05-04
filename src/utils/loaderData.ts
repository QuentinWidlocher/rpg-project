import { RouteDefinition, RouteLoadFunc } from "@solidjs/router";

export type LoaderData<Route extends RouteDefinition> = Route["load"] extends RouteLoadFunc<infer T>
	? T
	: "Invalid Route object";

export type LoaderDataProps<Route extends RouteDefinition> = {
	data: LoaderData<Route>;
};

export type WithLoaderData<Route extends RouteDefinition, P = {}> = P & LoaderDataProps<Route>;
