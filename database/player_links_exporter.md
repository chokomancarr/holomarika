# exporting talent links

This is for generating the `player_links.json` file, which will contain the talent youtube urls and profile pictures.

1. navigate to `https://hololive.hololivepro.com/talents`.

2. open console (f12) and paste the following command:

```
(async function() {
	let urls = Array.from(document.querySelectorAll(".talent_list li a"));
	let parser = new DOMParser();
	let res = await Promise.all(
		urls.map(async url => {
			let src = await (await fetch(url.href)).text();
			let dom = parser.parseFromString(src, "text/html");
			let divs = dom.querySelector("#talent_figure figure img");
			return {
				name: url.href.slice(0, -1).split("/").at(-1).replace("-", " "),
				youtube: dom.querySelector("ul.t_sns li a").href.split("?")[0],
				image: dom.querySelector("#talent_figure figure img").src
			};
		})
	);
	console.log(JSON.stringify(res, null, 2));
})()
```

3. save the output text as `player_links.json`.