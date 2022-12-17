function load_page(page) {
    do_fetch_str(`pages/${page}.html`, s => {
        document.getElementById("content_container").innerHTML = s;
        window["onload_" + page]();
    });
}

data_load();

ui_reg_multipick_cls("pagelist_item", (i, e) => {
    load_page(e.dataset.page);
}).pick(0);