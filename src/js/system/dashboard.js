import { logout, backendURL, formatDate } from "../utils/utils.js";

logout();
const loader = document.getElementById('loader');
loader.innerHTML = `<div class="loader-overlay"><div class="loader"></div></div>`;

async function fetchTreeData() {
  const getTotalTrees = document.getElementById('getTotalTrees');
  const recentlyAddedTrees = document.getElementById('recentlyAddedTrees');
  const recentActivity = document.getElementById('recentActivity');

  try {
    // Fetch API calls
    const [treeResponse, historyResponse, userResponse] = await Promise.all([
      fetch(`${backendURL}/api/trees`, { headers: { Accept: "application/json" } }),
      fetch(`${backendURL}/api/history`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }),
      fetch(`${backendURL}/api/users`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }),
    ]);

    // Handle HTTP errors
    if (!treeResponse.ok || !historyResponse.ok || !userResponse.ok) {
      throw new Error(
        `HTTP error! Status: ${treeResponse.status || historyResponse.status || userResponse.status}`
      );
    }

    const trees = await treeResponse.json();
    const history = await historyResponse.json();
    const usersData = await userResponse.json();

    // Update total trees
    getTotalTrees.innerHTML = `<h5 class="card-text fw-bold">${trees.length}</h5>`;

    // Render recently added trees
    const recentTreesHTML = trees
      .reverse()
      .slice(0, 7)
      .map(
        (tree) => `
          <tr>
            <td>${tree.tree_id}</td>
            <td>${tree.common_name}</td>
            <td>${tree.scientific_name}</td>
            <td>${tree.family_name}</td>
            <td>${formatDate(tree.created_at)}</td>
          </tr>`
      )
      .join("");
    recentlyAddedTrees.innerHTML = recentTreesHTML;

    // Render recent activity
    const recentActivityHTML = history.data.slice(0, 7).map((entry) => {
      const oldData = entry.old_data ? JSON.parse(entry.old_data) : {};

        const userData = usersData.data.find((user) => user?.id === entry?.user_id);
        const treeData = trees.find((tree) => tree?.tree_id === entry?.tree_id);
        const actionClass =
          entry.action === "created"
            ? "text-primary"
            : entry.action === "updated"
            ? "text-success"
            : "text-danger";

        return `
          <tr>
            <td class="fw-bold">${entry.tree_id}</td>
            <td>${treeData?.scientific_name || oldData.scientific_name}</td>
            <td class="fw-bold ${actionClass}">${entry.action}</td>
            <td>${userData?.fullname || "Unknown"}</td>
            <td>${formatDate(entry.created_at)}</td>
          </tr>`;
      })
      .join("");
    recentActivity.innerHTML = recentActivityHTML;

    // Count trees by scientific name
    const treeCounts = trees.reduce((counts, tree) => {
      counts[tree.family_name] = (counts[tree.family_name] || 0) + 1;
      return counts;
    }, {});

    return {
      types: Object.keys(treeCounts),
      percentages: Object.values(treeCounts),
    };
  } catch (error) {
    console.error("Failed to fetch tree data:", error);

    // Provide user feedback
    loader.innerHTML = `<p class="error-message">Failed to load data. Please try again later.</p>`;
    return {
      types: [],
      percentages: [],
    };
  }
}

// Generate random shades of green
function generateRandomGreenShades(count) {
  return Array.from({ length: count }, () =>
    `hsl(${Math.random() * 40 + 80}, ${Math.random() * 40 + 60}%, ${Math.random() * 30 + 30}%)`
  );
}

// Render the pie chart
async function renderTreeChart() {
  const data = await fetchTreeData();

  if (data.types.length === 0) return; // Stop if no data

  const ctx = document.getElementById("treeChart").getContext("2d");

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: data.types,
      datasets: [
        {
          data: data.percentages,
          backgroundColor: generateRandomGreenShades(data.types.length),
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          enabled: true,
        },
      },
    },
  });

  // Remove loader
  loader.innerHTML = "";
}

// Call the function to render the chart
renderTreeChart();
