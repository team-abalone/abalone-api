class serverControls {
   static a() {
        console.log("a");
    }
    static b() {
        console.log("b");
    }
    static chatFunction = (data) => {
        let extractedString = (data + '').split(" ");
        let name = extractedString[1];
        let msg = "";
        
        for (let i = 2; i < extractedString.length; i++) {
            msg += `${extractedString[i]} `;
        }
        console.log(`${name} said: ${msg}`);

       // return { name, msg };  -Eventually, the server will response with an array
    }
}
export default serverControls;

