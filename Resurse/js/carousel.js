function schimbaImag () {
    var vProdAlese = []
    for (let i=0; i<5; i++){
        let id = Math.floor(Math.random()*vProduse.length);
        vProdAlese.push(id);
    }
    for (let i=0; i<5; i++){
        let prod = vProduse[vProdAlese[i]];
        document.querySelector(`#slide${i} img`).src = "/Resurse/imagini/produse/"+prod.imagine;
        document.querySelector(`#slide${i} h5`).innerText = prod.nume;
        document.querySelector(`#slide${i} p`).innerText = prod.categorie;

    }

}

setInterval(schimbaImag,15000);
schimbaImag();