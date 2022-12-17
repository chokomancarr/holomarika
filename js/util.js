function do_fetch_str(path, onfetch, onfail = undefined) {
    fetch(path)
        .then(resp => resp.text())
        .then(onfetch)
        .catch(err => {
            console.error(err);
            if (onfail !== undefined) {
                onfail(err);
            }
        });
}

function set_inner(id, content, add = false) {
    let el = document.getElementById(id);
    if (add) {
        el.innerHTML += content;
    }
    else {
        el.innerHTML = content;
    }
}