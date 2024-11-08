import { logout, backendURL } from "../utils/utils.js";

  logout();
      // Example Data Fetching - Replace this with an actual API or dynamic data source
      async function fetchTreeData() {
        // Simulate fetching tree data
        return {
          types: ['Narra', 'Mahogany', 'Acacia', 'Molave',],
          percentages: [30, 20, 15, 25]
        };
      }

      // Function to render the pie chart
      async function renderTreeChart() {
        const data = await fetchTreeData();

        const ctx = document.getElementById('treeChart').getContext('2d');

        new Chart(ctx, {
          type: 'pie', // You can also use 'bar' for a bar chart
          data: {
            labels: data.types,
            datasets: [
              {
                data: data.percentages,
                backgroundColor: [
                  '#228B22',
                  '#556B2F',
                  '#2E8B57',
                  '#98FB98',
                  '#8A9A5B'
                ],
                borderColor: [
                  '#228B22',
                  '#556B2F',
                  '#2E8B57',
                  '#98FB98',
                  '#8A9A5B'
                ],
                borderWidth: 2
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
      }

      // Call the function to render the chart
      renderTreeChart();