import {newRect, newFilledText, newImage, newRotatedRect} from "./Utility.js";
import {dialogue} from "./dialogueClass.js";
import {keyPresses as keypress, keybinds} from "./KeyboardInputHandler.js";
import {availableAssets, playMusic} from "./AssetLoader.js";
import {shopDirectory} from "./shopDirectory.js";
import {changeGameState} from "./main.js";
import {playerController, playerData} from "./PlayerController.js";
import {itemDirectory} from "./ItemDirectory.js";

let interactionOptions= ["Buy","Sell","Talk","Exit"]

//you will need to make dialogueClass modular for this to work since the keeper's dialogue will want to use its system
export let shopHandler = {
    menuStack: [{name:"main", curIndex:0, maxIndex:3}],
    reference:"",
    // active:false

    update(deltaTime) {
        // if (!this.active){return}
        let currentMenu = this.menuStack[this.menuStack.length-1];
        if (keypress[keybinds.Interact]) {
            if (currentMenu.name === "main") {
                if (currentMenu.curIndex <= 1) {
                    this.menuStack.push({
                        name: "Type",
                        curIndex: 0,
                        maxIndex: 1,
                        desiredType: interactionOptions[currentMenu.curIndex]
                    });
                } else if (currentMenu.curIndex === 2) {
                    this.menuStack.push({name: "dialogue", curIndex: 0, maxIndex: 0});
                    //tell dialogueHandler to be active
                } else {
                    changeGameState("World");
                    playerController.state = "active";
                }
            } else if (currentMenu.name === "Type") {

                if (currentMenu.curIndex ===0 && currentMenu.desiredType === "Buy") {//items buy
                    this.menuStack.push({name:currentMenu.desiredType+"-items",curIndex: 0,maxIndex: shopDirectory[this.reference].items.length-1});
                } else if (currentMenu.curIndex ===1 && currentMenu.desiredType === "Buy") {//gears buy
                    this.menuStack.push({name:currentMenu.desiredType+"-gears",curIndex: 0,maxIndex: shopDirectory[this.reference].gears.length-1});
                } else if (currentMenu.curIndex ===0 && currentMenu.desiredType === "Sell") {//items sell
                    this.menuStack.push({name:currentMenu.desiredType+"-items",curIndex: 0,maxIndex: playerData.items.length-1});
                } else if (currentMenu.curIndex ===1 && currentMenu.desiredType === "Sell") {//gear sell
                    this.menuStack.push({name:currentMenu.desiredType+"-gears",curIndex: 0,maxIndex: playerData.gears.length-1});
                }
            }  else if (currentMenu.name === "Buy-items") {
                //check for player currency if they can afford it, and them add it to their inventory if plausible (and if they have the space for it)
            }
        } else if (keypress[keybinds.Left] || keypress[keybinds.Up]) {
            availableAssets.sounds.navigation.play();
            if (currentMenu.curIndex -1 >= 0) {currentMenu.curIndex--;}
        } else if (keypress[keybinds.Right] || keypress[keybinds.Down]) {
            availableAssets.sounds.navigation.play();
            if (currentMenu.curIndex +1 <= currentMenu.maxIndex) {currentMenu.curIndex++;}
        } else if (keypress[keybinds.MenuBack]) {
            availableAssets.sounds.back.play();
            //return to parent block, but if null, do nothing
            if (this.menuStack.length > 1) {
                this.menuStack.pop();
            }
        }
    },

    draw() {
        let currentMenu = this.menuStack[this.menuStack.length-1];
        newRect("a", 100, 100, 200, 200, "rgb(192,82,200)").draw();

        newRect("id", 800, 600, 700, 400, "rgb(255,255,255)").draw();
        
        //draw said character and background first, they will be covered by the UI
        for (let img of shopDirectory[this.reference].visuals) {
            if (img.image) {
                newImage("image",img.x,img.y,img.width,img.height, availableAssets.images[img.image]).draw();
            }
        }

        //draw base layer things like dialogueBox and shop menu
        newRect("dialogueShopBG",50,700,997,358,"rgb(87,87,87)").draw();
        newRect("gridBG",1070,20,800,800,"rgb(87,87,87)").draw();
        newRect("playerStats1BG",1070,837,800,100,"rgb(87,87,87)").draw();
        newRect("playerStats2BG",1070,951,800,100,"rgb(87,87,87)").draw();

        if (currentMenu.name === "main") {
            for (let i = 0; i < currentMenu.maxIndex+1; i++) {
                if (currentMenu.curIndex === i) {
                    newRect("highlight",1170,140+(i*150),600,110,"rgb(19,192,119)").draw();
                }
                newFilledText("optionShop",1170,240+(i*150),"rgb(255,255,255)","100px JetBrains Mono ExtraBold", interactionOptions[i]).draw();
            }
        } else if (currentMenu.name === "Type") {
            let things = ["items","gears"]
            for (let i = 0; i < 2; i++) {
                if (currentMenu.curIndex === i) {
                    newRect("highlight",1170,140+(i*150),600,110,"rgb(19,192,119)").draw();
                }
                newFilledText("optionShop",1170,240+(i*150),"rgb(255,255,255)","100px JetBrains Mono ExtraBold", things[i]).draw();
            }
        } else if (currentMenu.name === "Buy-items") {
            for (let i = 0; i < shopDirectory[this.reference].items.length; i++) {
                newRect("tileShop",1090 + (195 * (i%4)),140 + (Math.floor(i/4) * 195),175,175,currentMenu.curIndex === i ? "rgb(200,200,200)":"rgb(38,30,30)").draw();
                if (currentMenu.curIndex === i) {
                    newRotatedRect("thing",1090 + (195 * (i%4)) + 87.5,140 + (Math.floor(i/4) * 195) + 87.5,150,150,"rgb(64,54,54)",0.78539816).draw();
                }
                let itema = (itemDirectory[ shopDirectory[this.reference].items[i].itemName]);
                newImage("thing",1090 + (195 * (i%4)) + 12.5,140 + (Math.floor(i/4) * 195) + 12.5,150,150,availableAssets?.images[ itema.image] ?? availableAssets.images.apple).draw();
                // newRect("border1",1090 + (195 * (i%4)),140 + (Math.floor(i/4) * 195),175,50,"rgb(0,0,0,0.5)").draw();
                newRect("border1",1090 + (195 * (i%4)),140 + (Math.floor(i/4) * 195) + 125,175,50,"rgb(0,0,0,0.5)").draw();
                // let textLength = (shopDirectory[this.reference].items[i].name).length;
                // let baseSize = 25;
                // let textSize =
                // newFilledText("cost",1090 + (195 * (i%4)) + 10,140 + (Math.floor(i/4) * 195) + 35,"rgb(255,255,255)","25px JetBrains Mono ExtraBold", shopDirectory[this.reference].items[i].name).draw();
                newFilledText("cost",1090 + (195 * (i%4)) + 10,140 + (Math.floor(i/4) * 195) + 160,"rgb(255,255,255)","25px JetBrains Mono ExtraBold","$"+shopDirectory[this.reference].items[i].cost.amount).draw();

            }
        }


        //grid tile placeholder (coordinate 1,1)
        //newRect("...",1090,140,175,175,"rgb(200,0,0)").draw();
        //scale using a multiplier of 175 + 20 as the X and Y buffers
        //cap out at the 4th Y position



    },

    newShop(keeperName) {
        playMusic("shifting",{fadeSeconds:0.5});
        this.reference = keeperName;
        dialogue.setup({
            
        });
    }
}