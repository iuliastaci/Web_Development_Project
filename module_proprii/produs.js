/**
 * @param {Object} obiectProdus - obiectul de tip Produs
 * @param {number} id - id-ul produsului
 * @param {string} nume - numele produsului
 * @param {string} descriere - descrierea produsului
 * @param {number} pret - pretul produsului
 * @param {number} cantitate_in_pachet - nr de bucati dintr-un pachet
 * @param {string} locatie_de_plantare - locul unde este indicat sa se planteze produsul
 * @param {string} conditii_de_lumina - ce fel de lumina este indicata
 * @param {string} categorie - categoria produsului
 * @param {string[]} timp_de_plantare - lunile in care este indicat sa se planteze produsul
 * @param {boolean} comestibil - indica daca produsul este comestibil sau nu
 * @param {string} imagine - adresa imaginii
 * @param {Date} data_adaugare - data adaugarii produsului
 */

class Produs{

    constructor({id, nume, descriere, pret, cantitate_in_pachet, locatie_de_plantare, conditii_de_lumina, categorie, timp_de_plantare, comestibil, imagine, data_adaugare}={}) {

        for(let prop in arguments[0]){
            this[prop]=arguments[0][prop]
        }

    }

}