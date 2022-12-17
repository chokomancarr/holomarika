function ui_reg_multipick(elems, onpick) {
    return {
        last_active: 0,
        elems: elems,
        callback: onpick,
        _init() {
            this.elems.forEach((h, i) => {
                h.addEventListener("click", e => {
                    this.pick(i);
                })
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
function ui_reg_multipick_arr(arr, onpick) {
    return ui_reg_multipick(arr.map(a => document.getElementById(a)), onpick);
}
function ui_reg_multipick_cls(cls, onpick) {
    return ui_reg_multipick(Array.from(document.getElementsByClassName(cls)), onpick);
}