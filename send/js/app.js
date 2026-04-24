function askAI() {
  const query = document.getElementById("userQuery").value.trim();

  if (!query) {
    alert("Please enter your legal query");
    return;
  }

  document.getElementById("aiResponse").innerHTML =
    "<p><b>Analyzing your case...</b></p>";

  fetch("/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  })
    .then(res => res.json())
    .then(data => {
      renderCases(data.cases);
      renderLawyers(data.lawyers);
    })
    .catch(err => {
      console.error(err);
      document.getElementById("aiResponse").innerText =
        "Backend error. Please try again.";
    });
}

function renderCases(cases) {
  const box = document.getElementById("aiResponse");
  box.innerHTML = "<h3>Similar Legal Cases</h3>";

  cases.forEach((c, i) => {
    box.innerHTML += `
      <div class="case-card">
        <b>${i + 1}. Case:</b> ${c.case_number}<br>
        <b>Similarity:</b> ${c.similarity.toFixed(4)}<br>
        <b>Tags:</b> ${c.tags}<br>
        <b>Summary:</b> ${c.solution_summary}
        <hr>
      </div>
    `;
  });
}

function renderLawyers(lawyers) {
  const panel = document.getElementById("lawyerPanel");
  panel.innerHTML = "<h3>Recommended Lawyers</h3>";

  lawyers.forEach(l => {
    const card = document.createElement("div");
    card.className = "lawyer-card";
    card.innerHTML = `
      <img src="/assets/lawyer.png">
      <div>
        <strong>${l.name}</strong><br>
        ${l.area}<br>
        <small>${l.city}</small>
      </div>
    `;

    card.onclick = () => {
      localStorage.setItem("lawyer", JSON.stringify(l));
      window.location.href = "/lawyer";
    };

    panel.appendChild(card);
  });
}
