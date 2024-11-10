import { logout, backendURL, formatDate } from "../utils/utils.js";

logout();
const loader = document.getElementById('loader');
loader.innerHTML = `<div class="loader-overlay"><div class="loader"></div></div>`


async function fetchTreeData() {
  const getTotalTrees = document.getElementById('getTotalTrees');
  const recentlyAddedTrees = document.getElementById('recentlyAddedTrees');
  const recentActivity = document.getElementById('recentActivity');
  try {
    const treeResponse = await fetch(backendURL + "/api/trees", {
      headers: {
        Accept: "application/json",
      },
    });

    const historyResponse = await fetch(backendURL + "/api/history", {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    const userResponse = await fetch(backendURL + '/api/users',{
      headers:{
          Accept: 'application/json',
          Authorization: 'Bearer '+ localStorage.getItem('token'),
      },
  });
  


    if (!treeResponse.ok || !historyResponse.ok || !userResponse.ok) {
      throw new Error(`HTTP error! Status: ${treeResponse.status || historyResponse.status || userResponse.status}`);
    }

    const trees = await treeResponse.json();
    const history = await historyResponse.json();
    const usersData = await userResponse.json();

    getTotalTrees.innerHTML = `<h5 class="card-text fw-bold">${trees.length}</h5>`
    
    trees.reverse().slice(0, 7).forEach(tree => {
      recentlyAddedTrees.innerHTML += `
        <tr>
          <td>${tree.tree_id}</td>
          <td>${tree.common_name}</td>
          <td>${tree.scientific_name}</td>
          <td>${tree.family_name}</td>
          <td>${formatDate(tree.created_at)}</td>
        </tr>
      `;
    });

    history.data.slice(0, 7).forEach(history => {
      const userData = usersData.data.find(user => user?.id === history?.user_id);
      const treeData = trees.find(tree => tree?.tree_id === history?.tree_id);

      recentActivity.innerHTML += `     
        <tr>
          <td class="fw-bold">${history.tree_id}</td>
          <td>${treeData.scientific_name}</td>
          <td class="fw-bold ${history.action === "created" ? `text-primary` : history.action === "updated location" ? `text-success` : `text-success`}">${history.action}</td>
          <td>${userData.fullname}</td>
          <td>4${formatDate(history.created_at)}</td>
        </tr>`

        console.log(recentActivity)
    });

    const treeCounts = {};
    trees.forEach(tree => {
      const scientificName = tree.scientific_name;
      if (treeCounts[scientificName]) {
        treeCounts[scientificName]++;
      } else {
        treeCounts[scientificName] = 1;
      }
    });

    const types = Object.keys(treeCounts);
    const percentages = Object.values(treeCounts);

    return {
      types,
      percentages,
    };
  } catch (error) {
    console.error("Failed to fetch tree data:", error);
    return {
      types: [],
      percentages: []
    };
  }
}

// Function to generate random shades of green
function generateRandomGreenShades(count) {
  const shades = [];
  for (let i = 0; i < count; i++) {
    const greenShade = `hsl(${Math.floor(Math.random() * 40 + 80)}, ${Math.floor(Math.random() * 40 + 60)}%, ${Math.floor(Math.random() * 30 + 30)}%)`;
    shades.push(greenShade);
  }
  return shades;
}

// Function to render the pie chart
async function renderTreeChart() {
  const data = await fetchTreeData();

  const ctx = document.getElementById('treeChart').getContext('2d');

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.types,
      datasets: [
        {
          data: data.percentages,
          backgroundColor: generateRandomGreenShades(data.types.length),
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          enabled: true
        }
      }
    }
  });

  loader.innerHTML = ""; // Remove loader when data is fetched successfully

}

// Call the function to render the chart
renderTreeChart();
