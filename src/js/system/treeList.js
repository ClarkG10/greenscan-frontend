import { backendURL } from "../utils/utils.js";

fetchTrees();

// Function to fetch trees
async function fetchTrees(keyword = "") {
    const getTreeList = document.getElementById("getTreeList");

    getTreeList.innerHTML = `
  <div class="text-center mt-3">
    <div class="spinner-border" role="status">
      <span class="visually-hidden"></span>
    </div><br> Loading...
  </div>`;

  let queryParams = 
  "?" + 
  // (url ? new URL(url).searchParams + "&" : "") + 
  (keyword ? "keyword=" + encodeURIComponent(keyword) + "&" : "");

  const treeResponse = await fetch(backendURL + "/api/trees" + queryParams,{
    headers: {
      Accept: "application/json",
    },
  })
  const trees = await treeResponse.json();

  if (treeResponse.ok) {
      let treeNumber = 1;
      let treeHtml = "";
      const scientificNameSet = new Set(); // To track unique scientific names

      trees.forEach((tree) => {
        // Only add if scientific_name hasn't been added yet
        if (!scientificNameSet.has(tree.scientific_name)) {
          scientificNameSet.add(tree.scientific_name); // Add to the set
          treeHtml += `
      <div class="col-lg-4 col-md-6 col-sm-12" style="margin-top: -12px !important">
          <div type="button" class="p-3 rounded-3 shadow-sm border bg-white" style="border-right: 5px solid #4f7942 !important" data-bs-toggle="modal" data-bs-target="#viewTree_${tree.tree_id}">
            <span class="fw-bold me-2">${treeNumber}</span>
            <span class="fw-bold">${tree.common_name}</span> - <i>${tree.scientific_name}</i> - <span>${tree.family_name}</span>
          </div>
      </div>

     <!-- Modal -->
<div class="modal fade" id="viewTree_${tree.tree_id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header" style="background-color: #4F7942">
        <h1 class="modal-title fs-5 text-white fw-bold" id="exampleModalLabel">Tree Details</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="row text-center ">
          <!-- Tree Image -->
          <div class="col-12 text-center mb-4">
            <img class="border shadow-sm rounded-3" src="${tree.image_path ? `${backendURL}/storage/${tree.image_path}` : 'src/imgs/No image.png'}" width="400px" alt="Tree Image" />
          </div>
          <!-- Tree Details -->
          <div class="col-sm-4 "> <span class="opacity-75 fw-bold">Common Name </span> <div class=" fw-bold">${tree.common_name}</div></div>
          <div class="col-sm-4 "> <span class="opacity-75 fw-bold">Scientific Name </span> <div class="fw-bold">${tree.scientific_name}</div></div>
          <div class="col-sm-4 "> <span class="opacity-75 fw-bold">Family Name  </span><div class="fw-bold">${tree.family_name}</div></div>
          <div class="col-sm-6 "> <span class="opacity-75 fw-bold">IUCN Status  </span><div class="fw-bold">${tree.iucn_status}</div></div>
          <div class="col-sm-6 "> <span class="opacity-75 fw-bold">Economic Use </span><div class="fw-bold">${tree.economic_use}</div></div>
        </div>
      </div>
    </div>
  </div>
</div>

    `;
          treeNumber++;
        }
      });

      getTreeList.innerHTML = treeHtml;
    }else {
      alert(json.message);
    }
}

const search_form = document.getElementById("search_form");
search_form.onsubmit = async (e) => {
    e.preventDefault(); 

    const formData = new FormData(search_form); 
    const keyword = formData.get("keyword");
    console.log( keyword);

    fetchTrees(keyword);
}