const lawyer = JSON.parse(localStorage.getItem("lawyer"));

if (lawyer) {
  document.getElementById("lawyerName").innerText = lawyer.name;
  document.getElementById("lawyerArea").innerText = lawyer.area;
  document.getElementById("lawyerCity").innerText = lawyer.city;
  document.getElementById("lawyerEmail").innerText = lawyer.email;
}
