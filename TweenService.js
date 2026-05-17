import {Tween} from "./Tween.js"
//refer to Tween.js if you want to see how tweens work (and easing functions are also in that file)
export const TweenService = {
    create(object, tweenInfo, goal) {
        return new Tween(object, tweenInfo, goal);
    },

    update(dt) {
        for (let i = Tween.allTweens.length - 1; i >= 0; i--) {
            const tween = Tween.allTweens[i];
            tween.update(dt); //call said tween's update function, it won't do anything if it is already done

            if (tween.finished) {//we will discard finished tweens to free up a little memory
                Tween.allTweens.splice(i, 1);
            }
        }
    }
};
