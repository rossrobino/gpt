import { Input } from "@/ui/input";
import * as ovr from "ovr";

export const page = new ovr.Page("/", (c) => {
	c.head(<title>AI6</title>);

	return <Input />;
});
