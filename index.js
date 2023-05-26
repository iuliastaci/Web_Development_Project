const express = require("express");
const fs = require("fs");
const path = require('path');
const sharp = require("sharp");
const sass = require("sass");
const ejs = require("ejs");

const {Client} = require('pg');
const AccesBD = require("./module_proprii/accesbd");

const formidable = require("formidable");
const {Utilizator} = require("./module_proprii/utilizator");
const  session = require("express-session");
const Drepturi = require("./module_proprii/drepturi.js");

AccesBD.getInstanta().select({
    tabel: "produse",
    campuri: ["nume", "pret", "categorie"],
    conditiiAnd: ["pret>7"]
}, function (err, rez){
    console.log(err);
    console.log(rez);
})


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

client.query("SELECT * FROM unnest(enum_range(null::categ_produs))", function (err,rezCategorie) {
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

vectorFoldere=["temp","backup","poze_uploadate"];
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

app.post("/inregistrare",function(req, res){
    console.log("!!!!!");
    var username;
    var poza;
    console.log("ceva");
    var formular= new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier ){//4
        console.log("Inregistrare:",campuriText);

        console.log(campuriFisier);
        var eroare="";

        var utilizNou=new Utilizator();
        try{
            utilizNou.setareNume=campuriText.nume;
            utilizNou.setareUsername=campuriText.username;
            utilizNou.email=campuriText.email
            utilizNou.prenume=campuriText.prenume

            utilizNou.parola=campuriText.parola;
            utilizNou.culoare_chat=campuriText.culoare_chat;
            utilizNou.poza= poza;
            Utilizator.getUtilizDupaUsername(campuriText.username, {}, function(u, parametru ,eroareUser ){
                if (eroareUser==-1){//nu exista username-ul in BD
                    utilizNou.salvareUtilizator();
                }
                else{
                    eroare+="Mai exista username-ul";
                }

                if(!eroare){
                    res.render("pagini/inregistrare", {raspuns:"Inregistrare cu succes!"})

                }
                else
                    res.render("pagini/inregistrare", {err: "Eroare: "+eroare});
            })


        }
        catch(e){
            console.log(e);
            eroare+= "Eroare site; reveniti mai tarziu";
            console.log(eroare);
            res.render("pagini/inregistrare", {err: "Eroare: "+eroare})
        }




    });
    formular.on("field", function(nume,val){  // 1

        console.log(`--- ${nume}=${val}`);

        if(nume=="username")
            username=val;
    })
    formular.on("fileBegin", function(nume,fisier){ //2
        console.log("fileBegin");

        console.log(nume,fisier);
        //TO DO in folderul poze_uploadate facem folder cu numele utilizatorului
        let folderUser=path.join(__dirname, "poze_uploadate",username);
        //folderUser=__dirname+"/poze_uploadate/"+username
        console.log(folderUser);
        if (!fs.existsSync(folderUser))
            fs.mkdirSync(folderUser);
        fisier.filepath=path.join(folderUser, fisier.originalFilename)
        poza=fisier.originalFilename
        //fisier.filepath=folderUser+"/"+fisier.originalFilename

    })
    formular.on("file", function(nume,fisier){//3
        console.log("file");
        console.log(nume,fisier);
    });
});

//http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}
app.get("/cod/:username/:token",function(req,res){
    console.log(req.params);
    try {
        Utilizator.getUtilizDupaUsername(req.params.username,{res:res,token:req.params.token} ,function(u,obparam){
            AccesBD.getInstanta().update(
                {tabel:"utilizatori",
                    campuri:{confirmat_mail:'true'},
                    conditiiAnd:[`cod='${obparam.token}'`]},
                function (err, rezUpdate){
                    if(err || rezUpdate.rowCount==0){
                        console.log("Cod:", err);
                        afisareEroare(res,3);
                    }
                    else{
                        res.render("pagini/confirmare.ejs");
                    }
                })
        })
    }
    catch (e){
        console.log(e);
        renderError(res,2);
    }
})

app.get("/produse",function(req, res){


    //TO DO query pentru a selecta toate produsele
    //TO DO se adauaga filtrarea dupa tipul produsului
    //TO DO se selecteaza si toate valorile din enum-ul categ_prajitura
    client.query("SELECT * FROM unnest(enum_range(null::categ_produs))", function (err,rezCategorie){
        if(err) {
            console.log(err);
            afisareEroare(res,2);
        } else {
            let conditieWhere = "";
            if (req.query.categorie)
                conditieWhere = `where categorie='${req.query.categorie}'`;  //"where tip = '"+req.query.tip+"'"
            client.query("SELECT * FROM produse " + conditieWhere, function (err, rez) {
                console.log(300)
                console.log(rez.rows[0])
                if (err) {
                    console.log(err);
                    afisareEroare(res, 2);
                } else {
                    client.query("SELECT MIN(pret) AS min_pret, MAX(pret) AS max_pret FROM produse", function (err,rezPret){
                        if (err) {
                            console.log(err);
                            afisareEroare(rez,2);
                        } else {
                            client.query("SELECT distinct(unnest(timp_de_plantare)) FROM produse", function (err,rezTimp) {
                                if (err) {
                                    console.log(err);
                                    afisareEroare(res,2);
                                } else {
                                    client.query("SELECT * FROM unnest(enum_range(null::locatie_plantare))", function (err,rezLoc) {
                                        if (err) {
                                            console.log(err);
                                            afisareEroare(res,2);
                                        } else {

                                            client.query("SELECT distinct(conditii_de_lumina) FROM produse", function (err,rezLumina) {
                                                console.log(rezLumina.rows);
                                                if (err) {
                                                    console.log(err);
                                                    afisareEroare(res,2);
                                                } else {
                                                    res.render("pagini/produse", {
                                                        produse: rez.rows,
                                                        optiuni: rezCategorie.rows,
                                                        minPrice: rezPret.rows[0].min_pret,
                                                        maxPrice: rezPret.rows[0].max_pret,
                                                        timp: rezTimp.rows.map((row) => row.unnest),
                                                        locatie: rezLoc.rows,
                                                        lumina: rezLumina.rows
                                                    });
                                                }
                                            })

                                        }
                                    })
                                }
                            })
                        }
                    })
                }

            });
        }
    })




});


app.get("/produs/:id",function(req, res){
    console.log(req.params);

    client.query(`SELECT * FROM produse where id = ${req.params.id}`, function( err, rezultat){
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

app.listen(8080); //portul pe care asculta serverul
console.log("Serverul a pornit!");

//trb rulat din terminal cu node index.js
