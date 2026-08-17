/* gear properties;
* name: what it'll appear as
* image
* type; weapon or armor, weapons should primarily give attack, armor, defense, just determines what slot an ally can equip it on
* stats: any stat that an entity has can be modifed; attack, energy, speed, defense, but please try not to modify HP
* users; determines what allies can use said item as a list, prevents weird combos like using a sword on a mage
* */

export let gearDirectory={
    "Copper_Sword": {
        name: "Copper Sword",
        image:"copperSword",
        type:"weapon",
        stats:{
            attack:1,
        },
        users:[
            "Cobalt",
            "Insignia",
        ],
    }
}