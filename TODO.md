# TODO

## Bugs to fix

### High priority

- Bug when adding a door and a door opener, if I don't save or reload, I can't interact with the door
- Fix roadmap / timeline content
- crash if try to delete the bounce we are currently inside
- While switching play / editor, the camera come back to the start it's annoying

### Medium priority

- When updating size and rotation of element. At some point the rotation is not considered anymore

### Low priority

- The player in light composer change slightly the whole brightness of the screen when going in and out
- Bug with the wave when the menu is remounted after entering the game, the wave is not reacting with the mouse anymore.
- On loading of any page of the website, there is blank screen with loading written for a moment before disappearing.
- Address lint warnings
- Take care of google captcha on staging and prod

## Ideas

- Add arrow on the HUD to indicate direction of your team mate when he is far
- Players leave a trail behind them and it can impact the world

## Features

### High priority

- Add rating system for level, we can imagine multiple rating, one for fun and enjoyment, another one for the difficulty, and maybe more, etc.
- While in queue, propose an alternative than waiting infinitely
- Add button to reset bounces in level editor
- Add issues on github with tag "good first contribution"
- Add button to hide elements in level editor
- Add link to socials on the website, in the bottom close the version for example
- Add scale management for all elements. So you can have super big door, or you can have small door like evry lucarne
- Add landing page and reorganize routing
- In level editor root, add an author selector to be able to watch the levels made by others, to open them, play them, and fork them.
- Add request to add a like to a level
- Write medium article about the current state of the project, and about the vision and where I want to go
- Update the timeline. Talk in the timeline about brilliant and how it help me achieve what I needed in terms of math.
- Improve navigation in timeline, use button to go to anchor
- Add appropriate license for the project, VERY IMPORTANT
- Display a message to invite people to comeback with a laptop if they use the level editor
- Vue niveau creer par la communaute
  - call to action pour creer tes propres niveaux
  - Obviously, good UX / tuto / tips pour creer tes niveaux
  - Showcase avec les 5 derniers niveau creer
  - Les 5 niveaux les plus jouer
  - Un system de like par niveau, et donc niveau le plus like, etc
  - Niveau le plus partage
  - Le mec qui a fait les meilleurs niveaux, est ce que tu peux le follow ?
  - news about les prochains update du game, example, soon, element trou noir disponible dans le level builder

### Medium priority

- When you wait for a player on lobby, have a playground with the solo mode to make the wait more enjoyable.
- Ability to add doors open by default
- Add possibility to load custom geometry in the scene, would be awesome to avoid too geometric level
- When elements are locked, we have not visual indication about what is each element, just name
- Possibility to add lights in level
- Transform a wall into a wall door easily
- When you have a level with a lot of element, when you select one with the mouse, would be nice to scroll to select element in the list on the right
- Start to count accurately the exact duration of game in order to have speed run capability.
- Enable github sponsor
- Try to estimate waiting time
- Activator permanent, which doesn't require you to stay on the platform like current door openers. You activate a button to open / move another part of the level elsewhere
- Being able to manage the bounce power with level editor
- Aimenter les elements proche pour faciliter la creation de structure.
- Creer des groupes d'elements
- Add loading state for level editor
- Et un truc peut être bête mais pouvoir mettre du text dans la map, pour aider les joueurs, indiquer des chemins, raconter une histoire ...
- Reflechir a propos d'avoir des elements qui represente du texte comme dans outer wilds par example.
- Add end time when game is finished.
- Ease builder experience somehow, could be to add level templates, could be to add randomly generated maps, etc. Investigate

### Low priority

- Add a random mode
- Add session recover with websocket => https://socket.io/docs/v4/connection-state-recovery
- Use the already stored "entryNormal" inside the element to bounce to make coherent the entry and exit normal of the player.
- charger la rotation du bounce pour propulser plus loin son team mate, type gros coup de bate de baseball
- L3Gl0N__: Moi ce que je kifferai avoir à la place du synchronize .... Ce serais une grande vue comme ça et cela zoom sur le perso et seulement après tu peux jouer, le delai d'animation sert de synchro
- S4oul => https://roadmap.sh/cpp first, the connections and styles are interesting, then it can be nice to link roadmap points with github ticket. The goal is to reduce friction and ease a maximum the eventual collaboration experience.
- Timeline management while testing the level, to easily come back at any moment in the level. Multiple timeline, test different things in the same time, or timeline respective for shadow and light.
- Layout of end game scene view can be improved
- Generate map randomly

## Nice to have

### Low priority

- Optimize / improve the shadow player shader
- make floating animation for player
- Indicate where you team mate is in a game, and add possibility to call your friend in a direction somehow
- Different moment of the day depending of the level, different fog as well with level builder

## Potential game play suggestion

- L3Gl0N__:
  - black hole, potential impact on gravity
  - Dash for the light
  - shadow can avoid gravity for a while, or go through spaces the light can't, the main idea is about not having movement constraints for a duration
  - End level animation => make the player attracted by the center of the animation, kind of an ascension
- uchinara:
  - Player bounce against each other

## Stupid things to do

- Record welcome to millenium from => https://open.spotify.com/track/2GHnPQ8mAukedPzVZWRyTj?si=059aff8634a84bee and use it as a jingle when people subscribe

## If I ever receive one penny for this game

- Support this lib => https://github.com/gkjohnson/three-mesh-bvh
- Donate to shadertoy

## What to remember from test with viewers

- At the beginning of each level, indicate the basic keys could be helpful
- very light wave, pulsing at a frequency from where an element is being interacted with, to indicate other player the focus point
- Is it complicated to add controller support?
- Double jump
- twitch game support?
- Avoir des petites plateforme qui bouge, ou des éléments de décor qui change en fonction de si light ou shadow est dans la zone ou sur un interrupteur, dinguerie en devenir

## First streamer ever who played my game

- s17n
  - Because Legion sponsored me on his stream after a raid

## To be decided with the community

- Double jump feature when jumping against walls? Would change a lot the game but could be funny no?

## Police to test for home scene

- https://www.1001fonts.com/nk57-monospace-font.html
- https://www.ffonts.net/CPMono_v07Bold.font?text=COMPOSITE#

<!-- ## TODAY

- Add recurrent message such as kofibot, to print available commands for users in the chat. Or put it in the title of the stream.
- Lobby not always detecting choice of team mate on loading -->
