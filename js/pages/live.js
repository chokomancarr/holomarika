//@ts-check
'use strict';

import * as pages from "../pages.js"
pages.hooks["live"] = onload_live;

import * as util from "../util.js"
import * as ui from "../ui_hooks.js"
import * as data from "../data.js"

let stream_list = null;
const STREAM_REQ_TY = Object.freeze({
    STATIC: 0,
    HOLODEX: 1,
});
let stream_req_type = +util.cookie_get("stream_req_type", STREAM_REQ_TY.STATIC);
let hdx_api_key = util.url_param_get("holodex_key", util.cookie_get("holodex_key", null));

const MAX_N_LIVESTREAM = 4;
let active_livestream = [];
let livestream_div = document.getElementById("live_streams");

function add_livestream(url) {
    function _string2node(s) {
        var div = document.createElement('div');
        div.innerHTML = s;
        return div.querySelector("iframe");
    }
    document.getElementById("live_streams").prepend(_string2node(`
<iframe id="live_stream_frame_${url}" data-url="${url}" class="live_stream_frame" src="https://www.youtube.com/embed/${url}?autoplay=0&showinfo=0"
    scrolling="no" frameborder="0" marginheight="0px" marginwidth="0px" height="100vh" width="56.25vh" allowfullscreen>
</iframe>`));
    active_livestream.push(url);
    update_livestream_css();
}
function kill_livestream(url) {
    document.getElementById("live_stream_frame_" + url).remove();
    active_livestream.splice(active_livestream.indexOf(url), 1);
    update_livestream_css();
}
function update_livestream_css() {
    util.foreach_class("live_stream_frame", (e, i) => {
        e.style.setProperty("--stream_order", i + "");
    });
}

async function hdx_fetch(request, headers, params = {}) {
    return [];
    let res = await fetch("https://holodex.net/api/v2/" + request + "?" + new URLSearchParams(params), {
        method: "GET",
        headers: {
            "X-APIKEY": hdx_api_key,
            "Content-Type": "application/json",
            ... headers
        }
    });
    return await res.json();
}

async function reload_streams(force) {
    ui.hide("stream_none");
    ui.hide("stream_list");

    if (force || stream_list === null) {
        stream_list = [];
        switch (stream_req_type) {
            case STREAM_REQ_TY.STATIC: {
                stream_list = [
                    {
                        name: "Sakura Miko",
                        url: "uk6g-F43Z7A",
                    },
                    {
                        name: "Kazama Iroha",
                        url: "y2b9R5mIDmA",
                    },
                    {
                        name: "Kobo Kanaeru",
                        url: "y5Rd9ebaqUk"
                    }
                ];
                break;
            }
            case STREAM_REQ_TY.HOLODEX: {
                stream_list = (await hdx_fetch("live", {}, {
                    status: "live",
                    type: "stream",
                    topic: "Mario Kart",
                    org: "Hololive",
                })).map(v => ({
                    name: v.channel.english_name,
                    data: v
                }));
                break;
            }
        }
    }
    
    if (stream_list.length > 0) {
        util.set_inner("stream_list", stream_list.map(s => `<div id="stream_list_item_${s.url}" class="stream_list_item" data-youtube="${s.url}">${s.name}</div>`).join(""));
        ui.show("stream_list");
    }
    else {
        ui.show("stream_none");
    }
}

function load_standings_html() {
    util.set_inner("standings_list", Array(12).fill(0).map((_, i) => `
<div class="std_item" style="--rank:${i}">
    <div class="std_num">${i+1}.</div>
    <div class="std_col" style="background: rgb(51, 51, 255);"></div>
    <div class="std_name">DRIVER</div>
    <div class="std_pts">
        <div><span class="std_pts_no">0</span>Pts</div>
    </div>
</div>
    `).join(""));
}

function load_stream_list() {
    util.set_inner("stream_req_type", "Static");

    document.getElementById("reqtype_sel").addEventListener("change", e => {
        ui.show("showif_holodex", +e.target.value === 1);
        stream_req_type = +e.target.value;
        document.getElementById("stream_req_type").innerText = e.target.options[+e.target.value].text;
    });
    {
        let elm = document.getElementById("reqtype_sel");
        elm.value = stream_req_type + "";
        elm.dispatchEvent(new Event("change"));
        elm.addEventListener("change", e => {
            util.cookie_set("stream_req_type", e.target.value);
        });
    }
    {
        let elm = document.getElementById("holodex_key_input");
        if (hdx_api_key !== null) {
            elm.value = hdx_api_key;
        }
        elm.addEventListener("change", e => {
            util.cookie_set("holodex_key", e.target.value);
        });
    }
    ui.reg_click("floating_window_close", _ => {
        ui.hide("floating_window");
    });
    ui.reg_click("stream_req_text", _ => {
        ui.show("floating_window");
    });
}

function onload_live(load) {
    if (load) {
        livestream_div.classList.remove("floating");
        ui.show("live_streams");
        
        load_standings_html();

        load_stream_list();

        reload_streams();

        {
            let main_url = "KDyJmdtclAk";
            let div = document.getElementById("stream_list_item_main");
            div.dataset.youtube = main_url;
        }

        for (let it of document.getElementsByClassName("stream_list_item")) {
            if (active_livestream.indexOf(it.dataset.youtube) > -1) {
                it.classList.add("live");
            }
            it.addEventListener("click", e => {
                let url = e.target.dataset.youtube;
                if (active_livestream.indexOf(url) > -1) {
                    kill_livestream(url);
                    e.target.classList.remove("live");
                }
                else {
                    if (active_livestream.length === MAX_N_LIVESTREAM) {
                        let kill_url = document.querySelector(".live_stream_frame").dataset.url;
                        kill_livestream(kill_url);
                        document.getElementById("stream_list_item_" + kill_url).classList.remove("live");
                    }
                    add_livestream(url);
                    e.target.classList.add("live");
                }
            });
        }
    }
    else {
        if (active_livestream.length === 0) {
            ui.hide("live_streams");
        }
        else {
            livestream_div.classList.add("floating");
        }
    }
}