//@ts-check
'use strict';

import * as pages from "../pages.js"
pages.hooks["drivers"] = onload_drivers;

import * as util from "../util.js"
import * as ui from "../ui_hooks.js"
import * as data from "../data.js"

var drv_header = [];
var drv_player_elems = [];
var drv_sort_id = 0;
var drv_sort_invert = false;

function gen_list_html() {
    util.set_inner("player_list", data.players_raced.map((pl, i) => `
<div class="pll_item" style="--sort:${i}">
    <div class="pll_cell" style="--w:0.1">${i+1}</div>
    <div class="pll_cell" style="--w:0.35">${data.full_name_of(pl)}</div>
    <div class="pll_cell" style="--w:0.15">${pl.branch}</div>
    <div class="pll_cell" style="--w:0.25">${pl.group}</div>
    <div class="pll_cell" style="--w:0.15">${pl.racing_since}</div>
</div>
    `).join(""), true);
    
    let elms = Array.from(document.getElementsByClassName("pll_item"));
    drv_player_elems = elms.map(e => ({
        elem: e,
        cells: Array.from(e.querySelectorAll(".pll_cell")),
    }));

    ui.reg_multipick(elms, p => {
        select_player(p);
    })
}

function select_player(i) {
    let pl = data.players_raced[i];

    drv_player_elems[i].elem.classList.add("active");

    {
        let ptr = document.getElementById("pll_portrait");
        ptr.classList.remove("loaded");
        ptr.onload = () => {
            ptr.classList.add("loaded");
        }
        ptr.src = pl.portrait_url;
    }

    let nm1 = document.getElementById("pll_name_1");
    let nm2 = document.getElementById("pll_name_2");
    nm1.innerText = pl.first_name_in_front ? pl.name_first.toUpperCase() : pl.name_family ?? "";
    nm2.innerText = pl.first_name_in_front ? pl.name_family : pl.name_first.toUpperCase();
    nm1.classList.toggle("main", pl.first_name_in_front);
    nm2.classList.toggle("main", !pl.first_name_in_front);

    util.set_inner("pll_team", `${pl.branch} - ${pl.group}`);

    /** @type {HTMLElement[]} */
    // @ts-ignore
    let stats = document.getElementsByClassName("plls_r");
    
    //stats[1].innerHTML = pl.rating + "";
    stats[2].innerText = pl.game_char;
    stats[3].innerText = pl.game_chasis;
    stats[4].innerText = pl.game_rims;
    stats[5].innerText = pl.game_spoiler;

    util.set_inner("pllp_list_entries", pl.past_races.map((rc, j) => `
<div class="pllp_item" style="--sort:${j}">
    <div class="pllp_cell" style="--w:0.2">${rc.date}</div>
    <div class="pllp_cell" style="--w:0.5">${rc.name}</div>
    <div class="pllp_cell" style="--w:0.15">${rc.points}</div>
    <div class="pllp_cell" style="--w:0.15">${rc.rank}</div>
</div>
    `).join(""));

    let par = document.getElementById("player_info");
    par.classList.remove("anim_appear");
    void par.offsetWidth;
    par.classList.add("anim_appear");
}

function drv_sort_by(i) {
    if (i == drv_sort_id) {
        drv_sort_invert = !drv_sort_invert;
    }
    else {
        drv_sort_invert = false;
        drv_header[drv_sort_id].classList.remove("sort");
        drv_header[i].classList.add("sort");
        drv_sort_id = i;
    }
    drv_header[i].classList.toggle("invert", drv_sort_invert);

    drv_player_elems.map((e, j) => ([
        e.cells[i].innerHTML, j
    ])).sort((a, b) => {
        let res = a[0] - b[0];
        if (isNaN(res)) {
            res = a[0].localeCompare(b[0], { sensitivity: 'base' });
        }
        return drv_sort_invert ? -res : res;
    })
        .forEach((x, k) => {
            drv_player_elems[x[1]].elem.style.setProperty("--sort", k.toString());
        });
}

function onload_drivers(load) {
    if (!load) return;
    gen_list_html();

    drv_header = ui.reg_multipick_cls("pll_cell_hd", i => {
        drv_sort_by(i);
    }).elems;

    select_player(0);
}