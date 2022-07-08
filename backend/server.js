const http = require("http");
const app = require("./app");

app.set("port", process.env.PORT || 3000);

const server = http.createServer(app);

server.listen(process.env.PORT || 3000);
server.on("listening", () => {
    console.log("Le serveur est lancé sur le port 3000");
});
