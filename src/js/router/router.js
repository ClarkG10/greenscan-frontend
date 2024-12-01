function setRouter(){
    switch (window.location.pathname){
        case "/":
        case "/index.html":
        case "/login.html":
        case "/qrScan.html":
        case "/treeMap.html":
        if(localStorage.getItem("token") != null){
            window.location.pathname = "dashboard.html";
        }
        break;
        case "/dashboard.html":
        case "/trees.html":
        case "/user.html":
        case "/history.html":
        if(localStorage.getItem("token") == null){
            window.location.pathname = "/index.html";
        }
        default:
            break;
    }
}

export {setRouter}