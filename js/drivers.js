var drv_header = [];
var drv_player_elems = [];
var drv_sort_id = 0;
var drv_sort_invert = false;

function gen_list_html() {
    set_inner("player_list", data_players.map((pl, i) => `
<div class="pll_item" style="--sort:${i}">
    <div class="pll_cell" style="--w:0.1">${i+1}</div>
    <div class="pll_cell" style="--w:0.4">${full_name_of(pl)}</div>
    <div class="pll_cell" style="--w:0.2">${pl.team}</div>
    <div class="pll_cell" style="--w:0.15">${pl.group}</div>
    <div class="pll_cell" style="--w:0.15">${pl.rating}</div>
</div>
    `).join(""), true);
    
    let elms = Array.from(document.getElementsByClassName("pll_item"));
    drv_player_elems = elms.map(e => ({
        elem: e,
        cells: Array.from(e.querySelectorAll(".pll_cell")),
    }));

    ui_reg_multipick(elms, p => {
        select_player(p);
    })
}

function select_player(i) {
    let pl = data_players[i];

    drv_player_elems[i].elem.classList.add("active");

    let nm1 = document.getElementById("pll_name_1");
    let nm2 = document.getElementById("pll_name_2");
    nm1.innerHTML = pl.first_name_in_front ? pl.name_first.toUpperCase() : pl.name_family;
    nm2.innerHTML = pl.first_name_in_front ? pl.name_family : pl.name_first.toUpperCase();
    nm1.classList.toggle("main", pl.first_name_in_front);
    nm2.classList.toggle("main", !pl.first_name_in_front);

    set_inner("pll_team", pl.team);

    let stats = document.getElementsByClassName("plls_r");
    
    stats[1].innerHTML = pl.rating;
    stats[2].innerHTML = pl.game_char;
    stats[3].innerHTML = pl.game_chasis;
    stats[4].innerHTML = pl.game_rims;
    stats[5].innerHTML = pl.game_spoiler;

    set_inner("pllp_list_entries", Array(20).fill(0).map((_, j) => `
<div class="pllp_item" style="--sort:${j}">
    <div class="pllp_cell" style="--w:0.2">2022/1/1</div>
    <div class="pllp_cell" style="--w:0.5">Micomet Invitational</div>
    <div class="pllp_cell" style="--w:0.15">55</div>
    <div class="pllp_cell" style="--w:0.15">1</div>
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

function onload_drivers() {
    gen_list_html();

    drv_header = ui_reg_multipick_cls("pll_cell_hd", i => {
        drv_sort_by(i);
    }).elems;

    select_player(0);
}