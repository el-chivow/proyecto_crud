import app from './app.js';


app.listen(app.get('port'), () => {
console.log("SERVIDOR ESCUCHANDO", app.get("port"))
}
)