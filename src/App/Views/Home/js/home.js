if (!localStorage.getItem("usuario")) {
  window.location.href = "../Usuario/index.html";
}

const noticias = [
  { id: 1, titulo: "Primeira notícia", conteudo: "Conteúdo 1" },
  { id: 2, titulo: "Segunda notícia", conteudo: "Conteúdo 2" }
];

const container = document.getElementById("lista-noticias");

noticias.forEach(n => {
  const card = document.createElement("div");
  card.classList.add("card");

  card.innerHTML = `
    <h2>${n.titulo}</h2>
    <button class="btn">Ler</button>
  `;

  card.querySelector("button").addEventListener("click", () => {
    localStorage.setItem("noticia", JSON.stringify(n));
    window.location.href = "../Noticia/index.html";
  });

  container.appendChild(card);
});

document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("usuario");
  window.location.href = "../Usuario/index.html";
});
