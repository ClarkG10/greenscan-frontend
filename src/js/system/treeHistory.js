import { backendURL, logout, formatDate} from '../utils/utils.js'

logout();

getTreeHistory();

const loader = document.getElementById('loader');
loader.innerHTML = `<div class="loader-overlay"><div class="loader"></div></div>`
// Fetch the tree history data
async function getTreeHistory(url, keyword = "") {
    const getTreeHistory = document.getElementById('getTreeHistory');

    let queryParams = 
    "?" + 
    (url ? new URL(url).searchParams + "&" : "") + 
    (keyword ? "keyword=" + encodeURIComponent(keyword) + "&" : "");

    const historyResponse = await fetch(url || backendURL + '/api/history' + queryParams,{
        headers:{
            Accept: 'application/json',
            Authorization: 'Bearer '+ localStorage.getItem('token'),
        },
    });

    const userResponse = await fetch(backendURL + '/api/users',{
        headers:{
            Accept: 'application/json',
            Authorization: 'Bearer '+ localStorage.getItem('token'),
        },
    });

    const usersData = await userResponse.json();
    const historyData = await historyResponse.json();

    console.log(historyData)
    console.log(usersData)

    if(historyResponse.ok){
        // Process and display the history data
        let historyHTML = "";
        let index = 0;

        historyData.data.forEach(history => {
            const userData = usersData.data.find(user => user?.id === history?.user_id);
            const newData = JSON.parse(history.new_data);

            // Format the created_at date
            const formattedDate = formatDate(history.created_at);
            const oldData = history.old_data ? JSON.parse(history.old_data) : {};

            const newDataDisplay = `
            <ul style="list-style-type: none; padding-left: 0;">
                ${
                    (newData || oldData) 
                        ? Object.entries(newData || oldData)?.map(([key, value]) => {
                            // Exclude specific keys
                            if (!['tree_id', 'user_id', 'created_at', 'updated_at'].includes(key)) {
                                const oldValue = oldData ? oldData[key] : undefined; // Handle `oldData` safely
                                let style = '';
                                
                                // Set the color based on whether the value is from oldData or newData
                                if (newData && oldValue !== value) {
                                    style = 'color: green;'; // Highlight newData changes in green
                                } else if (!newData && oldValue === value) {
                                    style = 'color: red;'; // Highlight oldData in red
                                }
        
                                return `<li style="${style}"><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value || "N/A"}</li>`;
                            }
                            return ''; // Skip excluded keys
                        }).join('')
                        : '<li>No data available</li>' // Fallback if neither `newData` nor `oldData` exist
                }
            </ul>`;
        
            historyHTML += `
                <tr>
                    <td class="fw-bold">${history.tree_id}</td>
                    <td>${userData.fullname}</td>
                    <td> <span class="p-2 bg-secondary-subtle rounded-3">${userData.role}</span></td>
                    <td class="${history.action === "created" ? `text-primary` : history.action === "updated" ? `text-success` : `text-danger`}">${history.action}</td>
                    <td>${formattedDate}</td>
                    <td><div class="accordion accordion-flush" id="accordionExample_${index}">
                          <div class="accordion-item">
                            <h2 class="accordion-header">
                              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_${index}" aria-expanded="true" aria-controls="collapse_${index}">
                                Click here to view
                              </button>
                            </h2>
                            <div id="collapse_${index}" class="accordion-collapse collapse" data-bs-parent="#accordionExample_${index}">
                              <div class="accordion-body">
                                ${newDataDisplay}
                              </div>
                            </div>
                          </div>
                          </div>
                        </td>
                </tr>
            `;
            
            index++;
        });

        getTreeHistory.innerHTML = historyHTML;
        
        let pagination = "";

        if (historyData.links) {
            historyData.links.forEach((link) => {
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

    } else {
        // Handle error
        console.error('History fetch failed:', historyData.message);
    }

    loader.innerHTML = ""; // Remove loader when data is fetched successfully
}

const search_form = document.getElementById("search_form");
search_form.onsubmit = async (e) => {
    e.preventDefault(); 

    const formData = new FormData(search_form); 
    const keyword = formData.get("keyword");
    console.log( keyword);

    getTreeHistory("", keyword);
}

const pageAction = async (e) => {
    e.preventDefault();
    const url = e.target.getAttribute("data-url");
    await getTreeHistory(url);
  }

