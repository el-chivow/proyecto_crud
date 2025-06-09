const TABLA = 'clientes';
import auth from '../auth/index.js';


export default function(dbInyectada) {

    let db = dbInyectada;

    if(!db){
        db = require('../../DB/mysql')
    }

    function todos () {
        return db.todos(TABLA)
    }
    
    function uno (id) {
        return db.uno(TABLA, id)
    }
    
    function agregar (body) {
        return db.agregar(TABLA, body)
    }
    
    function eliminar (body) {
        return db.eliminar(TABLA, body)
    }

    return {
        todos,
        uno,
        agregar,
        eliminar
    }
};