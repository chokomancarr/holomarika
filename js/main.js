//@ts-check
'use strict';

import * as util from "./util.js"
import * as ui from "./ui_hooks.js"
import * as data from "./data.js"
import * as pages from "./pages.js"

import "./pages/overview.js";
import "./pages/standings.js";
import "./pages/drivers.js";
import "./pages/live.js";

/**
 * @param {string} page
 */
async function load_page(page) {
    let container = document.getElementById("content_container");
    container.innerHTML = "";
    document.getElementById("page_css").remove();
    await new Promise((resolve) => {
        var cssNode = document.createElement('link');
        cssNode.id = "page_css";
        cssNode.type = 'text/css';
        cssNode.rel = 'stylesheet';
        cssNode.href = `css/${page}.css`;
        cssNode.onload = resolve
        document.head.appendChild(cssNode);
    });
    container.innerHTML =
        await (await fetch(`pages/${page}.html`)).text();
    pages.hooks[page]();
}

async function load_bg_movie() {
    let img = document.getElementById("background_img");
    img.onload = () => {
        img.classList.add("show");
    };
    img.src = "res/movie/movie_static.png";
}

(async function() {
    load_bg_movie();
    await data.load();

    ui.reg_multipick_cls("pagelist_item", (/** @type {any} */ i, /** @type {{ dataset: { page: any; }; }} */ e) => {
        load_page(e.dataset.page);
    }).pick(0);
})();