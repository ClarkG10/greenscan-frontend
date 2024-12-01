import { setRouter } from "../router/router.js";
setRouter();

const backendURL = 'http://greenscan.test/public';

async function logout(){
    const btn_logout = document.getElementById("btn_logout");

    btn_logout.onclick = async () => {

    btn_logout.disabled = true;
        
    const logoutResponse = await fetch(backendURL + "/api/logout", { 
        headers: {
            Accept: "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
        },
    }); 
        
    if(logoutResponse.ok){
        localStorage.clear();
        window.location.pathname = "/index.html";
    }else{
        const json = await logoutResponse.json();
        alert(json.message);
        }
    }

    btn_logout.disabled = false;
}
// Function to format the date
function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
    const date = new Date(dateString);
    return date.toLocaleString('en-US', options);
}

export {backendURL, logout, formatDate}