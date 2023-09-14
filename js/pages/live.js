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
let stream_req_type = STREAM_REQ_TY.STATIC;
let hdx_api_key = util.url_param_get("holodex_key", util.cookie_get("holodex_key", null));

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

async function reload_streams() {    
    ui.hide("stream_none");
    ui.hide("stream_list");

    stream_list = [];
    switch (stream_req_type) {
        case STREAM_REQ_TY.STATIC: {
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
    
    if (stream_list.length > 0) {
        util.set_inner("stream_list", stream_list.map(s => `<div>${s.name}</div>`).join(""));
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

    util.set_inner("stream_req_type", "Static");


    document.getElementById("reqtype_sel").addEventListener("change", e => {
        ui.show("showif_holodex", +e.target.value === 1);
        stream_req_type = +e.target.value;
        document.getElementById("stream_req_type").innerText = e.target.options[+e.target.value].text;
    });
    {
        let elm = document.getElementById("holodex_key_input");
        if (hdx_api_key !== null) {
            elm.value = hdx_api_key;
            let e2 = document.getElementById("reqtype_sel");
            e2.value = "1";
            e2.dispatchEvent(new Event("change"));
        }
        elm.addEventListener("change", e => {
            util.cookie_set("holodex_key", e.target.value);
        });
    }
    ui.reg_click("floating_window_close", _ => {
        ui.hide("floating_window");
    });
    ui.reg_click("stream_req_type", _ => {
        ui.show("floating_window");
    });

    if (stream_list === null) {
        reload_streams();
    }
}

function onload_live() {
    load_standings_html();
}