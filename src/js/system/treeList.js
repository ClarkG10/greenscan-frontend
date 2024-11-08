import { backendURL } from "../utils/utils.js";

fetchTrees();

// Function to fetch trees
async function fetchTrees() {
    const getTreeList = document.getElementById("getTreeList");

    console.log(getTreeList);

    getTreeList.innerHTML = `
  <div class="text-center mt-3">
    <div class="spinner-border" role="status">
      <span class="visually-hidden"></span>
    </div><br> Loading...
  </div>`;

  const treeResponse = await fetch(backendURL + "/api/trees",{
    headers: {
      Accept: "application/json",
    },
  })
  const trees = await treeResponse.json();

  if (treeResponse.ok) {
      let treeNumber = 1;
      let treeHtml = "";
      const commonNameSet = new Set(); // To track unique common names

      trees.forEach((tree) => {
        // Only add if common_name hasn't been added yet
        if (!commonNameSet.has(tree.common_name)) {
          commonNameSet.add(tree.common_name); // Add to the set
          treeHtml += `
      <div class="col-lg-4 col-md-6 col-sm-12" style="margin-top: -12px !important">
          <div type="button" class="p-3 rounded-3 shadow-sm border" style="border-right: 5px solid #4f7942 !important">
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