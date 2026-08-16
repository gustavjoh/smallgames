(function () {
  var app = document.getElementById("app");
  var icons = ["🍎", "⭐", "🐟", "🌸", "🚗", "🐱"];
  var amount = 1;
  var icon = "*";
  var locked = false;

  function randomAmount() { return 1 + Math.floor(Math.random() * 10); }
  function answers() {
    var values = [amount];
    while (values.length < 3) {
      var candidate = Math.max(1, Math.min(10, amount + Math.floor(Math.random() * 5) - 2));
      if (values.indexOf(candidate) === -1) values.push(candidate);
    }
    return values.sort(function () { return Math.random() - 0.5; });
  }
  function home() {
    app.innerHTML = '<main class="shell"><header><p>SMÅ SPEL</p><h1>Smallgames</h1></header>' +
      '<section class="intro"><h2>Välj ett spel</h2><p>En enkel version för Kindle.</p></section>' +
      '<article class="game-tile"><h2>Räkna</h2><p>Räkna symbolerna och välj rätt siffra.</p>' +
      '<button class="primary" id="start">Starta Räkna</button></article></main>';
    document.getElementById("start").onclick = newRound;
  }
  function newRound() {
    amount = randomAmount();
    icon = icons[Math.floor(Math.random() * icons.length)];
    locked = false;
    var items = "";
    for (var i = 0; i < amount; i++) items += "<span>" + icon + "</span>";
    var choices = answers();
    var buttons = "";
    for (var j = 0; j < choices.length; j++) buttons += '<button class="number-button" data-number="' + choices[j] + '">' + choices[j] + "</button>";
    app.innerHTML = '<main class="shell"><header><p>SIFFERLEK</p><h1>Räkna</h1></header>' +
      '<p>Hur många symboler ser du?</p><div class="count-items" aria-label="' + amount + ' symboler">' + items + '</div>' +
      '<p>Välj rätt siffra:</p><div class="number-bank">' + buttons + '</div><p class="message" id="message"></p>' +
      '<button class="back" id="back">Till startsidan</button></main>';
    document.getElementById("back").onclick = home;
    var all = document.querySelectorAll("[data-number]");
    for (var k = 0; k < all.length; k++) all[k].onclick = choose;
  }
  function choose(event) {
    if (locked) return;
    var button = event.target;
    var message = document.getElementById("message");
    if (Number(button.getAttribute("data-number")) === amount) {
      locked = true;
      button.className += " count-correct";
      message.innerHTML = "Rätt!";
      setTimeout(newRound, 900);
    } else {
      button.className += " count-wrong";
      message.innerHTML = "Försök igen.";
    }
  }
  home();
}());
