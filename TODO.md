# TODO

## About communication front - back

- When the client load, he should ask the server information about the current state
  - How many players currently playing and pending
  - What did they selected as level and side
- Communication between the 2 players should be as stateless as possible from a server point of view
  - benefits from redis, socket.io redis-adapter

## Required

- Restore level loading
- Restore connection with server
  - Restore ambient occlusion map for elements
- Add information in the menu about the server state
  - Number of player waiting and in each level
  - Estimated waiting time => nice to have

- Restore occlusion with the light if some element are in front of the camera

## Nice to have

- make floating animation for player
- Rethink the way the level are built, everything could be imported from Blender or other tool to generate
  level
- Check to optimize / improve the shadow player shader
