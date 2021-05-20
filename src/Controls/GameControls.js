class GameControls {
    field;
    constructor() {

    }
   
    makeMove = (marbles, direction) => {
        //Example request : {userId: "bsp", commandCode: 70, marbles:[{id: 3,}, {...}], direction: 'LEFT_UP'};
        //if (!marbles) throw error
        //if(!direction) || if direction.notVaild throw error
        let ids =  [];
        for (let marble in marbles) {
            ids.push(marble.id);
        }
        let marblesWithDirection = {
            ids: ids,
            direction: direction
        };

        return marblesWithDirection;
    }

}