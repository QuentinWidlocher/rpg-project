import { JsonObject, JsonValue, OmitIndexSignature, Tagged } from "type-fest";
import { RemoveAllTags } from "type-fest/source/tagged";
import { Never } from "./types";

export const exact = <T = Never<"Type is required">>(v: NoInfer<T>) => v as Exact<T>;
export type Exact<T> = T extends object
	? T extends Array<infer U>
		? Array<Exact<U>>
		: { [k in keyof T]: Exact<T[k]> }
	: Tagged<T, "exact">;

export type LiteralToPrimitive<T extends JsonValue> = T extends Tagged<infer V, "exact">
	? V
	: T extends number
	? number
	: T extends bigint
	? bigint
	: T extends string
	? string
	: T extends boolean
	? boolean
	: T extends symbol
	? symbol
	: T extends null
	? null
	: T extends undefined
	? undefined
	: Never<T & "literal is not primitive">;

export type LiteralToPrimitiveDeep<T extends JsonValue> = RemoveAllTags<T> extends object
	? RemoveAllTags<T> extends Array<infer U>
		? U extends JsonValue
			? Array<LiteralToPrimitiveDeep<U>>
			: {
					[K in keyof OmitIndexSignature<T>]: T[K] extends JsonValue
						? LiteralToPrimitiveDeep<T[K]>
						: Never<"object props not json">;
			  }
		: {
				[K in keyof OmitIndexSignature<T>]: T[K] extends JsonValue
					? LiteralToPrimitiveDeep<T[K]>
					: Never<"object props not json">;
		  }
	: LiteralToPrimitive<T>;

export type ObjectOfLiteralToPrimitiveDeep<T extends JsonObject> = {
	[K in keyof OmitIndexSignature<T>]: LiteralToPrimitiveDeep<T[K]>;
};
