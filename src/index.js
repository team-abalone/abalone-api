/*import net from 'net';

const PORT = process.env.PORT || 5001;
const host = process.env.HOST || "0.0.0.0";

let server = net.createServer();
server.listen(PORT, host, function () {
   console.log(`abalone server running \nPORT: ${PORT} \Host: ${host}`);
});

*/

import express from 'express';

const app = express();
app.listen((process.env.PORT || 5001), (req, res) => {
res.send("Geht")

});