/**
 * @type {string}
 * @type {number[][]}
 * */


sirAlphaNum="";
v_intervale=[[48,57],[65,90],[97,122]]
//Generam sirul sirAlphaNum iterand pe intervale
for(let interval of v_intervale){
    for(let i=interval[0]; i<=interval[1]; i++)
        sirAlphaNum+=String.fromCharCode(i)
}

console.log(sirAlphaNum);

/**
 * @param {number} n - lungimea token-ului care va fi generat
 * @returns {string} - token-ul generat
 * */
function genereazaToken(n){
    let token=""
    for (let i=0;i<n; i++){
        token+=sirAlphaNum[Math.floor(Math.random()*sirAlphaNum.length)]
    }
    return token;
}

module.exports.genereazaToken=genereazaToken;