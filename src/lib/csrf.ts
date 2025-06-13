import * as constants from "@/lib/constants";
import * as ovr from "ovr";

export const csrf: ovr.Middleware<ovr.Params> = async (c, next) => {
	if (
		c.req.method !== "GET" &&
		c.req.headers.get("Origin") !== constants.origin
	) {
		return c.text("Forbidden", 403);
	}

	await next();
};
