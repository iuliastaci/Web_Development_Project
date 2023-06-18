const AccesBD=require('./accesbd.js');
const parole=require('./parole.js');

const {RolFactory}=require('./roluri.js');
const crypto=require("crypto");
const nodemailer=require("nodemailer");

/**
 * @type {string} - tpiul conexiunii cu baza de date
 * @type {string} - numele tabelului
 * @type {string} - parola pt criptare
 * @type {string} - server-ul de email folosit pt trimiterea email-urilor
 * @type {number} - lungimea codului pt generarea token-ului
 * @type {string} - numele sau URL-ul domeniului
 * */
class Utilizator{
    static tipConexiune="local";
    static tabel="utilizatori"
    static parolaCriptare="tehniciweb";
    static emailServer="coltulcuplante@gmail.com";
    static lungimeCod=64;
    static numeDomeniu="localhost:8080";
    #eroare;

    /**
     * Creeaza o instanta a clasei Utilizator
     * @param {number} id - The user ID.
     * @param {string} username - The username.
     * @param {string} nume - The user's last name.
     * @param {string} prenume - The user's first name.
     * @param {string} email - The user's email address.
     * @param {string} parola - The user's password.
     * @param {object} rol - The user's role.
     * @param {string} culoare_chat="black" - The user's chat color.
     * @param {string} poza - The user's profile picture.*/

    constructor({id, username, nume, prenume, email, parola, rol, culoare_chat="black", poza}={}) {
        this.id=id;

        //optional sa facem asta in constructor
        try{
        if(this.checkUsername(username))
            this.username = username;
        }
        catch(e){ this.#eroare=e.message}

        for(let prop in arguments[0]){
            this[prop]=arguments[0][prop]
        }
        if(this.rol)
            this.rol=this.rol.cod? RolFactory.creeazaRol(this.rol.cod):  RolFactory.creeazaRol(this.rol);
        console.log(this.rol);

        this.#eroare="";
    }
    /**
     * @param {string} nume - numele care trebuie verificat
     * @returns {boolean} - adevarat daca numele este valid, fals altfel
     * */
    checkName(nume){
        return nume!="" && nume.match(new RegExp("^[A-Z][a-z]+$")) ;
    }

    /**
     * @param {string} nume - numele care trebuie setat*/
    set setareNume(nume){
        if (this.checkName(nume)) this.nume=nume
        else{
            throw new Error("Nume gresit")
        }
    }

    /*
    * folosit doar la inregistrare si modificare profil
    */

    /**
     * @param {string} username - username-ul care trebuie setat
     * */
    set setareUsername(username){
        if (this.checkUsername(username)) this.username=username
        else{
            throw new Error("Username gresit")
        }
    }

    /**
     * @param {string} username - username-ul care trebuie verificat
     * @returns {boolean} - adevarat daca username-ul este valid, fals altfel
     * */
    checkUsername(username){
        return username!="" && username.match(new RegExp("^[A-Za-z0-9#_./]+$")) ;
    }

    /**
     * @param {string} parola - parola care va fi criptata
     * @returns {string} - parola criptata
     * */
    static criptareParola(parola){
        return crypto.scryptSync(parola,Utilizator.parolaCriptare,Utilizator.lungimeCod).toString("hex");
    }

    salvareUtilizator(){
        let parolaCriptata=Utilizator.criptareParola(this.parola);
        let utiliz=this;
        let token=parole.genereazaToken(100);
        AccesBD.getInstanta(Utilizator.tipConexiune).insert({tabel:Utilizator.tabel,
            campuri:{
                username:this.username,
                nume: this.nume,
                prenume:this.prenume,
                parola:parolaCriptata,
                email:this.email,
                culoare_chat:this.culoare_chat,
                cod:token,
                poza:this.poza}
            }, function(err, rez){
            if(err)
                console.log(err);
            
            utiliz.trimiteMail("Te-ai inregistrat cu succes","Username-ul tau este "+utiliz.username,
            `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${utiliz.username}.</p> <p><a href='http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}'>Click aici pentru confirmare</a></p>`,
            )
        });
    }
//xjxwhotvuuturmqm


    /**
     * @param {string} subiect - subiectul email-ului
     * @param {string} mesajText - continutul text al email-ului
     * @param {string} mesajHtml - continutul HTML al email-ului
     * @param {Array<object>} [atasamente=[]] - un vector cu atasamentele email-ului
     * */
    async trimiteMail(subiect, mesajText, mesajHtml, atasamente=[]){
        var transp= nodemailer.createTransport({
            service: "gmail",
            secure: false,
            auth:{//date login 
                user:Utilizator.emailServer,
                pass:"rjbwpipelbifdace"
            },
            tls:{
                rejectUnauthorized:false
            }
        });
        //genereaza html
        await transp.sendMail({
            from:Utilizator.emailServer,
            to:this.email, //TO DO
            subject:subiect,//"Te-ai inregistrat cu succes",
            text:mesajText, //"Username-ul tau este "+username
            html: mesajHtml,// `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${username}.</p> <p><a href='http://${numeDomeniu}/cod/${username}/${token}'>Click aici pentru confirmare</a></p>`,
            attachments: atasamente
        })
        console.log("trimis mail");
    }

    /**
    * @param {string} username - The username of the user to retrieve.
     * @returns {Promise<Utilizator|null>} - A promise that resolves to the retrieved user or null if not found.
     * */
    static async getUtilizDupaUsernameAsync(username){
        if (!username) return null;
        try{
            let rezSelect= await AccesBD.getInstanta(Utilizator.tipConexiune).selectAsync(
                {tabel:"utilizatori",
                campuri:['*'],
                conditiiAnd:[`username='${username}'`]
            });
            if(rezSelect.rowCount!=0){
                return new Utilizator(rezSelect.rows[0])
            }
            else {
                console.log("getUtilizDupaUsernameAsync: Nu am gasit utilizatorul");
                return null;
            }
        }
        catch (e){
            console.log(e);
            return null;
        }
        
    }

    /**
     * @param {string} username - The username of the user to retrieve.
     * @param {object} obparam - An object containing additional parameters.
     * @param {function} proceseazaUtiliz - A callback function to process the retrieved user.
     * */
    static getUtilizDupaUsername (username,obparam, proceseazaUtiliz){
        if (!username) return null;
        let eroare=null;
        AccesBD.getInstanta(Utilizator.tipConexiune).select({tabel:"utilizatori",campuri:['*'],conditiiAnd:[`username='${username}'`]}, function (err, rezSelect){
            let u = null;
            if(err){
                console.error("Utilizator:", err);
                //throw new Error()
                eroare=-2;
            }
            else if(rezSelect.rowCount==0){
                eroare=-1;
            } else {
                //constructor({id, username, nume, prenume, email, rol, culoare_chat="black", poza}={})
                u = new Utilizator(rezSelect.rows[0])
            }
            proceseazaUtiliz(u, obparam, eroare);
        });
    }

    /**
     * @param {Symbol} drept - The permission to check (must be a Symbol).
     * @returns {boolean} - True if the user has the permission, false otherwise.
     * */
    areDreptul(drept){
        return this.rol.areDreptul(drept);
    }
}
module.exports={Utilizator:Utilizator}