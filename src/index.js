require('dotenv').config()

let express = require('express')
let app = express()
const io = require('socket.io')(server);

const PORT  = process.env.PORT || 5001
app.listen(PORT,(req,res)=> res.send(`Server has started on ${PORT}`))

app.get("/", (req, res) => {
    res.send("welcome to the abalone mobile app api");
})

io.on('connection', (socket) => {
    console.log('request received');
});