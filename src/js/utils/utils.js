import { setRouter } from "../router/router.js";
setRouter();

const backendURL = 'http://greenscan.test/public';

async function logout(){
    const btn_logout = document.getElementById("btn_logout");

    btn_logout.onclick = async () => {
        
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
}

export {backendURL, logout}