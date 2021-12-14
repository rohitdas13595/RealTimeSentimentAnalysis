const getSentimentEmoji = function (s) {
  if (s > 1) return "😃";
  else if (s > 0) return "😊";
  else if (s < -1) return "😢";
  else if (s < 0) return "☹️";
  else if (s === 0) return "😶";
};

document.addEventListener("DOMContentLoaded", function () {
  const input = document.querySelector("#input");
  const output = document.querySelector("#output");
  const $outputbar = document.querySelector(".sa-legend-score");
  const sentimentTable = document.querySelector("#sentiment-table");
  const entities = document.querySelector("#entities");
  const wordFreq = document.querySelector("#word-freq");
  const $NuberOfSentences = document.querySelector("#sentences-stat");
  const $NuberOfTokens = document.querySelector("#tokens-stat");
  const $NuberOfWords = document.querySelector("#words-stat");
  //Remmoving style from the text
  input.addEventListener("paste", function (e) {
    e.preventDefault();
    var text = e.clipboardData.getData("text/plain");
    document.execCommand("insertHTML", false, text);
  });

  //for entities
  input.addEventListener("keyup", async (e) => {
    e.preventDefault();
    var textValue = String(input.innerText);
    //console.log(input.innerHTML);
    //console.log(input.innerText);
    let response = await fetch("/analysis/entities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({ text: textValue }),
    });

    let result = await response.json();
    //console.log(result);
    // Entitiy list
    entities.innerHTML = "";
    result.entities.forEach(function (e) {
      entities.innerHTML += '<li class="' + e.type + '">' + e.value + "</li>";
    });
  });
  //for other stats
  input.addEventListener("keyup", async (e) => {
    e.preventDefault();
    var textValue = String(input.innerText);
    let response = await fetch("/analysis/stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({ text: textValue }),
    });

    let result = await response.json();
    //console.log(result);
    //sentences
    sentimentTable.innerHTML = "";
    result.sentiments.forEach(function (s) {
      sentimentTable.innerHTML +=
        "<tr>" +
        '<td class="sentence-emoji">' +
        getSentimentEmoji(s.sentiment) +
        "</td>" +
        '<td class="sentence-text">' +
        s.sentence +
        "</td>" +
        "<td>" +
        s.sentiment +
        "</td>" +
        "</tr>";
    });
    //Document Stats
    $NuberOfSentences.innerHTML = result.counts.sentences;
    $NuberOfTokens.innerHTML = result.counts.tokens;
    $NuberOfWords.innerHTML = result.counts.words;
    //Word frequency
    wordFreq.innerHTML = "";
    result.wordFreq.forEach(function (f) {
      wordFreq.innerHTML +=
        "<tr>" + "<td>" + f[0] + "</td>" + "<td>" + f[1] + "</td>" + "</tr>";
    });
    //tagged text
    output.innerHTML = result.taggedText;
  });

  // for normalized score
  input.addEventListener("keyup", async (e) => {
    e.preventDefault();
    var textValue = String(input.innerText);
    let response = await fetch("/analysis/score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({ text: textValue }),
    });

    let result = await response.json();
    //console.log(result);
    var value = result.normalizedScore;
    value = value.toFixed(1);
    $outputbar.innerHTML = value;
    var leftVal = String(50 + value * 10) + "%";
    $outputbar.style.left = leftVal;
  });

  //End main
});
