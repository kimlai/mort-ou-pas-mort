const form = document.getElementById("form");
const input = document.getElementById("input");
const button = document.getElementById("button");
const error = document.getElementById("error");
const result = document.getElementById("result");
const note = document.getElementById("note");

const urlParams = new URLSearchParams(window.location.search);
const name = urlParams.get("name");
if (name) {
  window.history.replaceState({}, document.title, "/");
  input.value = name;
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const value = input.value;
  button.classList.add("loading");
  button.disabled = true;
  result.innerHTML = "";
  note.innerHTML = "";
  result.classList.remove("success");
  fetch(
    "https://fr.wikipedia.org/w/api.php?action=query&list=search&utf8=&format=json&origin=*&srlimit=7&srsearch=intitle:" +
      encodeURIComponent(value)
  )
    .then(body => body.json())
    .then(response => response.query.search)
    .then(results => {
      if (results.length === 0) {
        button.disabled = false;
        button.classList.remove("loading");
        result.innerHTML = "Aucune idée !";
      } else {
        const match = results[0];
        fetch(
          "https://fr.wikipedia.org/w/api.php?action=parse&origin=*&page=" +
            match.title +
            "&prop=text&formatversion=2&format=json"
        )
          .then(body => body.json())
          .then(response => {
            console.log(response);
            button.classList.remove("loading");
            button.disabled = false;
            const parser = new DOMParser();
            const doc = parser.parseFromString(
              response.parse.text,
              "text/html"
            );
            const dday = doc.documentElement.querySelector(".dday");
            const bday = doc.documentElement.querySelector(".bday");
            if (bday === null) {
              //probably not a person
              result.innerHTML =
                "<div>Aucune idée ! <small>(est-ce bien une personnalité ?)</small></div>";
              if (results.length > 1) {
                note.innerHTML = `<div><h2>Suggestions :</h2><ul class="suggestions">${suggestions(
                  results.slice(1)
                )}</ul></div>`;
              }
              return;
            }
            let resultString;
            if (dday === null) {
              resultString = "Pas mort·e !";
              result.classList.add("success");
            } else {
              resultString =
                "Mort·e le " + formatDate(dday.getAttribute("datetime"));
            }
            result.innerHTML = resultString;
          });
      }
    });
});

const suggestions = results =>
  results
    .map(match => `<li><a href="/?name=${match.title}">${match.title}</a></li>`)
    .join("");

const formatDate = value => {
  const date = new Date(value);
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre"
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};
