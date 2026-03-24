// LOCAL JSON SERVER SETTINGS
const JSON_ADDRESS = "127.0.0.1";
const JSON_PORT = 7190;
const JSON_ENDPOINT = `http://${JSON_ADDRESS}:${JSON_PORT}/`;

// PARAM VARIABLES
var PollingRate = 333;
var HideDA = false;
var HideEnemies = false;
var ShowOnlyDamaged = false;
var BarWidth = null;
var BarHeight = null;

window.onload = function () {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	const pollingRate = urlParams.get('pollingrate');
	if (pollingRate != null) {
		let parsed = parseInt(pollingRate);
		if (!isNaN(parsed) && parsed > 0) {
			PollingRate = parsed;
		}
	}

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

	// LOCK BAR HEIGHT TO Npx OF VIEWPORT
	const barheight = urlParams.get('barheight');
	if (barheight != null) {
		let parsed = parseFloat(barheight);
		if (!isNaN(parsed) && parsed > 0) {
			BarHeight = parsed;
		}
	}

	getData();
	setInterval(getData, PollingRate);
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
	fetch(JSON_ENDPOINT, {
		targetAddressSpace: "loopback",
	})
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
//	GET THE STYLE STRING FOR BARS
//	</summary>
//	Returns inline style for bar container.
//	If BarWidth or BarHeight is set, uses vw units; otherwise empty string (falls back to CSS default).
function GetBarStyle() {
	if (BarWidth != null && BarHeight != null) {
		return ` style="width: ${BarWidth}vw; height: ${BarHeight}px"`;
	}
	else if (BarWidth != null) {
		return ` style="width: ${BarWidth}vw"`;
	}
	else if (BarWidth != null) {
		return ` style="height: ${BarHeight}px"`;
	}
	else
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
function DrawProgressBar(current, max, percent, label, colors) {
	let mainContainer = document.getElementById("srtQueryData");
	mainContainer.innerHTML += `
	<div class="bar"${GetBarStyle()}>
		<div class="bar-text ${colors[0]}" style="width: ${(percent * 100)}%">
			<span>${label}${current} / ${max}</span><span class="${colors[1]}">${(percent * 100).toFixed(1)}%</span>
		</div>
	</div>
	`;
}

//	<summary>
//	TEXTBLOCK DRAW FUNCTION
//	</summary>
//
//	label = string label
//	val = current value
//	colors = array of color class names as string
//	hideParam = user chosen query parameter
function DrawTextBlock(label, val, colors, hideParam) {
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
function DrawTextBlocks(labels, vals, colors, hideParam) {
	if (hideParam) { return; }
	let mainContainer = document.getElementById("srtQueryData");
	let children = "";
	for (var i = 0; i < labels.length; i++) {
		children += `<div class="title ${colors[0]}">${labels[i]}: <span class="${colors[1]}">${vals[i]}</span></div>`
	}
	mainContainer.innerHTML += `<div class="textblock">${children}</div>`;
}

//	<summary>
//	GET HP BAR COLOR BASED ON PERCENTAGE
//	</summary>
function GetColorByPercent(current, max) {
	if (max <= 0) return ["dead", "grey"];
	let pct = current / max;
	if (pct > 0.75) return ["fine", "green"];
	else if (pct > 0.50) return ["fineToo", "yellow"];
	else if (pct > 0.25) return ["caution", "orange"];
	else if (pct > 0) return ["danger", "red"];
	return ["dead", "grey"];
}

function GetEnemyNameByKindID(kindID) {
	switch (kindID) {
		case 58224: return "The Girl";
		case 58272: return "The Girl";
		case 59088: return "Gideon";
		case 57264: return "Zombie";
		case 58032: return "Zombie";
		case 57744: return "Zombie";
		case 57744: return "Zombie";
		case 57312: return "Zombie";
		case 57648: return "Zombie";
		case 57504: return "Organ Zombie";
		case 57360: return "Chef";
		case 57408: return "Singing Zombie";
		case 58368: return "Chunk";
		case 57456: return "Maid Zombie";
		case 57552: return "Noise Zombie";
		case 58176: return "Titan Spinner";
		case 58128: return "Licker";
		case 57840: return "Blisterborne";
		case 57792: return "Chainsaw Zombie";
		case 57984: return "BSAA Zombie";
		case 58416: return "Garmr";
		case 58464: return "Gideon";
		case 58992: return "Child";
		case 58560: return "Mr. X";
		case 58800: return "Seedling";
		case 58944: return "Seedling";
		case 58896: return "Plant 42";
		case 58608: return "Soldier";
		case 58656: return "Hunk";
		default: return null;
	}
}

function appendData(data) {
	var mainContainer = document.getElementById("srtQueryData");
	mainContainer.innerHTML = "";

	// Version Info
	//DrawTextBlock("Game", data.GameName, ["white", "green2"], false);
	DrawTextBlock("SRT Version", data.VersionInfo, ["white", "green2"], false);

	// DA Rank / Score
	DrawTextBlocks(["DARank", "DAScore"], [data.DARank, data.DAScore], ["white", "green2"], HideDA);

	// Player HP
	if (data.PlayerContext.HP) {
		let playerPercent = data.PlayerContext.HP.CurrentMaxHP > 0 ? data.PlayerContext.HP.CurrentHP / data.PlayerContext.HP.CurrentMaxHP : 0;
		let _colors = GetColorByPercent(data.PlayerContext.HP.CurrentHP, data.PlayerContext.HP.CurrentMaxHP);
		DrawProgressBar(data.PlayerContext.HP.CurrentHP, data.PlayerContext.HP.CurrentMaxHP, playerPercent, "Player: ", _colors);
	}

	// Enemy HPs
	if (!HideEnemies && data.EnemyContexts) {
		var filteredEnemies = data.EnemyContexts.filter(function (m) {
			// Filter out enemies with 0 MaxHP (invalid/empty slots)
			if (m.HP.CurrentMaxHP <= 0) return false;
			// Filter out dead enemies.
			if (m.HP.CurrentHP <= 0) return false;
			// If ShowOnlyDamaged, only show enemies that have taken damage
			if (ShowOnlyDamaged && m.HP.CurrentHP >= m.HP.CurrentMaxHP) return false;
			return true;
		});

		filteredEnemies.sort(function (a, b) {
			let pctA = a.HP.CurrentMaxHP > 0 ? a.HP.CurrentHP / a.HP.CurrentMaxHP : 0;
			let pctB = b.HP.CurrentMaxHP > 0 ? b.HP.CurrentHP / b.HP.CurrentMaxHP : 0;
			return Asc(pctA, pctB) || Desc(a.HP.CurrentHP, b.HP.CurrentHP);
		}).forEach(function (item) {
			let percent = item.HP.CurrentMaxHP > 0 ? item.HP.CurrentHP / item.HP.CurrentMaxHP : 0;
			let enemyName = GetEnemyNameByKindID(item.KindID);
			if (enemyName)
				enemyName += " ";
			DrawProgressBar(item.HP.CurrentHP, item.HP.CurrentMaxHP, percent, enemyName ?? "", ["danger", "red"]);
		});
	}
}
