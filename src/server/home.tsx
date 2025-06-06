import { Input } from "@/ui/input";
import * as ovr from "ovr";

export const page = new ovr.Page("/", (c) => {
	c.head(<title>New Message</title>);

	return <Input />;
});
