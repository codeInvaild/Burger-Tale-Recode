import {newRect} from "./Utility.js";


//you will need to make dialogueClass modular for this to work since the keeper's dialogue will want to use its system
export let shopHandler = {
    menuStack: [{name:"main",curIndex:0,maxIndex:3}],
    reference:"",

    update(deltaTime) {
        console.log("Insert your king soopers shooper card");
    },

    draw() {
        newRect("a", 100, 100, 200, 200, "rgb(192,82,200)").draw();











    },

    newShop(keeperName) {
        this.reference = keeperName;
    }
}