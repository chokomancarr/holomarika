export function reg_click_e(elem, fn) {
    elem.addEventListener("click", fn);
}

export function reg_click(id, fn) {
    reg_click_e(document.getElementById(id), fn);
}

export function reg_multipick(elems, onpick) {
    return {
        last_active: 0,
        elems: elems,
        callback: onpick,
        _init() {
            this.elems.forEach((h, i) => {
                reg_click_e(h, _ => {
                    this.pick(i);
                });
            });
            return this;
        },
        pick(i) {
            this.elems[this.last_active].classList.remove("active");
            this.elems[i].classList.add("active");
            this.last_active = i;
            this.callback(i, this.elems[i]);
        }
    }._init();
}
export function reg_multipick_arr(arr, onpick) {
    return reg_multipick(arr.map(a => document.getElementById(a)), onpick);
}
export function reg_multipick_cls(cls, onpick) {
    return reg_multipick(Array.from(document.getElementsByClassName(cls)), onpick);
}

export function show(id, b = true) {
    document.getElementById(id).classList.toggle("hidden", !b);
}
export function hide(id) {
    document.getElementById(id).classList.add("hidden");
}