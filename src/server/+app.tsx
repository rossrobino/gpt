import { Layout } from "./layout";
import * as home from "@/server/home";
import { html } from "client:page";
import { App } from "ovr";

const app = new App();

app.base = html;
app.error = (c, error) => {
	console.error(error);
	c.html("Internal server error", 500);
};

app.add(home);

app.use((c, next) => {
	c.layout(Layout);
	return next();
});

export default app;
