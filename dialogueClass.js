import { dialogueDirectory } from "./dialogueDirectory.js"
import {newRect, newText, randInt, newFilledText} from "./Utility.js"
import { mouse } from "./MouseInputHandler.js"
import {playerController, playerData} from "./PlayerController.js";
import {keybinds, keyPresses} from "./KeyboardInputHandler.js";
import {availableAssets} from "./AssetLoader.js";
import {battle} from "./BattleHandler.js";
import {world} from "./WorldHandler.js";
import {gameWidth} from "./main.js";
import {shopDirectory} from "./shopDirectory.js";

/*
 * DIALOGUE ENGINE - how this is put together
 *
 * The old version had one giant resolve() that both (a) figured out which raw
 * data to pull from and (b) processed that data (conditions/choices/writeTo/
 * battle/text). That meant every new *source* of dialogue (shop, oneshots)
 * needed its own copy of the processing logic pasted in again.
 *
 * Now there are three separate jobs:
 *
 * 1. LOOKUP  - turns a request ({type:"story"|"shop"|"oneshot", ...}) into a
 *              flat `sequence` array of raw entries. This is the only part
 *              that knows dialogueDirectory/shopDirectory's shapes.
 * 2. APPLY   - given ONE entry from that sequence, does the actual work
 *              (condition redirect, writeTo, choices, battle trigger, text
 *              setup). Doesn't know or care where the entry came from.
 * 3. SESSION - `dialogue.session` tracks {sequence, index, type, name} and
 *              is what update()/handlePlayerInput() walk through. Completion
 *              is just "index >= sequence.length" - no more reaching back
 *              into dialogueDirectory to ask "are we done yet?".
 *
 * A single line that shouldn't advance the conversation (shop hover text,
 * "thanks for buying") is just an entry with oneshot:true - on interact it
 * closes instead of stepping to session.index + 1.
 */

export let questionHandler = {
    boxWidth:500,
    boxBaseHeight:50,
    boxStartingY: 400,
    boxYSpacing:60,
    boxX:(1920/2) - (500/2),

    selectionBoxSize : 25,

    textSize:25,

    baseColor : "rgb(176,89,165)",
    selectColor : "rgb(88,37,105)",

    selectionIndex:0,
    choices:[],

    satisfied:true,
    poll:false,

    update(dt){
        if (keyPresses[keybinds.Interact] && !this.poll) {
            this.poll = true;
        } else if (keyPresses[keybinds.Interact] && this.poll) {
            availableAssets.sounds.OO_Click.play();
            let selection = this.choices[this.selectionIndex];
            this.satisfied = true;
            this.poll = false;
            // writeTo / goTo / whatever the selection implies now lives in
            // one place, shared by every dialogue source - see below.
            dialogue.handleChoiceSelected(selection);
        } else if (keyPresses[keybinds.Left]) {
            availableAssets.sounds.navigation.play();
            if (this.selectionIndex - 1 >-1) {this.selectionIndex--;}
        } else if (keyPresses[keybinds.Right]) {
            availableAssets.sounds.navigation.play();
            if (this.selectionIndex + 1 <this.choices.length) {this.selectionIndex++;}
        }
    },

    draw(){
        for (let choiceIndex=0; choiceIndex<this.choices.length;choiceIndex++) {
            newRect("bg",this.boxX-5,this.boxStartingY + (choiceIndex*this.boxYSpacing)-5,this.boxWidth+10,this.boxBaseHeight+10,"rgb(0,0,0)").draw();
            newRect("bg",this.boxX,this.boxStartingY + (choiceIndex*this.boxYSpacing),this.boxWidth,this.boxBaseHeight,this.selectionIndex === choiceIndex ? this.selectColor : this.baseColor).draw();
            newFilledText("textForAnswers",this.boxX,this.boxStartingY + (choiceIndex*this.boxYSpacing) + this.textSize,"rgb(255,255,255)",this.textSize+"px JetBrains Mono ExtraBold",this.choices[choiceIndex].text).draw();
            if (this.selectionIndex === choiceIndex) {
                newRect("bg",this.boxX- (2*this.selectionBoxSize)-5,this.boxStartingY + (choiceIndex*this.boxYSpacing) + (this.selectionBoxSize/2)-5,this.selectionBoxSize+10,this.selectionBoxSize+10,"rgb(0 0 0)").draw();
                newRect("bg",this.boxX- (2*this.selectionBoxSize),this.boxStartingY + (choiceIndex*this.boxYSpacing) + (this.selectionBoxSize/2),this.selectionBoxSize,this.selectionBoxSize,"rgb(255,255,255)").draw();
            }
        }
    },

    // unchanged - readFrom still gates which choices even show up
    append(answerList){
        for (let choiceI of answerList) {
            let canQuestion = true;
            if (choiceI?.readFrom) {
                if (playerData.internalData[choiceI?.readFrom[0]] !== choiceI?.readFrom[1]){canQuestion=false;}
            }
            if (canQuestion) {
                this.choices.push({
                    text:choiceI.text,
                    readFrom: choiceI?.readFrom,
                    writeTo: choiceI?.writeTo,
                    goTo: choiceI?.goTo,
                });
            }
        }
        this.satisfied=false;
    },
};

// ---------------------------------------------------------------------
// LOOKUP: figures out which identifier branch of dialogueDirectory[name]
// wins. Right now that's always "normal", because the STORY branch is
// still a stub in your data (it just has a comment "execute special code
// or smth") and quest-override keys aren't implemented yet either. Kept
// as its own function with the TODO hooks so wiring in real quest
// branching later doesn't mean touching resolve() again.
// ---------------------------------------------------------------------
function selectStoryIdentifier(dialogueName) {
    const branches = dialogueDirectory[dialogueName];
    if (!branches) {
        console.error(`dialogue directory not found: ${dialogueName}`);
        return null;
    }
    for (const key of Object.keys(branches)) {
        const prefix = key.split("-")[0];
        if (prefix === "STORY") {
            // TODO: quest-stage-specific story branch selection goes here
            continue;
        }
        if (prefix !== "normal") {
            // TODO: active-quest dialogue override selection goes here
            continue;
        }
        return key; // "normal" - today's fallback for everything
    }
    return null;
}

export let dialogue = {

    dialoguePresent : false,

    x : 1920/2 - 400,
    y : 700,
    width : 800,
    height : 200,
    characterIndex : 0,
    localElapsedTime : 0, //in milliseconds

    characterSize : 15,
    characterWidth : 25,
    characterHeight : 25,
    startingYBuffer :20,

    backgroundBox:true,

    continueBoxSize : 80,

    selectedData : {who:"nobody",textIdentifier:"none"},

    punctuationPeriod : 800,
    punctuationComma : 400,
    textSpeed : 50,
    playerInteract : false,

    playerContinue:true,

    // one active conversation's worth of state. index:-1 means "nothing loaded".
    session: {
        sequence: [],
        index: -1,
        type: null,   // "story" | "shop" | "oneshot"
        name: null,   // dialogueName for story/oneshot, shopKey for shop
    },

    name : "",
    textFinished : false,
    resolving : false,

    active:false,

    precomputedText : [],

    precomputeWordWrapping : function(text){
        if (!text) {return}

        let final = [];
        let split = text.split(" ");
        let carrier = "";
        for (let word of split) {
            if (word.substring(0, 1) === "@" && word.substring(0, 4) !== "@end") {
                let splitStyle = word.split("/");
                let subCarrier = []
                for (let i = 0; i < splitStyle.length - 1; i++) {
                    let separated = splitStyle[i].split("(");
                    if (separated[0].substring(0,1)==="@") {
                        subCarrier.push( {type:separated[0].substring(1,separated[0].length) ,value: separated[1].substring( 0, separated[1].length - 1 ) } );
                    } else {
                        subCarrier.push({type:separated[0], value:separated[1].substring(0, separated[1].length - 1)});
                    }
                }
                carrier = subCarrier;
                final.push([splitStyle[splitStyle.length - 1], carrier]);
            } else if (word.substring(0, 4) === "@end"){
                carrier = "";
            } else {
                final.push([word,carrier]);
            }
        }

        let currentX = 0;
        let currentY = 0;

        for (let word of final) {
            let letterWidth = this.characterWidth + 3;
            let letterHeight = this.characterHeight;
            let SPACING = 3/4 * letterWidth;

            if (word[1]) {
                for (let style of word[1]) {
                    if (style.type === "size") {
                        letterWidth = style.value;
                        letterHeight = style.value;
                    }
                }
            }

            if ((word[0].length * letterWidth)+ SPACING + currentX > this.width) {
                currentX=0;
                currentY+=letterHeight;
            }

            for (let letterIndex=0; letterIndex<word[0].length; letterIndex++) {
                this.precomputedText.push({letter:word[0][letterIndex], x:currentX,y:currentY + this.startingYBuffer,size:letterWidth, style : word[1]});
                currentX += (letterWidth-10) + (letterIndex === word[0].length-1 ? SPACING : 0);
            }
        }
        dialogue.resolving = false;
    },

    handlePlayerInput : function() {
        this.playerInteract = true;

        if (!this.textFinished) {
            this.characterIndex = this.precomputedText.length-1;
            this.textFinished = true;
            return;
        }

        if (!questionHandler.satisfied) return; // waiting on a choice pick

        const currentEntry = this.session.sequence[this.session.index];

        if (currentEntry?.oneshot) {
            this.closeDialogue();
            return;
        }

        this.session.index++;
        this.resetPerLineState();

        if (this.session.index >= this.session.sequence.length) {
            this.closeDialogue();
            return;
        }

        this.advanceToValidEntry();
    },

    update : function(delta) {
        if (!this.active) {return}
        if (this.session.index < 0 || this.resolving) {return}

        if (!questionHandler.satisfied && this.textFinished) {
            questionHandler.update(delta);
        }

        this.localElapsedTime += delta * 1000;

        if (this.precomputedText.length-1 === this.characterIndex) {this.textFinished = true;}
    },

    setup(options={}) {
        const {
            backgroundBox = true,
            x =1920/2 - 400,
            y = 700,
            width = 800,
            height = 200,

            boxWidth=500,
            boxBaseHeight=50,
            boxStartingY=400,
            boxX=(1920/2) - (500/2),
        } = options

        this.backgroundBox = backgroundBox
        this.x = x
        this.y = y
        this.width = width
        this.height = height

        questionHandler.boxWidth = boxWidth
        questionHandler.boxBaseHeight=boxBaseHeight
        questionHandler.boxStartingY=boxStartingY
        questionHandler.boxX=boxX
    },

    draw(){
        if (!this.active) {return}
        if (this.backgroundBox) newRect("dialogueBoxBG",dialogue.x - this.characterSize, dialogue.y - this.characterSize,dialogue.width + this.characterSize,dialogue.height + this.characterSize,"rgb(80,80,80)").draw();

        if (!this.textFinished) {
            let delayTime = this.textSpeed;
            for (let styleI of this.precomputedText[this.characterIndex].style) {
                if (styleI.type === "speedMs") {
                    delayTime = styleI.value;
                }
            }

            if (this.localElapsedTime > delayTime) {
                this.characterIndex++;
                this.localElapsedTime-=delayTime;

                availableAssets.sounds[this.selectedData.voice].play();
            }
        } else {
            newRect("dialogueBoxContinueBox",dialogue.x + dialogue.width -(this.continueBoxSize/2),this.y - (this.continueBoxSize/2),this.continueBoxSize,this.continueBoxSize,"rgb(0,0,0)").draw();
            newText("dialogueBoxContinueBoxText",dialogue.x + dialogue.width -(this.continueBoxSize/2),this.y,"rgb(199,185,160)",(this.continueBoxSize/3)+"px JetBrains Mono ExtraBold",keybinds.Interact).draw();
        }

        for (let [index,character] of this.precomputedText.entries()) {
            if (index <= this.characterIndex) {
                let color = "rgb(255,255,255)";
                let size = dialogue.characterWidth;
                let textX = character.x + this.x;
                let textY = character.y + this.y;
                let wavy=null;
                let styleStartIndex = 1;
                let styleEndIndex = 1;
                for (let styleI of this.precomputedText[index].style) {
                    if (styleI.type === "rgb") {
                        color = "rgb("+styleI.value+")";
                    }
                    if (styleI.type === "size") {
                        size = styleI.value;
                    }
                    if (styleI.type === "wavy") {
                        if (index-1 >-1) {
                            if (this.precomputedText[index]?.style.length === 0) {
                                styleStartIndex = index;
                            }
                        }

                        if (index+1 < Object.keys(this.precomputedText).length-1) {
                            if (this.precomputedText[index+1].style.length === 0) {
                                styleEndIndex = index;
                            }
                        }

                        wavy = styleI.value.split(",");
                        let percentage = (index/25) * (Math.PI*2)
                        textX = textX + -(Math.cos(performance.now() / 1000 * wavy[1] + percentage) * wavy[0]);
                        textY = textY + (Math.sin(performance.now() / 1000 * wavy[1] + percentage) * wavy[0]);
                    }
                    if (styleI.type === "shake") {
                        textX = textX + randInt(-styleI.value,styleI.value);
                        textY = textY + randInt(-styleI.value,styleI.value);
                    }
                }

                newFilledText("character_"+character.letter+"_"+index,
                    textX,
                    textY,
                    color,
                    size+"px JetBrains Mono ExtraBold",
                    character.letter
                ).draw();
            }
        }

        if (!questionHandler.satisfied && this.textFinished) {
            questionHandler.draw();
        }
    },

    // ---------------------------------------------------------------
    // Entry point. Call shapes:
    //   dialogue.resolve({type:"story", name:"guy"})
    //   dialogue.resolve({type:"shop",  shopKey:"guy", entryName:"entrance"})
    //   dialogue.resolve({type:"oneshot", text:item.hoverDescription})
    // Optional on all: playerContinue (default true), overlap (default false)
    // ---------------------------------------------------------------
    resolve(request) {
        const { overlap = false } = request;

        if (this.dialoguePresent && !overlap) return;

        this.playerContinue = request.playerContinue ?? true;
        this.active = true;
        this.dialoguePresent = true;
        this.resolving = true;
        questionHandler.choices = [];
        questionHandler.satisfied = true;

        if (overlap) {
            this.resetPerLineState();
        }

        let sequence;
        let sessionName;

        switch (request.type) {
            case "story": {
                const identifier = selectStoryIdentifier(request.name);
                if (!identifier) { this.closeDialogue(); return; }
                sequence = dialogueDirectory[request.name][identifier];
                sessionName = request.name;
                break;
            }
            case "shop": {
                const shop = shopDirectory[request.shopKey];
                if (!shop) {
                    console.error(`shop not found: ${request.shopKey}`);
                    this.closeDialogue();
                    return;
                }
                sequence = shop.dialogue[request.entryName];
                if (!sequence) {
                    console.error(`shop dialogue entry not found: ${request.shopKey}.${request.entryName}`);
                    this.closeDialogue();
                    return;
                }
                sessionName = request.shopKey;
                break;
            }
            case "oneshot": {
                // request.text can be a plain string (item.hoverDescription /
                // item.buyDialogue) or a {text, voice} object like the rest
                // of the directories use.
                const rawEntry = typeof request.text === "object"
                    ? request.text
                    : {text: request.text, voice: request.voice};
                sequence = [{...rawEntry, oneshot: true}];
                sessionName = request.name ?? "oneshot";
                break;
            }
            default:
                console.error(`Unknown dialogue resolve type: ${request.type}`);
                this.closeDialogue();
                return;
        }

        this.session = {sequence, index: 0, type: request.type, name: sessionName};
        this.advanceToValidEntry();
    },

    // Applies whatever's at session.index, or closes out if the sequence
    // ran dry / wasn't found.
    advanceToValidEntry() {
        const entry = this.session.sequence?.[this.session.index];
        if (!entry) { this.closeDialogue(); return; }
        this.applyEntry(entry);
    },

    // The part that used to be duplicated between the dialogueDirectory and
    // shop branches. Doesn't know or care which directory the entry came
    // from - just reacts to whichever of these fields are present.
    applyEntry(entry) {
        if (entry.condition) {
            const {check, ifTrue} = entry.condition;
            if (playerData.internalData[check[0]] === check[1]) {
                if (this.session.type === "shop") {
                    this.resolve({type:"shop", shopKey:this.session.name, entryName:ifTrue, overlap:true});
                } else {
                    this.resolve({type:"story", name:ifTrue, overlap:true});
                }
                return;
            }
        }

        if (entry.writeTo) {
            playerData.internalData[entry.writeTo[0]] = entry.writeTo[1];
        }

        if (entry.choices) {
            questionHandler.satisfied = false;
            questionHandler.append(entry.choices);
        }

        if (entry.battle) {
            this.dialoguePresent = false;
            this.active = false;
            playerController.state = "battle";
            battle.start(entry.battle.enemies, world.currentLocation, entry.battle.backgroundData);
            return;
        }

        if (entry.text) {
            this.precomputeWordWrapping(entry.text);
            this.selectedData = {
                who: this.session.name,
                textIdentifier: this.session.type,
                voice: entry.voice || "OO_Talk",
            };
        } else {
            // nothing to type out (e.g. a choices-only prompt) - don't sit
            // there waiting on a typewriter effect that has nothing to type
            this.textFinished = true;
        }

        if (!entry.text && !entry.choices) {
            // condition-only dead end that didn't redirect, or a totally
            // empty entry - there's nothing left to show
            this.closeDialogue();
            return;
        }

        this.resolving = false;
    },

    // Called by questionHandler once a choice is confirmed. writeTo happens
    // no matter what; goTo jumps to a different named entry point within
    // the same source (this is what your shop "talk" -> whoAmI/locationAndWhy
    // needs - writeTo alone can't redirect you anywhere).
    handleChoiceSelected(selection) {
        if (selection?.writeTo) {
            playerData.internalData[selection.writeTo[0]] = selection.writeTo[1];
        }

        if (selection?.goTo) {
            if (this.session.type === "shop") {
                this.resolve({type:"shop", shopKey:this.session.name, entryName:selection.goTo, overlap:true});
            } else {
                this.resolve({type:"story", name:selection.goTo, overlap:true});
            }
        }

        // No goTo: just resume the normal sequence. Next handlePlayerInput()
        // call advances session.index as usual.
    },

    resetPerLineState() {
        this.textFinished = false;
        this.localElapsedTime = 0;
        this.characterIndex = 0;
        this.precomputedText = [];
    },

    closeDialogue() {
        this.active = false;
        this.dialoguePresent = false;
        this.playerInteract = false;
        this.resolving = false;
        this.session = {sequence: [], index: -1, type: null, name: null};
        this.selectedData = {who: "nobody", textIdentifier: "none"};
        this.resetPerLineState();
        playerController.state = "active";
    },
}