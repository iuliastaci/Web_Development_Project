const express = require("express");
const fs = require("fs");

obGlobal = {
    obErori:null,
    obImagini:null
}

app = express();
console.log("Folder proiect", __dirname);

app.set("view engine", "ejs"); //trb inainte de ejs


//ca sa trimit fisierele din resurse folosesc app.use
app.use("/Resurse", express.static(__dirname+"/Resurse"));

app.get("/ceva", function (req,res){
    console.log("cale:",req.url);
    res.send("<h1>altceva</h1> ip:"+req.ip );
})
app.get(["/index", "/", "/home"], function (req, res){
    res.render("pagini/index", {ip: req.ip, a:10, b:5}); //al doilea parametru este locals

})

/*app.get("/*", function (req,res) {
    res.render("pagini"+req.url, function (err, rezRandare){
        if(err){
            console.log(err);
            if(err.message.startsWith("Failed to lookup view"))
                afisareEroare(res,404);
            else
                afisareEroare(res);
        }
        else{
            console.log();
            res.send(rezRandare);
        }
    });
})

function initErori(){
    var continut = fs.readFileSync(__dirname+"/resurse/json/erori.json").toString("utf-8");
    obGlobal.obErori = JSON.parse(continut);
    let vErori = obGlobal.obErori.info_erori;
    // for(let i=0; i<vErori.length; i++){}
    for (let eroare of vErori){
        eroare.imagine = obGlobal.obErori.cale_baza+"/"+eroare.imagine;
    }   //for in stil javascript
}

initErori();

function afisareEroare(res,_identificator,_titlu,_text,_imagine){
    let vErori = obGlobal.obErori.info_erori;
    let eroare = vErori.find(function (elem){return elem.identificator==_identificator})
    if(eroare){
        let titlu1 = _titlu || eroare.titlu;
        let text1 = _text || eroare.text;
        let imagine1 = _imagine || eroare.imagine;
        if(eroare.status)
            res.status(eroare.identificator).render("pagini/eroare", {titlu:titlu, text:text, imagine:imagine});
        else
            res.render("pagini/eroare", {titlu:titlu1, text:text1, imagine:imagine1});
    }
    else {
        let errDef = obGlobal.obErori.eroare_default;
        res.render("pagini/eroare", {titlu:errDef.titlu, text:errDef.text, imagine:errDef.imagine});
    }
}

afisareEroare();*/

app.listen(8080);
console.log("Serverul a pornit!");

//trb rulat din terminal cu node index.js
