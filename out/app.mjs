const available_demos = [
    { name: "Coins", description: "Coin experiments.", path: "./coins.mjs" },
];
const LAST_DEMO_STORAGE_KEY = "LAST_DEMO";
(async () => {
    const app = document.getElementById("app");
    if (!app)
        throw new Error("Missing app div");
    let loaded_demo = null;
    let loaded_demo_cleanup;
    const unload = () => {
        if (loaded_demo_cleanup)
            loaded_demo_cleanup();
        app.replaceChildren();
    };
    const load_elems = (els) => {
        els.forEach(el => {
            try {
                app.appendChild(el);
            }
            catch (err) {
                console.error(`Couldnt load element ${el}. Error:`, err);
            }
        });
    };
    const last_demo_name = window.localStorage.getItem(LAST_DEMO_STORAGE_KEY);
    if (last_demo_name) {
        const demo = available_demos.find(d => d.name == last_demo_name);
        if (demo) {
            loaded_demo = await import(`${demo.path}`);
            loaded_demo_cleanup = await loaded_demo?.load(load_elems);
            const title = document.getElementById("title");
            if (title)
                title.innerText = demo.name;
        }
        else {
            window.localStorage.setItem(LAST_DEMO_STORAGE_KEY, "");
        }
    }
    const examples_container = document.createElement("div");
    if (!examples_container)
        throw new Error("no container");
    examples_container.style.position = "absolute";
    examples_container.style.right = "0";
    examples_container.style.display = "grid";
    examples_container.style.gridTemplateColumns = "450px";
    examples_container.style.color = "white";
    examples_container.style.textAlign = "center";
    available_demos.forEach(demo => {
        const row = document.createElement("div");
        row.style.margin = "auto";
        row.style.textAlign = "center";
        row.style.display = "grid";
        row.style.gridTemplateColumns = "repeat(3, 150px)";
        row.style.border = "1px dashed grey";
        const name = document.createElement("p");
        name.innerText = demo.name;
        name.style.margin = "auto";
        const desc = document.createElement("p");
        desc.innerText = demo.description;
        desc.style.margin = "auto";
        const load_btn = document.createElement("button");
        load_btn.innerText = "Load";
        load_btn.onclick = async (evt) => {
            evt.preventDefault();
            if (loaded_demo)
                unload();
            loaded_demo = await import(demo.path);
            if (loaded_demo) {
                loaded_demo_cleanup = await loaded_demo.load(load_elems);
                window.localStorage.setItem(LAST_DEMO_STORAGE_KEY, demo.name);
                const title = document.getElementById("title");
                if (title)
                    title.innerText = demo.name;
            }
            else {
                window.localStorage.setItem(LAST_DEMO_STORAGE_KEY, "");
            }
        };
        row.appendChild(name);
        row.appendChild(desc);
        row.appendChild(load_btn);
        examples_container.appendChild(row);
    });
    document.body.insertAdjacentElement("afterbegin", examples_container);
})();
export {};
