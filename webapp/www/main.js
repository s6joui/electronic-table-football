const YELLOW_TEAM = 0
const BLUE_TEAM = 1
const MAX_SCORE = 9

var ws;
var scoreY = 0
var scoreB = 0

let winAudio = new Audio('assets/win.mp3');
let scoreAudio = new Audio('assets/score.mp3');

function init() {
	let ns = new NoSleep()
    setupWebsocket(ns)

    document.getElementById("start-button").onclick = function() {
		ns.enable();
        document.getElementsByTagName("body")[0].requestFullscreen()
		showOverlay("start", false)
		scoreAudio.play()
    }
}

function paintScore(scores) {
	showWinOverlay(false)
	showOverlay("loading", false)
	if (scores[YELLOW_TEAM] > 0 || scores[BLUE_TEAM] > 0) {
		showOverlay("start", false)
	}
    var scoreYEl = document.getElementById("score0")
    var scoreBEl = document.getElementById("score1")
    scoreBEl.innerHTML = scores[BLUE_TEAM]
    scoreYEl.innerHTML = scores[YELLOW_TEAM]
	if (scores[YELLOW_TEAM] > scoreY) {
		if (scores[YELLOW_TEAM] < MAX_SCORE) {
			scoreAudio.play()
		}
		console.log("yellow scores")
		scoreYEl.classList.add("scoreAnimation")
	}
	if (scores[BLUE_TEAM] > scoreB) {
		if (scores[BLUE_TEAM] < MAX_SCORE) {
			scoreAudio.play()
		}
		console.log("blue scores")
		scoreBEl.classList.add("scoreAnimation")
	}
	scoreY = scores[YELLOW_TEAM]
	scoreB = scores[BLUE_TEAM]
	setTimeout(() => {
		scoreYEl.classList.remove("scoreAnimation")
		scoreBEl.classList.remove("scoreAnimation")
	}, 1000)
}

function finishGame() {
    winAudio.play();
	let winner = scoreY > scoreB ? YELLOW_TEAM : BLUE_TEAM
	console.log("WINNER:"+ winner);
	console.log("SCORE: Y: "+ scoreY+ "  B: "+scoreB);
	setTimeout(() => {
		showWinOverlay(true, winner)
	}, 2000)
}

function resetGame() {
	ws.send("reset")
	showOverlay("loading", true)
}

function shutdown() {
	ws.send("shutdown")
	showOverlay("loading", true)
}

function setupWebsocket(noSleep) {
	
    ws = new WebSocket("ws://" + window.location.host + "/ws");

    ws.onmessage = function(e) {
        let data = JSON.parse(e.data)
        if (data.type == "SCORE") {
            let scores = data.content.split(",")
            paintScore(scores.map(s => parseInt(s)));
        } else if (data.type == "FINISH") {
            finishGame();
        }
    };

    ws.onclose = function() {
        noSleep.disable();
        alert("Connection lost.. Please refresh the page")
    };

    ws.onerror = function(e) {
		console.log(e)
        alert(e)
    };
	
}

function showOverlay(overlay, show) {
	document.getElementById(overlay+"-overlay").style.display = show ? "table" : "none"
}

function showWinOverlay(show, winner) {
	document.getElementById("win-overlay").style.display = show ? "table" : "none"
	if (winner != null) {
		console.log(winner)
		document.getElementById("win-overlay").style.color = winner === YELLOW_TEAM ? "#ffb300" : "#4488FF"
		document.getElementById("team-name").innerHTML = winner === YELLOW_TEAM ? "YELLOW" : "BLUE"
	}
}