# RPG Project

This project is a web game based the concept of traditional RPG and Idle Games.

[Here you can find mockups for the different screen layouts and mechanics](https://excalidraw.com/#json=P9VkzuvsELsG_PzlKg9ok,ZhMg4lPg9FyB0dhFXNG--g)

## Introduction

### Inspirations

#### Dungeons & Dragons

For the setting, the rules, the gameplay etc. D&D is the TTRPG I'm the most familiar with and all the game is based on it.

#### Kitten Game

One of the few idle game I know that set the game in a tangible space (unlike Cookie Clicker or Antimatter Dimensions).
All the universe must feel like a real place, not just ridiculous abstract values.

#### Grim Tides

The UI-Based approach to a classic RPG is nice, and that's what motivated this project. Unlike Grim Tides, I want to have idle game parts and a more story-driven approach. (GT already have a story but it's not really tangible imo, unlike a TTRPG campaign.)

#### Picross Katana

Simply the best picross game I played with a nice way to underlay a progression mechanism via light RPG elements, idle systems etc.
Picross Katana if one of the few mobile game that does idle and slow progression without feeling like a cash grab.
This project aims to feel like PK, with a main game and a idle sub-game that brings value to the main game instead of restricting it and/or encourage players to pay to progress.

### Player Experience

The player will be able to travel between places, talk to people and fight enemies from a UI, with text narrating all of that. They will also be able to start action that takes time, and open the game later to see their outcome.

### Target Audience

This game will be available on web but is made to be played on mobile. Its idle parts are made to suit short and regular gameplay session. It's really made for casual players and fantasy rpg afficionados.

## Concept

As all RPG does, the player will be able to create a character, and give it a class, a species, set their stats and equip basic gear and spells.

They will then be presented to a story where they will need to reach ahard goal, even if they're too weak. They will then explore the world, talk to people, encounters foes and experience events.

All of these actions will allow them to gain experience points and gold, making them stronger and allowing them to tackle bigger tasks etc. (yes I'm describing all RPG from the dawn of time.)

## Mechanics

\* asterisks are here to denote mechanics that aren't needed in a MVP.

### Exploring

#### Exploring the world

The player character can explore the world via a map* or pre-defined locations. Traveling takes time and consume supplies\*.

Exploring a location may result in a random encounter with npcs, enemies, of even just a natural event (a trap, heavy rain that kind of things).

#### Exploring dungeons

> Here, by dungeons, we mean all kinds of large building with multiple rooms, treasures, enemies etc. It doesn't have to be underground or anything (ex: castle, forest, caves, sewers etc.)

In dungeons, the player will see a map from above with pathways (doors mainly) but not what's beyond. The map can be procedurally generated* or done by hand depending on the kind of dungeon it is.

Each room can result in a random event (much like described above) with various choices and outcomes.

Each floor of a dungeon have at least one way up/out, and potentially several* way down/in.

Doors can be locked* and the player will need to find a key (or the mechanism, or lockpick it) to open it.

The player can only do a short rest inside a dungeon, they will need to go outside to properly rest.

##### Exploring - Tasks needed for an MVP

> This is not a roadmap per se, it's just a way to prioritize tasks between short, medium and long time.

|Task|Goal|
|:--|--:|
|**v0 (MVP)**||
|Multiple locations and being able to move between them|v0|
|Random encounters|v0|
|Dungeons made of a simple grid (à la Grim Tide)|v0|
|**v1 (Base game)**||
|Dungeons with multiple floors|v1|
|Procedurally generated dungeons|v1|
|Map with locations placed on it|v1|
|**v2 (Best version of the game)**||
|Transitions between zones|v2|

### Talking

The player can talk to npcs with pre-defined choices. The character has a certain relation them, and their choices will impact how the npc feels about the player*

In this mode, the game plays like a visual novel. Choices will create branching paths in the dialog and may have an impact on future events*.

#### Talking - Tasks needed for an MVP

> This is not a roadmap per se, it's just a way to prioritize tasks between short, medium and long time.

|Task|Goal|
|:--|--:|
|**v0 (MVP)**||
|Few NPCs with basic functions (shopkeeper, guildmasters and such)|v0|
|One background illustration for the entire place (city)|v0|
|Only necessary text (quests, introductions, rewards and such)|v0|
|Static NPC portraits|v0|
|Static text with bold and italic emphasis|v0|
|**v1 (Base game)**||
|An affinity system with choices impacting the relationship|v1|
|A background for each specific location (tavern, temple etc.)|v1|
|Several key poses for the NPC|v1|
|Some text effects (text wiggling, small text etc.)|v1|
|A lot of mundane text, with rumors, jokes etc.|v1|
|**v2 (Best version of the game)**||
|Mundane texts about event happened in the game, players infos etc.|v2|
|"Lip-synced" dialogue with mouth animation|v2|
|Multiple NPC dialogs on the same screen|v2|

### Fighting

A fight is between one (or more*) player characters and one or more enemies. An initiative order is drawn at the start of the fight based on the dexterity stat of each participant and then it's all turn based.

In a turn, a player can use their weapon, cast spells, use skills or items.

A turn is made of an action and a bonus action. I won't be going into details here as the mechanics are entirely based on D&D 5e.

A successful fight yields treasures and experience points.  
The game is over if all characters in a party are dead. When the game is over, it's truly over but the player can create another character which will inherit some of the previous character's goods* (TBD)

To fight, the player can choose their actions (weapons, spells, moves, items..) and then the target.  
Fight would be on a grid with movement, ranges and area of effect*

#### Fighting - Tasks needed for an MVP

> This is not a roadmap per se, it's just a way to prioritize tasks between short, medium and long time.

|Task|Goal|
|:--|--:|
|**v0 (MVP)**||
|Turn based system (with initiative, actions, bonus actions etc)|v0|
|Basic actions in button form|v0|
|Melee, ranged and some spells (damage, heal)|v0|
|No AI for enemies, actions are selected at weighted random|v0|
|**v1 (Base game)**||
|Multiple player characters (the player and recruited heroes)|v1|
|Resistences and weaknesses|v1|
|Complex spells (DoT, multiple targets, group healing, lower resistance etc.)|v1|
|Actions in a playing card form|v1|
|Simple AI for enemies based on survival probabilities and target priority|v1|
|**v2 (Best version of the game)**||
|Actions in a drag and drop card form|v2|
|Arena with hard fights and handicaps|v1|
|Even more complex spells (invisibility, charms and such)|v1|
|Characters can auto-play|v1|
|Fights are done on a grid with movement,|v1|

### Idling

While doing nothing and being AFK (or AFS, away from screen idk), the game will still tracks progress on several tasks started by the player. Things like a travel, potions brewing or tasks given to other characters*.

The game will feature several materials that can be found in while exploring or after a fight. These materials can be sold or refined and then crafted into weapons, armors, enchantments etc.

Magical tools and weapons can also need to be attuned and it can take time.

Weapons degrade over time and need to be replaced. They don't break though, and can be smelted into iron to make another weapon.*

To justify crafting a lot of weapons, the player will work for a blacksmith and help them work. Same thing for a potion maker and an armorer. These artisans will be able to level up to make better and better tools *.

Spells can be learned when not in a dungeon, or when resting. Investing in a library can speed up the process.

If working as a guildmaster, the player can recruit adventurers and send them away to do quests. Returning adventurers level up and get better at this, but the complexity of quests will also be greater.

⚠️ The idle part of the game is **not** a way to prevent the player to progress and/or make them pay to skip waiting times. It's supposed to be a kind of resource management sub-game inside the rpg/exploring game.

#### Idling - Tasks needed for an MVP

> This is not a roadmap per se, it's just a way to prioritize tasks between short, medium and long time.

|Task|Goal|
|:--|--:|
|**v0 (MVP)**||
|Making raw elements from scraps (iron from weapons, yarn from clothes, refining monster hides into leather)|v0|
|Crafting items from raw element (weapons from iron, armors from yarn & leather)|v0|
|**v1 (Base game)**||
|Potion making system from monster drops|v1|
|Weapon degradation|v1|
|Level up artisans to craft better tools|v1|
|Recruits can be sent to do quests far away|v1|
|**v2 (Best version of the game)**||

## Tech

This will be a web game, made with traditional web app tools instead of a game engine. Here is a list of tools to be used :

- Solid.js with SolidStart
- Tailwind with DaisyUI
- A local-first DB like Dexie or PouchDB

The game will be hosted on Netlify as a SPA first, and maybe sometime will migrate to a SSR app in a lambda function.

### Tech - Tasks needed for an MVP

> This is not a roadmap per se, it's just a way to prioritize tasks between short, medium and long time.

|Task|Goal|
|:--|--:|
|**v0 (MVP)**||
|Make the skeleton of the game, with a nice theme|v0|
|Mobile-first layout|v0|
|**v1 (Base game)**||
|Responsive design|v1|
|Dark theme|v1|
|Page transitions|v1|
|Music and sound effects|v1|
|**v2 (Best version of the game)**||
|Online saves|v2|
|SSR data (enhanced security + updates...)|v2|
