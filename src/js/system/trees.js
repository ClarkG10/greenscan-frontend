import { backendURL, logout } from "../utils/utils.js";

logout();

const loader = document.getElementById('loader');
loader.innerHTML = `<div class="loader-overlay"><div class="loader"></div></div>`

const PI = Math.PI;
const treeForm = document.getElementById("createTree_form");

treeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    document.querySelector("#createTree_form button").disabled = true;
    document.querySelector("#createTree_form button").innerHTML = "Creating...";

    const profileResponse = await fetch(backendURL + "/api/profile/show",{
        headers: {
            Accept: "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
        },
    })

    console.log(treeForm);

    const profileData = await profileResponse.json();

    // Get values from form inputs
    const circumferenceAtBreastHeight = parseFloat(document.getElementById("circumferenceAtBreast").value);
    const circumferenceAtBase = parseFloat(document.getElementById("circumferenceAtBase").value);
    const distanceFromTree = parseFloat(document.getElementById("distanceFromTree").value);
    const angleOfElevation = parseFloat(document.getElementById("angleOfElevation").value);

    // Perform calculations
    const DBH = calculateDBH(circumferenceAtBreastHeight);
    const DAB = calculateDAB(circumferenceAtBase);
    const treeHeight = calculateTreeHeight(distanceFromTree, angleOfElevation);
    const treeVolume = calculateTreeVolume(DBH, treeHeight);
    const biomass = calculateBiomass(DBH);
    const carbonStored = calculateCarbonStored(biomass);

    console.log(circumferenceAtBase, DAB)
    // Create FormData from form and append calculated values
    const formData = new FormData(treeForm);
    formData.append("dbh", DBH);
    formData.append("dab", DAB);
    formData.append("t_height", treeHeight);
    formData.append("tree_volume", treeVolume);
    formData.append("biomass", biomass);
    formData.append("carbon_stored", carbonStored);
    formData.append("user_id", profileData.id);

    // Send form data to backend
    const treeResponse = await fetch(backendURL + "/api/trees", {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: formData,
    });

    const treeData = await treeResponse.json();
    console.log(treeData);

    if (treeResponse.ok) {
        treeForm.reset();
        alert("Tree created successfully!");
        await getTreeData();
    }

    document.querySelector("#createTree_form button").disabled = false;
    document.querySelector("#createTree_form button").innerHTML = `Create a new tree`;
});

// Function to calculate DBH from circumference at breast height
function calculateDBH(circumference) {
    return circumference / PI;
}

// Function to calculate DAB from circumference at base
function calculateDAB(baseCircumference) {
    return baseCircumference / PI;
}

// Function to calculate Tree Height using angle measurement
function calculateTreeHeight(distance, angleInDegrees) {
    const angleInRadians = angleInDegrees * (PI / 180);
    return distance * Math.tan(angleInRadians);
}

// Function to calculate Tree Volume using treeHeight
function calculateTreeVolume(DBH, treeHeight, formFactor = 0.5) {
    return (PI / 4) * Math.pow(DBH, 2) * treeHeight * formFactor;
}

// Function to calculate Biomass
function calculateBiomass(DBH) {
    return 0.0673 * Math.pow(DBH, 2.6);  // Simplified for tropical trees
}

// Function to calculate Carbon Stored
function calculateCarbonStored(biomass) {
    return biomass * 0.5;
}


getTreeData();
async function getTreeData(url, keyword = "") {
    const  getTreeData = document.getElementById("getTreeData");

    let queryParams = 
    "?" + 
    (url ? new URL(url).searchParams + "&" : "") + 
    (keyword ? "keyword=" + encodeURIComponent(keyword) + "&" : "");

    const treeResponse = await fetch(url || backendURL + "/api/paginated/trees" + queryParams, {
        headers: {
            Accept: "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
        },
    });

    const treeData = await treeResponse.json();
    console.log(treeData);
    if(treeResponse.ok){
        let treeHtml = "";

        treeData.data.forEach(tree => {
            treeHtml += ` <tr>
                      <td class="fw-bold">${tree.tree_id}</td>
                      <td>${tree.common_name}</td>
                      <td>${tree.scientific_name} John</td>
                      <td>${tree.family_name}</td>
                      <td>${tree.economic_use}</td>
                      <td>${tree.dbh}cm</td>
                      <td>${tree.dab}cm</td>
                      <td>${tree.t_height}m</td>
                      <td>${tree.biomass}kg</td>
                      <td>${tree.carbon_stored}kg</td>
                      <td ><span class="fw-bold bg-secondary-subtle p-2 rounded-3">${tree.tree_health}</span></td>
                      <td>
                        <div
                          class="d-flex justify-content-center align-items-center"
                        >
                          <button
                            class="me-2 btn text-white"
                            style="background-color: #4f7942"
                            data-bs-toggle="modal" 
                            data-bs-target="#displayTreeModal_${tree.tree_id}"
                          >
                            Details</button
                          ><button class="btn bg-secondary-subtle" id="deletetreeButton" data-id="${tree.tree_id}">
                            <img src="src/icon/trash.png" alt="" width="14px" data-id="${tree.tree_id}" id="deletetreeButton" />
                          </button>

                          ${displayTreeDataModal(tree)}
                        </div>

                        <!-- Modal -->
                      </td>
                    </tr>`
                  // }
        });

    getTreeData.innerHTML = treeHtml;

    // Attach modal event listener to generate QR code on modal show
    treeData.data.forEach(tree => {
        const modal = document.getElementById(`displayTreeModal_${tree.tree_id}`);
        modal.addEventListener("shown.bs.modal", () => {
            displayQRCode(tree.tree_id);
        });
    });

    let pagination = "";

    if (treeData.links) {
        treeData.links.forEach((link) => {
            pagination += `
                <li class="page-item" >
                    <a class="page-link ${link.url == null ? " disabled" : ""}${link.active ? " active" : ""}" href="#" data-url="${link.url}" style="color: #4F7942">
                        ${link.label}
                    </a>
                </li>`;
        });
    }

    document.getElementById("pages").innerHTML = pagination;

    document.querySelectorAll("#pages .page-link").forEach((link) => {
      link.addEventListener("click", pageAction);
  });

  document.addEventListener("click", (e) => {
    if (e.target.id === "deletetreeButton") {
        deletetreeClick(e);
    } else if (e.target.id === "updateButton") {
        updatetreeClick(e);
    }
});
    }else{
        console.log(treeData.message);
    }

    loader.innerHTML = ""; // Remove loader when data is fetched successfully
}

const search_form = document.getElementById("search_form");
search_form.onsubmit = async (e) => {
    e.preventDefault(); 

    const formData = new FormData(search_form); 
    const keyword = formData.get("keyword");
    console.log( keyword);

    getTreeData("", keyword);
}

const pageAction = async (e) => {
    e.preventDefault();
    const url = e.target.getAttribute("data-url");
    await getTreeData(url);
  }

  function updatetreeClick(e) {
    const tree_id = e.target.getAttribute("data-id");
    console.log(tree_id)
    updateTreeData(tree_id);
  }
  
  function deletetreeClick(e) {
    const tree_id = e.target.getAttribute('data-id');
    console.log(tree_id)
    deleteTreeData(tree_id);
    }
  
  async function updateTreeData(id) {
    const treeForm = document.getElementById("update_tree_form_" + id);
    console.log(treeForm)
    // Ensure form exists before continuing
    if (!treeForm) {
        console.error("tree form not found!");
        return;
    }
  
    treeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      document.querySelector("#updateButton").disabled = true;
      document.querySelector("#updateButton").innerHTML = `Updating...`;


       // Get values from form inputs
    const circumferenceAtBreastHeight = parseFloat(document.getElementById("circumferenceAtBreast_" + id).value || 0);
    const circumferenceAtBase = parseFloat(document.getElementById("circumferenceAtBase_" + id).value || 0);
    const distanceFromTree = parseFloat(document.getElementById("distanceFromTree_" + id).value || 0);
    const angleOfElevation = parseFloat(document.getElementById("angleOfElevation_" + id).value || 0);

    // Create FormData from form and append calculated values
    const formData = new FormData(treeForm);

    // Perform calculations only if none of the required values are 0
    if (circumferenceAtBreastHeight !== 0 && circumferenceAtBase !== 0 && distanceFromTree !== 0 && angleOfElevation !== 0) {
      // Calculate DBH, DAB, tree height, volume, biomass, and carbon stored
      const DBH = calculateDBH(circumferenceAtBreastHeight);
      const DAB = calculateDAB(circumferenceAtBase);
      const treeHeight = calculateTreeHeight(distanceFromTree, angleOfElevation);
      const treeVolume = calculateTreeVolume(DBH, treeHeight);
      const biomass = calculateBiomass(DBH);
      const carbonStored = calculateCarbonStored(biomass);

      // Append calculated values to formData
      formData.append("dbh", DBH);
      formData.append("dab", DAB);
      formData.append("t_height", treeHeight);
      formData.append("tree_volume", treeVolume);
      formData.append("biomass", biomass);
      formData.append("carbon_stored", carbonStored);
    }
    else {
      // No data to update since one or more values are 0
      console.log("Invalid input: One or more values are 0, no data will be updated.");
    }

    formData.append("_method", "PUT");
  
      try {
          const treeResponse = await fetch(backendURL + "/api/trees/" + id, {
              method: "POST",
              headers: {
                  Accept: "application/json",
                  Authorization: "Bearer " + localStorage.getItem("token"),
              },
              body: formData,
          });
  
          const treeData = await treeResponse.json();
  
          if (treeResponse.ok) {
              console.log("Update successful:", treeData.message);
              alert("Tree updated successfully");
              document.querySelector(".btn-close_" + id).click();
              await getTreeData(); // Refresh the tree list
          } else {
              console.error("Update failed:", treeData.message);
          }
      } catch (error) {
          console.error("Error updating tree:", error);
      }
  
      document.querySelector("#updateButton").disabled = false;
      document.querySelector("#updateButton").innerHTML = `Update tree`;
  });
  }
  
  
  async function deleteTreeData(id) {
    if (confirm("Are you sure you want to delete this tree?")) {
        const treeResponse = await fetch(backendURL + "/api/trees/" + id, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                Authorization: "Bearer " + localStorage.getItem("token"),
            },
        });
    
        const treeData = await treeResponse.json();
    
        if (treeResponse.ok) {
            await getTreeData();
        } else {
            console.error("Delete failed:", treeData.message);
        }
    }
}
    
    function displayTreeDataModal(tree) {
        return `    
      <div class="modal fade"
      id="displayTreeModal_${tree.tree_id}"
      aria-hidden="true"
      tabindex="-1"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bold">
              Tree Details
            </h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="d-flex justify-content-end align-items-end">
              <button
                type="button"
                class="btn bg-secondary-subtle me-3 mt-2"
                data-bs-target="#updateTreeModal_${tree.tree_id}"
                data-bs-toggle="modal"
              >
                Update
              </button>
            </div>
            <div id="qrcode-container" class="mb-4">
              <canvas
                class="w-75"
                id="qrcodeCanvas_${tree.tree_id}"
                style="max-width: 200px; height: auto"
              ></canvas>
              <br />
              <button
                id="download-btn_${tree.tree_id}"
                class="btn"
                style="background-color: #4f7942; color: white"
              >
                Download QR Code
              </button>
            </div>
            <div class="container px-3">
              <div class="row">
                <div class="col-6">
                  <span class="opacity-50 fw-bold">Tree ID:</span
                  ><br />${tree.tree_id}
                </div>
                <div class="col-6">
                  <span class="opacity-50 fw-bold">Common Name:</span
                  ><br />${tree.common_name}
                </div>
                <div class="col-6">
                  <span class="opacity-50 fw-bold">Scientific Name:</span
                  ><br />${tree.scientific_name}
                </div>
                <div class="col-6">
                  <span class="opacity-50 fw-bold">Family Name:</span
                  ><br />${tree.family_name}
                </div>
                <div class="col-6">
                  <span class="opacity-50 fw-bold">Economic Use:</span
                  ><br />${tree.economic_use}
                </div>
                <div class="col-6">
                  <span class="opacity-50 fw-bold">DHB:</span><br />${tree.dbh}cm
                </div>
                <div class="col-6">
                  <span class="opacity-50 fw-bold">DAB:</span><br />${tree.dab}cm
                </div>
                <div class="col-6">
                  <span class="opacity-50 fw-bold">Tree Height:</span
                  ><br />${tree.t_height }m
                </div>
                <div class="col-6">
                  <span class="opacity-50 fw-bold">Biomass:</span
                  ><br />${tree.biomass}kg
                </div>
                <div class="col-6">
                  <span class="opacity-50 fw-bold">Carbon Stored:</span
                  ><br />${tree.carbon_stored}kg
                </div>
                <div class="col-6">
                  <span class="opacity-50 fw-bold">Health:</span 
                  ><br /><span class="bg-secondary-subtle p-2 fw-bold rounded-3">${tree.tree_health}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Modal -->
    ${updateTreeDataModal(tree)}
    `;
    }
    
    
    function updateTreeDataModal(tree) {
      return ` <div
        class="modal fade"
        id="updateTreeModal_${tree.tree_id}"
        aria-hidden="true"
        tabindex="-1"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5 fw-bold" >
                Update Tree
              </h1>
              <button
                type="button"
                class="btn-close_${tree.tree_id} btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <!-- Your form here -->
              <div class="floating-form">
                <form id="update_tree_form_${tree.tree_id}">
                  <!-- Common Name -->
                  <div class="form-floating mb-3">
                    <input
                      type="text"
                      class="form-control"
                      id="commonName"
                      placeholder="Common Name"
                      name="common_name"
                      value="${tree.common_name}"
                    />
                    <label for="commonName">Common Name</label>
                  </div>
                  <!-- Scientific Name -->
                  <div class="form-floating mb-3">
                    <input
                      type="text"
                      class="form-control"
                      id="scientificName"
                      placeholder="Scientific Name"
                      name="scientific_name"
                      value="${tree.scientific_name}"
                    />
                    <label for="scientificName">Scientific Name</label>
                  </div>
                  <!-- Family Name -->
                  <div class="form-floating mb-3">
                    <input
                      type="text"
                      class="form-control"
                      id="familyName"
                      placeholder="Family Name"
                      name="family_name"
                      value="${tree.family_name}"
                    />
                    <label for="familyName">Family Name</label>
                  </div>
                  <!-- Economic Use -->
                  <div class="form-floating mb-3">
                    <input
                      type="text"
                      class="form-control"
                      id="economicUse"
                      placeholder="Economic Use"
                      name="economic_use"
                      value="${tree.economic_use}"
                    />
                    <label for="economicUse">Economic Use</label>
                  </div>
                  <!-- DBH -->
                  <span class="fw-bold">To calculate DBH</span><br />
                  <div class="form-floating mb-3">
                    <input
                      type="number"
                      class="form-control"
                      id="circumferenceAtBreast_${tree.tree_id}"
                      placeholder="Circumference at breast"
                      name="circumferenceAtBreast"
                    />
                    <label for="circumferenceAt_breast"
                      >Circumference at breast (cm)</label
                    >
                  </div>
                  <!-- DAB -->
                  <span class="fw-bold">To calculate DAB</span><br />
                  <div class="form-floating mb-3">
                    <input
                      type="number"
                      class="form-control"
                      id="circumferenceAtBase_${tree.tree_id}"
                      placeholder="Circumference at base"
                      name="circumferenceAtBase"
                    />
                    <label for="circumferenceAtBase"
                      >Circumference at base (cm)</label
                    >
                  </div>
                  <!-- Total Height -->
                  <span class="fw-bold">To calculate Tree Height</span><br />
                  <div class="form-floating mb-3">
                    <input
                      type="number"
                      class="form-control"
                      id="distanceFromTree_${tree.tree_id}"
                      placeholder="Distance from tree"
                      name="distanceFromTree"
                    />
                    <label for="distanceFrom_tree"
                      >Distance from tree (meters)</label
                    >
                  </div>
                  <div class="form-floating mb-3">
                    <input
                      type="number"
                      class="form-control"
                      id="angleOfElevation_${tree.tree_id}"
                      placeholder="Angle of elevation"
                      name="angleOfElevation"
                    />
                    <label for="angleOfElevation">Angle of elevation</label>
                  </div>
                  <hr />
                  <!-- Health (Dropdown) -->
                  <div class="form-floating mb-3">
                    <select class="form-select" id="health" name="tree_health">
                      <option value="Healthy" ${tree.tree_health == "Healthy" ? `selected` : ``}>Healthy</option>
                      <option value="Fair" ${tree.tree_health == "Fair" ? `selected` : ``}>Fair</option>
                      <option value="Poor" ${tree.tree_health == "Poor" ? `selected` : ``}>Poor</option>
                    </select>
                    <label for="health">Health</label>
                  </div>
                  <!-- Age -->
                  <div class="form-floating mb-3">
                    <input
                      type="number"
                      class="form-control"
                      id="age"
                      placeholder="Age"
                      name="age"
                      value="${tree.age}"
                    />
                    <label for="age">Tree age</label>
                  </div>
                  <!-- IUCN Status (Dropdown) -->
                  <div class="form-floating mb-3">
                    <select
                      class="form-select"
                      id="iucnStatus"
                      name="iucn_status"
                    >
                      <option value="Least Concern" ${tree.iucn_status == "Least Concern" ? `selected` : ``}>
                        Least Concern
                      </option>
                      <option value="Near Threatened" ${tree.iucn_status == "Near Threatened" ? `selected` : ``}>Near Threatened</option>
                      <option value="Vulnerable" ${tree.iucn_status == "Vulnerable" ? `selected` : ``}>Vulnerable</option>
                      <option value="Endangered" ${tree.iucn_status == "Endangered" ? `selected` : ``}>Endangered</option>
                      <option value="Critically Endangered" ${tree.iucn_status == "Critically Endangered" ? `selected` : ``}>
                        Critically Endangered
                      </option>
                      <option value="Extinct" ${tree.iucn_status == "Extinct" ? `selected` : ``}>Extinct</option>
                    </select>
                    <label for="iucnStatus">IUCN Status</label>
                  </div>
                  <!-- Longitude -->
                  <div class="form-floating mb-3">
                    <input
                      type="number"
                      class="form-control"
                      id="longitude"
                      placeholder="Longitude"
                      name="longitude"
                      value="${tree.longitude}"
                    />
                    <label for="longitude">Longitude</label>
                  </div>
  
                  <!-- Latitude -->
                  <div class="form-floating mb-3">
                    <input
                      type="number"
                      class="form-control"
                      id="latitude"
                      placeholder="Latitude"
                      name="latitude"
                      value="${tree.latitude}"
                    />
                    <label for="latitude">Latitude</label>
                  </div>
                  <!-- Price -->
                  <div class="form-floating mb-3">
                    <input
                      type="number"
                      class="form-control"
                      id="price"
                      placeholder="Price"
                      name="price"
                      value="${tree.price}"
                    />
                    <label for="price">Price</label>
                  </div>
                
                  <!-- Submit Button -->
                  <div class="d-grid">
                    <button
                      type="submit"
                      id="updateButton"
                      data-id="${tree.tree_id}"
                      class="btn text-white "
                      style="background-color: #4f7942"
                    >
                      Update Tree
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function displayQRCode(treeID) {
    const qrData = String(treeID);  // Ensure treeID is a string
    const qrCodeSize = 180;

    const qrCanvas = document.getElementById(`qrcodeCanvas_${treeID}`);
    const downloadBtn = document.getElementById(`download-btn_${treeID}`);

    QRCode.toCanvas(
        qrCanvas,
        qrData,
        {
            width: qrCodeSize,
            margin: 2,
        },
        function (error) {
            if (error) {
                console.error("Error generating QR code:", error);
            } else {
                console.log("QR code generated successfully!");
            }
        }
    );

    // Clear any previous click event listeners
    downloadBtn.replaceWith(downloadBtn.cloneNode(true));
    const newDownloadBtn = document.getElementById(`download-btn_${treeID}`);

    newDownloadBtn.addEventListener("click", function () {
        const downloadCanvas = document.createElement("canvas");
        const ctx = downloadCanvas.getContext("2d");
        const textHeight = 60;

        downloadCanvas.width = 500;
        downloadCanvas.height = 500 + textHeight;

        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText(qrData, downloadCanvas.width / 2, textHeight - 20);
        ctx.drawImage(qrCanvas, 0, textHeight, 500, 500);

        const link = document.createElement("a");
        link.download = `tree_${treeID}_qrcode.png`;
        link.href = downloadCanvas.toDataURL("image/png");
        link.click();
    });
}

  
