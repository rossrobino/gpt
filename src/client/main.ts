import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "drab/editor/define";
import "drab/prefetch/define";
import "drab/share/define";

const form = document.querySelector("form");
if (!form) throw Error("Form element not found.");

form.addEventListener("keydown", (e) => {
	if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
		form.submit();
	}
});
