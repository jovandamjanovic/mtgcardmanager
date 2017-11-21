const axios = require('axios');
const ScheduleRequests = require('./axiosHelper');
const JSZip = require('jszip');
const fs = require('fs');

//var cards = ["Artful Dodge", "Distortion Strike", "Divine Reckoning", "Haze of Rage", "Supreme Verdict", "Teleportal", "Brainstorm", "Brute Force", "Counterflux", "Dig Through Time", "Emerge Unscathed", "Gods Willing", "Intervene", "Render Silent", "Return to Dust", "Savage Beating", "Spell Crumple", "Sphinx's Revelation", "Titan's Strength", "Wear / Tear", "Wild Ricochet", "Sol Ring", "Sunforger", "Swiftfoot Boots", "Aqueous Form", "Assemble the Legion", "Detention Sphere", "Flickering Ward", "Gift of Immortality", "Indestructibility", "Jeskai Ascendancy", "Madcap Skills", "Magefire Wings", "Pemmin's Aura", "Righteous Authority", "Shimmering Wings", "Spectra Ward", "Vanishing", "AEtherling", "Aurelia, the Warleader", "Bruna, Light of Alabaster", "Daxos of Meletis", "Dragon-Style Twins", "Monastery Mentor", "Narset, Enlightened Master"];
//var cards = ["Cemetery Reaper", "Consuming Aberration", "Crypt Ghast", "Cryptbreaker", "Death Baron", "Diregraf Captain", "Diregraf Colossus", "Fleshbag Marauder", "Geth, Lord of the Vault", "Ghoulcaller Gisa", "Gisa and Geralf", "Grave Titan", "Graveborn Muse", "Gravecrawler", "Gray Merchant of Asphodel", "Grimgrin, Corpse-Born", "Havengul Lich", "Lich Lord of Unx", "Lord of the Accursed", "Lord of the Undead", "Mikaeus, the Unhallowed", "Noosegraf Mob", "Plague Belcher", "Relentless Dead", "Sidisi, Undead Vizier", "Undead Alchemist", "Undead Warchief", "Zombie Master", "Counterspell", "Cyclonic Rift", "Disallow", "Entomb", "Fact or Fiction", "Hero's Downfall", "Swan Song", "Vampiric Tutor", "Army of the Damned", "Buried Alive", "Damnation", "Dark Salvation", "Demonic Tutor", "Dread Summons", "Life's Finale", "Toxic Deluge", "Victimize", "Zombie Apocalypse", "Ashnod's Altar", "Commander's Sphere", "Dimir Signet", "Herald's Horn", "Lightning Greaves", "Mindcrank", "Sol Ring", "Talisman of Dominance", "Vanquisher's Banner", "Endless Ranks of the Dead", "Kindred Discovery", "Liliana's Mastery", "Phyrexian Arena", "Rhystic Study", "Rooftop Storm", "Training Grounds", "Liliana, Death's Majesty", "Cabal Coffers", "Choked Estuary", "Command Tower", "Dimir Aqueduct", "Drowned Catacomb", "Evolving Wilds", "Fetid Pools", "Polluted Delta", "Sunken Hollow", "Tainted Isle", "Temple of Deceit", "Underground River", "Urborg, Tomb of Yawgmoth", "Watery Grave"];

//var cards = ["Aetherling", "Anthroplasm", "Buried Alive", "Capsize", "Cavern Harpy", "Chainer, Dementia Master", "Crimson Mage", "Deadeye Navigator", "Eater of the Dead", "Empress Galina", "Evacuation", "Fact or Fiction", "Gamble", "Hateflayer", "Horseshoe Crab", "Illusionist's Bracers", "Intuition", "Jace's Archivist", "Kokusho, the Evening Star", "Leech Bonder", "Lightning Greaves", "Minion of Leshrac", "Morphling", "Nightscape Familiar", "Ovinomancer", "Phyrexian Arena", "Pili-Pala", "Quicksilver Elemental", "Rainbow Efreet", "Rhystic Study", "Shauku, Endbringer", "Skeleton Scavengers", "Skithiryx, the Blight Dragon", "Soul of New Phyrexia", "Staff of Domination", "Steam Augury", "Torchling", "Training Grounds", "Tree of Perdition", "Vandalblast"];

var cards = ["Uyo, Silent Prophet", "Jhoira of the Ghitu", "Patron of The Moon", "Oona, Queen of the Fae", "Dralnu, Lich Lord", "Olivia Voldaren", "Vedalken Orrery", "Leyline of Anticipation", "Gilded Lotus"]

const cardService = axios.create();
ScheduleRequests(cardService, 150);

const getCardByName = cardName => {
    return cardService.get("https://api.scryfall.com/cards/named?format=json&fuzzy=" + cardName).then(response => response.data);
}
const getCardDetails = card => {
    console.log(card.name + ' loaded!');
    return {name: card.name, imageUrl: card.image_uris.png};
};
const getCardImage = card => cardService.get(card.imageUrl, {responseType: 'arraybuffer'}).then(response => {
    console.log(card.name + ' image loaded!');
    return response.data;
});
const appendImageToCard = card => getCardImage(card).then(image => ({name: card.name, imageUrl: card.imageUrl, image: image}));

axios.all(cards.map(card => getCardByName(card)
                                    .then(getCardDetails)
                                    .then(appendImageToCard)))
.then(cardList => {
    zip = new JSZip();
    cardList.map(card => {
        zip.file(card.name + '.png', card.image);
    });

    zip
    .generateNodeStream({type:'nodebuffer',streamFiles:true})
    .pipe(fs.createWriteStream('cards.zip'))
    .on('finish', function () {
        console.log("cards.zip written.");
    });
})
.catch(err => console.log(err));