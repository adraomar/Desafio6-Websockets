console.log("Home view cargada correctamente!");

const socketClient = io();

const productForm = document.getElementById("productForm");
productForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const product = {
        title: document.getElementById("title").value,
        price: document.getElementById("price").value,
        thumbnail: document.getElementById("thumbnail").value
    };

    socketClient.emit("newProduct", product);
})

const productsContainer = document.getElementById("productsContainer");

socketClient.on("productsAll", async (data) => {
    const tableTemplate = await fetch("./templates/table.handlebars");
    const tableFormat = await tableTemplate.text();
    const template = Handlebars.compile(tableFormat);
    const html = template({products: data});
    productsContainer.innerHTML = html;
})
