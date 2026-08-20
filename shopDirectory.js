export const shopDirectory = {
    guy: {

        visuals:[
            {x:0,y:0,width:1920,height:1080,image:"shopBG1"},
        ],
        music:"shifting",

        items: [
            {
                name:"Red Apple",
                itemName:"apple",
                hoverDescription:"I found it off the trail, what about it?",
                buyDialogue:"Thanks, I didn't need it",
                cost:{amount:10,currency:"Copper"},
            },
            {
                name:"Tomato Sauce",
                itemName:"ketchup",
                hoverDescription: "I heard they call this thing 'ketchup' it's a weird name for some tangy tomato sauce",
                buyDialogue:"Thanks, I didn't need it",
                cost:{amount:15,currency:"Copper"},
            },
            {
                name:"Green Apple",
                itemName:"apple",
                hoverDescription:"I found it off the trail, what about it? And no, don't tell me that it's red",
                buyDialogue:"Thanks, I didn't need it",
                cost:{amount:10,currency:"Copper"},
            },
            {
                name:"Rotten Tomato Sauce",
                itemName:"ketchup",
                hoverDescription: "I found it in a trash can this time! ...what? Feed it to your enemies, dont eat it you nitwit!" ,
                buyDialogue:"Thank god, my store smells better now",
                cost:{amount:15,currency:"Copper"},
            },
            {
                name:"Ball of corn",
                itemName:"cornball",
                hoverDescription:"It's some weird looking piece of corn I found from a witch tower",
                buyDialogue:"...",
                cost:{amount:1,currency:"Copper"},
            },
            {
                name:"Red Apple",
                itemName:"apple",
                hoverDescription:"I found it off the trail, what about it?",
                buyDialogue:"Thanks, I didn't need it",
                cost:{amount:10,currency:"Copper"},
            },
            {
                name:"Tomato Sauce",
                itemName:"ketchup",
                hoverDescription: "I heard they call this thing 'ketchup' it's a weird name for some tangy tomato sauce",
                buyDialogue:"Thanks, I didn't need it",
                cost:{amount:15,currency:"Copper"},
            },
            {
                name:"Green Apple",
                itemName:"apple",
                hoverDescription:"I found it off the trail, what about it? And no, don't tell me that it's red",
                buyDialogue:"Thanks, I didn't need it",
                cost:{amount:10,currency:"Copper"},
            },
            {
                name:"Rotten Tomato Sauce",
                itemName:"ketchup",
                hoverDescription: "I found it in a trash can this time! ...what? Feed it to your enemies, dont eat it you nitwit!" ,
                buyDialogue:"Thank god, my store smells better now",
                cost:{amount:15,currency:"Copper"},
            },
            {
                name:"Ball of corn",
                itemName:"cornball",
                hoverDescription:"It's some weird looking piece of corn I found from a witch tower",
                buyDialogue:"...",
                cost:{amount:1,currency:"Copper"},
            },
        ],

        gears:[
            "..."
        ],

        dialogue:{
            entrance:[
                {
                    text:"Hey, welcome in. Do me a favor and buy something, yeah?"
                }
            ],
            
            talk: [
                {
                    text:"Huh? You're asking me a question?"
                },
                {
                    choices:[
                        {text:"Who are you?",goTo:"whoAmI"},
                        {text:"Why sell in a place like this?",goTo:"locationAndWhy"},
                        {text:"Nevermind",goTo:"entrance"},
                    ]
                }
            ],
            
            whoAmI:["..."],
            locationAndWhy:["..."],
        },

    },
    
    Turquoise: {
        //keeper items are the same as their item/gear directories but have special descriptions/dialogue based on who the keeper is for unique flavor dialogue
        items:[
            {
                name: "apple",
                price: 10,
                description: "regular apple bruh",
                hoverDialogue:"Interested in that apple dear? It's the best season to harvest right now! So enjoy while you can here, I'm sure you can't find anything like it up North~"
            }
        ],
        gears:[
            {
                name:"gold sword",
                price: 100,
                description:"A golden sword to appeal to the yellow aesthetic of the South! Grants a reasonable amount of attack.",
                hoverDialogue:"I've heard of that myth about golden equipment fragility, I assure you gold is just as strong as iron, with magic nullifying properties!~",
            }
        ],
        dialogue: {
            entrance: [
                {
                    text:"Welcome on in! Feel free to browse the Jewel's Armory, or pick up this season's harvest if you'd like~"
                }
            ],

            normal:[//triggers when the player decides to talk to the shopkeeper
                {
                    text:"What would you like to talk about?"
                },
                {
                    choices:[
                        {
                            text:"Your experience living in the South"
                        },
                        {
                            text:"The culture here"
                        },
                        {
                            text:"Who are you?"
                        },
                        {
                            text:"Who is Jewel?"
                        }
                    ]
                }
            ],

            whoAreYou:[
                {
                    text:"Ah, who am I?"
                },
                {
                    text:"My name is Turquoise! I'm a smithess who builds beautiful weapons~"
                },
                {
                    text:"I come from the small family of mages who rely on physical strength just as much as our knight counterparts! A deadly combination of exotic power and muscle~"
                },
                {
                    text:"I don't actually own this shop if ya can't tell... Jewel's name is plastered on the sign out in the front.",
                },
                {
                    text:"But I got the job here from showin' off some beautifully crafted weapons to her, so don't be lookin' for anything cheap here! We're all about quality!"
                }
            ],

            cultureHere:[
                {
                    text:"Ah, the culture that you Northeners slander?"
                },
                {
                    text:"I don't mean to sound like everyone else here, but give it a shot around here! It's not as brutal as anybody would depict us as."
                },
                {
                    text:"Sure, we rough house a lot. Well... To you, that may be an understatement."
                },
                {
                    text:"But our tendencies have led us to become one of the cities with the lowest crime rate! Believe that or not, the community keeps itself in check quite well",
                },
                {
                    text:"Everyone knows their bounds, and if someone steps out of it... The people around will knock you into place"
                },
                {
                    text:"Besides our so called violent tendencies, I think it'd be fun if you tried to participate in the Sundown festival that happens yearly."
                },
                {
                    text:"Since you asked about culture, I think going there will really give you a much better insight into how we are. Not from me trying to verbally escribe it to ya"
                }
            ],

            southExperience:[
                {
                    text:"Living in the South? Well you should know about the Shallow and Deep Souths first",
                },
                {
                    text:"The Shallow South, where you and I are, is quite tame and welcoming compared to the Deep."
                },
                {
                    text:"I've lived in the Deep South for a few years unfortunately, their anarchy knows no bounds, it is a criminal's paradise"
                },
                {
                    text:"I would say your depictions of us should go to THEM instead! We're a lot more civilized here!"
                }
            ],

            jewel:[
                {
                    text:"Lady Jewel ya say?",
                },
                {
                    text:"She's a high ranking council member who owns quite a few stores. You might've heard her name from Tabby up North, I hear they are close friends despite living in vastly different areas",
                },
                {
                    text:"I know they might do a co-opening someday, might be my excuse to take a trip up North and check it out."
                },
                {
                    text:"Now, now. I won't go prying too much into my boss for a customer like you. But consider visiting her other stores. And say hi to her if you see her please"
                },
                {
                    text:"She should be easy to spot wearing quite the jewelry on her. Hence her nickname; Jewel"
                }
            ]

        }
    },
};