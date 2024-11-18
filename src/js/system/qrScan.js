import { backendURL } from "../utils/utils.js";

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
      const treeResponse = await fetch(backendURL + '/api/trees/' + treeId, {
          headers: {
              Accept: "application/json",
          },
      });

      const treeData = await treeResponse.json();

      if (treeResponse.ok) {
          displayTreeDetails(treeData);
          showToast("Tree details fetched successfully!", true);
          isScanning = true;
          updateTreeLocation(treeId);
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

function getCurrentPositionPromise() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }
  
  async function updateTreeLocation(treeId) {
    if (!treeId) {
        console.error("Invalid tree ID for location update.");
        showToast("Invalid tree ID. Unable to update location.", false);
        return;
    }

    if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        showToast("Geolocation not supported", false);
        return;
    }

    try {
        const position = await getCurrentPositionPromise();
        const treeLocationResponse = await fetch(backendURL + '/api/trees/update-location/' + treeId, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                _method: "PUT",
            }),
        });

        const treeData = await treeLocationResponse.json();

        if (treeLocationResponse.ok) {
            console.log("Tree location updated successfully:", treeData);
            showToast("Tree location updated successfully!", true);
        } else {
            console.error("Error updating tree location:", treeData);
            showToast(treeData.message || "Error updating tree location", false);
        }
    } catch (error) {
        console.error("Error updating tree location:", error);
        showToast("Error connecting to the server.", false);
    }
}

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
      <div class="row">
          <div class="col-6">
              <p><span class="fw-bold opacity-50">Common Name:</span><br> <span class="fw-bold"> ${
                tree.common_name
              }</span></p>
              <p><span class="fw-bold opacity-50">Family Name:</span><br> <span class="fw-bold"> ${
                tree.family_name || "N/A"
              }</span></p>
              <p><span class="fw-bold opacity-50">IUCN Status:</span><br> <span class="fw-bold"> ${
                tree.iucn_status || "N/A"
              }</span></p>
              <p><span class="fw-bold opacity-50">DAB:</span><br> <span class="fw-bold"> ${
                tree.dab || "N/A"
              }</span></p>
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
          <div class="col-6">
              <p><span class="fw-bold opacity-50">Scientific Name:</span><br> <span class="fw-bold"> ${
                tree.scientific_name
              }</span></p>
              <p><span class="fw-bold opacity-50">Economic Use:</span><br> <span class="fw-bold"> ${
                tree.economic_use || "N/A"
              }</span></p>
              <p><span class="fw-bold opacity-50">DBH:</span><br> <span class="fw-bold"> ${
                tree.dbh || "N/A"
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
  `;

  document.getElementById("treeDataButton").click();
}

document.getElementById("retakeButton").addEventListener("click", function () {
    location.reload();
  });

const html5QrCode = new Html5Qrcode("reader");

function getReaderSizeAndFps() {
    let size = 0, fps = 0; 

  if (window.innerWidth >= 768) {
    size = 500; // Larger size for desktop
    fps = 30; // Higher FPS for desktop
  } else if (window.innerWidth >= 430) {
    size = 240; // Medium size for larger mobile devices
    fps = 25; // Moderate FPS for medium devices
  } else if (window.innerWidth >= 412) {
    size = 235; // Smaller size for mobile
    fps = 20; // Default FPS for mobile
  } else if (window.innerWidth >= 390) {
    size = 235; // Smaller size for mobile
    fps = 15; // Lower FPS for smaller mobile devices
  } else {
    size = 230; // Smallest size for very small devices
    fps = 20; // Lowest FPS for performance
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

function handleResize() {
  window.reload();
}

// Wait for DOM to fully load before starting the QR scanner
document.addEventListener("DOMContentLoaded", function () {
  startQrScanner();
});

// Add event listener for window resize
window.addEventListener("resize", handleResize);
