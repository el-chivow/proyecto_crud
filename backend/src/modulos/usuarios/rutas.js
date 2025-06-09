import express from 'express';
import seguridad from './seguridad.js';
import respuesta from '../../red/respuestas.js';
import controlador from './index.js';
import error from '../../middleware/errors.js';

const router = express.Router();


router.get('/', todos);
router.get('/:id', uno);
router.post('/', seguridad(), agregar);
router.put('/', seguridad(), eliminar);


async function todos (req, res, next) {
    try{
        const items = await controlador.todos()
        respuesta.success(req, res, items, 200);
    }catch(err){
        next(error);
    }   
};


async function uno (req, res, next) {
    try{
        const items = await controlador.uno(req.params.id)
        respuesta.success(req, res, items, 200);
    }catch(err){
        next(error);
    }   
};





async function agregar (req, res, next) {
    try{
        const items = await controlador.agregar(req.body);
        if(req.body.id == 0){
            mensaje = 'Item guardado con exito';
        }else{
            mensaje = 'Item actualizado con exitooo';
        }
        respuesta.success(req, res, mensaje, 201);
    }catch(err){
        next(err);
    }   
};





async function eliminar (req, res, next) {
    try{
        const items = await controlador.eliminar(req.body)
        respuesta.success(req, res, 'ITEM ELIMINADO CON EXITO', 200);
    }catch(err){
        next(error);
    }   
};









export default router;