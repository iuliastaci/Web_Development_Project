

//setCookie("a",10, 1000)
function setCookie(nume, val, timpExpirare){//timpExpirare in milisecunde
    d=new Date();
    d.setTime(d.getTime()+timpExpirare)
    document.cookie=`${nume}=${val}; expires=${d.toUTCString()}`;
}

function getCookie(nume){
    vectorParametri=document.cookie.split(";") // ["a=10","b=ceva"]
    for(let param of vectorParametri){
        if (param.trim().startsWith(nume+"="))
            return param.split("=")[1]
    }
    return null;
}

function deleteCookie(nume){
    //console.log(`${nume}; expires=${(new Date()).toUTCString()}`)
    document.cookie=`${nume}=0; expires=${(new Date()).toUTCString()}`;
}

function deleteAllCookies() {
    vectorParametri = document.cookie.split(";")
    for (let param of vectorParametri) {
        deleteCookie(param.split("=")[0])
    }
}


window.addEventListener("load", function(){
    if (getCookie("acceptat_banner")){
        document.getElementById("banner").style.display="none";
    }
    else
        document.getElementById("banner").classList.add("animation");

    this.document.getElementById("ok_cookies").onclick=function(){
        setCookie("acceptat_banner",true,60000);
        document.getElementById("banner").style.display="none"
    }

    if (getCookie("planta")){
        document.getElementById("cookie_planta").style.display = "none";
    }
    else
        document.getElementById("cookie_planta").style.display = "block";

    this.document.getElementById("cookie_planta").onclick = function (){
        setCookie("planta",true,10000);
        document.getElementById("cookie_planta").style.display = "none";
    }
})
