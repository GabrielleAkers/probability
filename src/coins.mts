import { ElementLoaderCallback } from "./app.mjs";
import { Coin, FlipperContainer, is_flip_result, is_flip_sequence_result } from "./flippers.mjs";

import * as Plotly from "plotly.js-basic-dist";

export const load = async (load_elems: ElementLoaderCallback) => {
    const controls_container = document.createElement("div");
    controls_container.style.display = "grid";
    controls_container.style.gridTemplateColumns = "160px";
    controls_container.style.color = "white";
    controls_container.style.textAlign = "center";

    const CoinContainer = new FlipperContainer();

    const coin_summary = document.createElement("div");
    coin_summary.style.display = "grid";
    coin_summary.style.gridTemplateColumns = "160px";
    coin_summary.style.color = "white";
    coin_summary.style.textAlign = "center";

    const coins_label = document.createElement("p");
    coins_label.innerHTML = "Coin Container";
    coin_summary.appendChild(coins_label);
    const coin_list = document.createElement("l");
    coin_summary.appendChild(coin_list);

    const update_summary = () => {
        const summary = CoinContainer.summarize();
        coin_list.replaceChildren();
        Object.keys(summary.weight_buckets).forEach(bucket => {
            const b = document.createElement("li");
            b.innerHTML = `${bucket} : ${summary.weight_buckets[bucket]}`;
            coin_list.appendChild(b);
        });
    };

    let new_coin_heads_probability = 0.5;

    const new_coin_label = document.createElement("p");
    new_coin_label.innerHTML = "New Coin";
    controls_container.appendChild(new_coin_label);

    const prob_slider_label = document.createElement("div");
    prob_slider_label.style.display = "grid";
    prob_slider_label.style.gridTemplateColumns = "repeat(2, 80px)";
    const prob_slider_label_h = document.createElement("p");
    prob_slider_label_h.innerHTML = "H: " + new_coin_heads_probability.toString();
    const prob_slider_label_t = document.createElement("p");
    prob_slider_label_t.innerHTML = "T: " + (1.0 - new_coin_heads_probability).toString();
    prob_slider_label.appendChild(prob_slider_label_h);
    prob_slider_label.appendChild(prob_slider_label_t);
    controls_container.appendChild(prob_slider_label);

    const prob_input = document.createElement("div");
    prob_input.style.display = "grid";
    prob_input.style.gridTemplateColumns = "repeat(2, 80px)";

    const new_coin_prob_input = document.createElement("input");
    new_coin_prob_input.type = "number";
    new_coin_prob_input.min = "0.0";
    new_coin_prob_input.max = "1.0";
    new_coin_prob_input.step = "0.01";
    new_coin_prob_input.defaultValue = new_coin_heads_probability.toString();
    new_coin_prob_input.onchange = evt => {
        // @ts-ignore
        new_coin_heads_probability = parseFloat(evt.target.value);
        prob_slider_label_h.innerHTML = "H: " + new_coin_heads_probability.toPrecision(2);
        prob_slider_label_t.innerHTML = "T: " + (1.0 - new_coin_heads_probability).toPrecision(2);
    };
    const new_coin_prob_slider = document.createElement("input");
    new_coin_prob_slider.type = "range";
    new_coin_prob_slider.min = "0.0";
    new_coin_prob_slider.max = "1.0";
    new_coin_prob_slider.step = "0.01";
    new_coin_prob_slider.defaultValue = new_coin_heads_probability.toString();
    new_coin_prob_slider.onchange = evt => {
        // @ts-ignore
        new_coin_heads_probability = parseFloat(evt.target.value);
        // @ts-ignore
        new_coin_prob_input.value = parseFloat(evt.target.value);
        prob_slider_label_h.innerHTML = "H: " + new_coin_heads_probability.toPrecision(2);
        prob_slider_label_t.innerHTML = "T: " + (1.0 - new_coin_heads_probability).toPrecision(2);
    };

    prob_input.appendChild(new_coin_prob_input);
    prob_input.appendChild(new_coin_prob_slider);

    controls_container.appendChild(prob_input);

    const add_coin_btn = document.createElement("button");
    add_coin_btn.innerText = "Add Coin";
    add_coin_btn.onclick = () => {
        CoinContainer.push(new Coin([new_coin_heads_probability, 1.0 - new_coin_heads_probability]));
        update_summary();
    };
    controls_container.appendChild(add_coin_btn);

    const add_n_holder = document.createElement("div");
    add_n_holder.style.display = "grid";
    add_n_holder.style.gridTemplateColumns = "repeat(2, 80px)";

    let num_coins = 1;
    const add_n_input = document.createElement("input");
    add_n_input.type = "number";
    add_n_input.min = "1";
    add_n_input.defaultValue = num_coins.toString();
    add_n_input.onchange = evt => {
        // @ts-ignore
        num_coins = parseInt(evt.target.value);
    };

    const add_n_btn = document.createElement("button");
    add_n_btn.innerText = "Add N";
    add_n_btn.onclick = () => {
        for (let i = 0; i < num_coins; i++) {
            CoinContainer.push(new Coin([new_coin_heads_probability, 1.0 - new_coin_heads_probability]));
        }
        update_summary();
    };
    add_n_holder.appendChild(add_n_input);
    add_n_holder.appendChild(add_n_btn);
    controls_container.appendChild(add_n_holder);

    const remove_last_coin_btn = document.createElement("button");
    remove_last_coin_btn.innerText = "Remove Last";
    remove_last_coin_btn.onclick = () => {
        CoinContainer.pop();
        update_summary();
    };
    controls_container.appendChild(remove_last_coin_btn);

    const empty_coin_container_btn = document.createElement("button");
    empty_coin_container_btn.innerText = "Empty Container";
    empty_coin_container_btn.onclick = () => {
        CoinContainer.clear();
        update_summary();
    };
    controls_container.appendChild(empty_coin_container_btn);

    const results_container = document.createElement("div");
    results_container.style.width = "800px";
    results_container.style.height = "800px";
    results_container.style.position = "absolute";
    results_container.style.top = "0";
    results_container.style.top = "0";
    results_container.style.bottom = "0";
    results_container.style.left = "0";
    results_container.style.right = "0";
    results_container.style.margin = "auto";
    results_container.style.border = "white 1px solid";
    results_container.style.color = "white";
    results_container.style.textAlign = "center";
    results_container.style.textWrap = "wrap";

    const build_chart = (x: string[], y: number[]) => {
        const total = y.reduce((s, v) => s + v);
        const chart_data: Plotly.Data[] = [
            {
                x,
                y,
                type: "bar",
                text: y.map(v => `
                ${v} : ${((v / total) * 100).toPrecision(4)}%
                `),
                textposition: "auto",
                hoverinfo: "none"
            }
        ];
        const chart_layout: Partial<Plotly.Layout> = {
            title: "Result",
            xaxis: {
                title: "Face"
            },
            yaxis: {
                title: "Count"
            }
        };
        Plotly.newPlot(results_container, chart_data, chart_layout);
    };

    const result_string = document.createElement("p");
    result_string.style.textWrap = "wrap";
    results_container.appendChild(result_string);

    const result_percentages_string = document.createElement("p");
    result_percentages_string.style.textWrap = "wrap";
    results_container.appendChild(result_percentages_string);

    const flip_container = document.createElement("div");
    flip_container.style.display = "grid";
    flip_container.style.gridTemplateColumns = "repeat(2, 80px)";
    flip_container.style.alignItems = "center";
    flip_container.style.justifyContent = "center";

    let num_flips = 1;
    const num_flips_label = document.createElement("p");
    num_flips_label.innerHTML = "Num Flips";
    flip_container.appendChild(num_flips_label);
    const num_flips_input = document.createElement("input");
    num_flips_input.type = "number";
    num_flips_input.min = "1";
    num_flips_input.defaultValue = num_flips.toString();
    num_flips_input.onchange = evt => {
        // @ts-ignore
        num_flips = parseInt(evt.target.value);
        console.log(num_flips);
    };
    flip_container.appendChild(num_flips_input);

    let flip_with_replacement = false;
    const w_replace_holder = document.createElement("div");
    const flip_with_replacement_check = document.createElement("input");
    flip_with_replacement_check.style.height = "16px";
    flip_with_replacement_check.type = "checkbox";
    flip_with_replacement_check.defaultChecked = flip_with_replacement;
    flip_with_replacement_check.onchange = evt => {
        // @ts-ignore
        flip_with_replacement = evt.target.checked;
    };
    const flip_with_replacement_label = document.createElement("p");
    flip_with_replacement_label.innerHTML = "Replace?";
    w_replace_holder.appendChild(flip_with_replacement_label);
    w_replace_holder.appendChild(flip_with_replacement_check);
    flip_container.appendChild(w_replace_holder);

    const flip_rnd_btn = document.createElement("button");
    flip_rnd_btn.innerText = "Flip";
    flip_rnd_btn.onclick = () => {
        const r = CoinContainer.flip_random(num_flips, flip_with_replacement);
        results_container.replaceChildren();
        if (r) {
            console.log("result", r);
            if (is_flip_result(r)) {
                results_container.appendChild(result_string);
                result_string.innerHTML = r.label;
            }
            if (is_flip_sequence_result(r)) {
                build_chart(["H", "T"], [r.stats.data["H"].count || 0, r.stats.data["T"].count || 0]);
            }
        }
    };
    flip_container.appendChild(flip_rnd_btn);
    controls_container.appendChild(flip_container);



    load_elems([controls_container, coin_summary, results_container]);

    return () => {
        // cleanup function
    };
};
