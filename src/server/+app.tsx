import * as home from "@/server/home";
import { Layout } from "@/server/layout";
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

app.prerender = [home.page.pattern];

export default app;
