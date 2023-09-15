//@ts-check
'use strict';

import * as pages from "../pages.js"
pages.hooks["standings"] = onload_standings;

import * as util from "../util.js"
import * as ui from "../ui_hooks.js"
import * as data from "../data.js"

var tourney_id = -1;

var standing_elems = [];
var standing_elems_num = [];
var standing_elems_col = [];
var standing_elems_name = [];
var standing_elems_pts = [];

let graph = {
    load_scores(res_id) {
        let res = data.races[tourney_id].groups[res_id];
        let scores = Array(12).fill(0).map((_, i) => Array(6));
        res.results.forEach((r, i) => {
            r.scores_sum.forEach((s, j) => {
                scores[j][i] = s;
            });
        });
        let cols = res.player_ids.map(i => data.players.find(d => d.player_id == i).color);

        util.set_inner("svg_scores", scores.map((s, p) => `
<g id="svg_score_grp_${p}" class="svg_score_grp">
    <polyline vector-effect="non-scaling-stroke" points="0,0 ${s.map((c,i) => `${i*15+7.5},${c*0.6}`).join(" ")}" stroke="${cols[p]}" stroke-width="2" fill="none" />
    ${
        s.map((c,i) => `<circle cx="${i*15+7.5}" cy="${c * 0.6}" r="1" fill="${cols[p]}" />`).join("")
    }
</g>`).join(""));
    },
}

function gen_group_list_html() {
    util.set_inner("group_list", data.races[tourney_id].groups.map((g, i) => `
<li class="glist_item">${g.group_name}</li>
    `).join(""));
}

function gen_standings_html() {
    util.set_inner("standings", Array(12).fill(0).map((_, i) => `
<div class="std_item" data-i="${i}" style="--rank:${i}">
    <div class="std_num">${i+1}.</div>
    <div class="std_col"></div>
    <div class="std_name">PLAYER NAME</div>
    <div class="std_pts">
        <div><span class="std_pts_no">69</span>Pts</div>
    </div>
</div>
    `).join(""));
    standing_elems = Array.from(document.getElementsByClassName("std_item"));
    standing_elems_num = Array.from(document.getElementsByClassName("std_num"));
    standing_elems_col = Array.from(document.getElementsByClassName("std_col"));
    standing_elems_name = Array.from(document.getElementsByClassName("std_name"));
    standing_elems_pts = Array.from(document.getElementsByClassName("std_pts_no"));

    standing_elems.forEach(el => {
        el.addEventListener("mouseover", e => {
            document.getElementById("svg_scores").classList.add("dofade");
            document.getElementById(`svg_score_grp_${e.target.dataset.i}`).classList.add("nofade");
        });
        el.addEventListener("mouseleave", e => {
            document.getElementById("svg_scores").classList.remove("dofade");
            document.getElementById(`svg_score_grp_${e.target.dataset.i}`).classList.remove("nofade");
        });
    });
}

function select_group(i) {
    let grp = data.races[tourney_id].groups[i];
    let hasplayers = grp.player_ids.length > 0;
    let hasdata = grp.results.length > 0;
    document.getElementById("notplayed").classList.toggle("hidden", hasplayers);
    document.getElementById("played").classList.toggle("hidden", !hasplayers);

    if (hasplayers) {
        let ids = grp.player_ids;
        ids.forEach((id, j) => {
            let pl = data.players[id];
            let nm1 = pl.name_family ?? "";
            let nm2 = pl.name_first.toUpperCase();
            standing_elems_col[j].style.background = pl.color;
            standing_elems_name[j].innerText =
                pl.first_name_in_front ? `${nm2} ${nm1}` : `${nm1} ${nm2}`;
        });

        document.getElementById("noresults").classList.toggle("hidden", hasdata);
        if (hasdata) {
            for (let cl of document.getElementsByClassName("hasresults"))
                cl.classList.remove("hidden");
            util.set_inner("std_game_no", grp.results.length + "");
                
            ids.map((id, j) => {
                let pl = data.players[id];
                let sc = grp.results.at(-1).scores_sum[j];
                standing_elems_pts[j].innerText = sc + "";
                return [sc, j];
            }).sort((a, b) => b[0] - a[0]).map(([_, j], k) => {
                standing_elems[j].style = `--rank:${k}`;
                standing_elems_num[j].innerText = `${k + 1}.`;
            });

            graph.load_scores(i);
        }
        else {
            for (let cl of document.getElementsByClassName("hasresults"))
                cl.classList.add("hidden");
            ids.forEach((_, j) => {
                standing_elems[j].style = `--rank:${j}`;
                standing_elems_num[j].innerText = "";
                standing_elems_pts[j].innerText = "0";
            });
        }

        standing_elems.forEach((e, i) => {
            e.classList.toggle("hidden", i >= ids.length);
        });
    }
}

function onload_standings(load) {
    if (!load) return;
    if (tourney_id < 0) {
        tourney_id = data.races.length - 1;
    }
    util.set_inner("std_tourney_sel", data.races.map((r, i) => `<option ${i === tourney_id ? `selected="selected"` : ""} value="${i}">${r.name}</option>`).join(""));

    document.getElementById("std_tourney_sel").addEventListener("change", e => {
        tourney_id = +e.target.value;
        gen_group_list_html();
        gen_standings_html();
        ui.reg_multipick_cls("glist_item", select_group).pick(0);
    });

    gen_group_list_html();
    gen_standings_html();
    ui.reg_multipick_cls("glist_item", select_group).pick(0);
}