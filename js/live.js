function load_standings_html() {
    set_inner("standings_list", Array(12).fill(0).map((_, i) => `
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

function onload_live() {
    load_standings_html();
}