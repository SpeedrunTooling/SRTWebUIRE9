// LOCAL JSON SERVER SETTINGS
var JSON_ADDRESS = "127.0.0.1";
const JSON_PORT = 7190;
const POLLING_RATE = 333;
var JSON_ENDPOINT = `http://${JSON_ADDRESS}:${JSON_PORT}/`;

// PARAM VARIABLES
var HideDA = false;
var HideEnemies = false;
var ShowOnlyDamaged = false;
var BarWidth = null; // null = default (100% of parent), or a number 1-100 for vw%

window.onload = function () {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	// HIDE DA
	const da = urlParams.get('hideda');
	if (da != null) {
		HideDA = true;
	}

	// HIDE ALL ENEMIES
	const enemies = urlParams.get('hideenemies');
	if (enemies != null) {
		HideEnemies = true;
	}

	// SHOW ONLY DAMAGED ENEMIES
	const damaged = urlParams.get('damagedonly');
	if (damaged != null) {
		ShowOnlyDamaged = true;
	}

	// LOCK BAR WIDTH TO N% OF VIEWPORT
	const barwidth = urlParams.get('barwidth');
	if (barwidth != null) {
		let parsed = parseFloat(barwidth);
		if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
			BarWidth = parsed;
		}
	}

	getData();
	setInterval(getData, POLLING_RATE);
};

var Asc = function (a, b) {
	if (a > b) return +1;
	if (a < b) return -1;
	return 0;
};

var Desc = function (a, b) {
	if (a > b) return -1;
	if (a < b) return +1;
	return 0;
};

function getData() {
	fetch(JSON_ENDPOINT)
		.then(function (response) {
			return response.json();
		})
		.then(function (data) {
			appendData(data);
		})
		.catch(function (err) {
			console.log("Error: " + err);
		});
}

//	<summary>
//	GET THE WIDTH STYLE STRING FOR BARS
//	</summary>
//	Returns inline style for bar container width.
//	If BarWidth is set, uses vw units; otherwise empty string (falls back to CSS default).
function GetBarWidthStyle()
{
	if (BarWidth != null) {
		return ` style="width:${BarWidth}vw"`;
	}
	return "";
}

//	<summary>
//	PROGRESS BAR DRAW FUNCTION
//	</summary>
//
//	current = current value;
//	max = max value;
//	percent = current / max as float 0 - 1
//	label = string label for progress bar (optional)
//	colors = array of color class names as string
function DrawProgressBar(current, max, percent, label, colors)
{
	let mainContainer = document.getElementById("srtQueryData");
	mainContainer.innerHTML += `<div class="bar"${GetBarWidthStyle()}><div class="progressbar ${colors[0]}" style="width:${(percent * 100)}%">
		<div id="currentprogress">${label}${current} / ${max}</div><div class="${colors[1]}" id="percentprogress">${(percent * 100).toFixed(1)}%</div></div></div>`;
}

//	<summary>
//	TEXTBLOCK DRAW FUNCTION
//	</summary>
//
//	label = string label
//	val = current value
//	colors = array of color class names as string
//	hideParam = user chosen query parameter
function DrawTextBlock(label, val, colors, hideParam)
{
	if (hideParam) { return; }
	let mainContainer = document.getElementById("srtQueryData");
	mainContainer.innerHTML += `<div class="title ${colors[0]}">${label}: <span class="${colors[1]}">${val}</span></div>`;
}

//	<summary>
//	FLEXBOXED TEXTBLOCK DRAW FUNCTION
//	</summary>
//
//	labels = string labels array
//	vals = current value array
//	colors = array of color class names as string
//	hideParam = user chosen query parameter
function DrawTextBlocks(labels, vals, colors, hideParam)
{
	if (hideParam) { return; }
	let mainContainer = document.getElementById("srtQueryData");
	let children = "";
	for (var i = 0; i < labels.length; i++)
	{
		children += `<div class="title ${colors[0]}">${labels[i]}: <span class="${colors[1]}">${vals[i]}</span></div>`
	}
	mainContainer.innerHTML += `<div class="textblock">${children}</div>`;
}

//	<summary>
//	GET HP BAR COLOR BASED ON PERCENTAGE
//	</summary>
function GetColorByPercent(current, max)
{
	if (max <= 0) return ["dead", "grey"];
	let pct = current / max;
	if (pct > 0.75) return ["fine", "green"];
	else if (pct > 0.50) return ["fineToo", "yellow"];
	else if (pct > 0.25) return ["caution", "orange"];
	else if (pct > 0) return ["danger", "red"];
	return ["dead", "grey"];
}

function appendData(data) {
	var mainContainer = document.getElementById("srtQueryData");
	mainContainer.innerHTML = "";

	// Version Info
	DrawTextBlock("Game", data.GameName, ["white", "green2"], false);
	DrawTextBlock("Version", data.VersionInfo, ["white", "green2"], false);

	// DA Rank / Score
	DrawTextBlocks(["DARank", "DAScore"], [data.DARank, data.DAScore], ["white", "green2"], HideDA);

	// Player HP
	if (data.PlayerContext.HP) {
		let playerPercent = data.PlayerContext.HP.CurrentMaxHP > 0 ? data.PlayerContext.HP.CurrentHP / data.PlayerContext.HP.CurrentMaxHP : 0;
		let _colors = GetColorByPercent(data.PlayerContext.HP.CurrentHP, data.PlayerContext.HP.CurrentMaxHP);
		DrawProgressBar(data.PlayerContext.HP.CurrentHP, data.PlayerContext.HP.CurrentMaxHP, playerPercent, "Player: ", _colors);
	}

	// Enemy HPs
	if (!HideEnemies && data.EnemyContexts.HP) {
		var filteredEnemies = data.EnemyContexts.HP.filter(function (m) {
			// Filter out enemies with 0 MaxHP (invalid/empty slots)
			if (m.CurrentMaxHP <= 0) return false;
			// If ShowOnlyDamaged, only show enemies that have taken damage
			if (ShowOnlyDamaged && m.CurrentHP >= m.CurrentMaxHP) return false;
			return true;
		});

		filteredEnemies.sort(function (a, b) {
			let pctA = a.CurrentMaxHP > 0 ? a.CurrentHP / a.CurrentMaxHP : 0;
			let pctB = b.CurrentMaxHP > 0 ? b.CurrentHP / b.CurrentMaxHP : 0;
			return Asc(pctA, pctB) || Desc(a.CurrentHP, b.CurrentHP);
		}).forEach(function (item) {
			let percent = item.CurrentMaxHP > 0 ? item.CurrentHP / item.CurrentMaxHP : 0;
			DrawProgressBar(item.CurrentHP, item.CurrentMaxHP, percent, "", ["danger", "red"]);
		});
	}
}
