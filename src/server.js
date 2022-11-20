const express = require("express");
const handlebars = require("express-handlebars");
const path = require("path");
const Contenedor = require("./managers/contenedorProductos");
const { Server } = require("socket.io");

const messages = [];
const prodService = new Contenedor("productos.txt");
const viewsFolder = path.join(__dirname, "views");
const app = express();

const server = app.listen(8080, () => console.log(`Server listening on port 8080`));
const io = new Server(server);

app.use(express.static(__dirname+"/public"));
app.engine("handlebars", handlebars.engine());
app.set("views", viewsFolder);
app.set("view engine", "handlebars");

// Midlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Conexion Websocket
io.on("connection", async (socket) => {
    console.log("Nuevo cliente conectado: ", socket.id);

    const productos = await prodService.getAll();
    socket.emit("productsAll", productos);

    socket.on("newProduct", async (data) => {
       await prodService.save(data);

       const productos = await prodService.getAll();
       io.sockets.emit("productsAll", productos);
    });

    socket.emit("srvMessage", messages);
    socket.on("newMessage", (data) => {
        messages.push(data);
        // enviar a todos los clientes
        io.sockets.emit("srvMessage", messages);
    })
})

// RUTAS
app.get("/", (req, res) => {
    res.render("home");
})

app.post("/productos", async (req, res) => {
    const newProducto = req.body;
    console.log(newProducto);
    await prodService.save(newProducto);
    res.redirect("/");
})

app.get("/productos", async (req, res) => {
    const productos = await prodService.getAll();
    res.render("productos", {
        productos: productos
    });
})