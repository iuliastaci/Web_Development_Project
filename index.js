const express = require("express");
const fs = require("fs");
const path = require('path');
const sharp = require("sharp");
const sass = require("sass");
const ejs = require("ejs");

const {Client} = require('pg');


var client= new Client({database:"db_web", //modificat numele bazei de date - done
    user:"iulia", //modificat user-done
    password:"2013", //modificat parola - done
    host:"localhost",
    port:5432});
client.connect();
client.query("select * from lab8_14", function(err, rez){
    console.log("Eroare BD",err);

    console.log("Rezultat BD",rez.rows);
});



obGlobal = {
    obErori:null,
    obImagini:null,
    folderSccs: path.join(__dirname,"Resurse/scss"),
    folderCss: path.join(__dirname,"Resurse/css"),
    folderBackup: path.join(__dirname,"backup"),
    optiuniMeniu: []
}

client.query("SELECT * FROM unnest(enum_range(null::tipuri_produse))", function (err,rezCategorie) {
    if (err)
        console.log(err);
    else {
        obGlobal.optiuniMeniu = rezCategorie.rows;
    }
});

app = express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

vectorFoldere=["temp","temp1","backup"];
for(let folder of vectorFoldere){
    //let caleFolder = __dirname+"/"+folder;
    let caleFolder = path.join(__dirname,folder);
    if(! fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
}

function compileazaSccs(caleSccs,caleCss){
    console.log("cale:", caleCss);
    if(!caleCss) {
        //let vectorCale = caleSccs.split("\\");
        //let numeFisExt = vectorCale[vectorCale.length - 1];
        let numeFisExt = path.basename(caleSccs);
        let numeFis = numeFisExt.split(".")[0]; //sau path.basename()
        caleCss = numeFis + ".css";
    } //functie care obtine numele fisierului din cale BONUS
    if (! path.isAbsolute(caleSccs))
    {
        caleSccs = path.join(obGlobal.folderSccs,caleSccs);
    }
    if (! path.isAbsolute(caleCss))
    {
        caleCss = path.join(obGlobal.folderCss,caleCss);
        //la acest punct avem cai absolute in caleCss si caleScss
    }
    //let vectorCale = caleCss.split("\\");
    //let numeFisCss = vectorCale[vectorCale.length-1];
    let caleBackup = path.join(obGlobal.folderBackup, "Resurse/css");
    if(!fs.existsSync(caleBackup)){
        fs.mkdirSync(caleBackup,{recursive:true});
    }
    let numeFisCss = path.basename(caleCss);
    if(fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss,path.join(obGlobal.folderBackup,"Resurse/css",numeFisCss)); //+(new Date()).getTime()
    }
    rez = sass.compile(caleSccs, {"sourceMap": true});
    fs.writeFileSync(caleCss,rez.css);
    //console.log("Compilare scss", rez);
}
    compileazaSccs("a.scss");
vFisiere = fs.readdirSync(obGlobal.folderSccs);
for (let numeFis of vFisiere){
    if (path.extname(numeFis) == ".scss") {

        compileazaSccs(numeFis);
    }
}
fs.watch(obGlobal.folderSccs, function (eveniment, numeFis){
    if(numeFis.length - 1 == "~")
        return;
    if(path.extname(numeFis) != ".scss") //cele 2 if-uri sunt ca sa nu avem eroarea "no such file or directory" la modif fis.sccs cu serverul pornit
        return;
    console.log(eveniment, numeFis);
    if(eveniment == "change" || eveniment == "rename"){
        let caleCompleta = path.join(obGlobal.folderSccs, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaSccs(caleCompleta);
        }
    }
})

app.set("view engine", "ejs"); //trb inainte de ejs


//ca sa trimit fisierele din resurse folosesc app.use
app.use("/Resurse", express.static(__dirname+"/Resurse"));
app.use("/node_modules", express.static(__dirname+"/node_modules"));

app.use("/*", function (req,res,next){
    res.locals.optiuniMeniu = obGlobal.optiuniMeniu;
    next();
});

app.use(/^\/resurse(\/[a-zA-Z0-9]*(?!\.)[a-zA-Z0-9]*)*$/, function (req,res){
    afisareEroare(res,403);
});

app.get("/favicon.ico",function (req,res){
    res.sendFile(__dirname+"/Resurse/ico/favicon.ico");
})
app.get("/ceva", function (req,res){
    console.log("cale:",req.url);
    res.send("<h1>altceva</h1> ip:"+req.ip );
})
app.get(["/index", "/", "/home"], function (req, res){
    res.render("pagini/index", {ip: req.ip, a:10, b:5, imagini:obGlobal.obImagini.imagini}); //al doilea parametru al lui render este locals

})

//^\w+\.ejs$

app.get("/produse",function(req, res){


    //TO DO query pentru a selecta toate produsele
    //TO DO se adauaga filtrarea dupa tipul produsului
    //TO DO se selecteaza si toate valorile din enum-ul categ_prajitura
    client.query("SELECT * FROM unnest(enum_range(null::categ_prajitura))", function (err,rezCategorie){
        if(err)
            console.log(err);
        else {
            let conditieWhere = "";
            if (req.query.tip)
                conditieWhere = `where tip_produs='${req.query.tip}'`;  //"where tip = '"+req.query.tip+"'"
            client.query("SELECT * FROM prajituri " + conditieWhere, function (err, rez) {
                console.log(300)
                if (err) {
                    console.log(err);
                    afisareEroare(res, 2);
                } else
                    res.render("pagini/produse", {produse: rez.rows, optiuni: rezCategorie.rows});
            });
        }
    })




});


app.get("/produs/:id",function(req, res){
    console.log(req.params);

    client.query(`SELECT * FROM prajituri where id = ${req.params.id}`, function( err, rezultat){
        if(err){
            console.log(err);
            afisareEroare(res, 2);
        }
        else
            res.render("pagini/produs", {prod:rezultat.rows[0]});
    });
});

app.get("/*.ejs",function (req,res){
    afisareEroare(res,400);
})

app.get("/*", function (req,res) {
    try {
        res.render("pagini" + req.url, function (err, rezRandare) {
            if (err) {
                console.log(err);
                if (err.message.startsWith("Failed to lookup view"))
                    //afisareEroare(res,{_identificator:404, _titlu:"ceva"});
                    afisareEroare(res, 404);
                else
                    afisareEroare(res);
            } else {
                console.log();
                res.send(rezRandare);
            }
        });
    }catch (err){
        if(err.message.startsWith("Cannot find module"))
        afisareEroare(res, 404);
    else
        afisareEroare(res);
    }
})

function initErori(){
    var continut = fs.readFileSync(__dirname+"/Resurse/json/erori.json").toString("utf-8");
    obGlobal.obErori = JSON.parse(continut);
    let vErori = obGlobal.obErori.info_erori;
    // for(let i=0; i<vErori.length; i++){}
    for (let eroare of vErori){
        eroare.imagine = path.join(obGlobal.obErori.cale_baza,eroare.imagine);
    }   //for in stil javascript
}

initErori();
function initImagini(){
    var continut = fs.readFileSync(__dirname+"/Resurse/json/galerie.json").toString("utf-8");
    obGlobal.obImagini = JSON.parse(continut);
    let vImagini = obGlobal.obImagini.imagini;
    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu = path.join(caleAbs,"mediu");
    if(!fs.existsSync(caleAbsMediu))
    {
        fs.mkdirSync(caleAbsMediu);
    }
    for (let imag of vImagini){
        [numeFis,ext] = imag.fisier.split(".");
        let caleFisAbs = path.join(caleAbs, imag.fisier);
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis+".webp");
        sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs);
        imag.fisier_mediu = "/"+path.join(obGlobal.obImagini.cale_galerie,"mediu", numeFis+".webp");
        imag.fisier = "/"+path.join(obGlobal.obImagini.cale_galerie, imag.fisier);
       // eroare.imagine = path.join(obGlobal.obErori.cale_baza,eroare.imagine);
    }
}

initImagini();

/*
daca programatorul seteaza titlul, se ia titlul din argumentg
daca nu e setat, se ia cel din json
daca nu avem titlul nici in json se ia titlu de valoarea default
 */

function afisareEroare(res,_identificator,_titlu,_text,_imagine){
    let vErori = obGlobal.obErori.info_erori;
    let eroare = vErori.find(function (elem){return elem.identificator==_identificator})
    if(eroare){
        let titlu1 = _titlu || eroare.titlu;
        let text1 = _text || eroare.text;
        let imagine1 = _imagine || eroare.imagine;
        if(eroare.status)
            res.status(eroare.identificator).render("pagini/eroare", {titlu:titlu1, text:text1, imagine:imagine1});
        else
            res.render("pagini/eroare", {titlu:titlu1, text:text1, imagine:imagine1});
    }
    else {
        let errDef = obGlobal.obErori.eroare_default;
        res.render("pagini/eroare", {titlu:errDef.titlu, text:errDef.text, imagine:obGlobal.obErori.cale_baza+"/"+errDef.imagine});
    }
}

// afisareEroare();

app.listen(8080);
console.log("Serverul a pornit!");

//trb rulat din terminal cu node index.js
