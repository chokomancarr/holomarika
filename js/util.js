//@ts-check
'use strict';

let cookies = (function() {
    let res = {};
    document.cookie.split(";")
        .forEach(s => {
            let [k, v] = s.trim().split("=");
            res[k] = v;
        });
    return res;
})();

export function cookie_get(nm, def) {
    return cookies[nm] ?? def;
}
export function cookie_set(nm, vl) {
    cookies[nm] = vl + "";
    document.cookie = nm + "=" + vl + ";max-age=31536000";
}

let url_params = (function() {
    let res = {};
    (document.URL.split("?")[1] ?? "").split("&")
        .forEach(s => {
            let [k, v] = s.split("=");
            res[k] = v;
        });
    return res;
})();

export function url_param_get(nm, def) {
    return url_params[nm] ?? def;
}


/**
 * @param {string} id
 * @param {string} content
 */
export function set_inner(id, content, add = false) {
    let el = document.getElementById(id);
    if (add) {
        el.innerHTML += content;
    }
    else {
        el.innerHTML = content;
    }
}

/**
 * @param {string} cls
 * @param {(arg0: HTMLElement, arg1: number) => void } fn
 */
export function foreach_class(cls, fn) {
    let i = 0;
    for (let c of document.getElementsByClassName(cls)) {
        fn(c, i);
        i += 1;
    }
}