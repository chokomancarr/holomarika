//@ts-check


/** Data of all players
 * @typedef {Object} PlayerInfo
 * @property {number} player_id
 * @property {string} name_family
 * @property {string} name_first
 * @property {boolean} first_name_in_front
 * @property {string} color_code
 * @property {string} team
 * @property {string} group
 * @property {number} rating
 * @property {string} game_char
 * @property {string} game_chasis
 * @property {string} game_rims
 * @property {string} game_spoiler
 */

/**
 * @type PlayerInfo[]
 */
var data_players = undefined;


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
 */

/**
 * @type DataResultGroup[]
 */
var data_results = undefined;

/**
 * @param {PlayerInfo} pl
 */
function full_name_of(pl) {
    let nm1 = pl.name_family;
    let nm2 = pl.name_first.toUpperCase();
    return pl.first_name_in_front ? `${nm2} ${nm1}` : `${nm1} ${nm2}`;
}


function data_load() {
    data_players = [
        {
            player_id: 1010,
            name_family: "Hoshimachi",
            name_first: "Suisei",
            first_name_in_front: false,
            color_code: "#33F",
            team: "JP Gen 0",
            group: "A",
            rating: 9.02,
            game_char: "No Info",
            game_chasis: "No Info",
            game_rims: "No Info",
            game_spoiler: "No Info",
        },
        {
            player_id: 2020,
            name_family: "Sakura",
            name_first: "Miko",
            first_name_in_front: false,
            color_code: "#F33",
            team: "JP Gen 0",
            group: "D",
            rating: 8.92,
            game_char: "No Info",
            game_chasis: "No Info",
            game_rims: "No Info",
            game_spoiler: "No Info",
        },
        {
            player_id: 3030,
            name_family: "Gawr",
            name_first: "Gura",
            first_name_in_front: false,
            color_code: "#55F",
            team: "EN Myth",
            group: "A",
            rating: 8.23,
            game_char: "No Info",
            game_chasis: "No Info",
            game_rims: "No Info",
            game_spoiler: "No Info",
        },
        {
            player_id: 4040,
            name_family: "Tokoyami",
            name_first: "Towa",
            first_name_in_front: false,
            color_code: "#F2F",
            team: "JP Gen 4",
            group: "C",
            rating: 8.52,
            game_char: "No Info",
            game_chasis: "No Info",
            game_rims: "No Info",
            game_spoiler: "No Info",
        },
        {
            player_id: 5050,
            name_family: "Kanaeru",
            name_first: "Kobo",
            first_name_in_front: true,
            color_code: "#11F",
            team: "ID Gen 3",
            group: "B",
            rating: 1.01,
            game_char: "No Info",
            game_chasis: "No Info",
            game_rims: "No Info",
            game_spoiler: "No Info",
        }
    ];


    data_results = [
        {
            group_name: "Prelim Block A",
            player_ids: [ 1010, 2020, 3030, 4040, 5050 ],
            results: [
                {
                    map_name: "Big Blue",
                    scores: [
                        1, 2, 4, 3, 5
                    ],
                    scores_sum: [
                        1, 2, 4, 3, 5
                    ]
                },
                {
                    map_name: "Mute City",
                    scores: [
                        2, 3, 4, 1, 5
                    ],
                    scores_sum: [
                        3, 5, 8, 4, 10
                    ]
                }
            ]
        },
        {
            group_name: "Prelim Block B",
            player_ids: [],
            results: []
        },
        {
            group_name: "Prelim Block C",
            player_ids: [],
            results: []
        },
        {
            group_name: "Zako Cup",
            player_ids: [],
            results: []
        },
        {
            group_name: "Finals",
            player_ids: [],
            results: []
        },
    ]
}