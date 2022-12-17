var standing_elems = [];
var standing_elems_num = [];
var standing_elems_col = [];
var standing_elems_name = [];
var standing_elems_pts = [];

let graph = {
    load_scores(res_id) {
        let res = data_results[res_id];
        let scores = Array(12).fill(0).map((_, i) => Array(6));
        res.results.forEach((r, i) => {
            r.scores_sum.forEach((s, j) => {
                scores[j][i] = s;
            });
        });
        let cols = res.player_ids.map(i => data_players.find(d => d.player_id == i).color_code);

        document.getElementById("svg_scores").innerHTML = scores.map((s, p) => `
<polyline vector-effect="non-scaling-stroke" points="0,0 ${s.map((c,i) => `${i*15+7.5},${c}`).join(" ")}" stroke="${cols[p]}" stroke-width="2" fill="none" />
${
    s.map((c,i) => `<circle cx="${i*15+7.5}" cy="${c}" r="1" fill="${cols[p]}" />`).join("")
}
        `).join("");
    },
}

function gen_group_list_html() {
    set_inner("group_list", data_results.map((g, i) => `
<li class="glist_item">${g.group_name}</li>
    `).join(""));
}

function gen_standings_html() {
    set_inner("standings", Array(12).fill(0).map((_, i) => `
<div class="std_item" style="--rank:${i}">
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
    standing_elems_pts = Array.from(document.getElementsByClassName("std_pts"));
}

function update_standings(ss) {
    ss.forEach((v, i) => {
        standing_elems[v].style = `--rank:${i}`;
        standing_elems_num[v].innerHTML = `${i + 1}.`;
    });
}

function select_group(i) {
    let hasdata = data_results[i].results.length > 0;
    document.getElementById("notplayed").classList.toggle("hidden", hasdata);
    document.getElementById("played").classList.toggle("hidden", !hasdata);

    if (hasdata) {
        standing_elems_name.forEach(n => {
            n.innerHTML = "";
        });
        let ids = data_results[i].player_ids;
        ids.forEach((id, j) => {
            let pl = data_players.find(p => p.player_id == id);
            let nm1 = pl.name_family;
            let nm2 = pl.name_first.toUpperCase();
            standing_elems_col[j].style.background = pl.color_code;
            standing_elems_name[j].innerHTML =
                pl.first_name_in_front ? `${nm2} ${nm1}` : `${nm1} ${nm2}`;
        });
        standing_elems.forEach((e, i) => {
            e.classList.toggle("hidden", i >= ids.length);
        });

        graph.load_scores(i);
    }
}

function onload_standings() {
    gen_group_list_html();

    gen_standings_html();

    ui_reg_multipick_cls("glist_item", select_group).pick(0);
}