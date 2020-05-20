const form = document.getElementById("form");
const input = document.getElementById("input");
const button = document.getElementById("button");
const error = document.getElementById("error");
const result = document.getElementById("result");

form.addEventListener("submit", e => {
  e.preventDefault();
  const value = input.value;
  button.classList.add("loading");
  button.disabled = true;
  result.innerHTML = "";
  result.classList.remove("success");
  fetch(
    "https://fr.wikipedia.org/w/api.php?action=query&list=prefixsearch&utf8=&format=json&origin=*&pssearch=" +
      encodeURIComponent(value)
  )
    .then(body => body.json())
    .then(response => response.query.prefixsearch)
    .then(results => {
      if (results.length === 0) {
        button.disabled = false;
        button.classList.remove("loading");
        result.innerHTML = "Aucune idée !";
      } else {
        const result = results[0];
        fetch(
          "https://fr.wikipedia.org/w/api.php?action=parse&origin=*&page=" +
            result.title +
            "&prop=text&formatversion=2&format=json"
        )
          .then(body => body.json())
          .then(response => {
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
              document.getElementById("result").innerHTML =
                "Aucune idée ! <small>(est-ce bien une personnalité ?)</small>";
              return;
            }
            let result;
            if (dday === null) {
              result = "Pas mort·e !";
              document.getElementById("result").classList.add("success");
            } else {
              result = "Mort·e le " + formatDate(dday.getAttribute("datetime"));
            }
            document.getElementById("result").innerHTML = result;
          });
      }
    });
});

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
