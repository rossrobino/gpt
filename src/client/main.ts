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

customElements.define(
	"open-agents",
	class extends HTMLElement {
		connectedCallback() {
			this.style.display = "contents";

			const button = document.createElement("button");
			button.type = "button";
			button.textContent = "View Agents";

			const openAgents = () => {
				const agentsPopover = document.querySelector("#agents");
				if (agentsPopover instanceof HTMLElement) {
					agentsPopover.showPopover();
				}
			};

			const params = new URLSearchParams(window.location.search);

			if (params.has("agents")) openAgents();

			button.addEventListener("click", openAgents);

			this.append(button);
		}
	},
);
