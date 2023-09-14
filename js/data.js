//@ts-check


/** Data of all players
 * @typedef {Object} PastRace
 * @property {string} date
 * @property {string} name
 * @property {number} points
 * @property {number} rank
 * 
 * @typedef {Object} PlayerInfo
 * @property {number} player_id
 * @property {string} name_family
 * @property {string} name_first
 * @property {string[]} name_lookups
 * @property {boolean} first_name_in_front
 * @property {string} color
 * @property {string} channel_url
 * @property {string} portrait_url
 * @property {string} branch
 * @property {string} group
 * @property {string} game_char
 * @property {string} game_chasis
 * @property {string} game_rims
 * @property {string} game_spoiler
 * @property {number} racing_since
 * @property {PastRace[]} past_races
 */

/**
 * @type PlayerInfo[]
 */
export var players = undefined;
/**
 * @type PlayerInfo[]
 */
export var players_raced = undefined;


/** Data of all results
 * @typedef {Object} DataResultMap
 * @property {string} map_name
 * @property {number[]} scores
 * @property {number[]} scores_sum
 * 
 * @typedef {Object} DataResultGroup
 * @property {string} group_name
 * @property {number[]} player_ids
 * @property {DataResultMap[]} results
 * 
 * @typedef {Object} DataResultTourney
 * @property {string} name
 * @property {Date} date
 * @property {DataResultGroup[]} groups
 */

/**
 * @type DataResultTourney[]
 */
export var races = undefined;

const RESOURCE_BRANCH_NAME = "master";
const _resource_domain = (function() {
    if (document.URL.startsWith("localhost")) return "";
    else {
        let ps = document.URL.split("/").slice(2);
        if (!ps[0].endsWith(".github.io")) return "";

        let acc = ps[0].split(".")[0];
        let repo = ps[1];
        return `https://raw.githubusercontent.com/${acc}/${repo}/${RESOURCE_BRANCH_NAME}/`;
    }
})();
async function fetch_resource(url, type) {
    return await (await fetch(_resource_domain + url))[type]();
}

const placement_score_lookup = [
    [3, 1],
    [4, 2, 1],
    [5, 3, 2, 1],
    [6, 4, 3, 2, 1],
    [7, 5, 4, 3, 2, 1],
    [8, 6, 5, 4, 3, 2, 1],
    [10, 8, 6, 5, 4, 3, 2, 1],
    [11, 9, 7, 6, 5, 4, 3, 2, 1],
    [12, 10, 8, 7, 6, 5, 4, 3, 2, 1],
    [13, 11, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    [15, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
];
export function get_placement_score(place, num_ppl) {
    if (num_ppl < 2 || num_ppl > 12)
        alert(`could not get placement: total number of players cannot be ${num_ppl}!`);
    else if (place < 1 || place > num_ppl)
        alert(`could not get placement for no. ${place} out of ${num_ppl} players!`);
    else return placement_score_lookup[num_ppl - 2][place - 1];
}

/**
 * @param {PlayerInfo} pl
 */
export function full_name_of(pl) {
    let nm1 = pl.name_family ?? "";
    let nm2 = pl.name_first.toUpperCase();
    return pl.first_name_in_front ? `${nm2} ${nm1}` : `${nm1} ${nm2}`;
}

/**
 * From the name given, try to find a player with the closest matching name.
 * This should account for all common nicknames to make tagging races easier.
 * E.g.: names like "sui", "azki", "ina", "fbk" should work.
 * 
 * @param {string} nm
 * @returns {number} index of player
 */
export function find_closest_player(nm, nothrow = false) {
    let nm2 = nm.trim().toLowerCase();

    { //some common nicknames
        if (nm2 === "haachama") nm2 = "haato";
        else if (nm2 === "laplus" || nm2 === "lap") nm2 = "la+";
        else if (nm2 === "wamy") nm2 = "lamy";
        else if (nm2 === "god") nm2 = "matsuri";
        else if (nm2 === "foob") nm2 = "fubuki";
    }

    //look for exact match first
    let res = players.findIndex(p => p.name_lookups.some(l => l === nm2));
    if (res > -1) return res;

    //look for starting names
    res = players.findIndex(p => p.name_lookups.some(l => l.startsWith(nm2)));
    if (res > -1) return res;

    if (res === -1 && !nothrow) {
        alert(`database error: could not find player named "${nm}"!`);
    }
    return res;
}

async function load_single_result(path, title, date) {
    let json = await fetch_resource("database/races/" + path, "json");
    return Object.entries(json).map(([nm, vl]) => {
        /** @type {DataResultGroup} */
        let res = {
            group_name: nm,
            player_ids: [],
            results: []
        };
        let group_name_abrv = nm.split(" ").map(s => s[0].toUpperCase()).join("");
        if (vl.length === 0) return res;

        let ppls = vl[0]["players"];
        if (ppls !== undefined) {
            res.player_ids = ppls.map(p => find_closest_player(p)).sort((a, b) => a - b);
            res.results = [];
        }
        else {
            let tmp1 = vl.map(v => ({
                placement_ids: (Array.isArray(v.placements) ? v.placements : v.placements.split(",")).map(p => find_closest_player(p)),
                ... v
            }));
            //assume game 1 always have all players
            res.player_ids = tmp1[0].placement_ids.slice().sort((a, b) => a - b);
            let num_ppl = res.player_ids.length;
            let scores_last = res.player_ids.map(_ => 0);
            res.results = tmp1.map(t => {
                let sc = {
                    map_name: t.map_name,
                    scores: res.player_ids.map(p => get_placement_score(t.placement_ids.indexOf(p) + 1, num_ppl)),
                };
                sc.scores_sum = sc.scores.map((s, i) => s + scores_last[i]);
                (tmp1["disconnects"] ?? []).forEach(dc => {
                    sc.scores_sum[res.player_ids.indexOf(find_closest_player(dc))] = 0;
                });
                scores_last = sc.scores_sum;
                return sc;
            });
            let scf = res.results.at(-1);
            res.player_ids.map((p, i) => [p, i, scf.scores_sum[i]]).sort((a, b) => b[2] - a[2]).forEach(([p, i, scr], rnk) => {
                players[p].past_races.push({
                    date: date,
                    name: title + " - " + group_name_abrv,
                    points: scf.scores_sum[i],
                    rank: rnk + 1
                });
            });
        }

        res.player_ids.forEach(p => {
            if (players[p].racing_since === 0) {
                players[p].racing_since = +date.slice(0, 4);
            }
            players[p].racing_since = Math.min(players[p].racing_since, +date.slice(0, 4));
        })

        return res;
    });
}

export async function load() {
    players = window["Papa"].parse(await fetch_resource("database/all_players.csv", "text"), { header: true, dynamicTyping: true }).data
        .map((v, i) => ({
            player_id: i,
            game_char: "No Info",
            game_chasis: "No Info",
            game_rims: "No Info",
            game_spoiler: "No Info",
            name_lookups: (function() { 
                let n1 = (v.name_family ?? "").toLowerCase();
                let n2 = v.name_first.toLowerCase();
                return [n1, n2, [...n1].filter(c => !"aeiou".includes(c)).join(""), [...n2].filter(c => !"aeiou".includes(c)).join("")]
            })(),
            racing_since: 0,
            past_races: [],
            ...v
        }));

    (await fetch_resource("database/player_links.json", "json")).forEach(d => {
        let pid = find_closest_player(d.name.split(" ")[0].substring(0, 6), true); //for some reason, "sakuramiko" isnt spaced
        if (pid > -1) {
            players[pid].channel_url = d.youtube;
            players[pid].portrait_url = d.image;
        }
    });

    let races_tmp = window["Papa"].parse(await fetch_resource("database/races/_race_list.csv", "text"), { header: true, dynamicTyping: true }).data
        .map(lst => ({
            name: lst.name,
            date: new Date(lst.date),
            date_o: lst.date,
            file_name: lst.file_name,
        }));
    races_tmp.sort((a, b) => a.date - b.date);
    races = await Promise.all(races_tmp.map(async lst => ({
        groups: await load_single_result(lst.file_name, lst.name, lst.date_o),
        ...lst
    })));

    players_raced = players.filter(p => p.racing_since > 0);
}