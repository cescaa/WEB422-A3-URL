/********************************************************************************
 * WEB422 – Assignment 2
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 *
 * https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Anna Francesca (Cesca) Dela Cruz Student ID:123123150 Date: 9/27/2024
 *
 * Published URL: https://web422-a2-kappa.vercel.app/
 *
 ********************************************************************************/

let page = 1;
const perPage = 10;
let searchName = null;

// NOTE TO PROF: My deployment of my API in Vercel from Assignment 1 is unstable.
// It was working fine until a few days ago, even though I made no changes since my submission;
// It suddenly stopped showing data and instead, began returning a 500 error.
// But, if I reload the page 6-10 times quickly, it will show the data again.

// pull data from API
function pullDataFromAPI() {
  let path = searchName ? `&name=${searchName}` : "";
  let url =
    `https://web422a1-api.onrender.com/api/listings?page=${page}&perPage=${perPage}` +
    path; // unstable API deployment, see note above

  let listingsAvailable = false;
  fetch(url)
    .then((res) => {
      listingsAvailable = true;
      return res.ok ? res.json() : Promise.reject(res.status);
    })
    .then((data) => {
      if (data.length) {
        //console.log(data);
        addListingsDataToTable(data);
        makeRowClickable();
      } else {
        console.log("Data is an empty array.");
        listingsAvailable = false;
        showNoDataMessage(listingsAvailable);
      }
    })
    .catch((err) => {
      console.log(err);
    });

  updateCurrentPage();
}

function showNoDataMessage(listingsAvail) {
  if (listingsAvail == false) {
    if (page > 1) {
      page -= 1;
    } else {
      const tblBody = document.querySelector("#listingsTable tbody");
      const singleRow = document.createElement("tr");
      const cellInRow = document.createElement("td");

      // clear listings table
      tblBody.innerHTML = "";

      // display "no data" message in table
      cellInRow.colSpan = "4";
      cellInRow.innerHTML = "<strong>No data available.</strong>";

      // append elements to table
      singleRow.appendChild(cellInRow);
      tblBody.appendChild(singleRow);
    }
  }
}

function addListingsDataToTable(data) {
  const tblBody = document.querySelector("#listingsTable tbody");
  // convert listings to one string
  let listingRow = `
  ${data
    .map(
      (listing) =>
        `<tr data-id=${
          listing._id
        } data-bs-toggle="modal" data-bs-target="#detailsModal">
<td>${listing.name}</td>
<td>${listing.room_type}</td>
<td>${listing.address.street}</td>
<td>${listing.summary ? listing.summary : "No summary available."}<br><br>
<strong>Accommodates:</strong> ${listing.accommodates}<br>
<strong>Rating:</strong> ${listing.review_scores.review_scores_rating} (${
          listing.number_of_reviews
        } Reviews)
</td>
</tr>`
    )
    .join("")}
`;
  // add to table
  tblBody.innerHTML = listingRow;
}

function updateCurrentPage() {
  const currentPage = document.getElementById("currPg");
  currentPage.innerText = page;
}

function makeRowClickable() {
  // add "click" event to created rows
  document.querySelectorAll("#listingsTable tbody tr").forEach((row) => {
    row.addEventListener("click", (e) => {
      let clickedID = row.getAttribute("data-id");
      PullClickedListingData(clickedID);
    });
  });
}

function PullClickedListingData(clickedID) {
  let url = `https://web422a1-api.onrender.com/api/listings/${clickedID}`; // Unstable API deployment (see note to prof above)

  fetch(url)
    .then((res) => {
      return res.ok ? res.json() : Promise.reject(res.status);
    })
    .then((data) => {
      if (data) {
        populateModal(data);
        //console.log(data.name);
      } else {
        console.log("Data is an empty array.");
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

// Note: error not being detected in first image, so broken image remains
function populateModal(data) {
  const detailsModal = document.getElementById("detailsModal");
  detailsModal.querySelector(".modal-title").innerHTML = data.name;

  let clickedListing = `
        <div class="modal-body">
<img id="photo" onerror="this.onerror=null;this.src = 'https://placehold.co/600x400?
text=Photo+Not+Available'" class="img-fluid w-100"
src=${data.images.picture_url}><br><br>
${
  data.neighborhood_overview
    ? data.neighborhood_overview
    : "No neighborhood overview available."
}<br><br>
<strong>Price:</strong> ${data.price.toFixed(2)}<br>
<strong>Room:</strong> ${data.room_type}<br>
<strong>Bed:</strong> ${data.bed_type} (${data.beds})<br><br>
</div>`;

  detailsModal.querySelector(".modal-body").innerHTML = clickedListing;
}

function GoToPrevPage() {
  if (page > 1) {
    page -= 1;
    pullDataFromAPI();
  }
}

function GoToPage(nextPage) {
  if (nextPage == true) {
    page += 1;
  } else {
    if (page > 1) {
      page -= 1;
    }
  }
  pullDataFromAPI();
}

function searchByName() {
  const searchInput = document.getElementById("name");
  searchName = searchInput.value;
  page = 1;
  pullDataFromAPI();
}

function clearSearch() {
  const searchInput = document.getElementById("name");
  searchInput.value = "";
  page = 1;
  searchName = null;
  pullDataFromAPI();
}

document.addEventListener("DOMContentLoaded", function () {
  pullDataFromAPI();
  const prevPgBtn = document.getElementById("prevPg");
  const nextPgBtn = document.getElementById("nextPg");
  prevPgBtn.addEventListener("click", function () {
    GoToPage(false);
  });
  nextPgBtn.addEventListener("click", function () {
    GoToPage(true);
  });
  const searchForm = document.getElementById("searchForm");
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    searchByName();
  });
  const clearForm = document.getElementById("clearForm");
  clearForm.addEventListener("click", function () {
    // e.preventDefault();
    clearSearch();
  });
});
