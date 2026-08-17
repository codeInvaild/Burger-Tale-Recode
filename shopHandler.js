import {newRect} from "./Utility.js";
import {dialogue} from "./dialogueClass.js";

//you will need to make dialogueClass modular for this to work since the keeper's dialogue will want to use its system
export let shopHandler = {
    menuStack: [{name:"main",curIndex:0,maxIndex:3}],
    reference:"",

    update(deltaTime) {
        console.log("Insert your king soopers shooper card");
    },

    draw() {
        newRect("a", 100, 100, 200, 200, "rgb(192,82,200)").draw();

        newRect("id", 800, 600, 700, 400, "rgb(255,255,255)").draw();
        
        //draw said character and background first, they will be covered by the UI

        //draw base layer things like dialogueBox and shop menu
        newRect("Aaa",50,700,997,358,"rgb(87,87,87)").draw();
        newRect("id2",1070,20,800,800,"rgb(87,87,87)").draw();
        newRect("bg",1070,837,800,100,"rgb(87,87,87)").draw();
        newRect("bg2",1070,951,800,100,"rgb(87,87,87)").draw();


        //grid tile placeholder (coordinate 1,1)
        //newRect("...",1090,140,175,175,"rgb(200,0,0)").draw();
        //scale using a multiplier of 175 + 20 as the X and Y buffers
        //cap out at the 4th Y position







    },

    newShop(keeperName) {
        this.reference = keeperName;
        dialogue.setup({
            
        });
    }
}