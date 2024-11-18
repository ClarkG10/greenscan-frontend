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
          <div type="button" class="p-3 rounded-3 shadow-sm border bg-white" style="border-right: 5px solid #4f7942 !important">
            <span class="fw-bold me-2">${treeNumber}</span>
            <span class="fw-bold">${tree.common_name}</span> - <span>${tree.scientific_name}</span> - <span>${tree.family_name}</span>
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