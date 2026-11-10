function el(tag, text, cls) {
const e = document.createElement(tag);
if (text) e.textContent = text;
if (cls) e.className = cls;
return e;
}

async function loadMovies() {
const res = await fetch("/api/movies");
const movies = await res.json();
const box = document.getElementById("movies");
movies.forEach((m) => {
const card = el("div", "", "card");
const img = document.createElement("img");
img.src = "images/" + m.id + ".jpg";
img.alt = m.title;
img.className = "poster";
card.appendChild(img);
card.appendChild(el("h3", m.title));
card.appendChild(el("p", m.genre + " | " + m.language + " | " + m.duration_min + " min", "meta"));
card.appendChild(el("span", "Rating: " + m.rating, "rating"));
card.appendChild(el("p", m.description, "desc"));
const link = el("a", "View shows", "btn");
link.href = "movie.html?id=" + m.id;
card.appendChild(link);
box.appendChild(card);
});
}

loadMovies();