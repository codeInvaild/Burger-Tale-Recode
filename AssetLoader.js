export const assets = {
    images: {
        hammer: "Assets/images/fixItHammerDisortion.jpg",
        title : "Assets/images/burg.png",
    },
    music : { //WE CAN ONLY ACCEPT MP3s
        bling : "Assets/music/bling.mp3",
    }
};

export let assetCount = 0;

export let availableAssets = {
    images: {},
    music: {},//music is separated in a different category because we want it to loop
    sounds : {},
};

export function loadAsset(type, src, id) {

    if (type === "images") {
        const img = new Image();
        img.src = src;

        img.onload = () => {
            assetCount++;
            availableAssets[type][id] = img;
            console.log(`Loaded ${id}`);
        };
    } else if (type === "music") {
        const audio = new Audio(src);
        audio.loop = true;
        audio.oncanplaythrough = () => {//ensures that the ENTIRE audio is ready to be played
            console.log(`Audio loaded: ${id}`);
            availableAssets[type][id] = audio;
        }
    } else if (type === "sounds") {
        const audio = new Audio(src);
        audio.oncanplaythrough = () => { //ensures that the ENTIRE sfx is ready to be played
            console.log(`Audio loaded: ${id}`);
            availableAssets[type][id] = audio;
        }
    }

}
