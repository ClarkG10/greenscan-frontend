import { backendURL, logout } from "../utils/utils.js";

let isScanning = false; // Flag to prevent multiple scans

function onScanSuccess(qrCodeMessage) {
  if (isScanning) return; // Prevent multiple scans
  isScanning = true; // Set scanning flag to true
  console.log(`QR Code scanned: ${qrCodeMessage}`);

  // Fetch the tree details
  fetchTreeDetails(qrCodeMessage);
}

function onScanError(errorMessage) {
  console.log(`QR Code scan error: ${errorMessage}`);
}

async function fetchTreeDetails(treeId) {
  if (!treeId) {
      console.error("Invalid tree ID received for fetching details.");
      showToast("Invalid tree ID. Unable to fetch details.", false);
      isScanning = false;
      return;
  }

  try {
      const treeResponse = await fetch(`${backendURL}/api/trees/${treeId}`, {
          headers: {
              Accept: "application/json",
          },
      });

      const treeData = await treeResponse.json();

      if (treeResponse.ok) {
          displayTreeDetails(treeData);
          getLocation(parseFloat(treeData.latitude), parseFloat(treeData.longitude));

          showToast("Tree details fetched successfully!", true);
          isScanning = true;
      } else {
          console.error("Error fetching tree details:", treeData);
          showToast(treeData.message || "Error fetching tree details", false);
          isScanning = false;
      }
  } catch (error) {
      console.error("Fetch tree details error:", error);
      showToast("Error connecting to the server.", false);
      isScanning = false;
  }
}

async function getAllTree() {
  const getAllTreeData = document.getElementById("getAllTrees");

  try {
    const allTreeResponse = await fetch(`${backendURL}/api/trees`, {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    const allTreeData = await allTreeResponse.json();

    if (allTreeResponse.ok) {
      let treeListHtml = `<option value="">Open this select menu</option>`; // Add a default option
      allTreeData.forEach((tree) => {
        treeListHtml += `
          <option value="${tree.tree_id}">
            ${tree.tree_id}. <i>${tree.scientific_name}</i> - ${tree.common_name} - ${tree.family_name}
          </option>`;
      });
      getAllTreeData.innerHTML = treeListHtml;

      // Add event listener to handle tree selection
      getAllTreeData.addEventListener("change", (e) => {
        const treeId = e.target.value;
        if (treeId) {
          fetchTreeDetails(treeId);
        }
      });
    } else {
      console.error("Error fetching all trees:", allTreeData);
    }
  } catch (error) {
    console.error("Error fetching all trees:", error);
  }
}

getAllTree();

// Function to show the toast message
function showToast(message, success = true) {
  const toastBody = document.getElementById("toast-body");
  toastBody.innerText = message;
  const toast = new bootstrap.Toast(document.getElementById("liveToast"));
  document
    .getElementById("liveToast")
    .classList.remove("bg-success", "bg-danger");
  if (success) {
    document.getElementById("liveToast").classList.add("bg-success");
  } else {
    document.getElementById("liveToast").classList.add("bg-danger");
  }
  toast.show();
}

function displayTreeDetails(tree) {
  const detailsDiv = document.getElementById("tree-details");

  detailsDiv.innerHTML = `
        <div class="d-flex justify-content-center mt-2 mb-3">
            <img class="rounded-3" src="${tree.image_path ? `${backendURL}/storage/${tree.image_path}` : `src/imgs/No image.png`}" width="400px">
        </div>
      <div class="row">
          <div class="col-6 ms-2">
              <p><span class="fw-bold opacity-50">Common Name:</span><br> <span class="fw-bold"> ${
                tree.common_name
              }</span></p>
              <p><span class="fw-bold opacity-50">Family Name:</span><br> <span class="fw-bold"> ${
                tree.family_name || "N/A"
              }</span></p>
              <p><span class="fw-bold opacity-50">IUCN Status:</span><br> <span class="fw-bold"> ${
                tree.iucn_status || "N/A"
              }</span></p>
              <p><span class="fw-bold opacity-50">DBH/DAB:</span><br> <span class="fw-bold"> ${
                tree.dbh || "N/A" } / ${tree.dab || "N/A" }
              </span></p>
              <p><span class="fw-bold opacity-50">Tree Volume:</span><br> <span class="fw-bold"> ${
                tree.tree_volume || "N/A"
              }</span></p>
              <p><span class="fw-bold opacity-50">Carbon Stored:</span><br> <span class="fw-bold"> ${
                tree.carbon_stored || "N/A"
              }</span></p>
              <p><span class="fw-bold opacity-50">Tree Health:</span><br> <span class="fw-bold"> ${
                tree.tree_health || "N/A"
              }</span></p>
          </div>
          <div class="col-5">
              <p><span class="fw-bold opacity-50">Scientific Name:</span><br> <span class="fw-bold"> ${
                tree.scientific_name
              }</span></p>
              <p><span class="fw-bold opacity-50">Economic Use:</span><br> <span class="fw-bold"> ${
                tree.economic_use || "N/A"
              }</span></p>
              <p><span class="fw-bold opacity-50">Tree Height:</span><br> <span class="fw-bold"> ${
                tree.t_height || "N/A"
              }</span></p>
              <p><span class="fw-bold opacity-50">Biomass:</span><br> <span class="fw-bold"> ${
                tree.biomass || "N/A"
              }</span></p>
              <p><span class="fw-bold opacity-50">Age:</span><br> <span class="fw-bold"> ${
                tree.age || "N/A"
              }</span></p>
              <p><span class="fw-bold opacity-50">Price:</span><br> <span class="fw-bold"> ${
                tree.price || "N/A"
              }</span></p>
          </div>
      </div>
      <div class="fw-bold my-1 text-center">Location</div>
      <div style="border: 1px solid #4F7942; border-radius: 7px"  id="map"></div>
  `;
  document.getElementById("treeDataButton").click();
}

function getLocation(latitude, longitude) {
  if (!latitude || !longitude) {
      console.error("Invalid latitude or longitude for map.");
      return;
  }

  if (isNaN(latitude) || isNaN(longitude)) {
    console.error("Invalid latitude or longitude:", latitude, longitude);
    return;
  }

  // Check if the map element exists and retry if not
  const mapElement = document.getElementById("map");
  if (!mapElement) {
      console.error("#map element is missing in the DOM.");
      setTimeout(() => getLocation(latitude, longitude), 100); // Retry after 100ms
      return;
  }

  const map = new google.maps.Map(mapElement, {
      center: { lat: latitude, lng: longitude },
      zoom: 19,
  });

  new google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: map,
  });
}


document.getElementById("retakeButton").addEventListener("click", function () {
    location.reload();
});

const html5QrCode = new Html5Qrcode("reader");

function getReaderSizeAndFps() {
    let size = 0, fps = 0; 

  if (window.innerWidth >= 768) {
    size = 500; 
    fps = 30; 
  } else if (window.innerWidth >= 430) {
    size = 240; 
    fps = 25; 
  } else if (window.innerWidth >= 412) {
    size = 235; 
    fps = 20; 
  } else if (window.innerWidth >= 390) {
    size = 235; 
    fps = 20; 
  } else {
    size = 230; 
    fps = 20; 
  }

  return { size, fps };
}

function startQrScanner() {
  const { size, fps } = getReaderSizeAndFps();

  // Log current settings for debugging
  console.log(`Starting QR scanner with size: ${size}, fps: ${fps}`);

  html5QrCode
    .start(
      { facingMode: "environment" }, // Use the back camera
      { fps: fps, qrbox: size }, // QR code box size based on device
      onScanSuccess, // Function called when QR code is scanned
      onScanError // Function called on scan error
    )
    .catch((err) => {
      console.error(`Unable to start scanning: ${err}`);
    });
}

// Wait for DOM to fully load before starting the QR scanner
document.addEventListener("DOMContentLoaded", function () {
  startQrScanner();
});
