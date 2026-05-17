import { assets, availableAssets, loadAsset } from './AssetLoader.js';
import { TweenService } from './TweenService.js';
import { TweenInfo } from './TweenInfo.js';
import { Tween} from './Tween.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let lastTime = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

for (let img in assets.images) {
    console.log(img);
    loadAsset("images",assets.images[img], img);
}

// loadAsset("music",assets.music.bling,"bling");

function draw() {
    ctx.fillStyle = 'purple';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (availableAssets.music.bling) {availableAssets.music.bling.play()}

    for (let img in availableAssets.images) {
        if (availableAssets.images[img]) {
            ctx.drawImage(availableAssets.images[img], sprite.x, sprite.y, canvas.width/2, canvas.height/2);
        }
    }
}

let sprite = {
    x:0,
    y:0,
}

const tween = TweenService.create(sprite, new TweenInfo(2,Tween.Easing.ElasticOut) , {x:400})
tween.play();

function update(dt) {//this is for operations that need to use deltaTime, all coupled into one function; NEEDS TO HAPPEN BEFORE THE DRAW CALL
    //import tweenService into here
    TweenService.update(dt);
}

function loop() {//MAIN GAME HAPPENS HERE
    const deltaTime = Math.min((Date.now() - lastTime) / 1000 , 0.05); //max 50 ms delay
    lastTime = Date.now();

    update(deltaTime);

    draw();
    requestAnimationFrame(loop);
}

loop();
