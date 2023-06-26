window.addEventListener("load", function (){

    let iduriProduse=localStorage.getItem("cos_virtual");
    iduriProduse=iduriProduse?iduriProduse.split(","):[];      //["3","1","10","4","2"]

    for(let idp of iduriProduse){
        let ch = document.querySelector(`[value='${idp}'].select-cos`);
        if(ch){
            ch.checked=true;
        }
        else{
            console.log("id cos virtual inexistent:", idp);
        }
    }

    //----------- adaugare date in cosul virtual (din localStorage)
    let checkboxuri= document.getElementsByClassName("select-cos");
    for(let ch of checkboxuri){
        ch.onchange=function(){
            let iduriProduse=localStorage.getItem("cos_virtual");
            iduriProduse=iduriProduse?iduriProduse.split(","):[];

            if( this.checked){
                iduriProduse.push(this.value)
            }
            else{
                let poz= iduriProduse.indexOf(this.value);
                if(poz !== -1){
                    iduriProduse.splice(poz,1);
                }
            }

            localStorage.setItem("cos_virtual", iduriProduse.join(","))
        }

    }

    document.getElementById("inp-pret").onchange = function (){
        document.getElementById("infoRange").innerHTML = `(${this.value})`;

    }

    //pt butonul de Filtrare
    document.getElementById("filtrare").onclick = function (){
        let val_nume = document.getElementById("inp-nume").value.toLowerCase();
        let radiobuttons = document.getElementsByName("gr_rad");
        let val_lumina;

        for (let r of radiobuttons){
            if (r.checked){
                val_lumina = r.value;
                break;
            }
        }


        let locatie = document.getElementsByName("gr_check");

        let val_loc = [];
        for(let l of locatie) {
            if(l.checked) {
                val_loc.push(l.value);
            }
        }


        let val_pret = document.getElementById("inp-pret").value;

        var produse = document.getElementsByClassName("produs");

        let val_categ = document.getElementById("inp-categorie").value;

        let val_descriere = document.getElementById("i_textarea").value.toLowerCase();
        let vector_descriere = val_descriere.split(",");
        let RegExp = /^[A-z]*((,|\s)*[A-z]*)*$/;
        const isMatch = RegExp.test(val_descriere);
        console.log(isMatch);

        if (val_descriere === "" || !RegExp.test(val_descriere)){
            document.getElementById("invalidDescription").style.display = "block";
        }

        let val_timpInput = document.getElementById("i_datalist");
        let val_timp = document.getElementById("i_datalist").value;

        let datalistOpt = document.getElementById("id_lista").children;
        let isValid = false;


        for (let i=0; i<datalistOpt.length; i++) {
            if (datalistOpt[i].value === val_timp || val_timp === "") {
                isValid = true;
                break;
            }
        }

        if (!isValid) {
            alert("Timpul de plantare nu este valid!");
            val_timpInput.style.border = "4px solid red";
            return;
        } else {
            val_timpInput.style.border = "";
        }

        let val_lumina2 = document.getElementById("i_select_multiplu");
        let conditii_lumina_selectate = [];
        for (let options of val_lumina2.selectedOptions) {
            conditii_lumina_selectate.push(options.value);
        }


        for (let prod of produse){
            prod.style.display = "none";

            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();
            let cond1 = (nume.includes(val_nume)); //in task inlocuiesc cu includes

            let lumina = prod.getElementsByClassName("val-lumina")[0].innerHTML;
            let cond2 = (val_lumina === "toate" || val_lumina === lumina);

            let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
            let cond3 = (pret >= val_pret);

            let categorie = prod.getElementsByClassName("val-categorie")[0].innerHTML;
            let cond4 = (val_categ === "toate" || val_categ === categorie);

            let prod_loc = prod.getElementsByClassName("val-locatie")[0].innerHTML;
            let cond5 = (val_loc.includes(prod_loc));

            let prod_timp = prod.getElementsByClassName("val-timp")[0].innerHTML;
            let cond6 = (val_timp === "" || prod_timp.includes(val_timp));

            let cond7 = false;
            let prod_descriere = prod.getElementsByClassName("val-descriere")[0].innerHTML.toLowerCase();
            for (let i of vector_descriere){
                console.log(i)
                if (prod_descriere.includes(i)){
                    cond7 = true;
                    break;
                }
            }

            let cond8 = conditii_lumina_selectate.length === 0 || !conditii_lumina_selectate.some(lum => lumina === lum);


            if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8){
                prod.style.display = "block";
            }

        }
        let c = 0;
        for (let p of produse){
            if (p.style.display === "none"){
                c++;
            }
        }
        console.log(c);
        if (c === 0){
            document.getElementById("invalid").style.display = "block";
        }
        else {
            document.getElementById("invalid").style.display = "none";
        }

    }
    //in caz ca nu exista niciun prod care sa corespunda filtrelor
    window.onchange=function (){

    }
    //pt butonul Reseteaza
    document.getElementById("resetare").onclick = function(){
        if (confirm("Sunteti sigur ca doriti sa resetati filtrele?")) {
            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-pret").value = document.getElementById("inp-pret").min;
            document.getElementById("inp-categorie").value = "toate";
            document.getElementById("i_rad4").checked = true;
            var produse = document.getElementsByClassName("produs");
            document.getElementById("infoRange").innerHTML = "(0)";
            document.getElementById("i_datalist").value = "";
            document.getElementById("i_textarea").value = "";
            document.getElementById("i_select_multiplu").value = "";
            document.getElementById("invalid").style.display = "none";
            var ch = document.getElementsByName("gr_check");
            for (let i of ch){
                i.checked = true;
            }

            for (let prod of produse) {
                prod.style.display = "block";
            }
        }
    };

    //functie de sortare pt cele 2 butoane
    function sortare (semn) {
        var produse = document.getElementsByClassName("produs");
        var v_produse = Array.from(produse);

        v_produse.sort(function (a, b) {
            let pret_a = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
            let pret_b = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
            if (pret_a === pret_b) {
                let nume_a = a.getElementsByClassName("val-nume")[0].innerHTML;
                let nume_b = b.getElementsByClassName("val-nume")[0].innerHTML;
                return semn * nume_a.localeCompare(nume_b);
            }
            return semn * (pret_a - pret_b);
        });
        for (let prod of v_produse) {
            prod.parentElement.appendChild(prod);
        }
    }

    //pt butonul Sorteaza crescator dupa pret si nume
    document.getElementById("sortCrescNume").onclick = function (){
            sortare(1);
    }

    //pt butonul Sorteaza descrescator dupa pret si nume
    document.getElementById("sortDescrescNume").onclick = function (){
        sortare(-1);
    }

    window.onkeydown = function (e){
        if (e.altKey && e.key === "c"){
            if(document.getElementById("info-suma"))
                return;

        var produse = document.getElementsByClassName("produs");
        let suma = 0;
        for (let prod of produse){
            if (prod.style.display !== "none") {
                let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
                suma += pret;
            }
        }
        let p = document.createElement("p");
        p.innerHTML = suma;
        p.id = "info-suma";
        ps = document.getElementById("p-suma");
        container = ps.parentNode;
        frate = ps.nextElementSibling;
        container.insertBefore(p, frate);
        setTimeout(function (){
            let info = document.getElementById("info-suma");
            if (info){
                info.remove();
            }
        }, 1000);
    }

    }
    const textarea = document.getElementById("i_textarea");

    function validation(textarea) {
        let val_descriere = textarea.value.toLowerCase();
        var produse = document.getElementsByClassName("produs");
        let isInvalid = true;

        for (let prod of produse) {
            let prod_descriere = prod.getElementsByClassName("val-descriere")[0].innerHTML.toLowerCase();
            if (prod_descriere.includes(val_descriere)) {
                isInvalid = false;
                break;
            }
        }

        if (isInvalid) {
            textarea.classList.add("is-invalid");
        } else {
            textarea.classList.remove("is-invalid");
        }
    }

    textarea.addEventListener("input", function (){
        validation(textarea);
    });
});

