import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Composite - The game - Roadmap',
    description:
        'Explore the timeline of events and milestones in the development of Composite - The game.',
};

type TimelineEvent = {
    date: string;
    description: React.ReactNode;
};

const pastEvents: TimelineEvent[] = [
    {
        date: '2017 - March',
        description: (
            <p>
                The birth of the idea. It happened during the thinking process
                of my final study project at {` `}
                <a
                    href="https://www.heaj.be/fr/formations/bacheliers/1ere-bac-techniques-infographiques/design-web-mobile"
                    target="_blank"
                    className="inline-link"
                >
                    HEAJ
                </a>
                .
            </p>
        ),
    },
    {
        date: '2017 - June',
        description: (
            <p>
                Final presentation in front of a jury. Was bugged, but somehow,
                managed to get a distinction grade and favor of the jury.
            </p>
        ),
    },
    {
        date: 'From December 2018 to February 2019',
        description: (
            <p>
                First tentative of refactoring, using Typescript. Mostly a
                refactoring of the menu part, not the 3D and game one. In my
                free time, aborted because no time in life.
            </p>
        ),
    },
    {
        date: '2023 - July',
        description: (
            <p>
                {`Too bored by corporate jobs, too thirsty about creating
                something on my own and working for my dreams and not for
                somebody else's dream. Start to work on the game again, in my
                free time.`}
            </p>
        ),
    },
    {
        date: '2023 - September',
        description: (
            <>
                <p>
                    Quit an ongoing freelance mission and start to work on the
                    game full time, while looking for another mission in my free
                    time.
                </p>
                <h3>Achievements</h3>
                <ul>
                    <li>
                        <p>Move to monorepo / npm workspaces.</p>
                    </li>
                    <li>
                        <p>
                            Update dependencies to last version. Most notable
                            change is updating{' '}
                            <a
                                href="https://threejs.org/"
                                target="_blank"
                                className="inline-link"
                            >
                                Three.js
                            </a>{' '}
                            from r85 to r156.
                        </p>
                    </li>
                    <li>
                        <p>
                            Reimplement and clean most of the graphic feature /
                            shaders from the initial POC. Add some new
                            animations.
                        </p>
                    </li>
                    <li>
                        <p>
                            Extracting everything that is physic related and
                            everything that should be shared between the server
                            and the client into a dedicated{' '}
                            <a
                                className="inline-link"
                                href="https://github.com/benjaminbours/Composite/tree/master/packages/core"
                                target="_blank"
                            >
                                package CORE
                            </a>
                            . The purpose was to run the same code back and
                            front to have predictable physic.
                        </p>
                    </li>
                    <li>
                        <p>
                            Add automated deployment process docker based with
                            CI/CD. Support dev and staging environment.
                        </p>
                    </li>
                    <li>
                        <p>
                            Discover and use{' '}
                            <a
                                href="https://traefik.io/"
                                target="_blank"
                                className="inline-link"
                            >
                                Traefic
                            </a>{' '}
                            in order to think from the very beginning about load
                            balancing, stateless server, and{' '}
                            <a
                                href="https://socket.io/docs/v4/using-multiple-nodes/"
                                target="_blank"
                                className="inline-link"
                            >
                                multiple socket.io instances.
                            </a>
                        </p>
                    </li>
                    <li>
                        <p>
                            Discover and use{' '}
                            <a
                                href="https://redis.io/https://redis.io"
                                target="_blank"
                                className="inline-link"
                            >
                                Redis
                            </a>{' '}
                            as a temporary storage system to own the game state,
                            the inputs buffer etc on the server.
                        </p>
                    </li>
                    <li>
                        <p>
                            Following investigation about techniques to produce
                            quality multiplayer games, such as the{' '}
                            <a
                                className="inline-link"
                                href="https://www.gabrielgambetta.com/client-server-game-architecture.html"
                                target="_blank"
                            >
                                series of article from Gabriel Gambetta
                            </a>{' '}
                            to name only one, I moved from my initial proof of
                            concept, which was very naive and not scalable at
                            all, with every kind of code mixed (inputs, net
                            code, game logic, graphic code, etc.), to a more
                            scalable architecture, with a clear separation of
                            concerns. To summarize, clients synchronize their
                            clock with the server, they predict inputs and sent
                            them to the server. The server queue them, then
                            process the same physic simulation and update all
                            the clients at a specific network update rate. Then
                            the clients reconciliate the state, using what can
                            be describe as rollback net code. The server is
                            authoritative and own the truth. This is also made
                            to have in mind cheat protection at some point, to
                            allow a clean leader board, as the game seems to be
                            a good fit for speed runners.
                        </p>
                    </li>
                    <li>
                        {`Fist level "Crack the door" restored and playable. Door
                        opening mechanic restored.`}
                    </li>
                </ul>
            </>
        ),
    },
    {
        date: '2023 - October',
        description: (
            <>
                <p>
                    Start a new freelance mission, try to keep working on the
                    game in my free time.
                </p>
                <h3>Achievements</h3>
                <ul>
                    <li>
                        <p>Add basic mobile support.</p>
                    </li>
                    <li>
                        <p>
                            Improve client flow between menu and game to be able
                            to stay in the same room with the guy you initially
                            matched with and then continue to play multiple
                            level together.
                        </p>
                    </li>
                </ul>
            </>
        ),
    },
    {
        date: '2023 - Mid December',
        description: (
            <>
                <p>
                    {`Realize it's not gonna work, realize I have to force myself
                    so much to work for that job I have no interest into,
                    realize I'm not gonna be able to work on the game in my free
                    time with a full time job load, realize I was much more
                    productive working one month on Composite than 2 months on
                    the freelance mission.`}
                </p>
                <p>
                    Realize I am not in the rush to find another mission in the
                    next months, and go with the flow, following my energy and
                    motivation. Start to work full time on multiple axis:
                    building the project itself, building a community around,
                    and generate as much content as I can about the game and the
                    development process, trying to give visibility to the
                    project.
                </p>
                <h3>Achievements</h3>
                <ul>
                    <li>
                        <p>
                            Start{' '}
                            <a
                                href="https://www.twitch.tv/elboursico"
                                target="_blank"
                                className="inline-link"
                            >
                                streaming project
                            </a>{' '}
                            development consistently.
                        </p>
                    </li>
                    <li>
                        <p>
                            Create a new version of the initial bounce mechanic.
                            Players can now enter platform of the same type and
                            make them rotate, to influence the bounce of your
                            team mate. Playing on the opposition between shadow
                            and light.
                        </p>
                    </li>
                    <li>
                        <p>New version of bounce skins.</p>
                    </li>
                    <li>
                        <p>
                            {` Realizing that doing real time collision between
                            players in multiplayer game is more challenging and
                            the current experience is poor in the second level
                            based on this mechanic. Start reading a lot of
                            content about Rocket League's physic system,
                            fighting / FPS games's net code, etc.`}
                        </p>
                    </li>
                    <li>
                        <p>
                            {`Second level "Learn to fly" remake, playable but not
                            incredible. Bounce mechanic enabled but hard to deal
                            with network inconsistencies.`}
                        </p>
                    </li>
                    <li>
                        <p>
                            Performance optimization, clean up shaders, usage of{' '}
                            <a
                                href="https://github.com/gkjohnson/three-mesh-bvh"
                                target="_blank"
                                className="inline-link"
                            >
                                three-mesh-bvh
                            </a>
                            {` `}
                            was game changing.
                        </p>
                    </li>
                </ul>
            </>
        ),
    },
    {
        date: '2024 - January',
        description: (
            <>
                <h3>Achievements</h3>
                <h4>Week 1</h4>
                <ul>
                    <li>
                        <p>
                            Add key bindings panel to support multiple keyboard
                            layouts.
                        </p>
                    </li>
                    <li>
                        <p>
                            Update bounce mechanic based on feedback from game
                            with viewers.
                        </p>
                    </li>
                    <li>
                        <p>Open discord server.</p>
                    </li>
                    <li>
                        <p>
                            Add contribution guide, ensure local development
                            setup procedure is complete and working as expected.
                            Tested with viewers on multiple OS.
                        </p>
                    </li>
                    <li>
                        <p>
                            Various other improvements and bugs fixing, check
                            the {` `}
                            <a
                                href="https://github.com/benjaminbours/Composite"
                                target="_blank"
                                className="inline-link"
                            >
                                repository
                            </a>{' '}
                            for more details.
                        </p>
                    </li>
                </ul>
                <h4>Week 2</h4>
                <ul>
                    <li>
                        <p>Add google analytics.</p>
                    </li>
                    <li>
                        <p>Roadmap / timeline page.</p>
                    </li>
                    <li>
                        <p>
                            Improve net code to manage better the latency and
                            player to player collision. Move from 60Hz to 120Hz
                            for the physic simulation.
                        </p>
                    </li>
                    <li>
                        <p>Manage disconnect event while in game.</p>
                    </li>
                    <li>
                        <p>
                            Start posting consistently on twitter about the
                            project.
                        </p>
                    </li>
                </ul>
                <h4 id="january-week-3">
                    <a
                        href="https://github.com/benjaminbours/Composite/pull/64"
                        target="_blank"
                        className="inline-link"
                    >
                        Week 3
                    </a>
                </h4>
                <ul>
                    <li>
                        <p>
                            Update menu home scene accordingly with the feature
                            invite a friend.
                        </p>
                    </li>
                    <li>
                        <p>
                            Remove a lot of code dedicated to the drawing of
                            text with the{' '}
                            <a
                                href="https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API"
                                target="_blank"
                                className="inline-link"
                            >
                                canvas API
                            </a>{' '}
                            to benefit for the{' '}
                            <a
                                href="https://caniuse.com/?search=mix-blend-mode"
                                target="_blank"
                                className="inline-link"
                            >
                                now supported enough
                            </a>{' '}
                            CSS property{' '}
                            <a
                                href="https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode"
                                target="_blank"
                                className="inline-link"
                            >
                                mix-blend-mode
                            </a>
                            . Thank you to{' '}
                            <a
                                href="https://buttermax.net/"
                                target="_blank"
                                className="inline-link"
                            >
                                this website
                            </a>{' '}
                            for the inspiration.
                        </p>
                    </li>
                    <li>
                        <p>
                            Tremendous refactor of the "MainApp" orchestration
                            in order to welcome more easily the invite a friend
                            flow, but also to improve the separation of concerns
                            of the menu.
                        </p>
                    </li>
                    <li>
                        <p>Add menu scene invite a friend and team lobby.</p>
                    </li>
                    <li>
                        <p>Add missing router management.</p>
                    </li>
                    <li>
                        <p>Add page 404.</p>
                    </li>
                </ul>
                <h4 id="january-week-4">
                    <a
                        href="https://github.com/benjaminbours/Composite/pull/64"
                        target="_blank"
                        className="inline-link"
                    >
                        Week 4
                    </a>
                </h4>
                <ul>
                    <li>
                        <p>
                            Use team lobby at the end of any game, even ones
                            from the matchmaking queue.
                        </p>
                    </li>
                    <li>
                        <p>Add https support.</p>
                    </li>
                    <li>
                        <p>
                            Add{' '}
                            <a
                                href="https://dev.compositethegame.com"
                                target="_blank"
                                className="inline-link"
                            >
                                dev environment
                            </a>{' '}
                            in order to deploy and test safely updates while
                            keeping a stable version to demonstrate any time.
                            Update deployments procedure accordingly.
                        </p>
                    </li>
                    <li>
                        Deploy all changes from week 3 and 4 on dev environment
                        for testing.
                    </li>
                </ul>
            </>
        ),
    },
];

const futureEvents: TimelineEvent[] = [
    {
        date: '2024 - Quarter 1',
        description: (
            <>
                <h3>Objectives</h3>
                <ul>
                    <li>
                        <p>
                            {`Add menu mode, invite a friend, so you don't have to
                            match with random person, you can just send a link
                            to your friend, and play the game with him.`}
                        </p>
                    </li>
                    <li>
                        <p>Add certificate for https support.</p>
                    </li>
                    <li>
                        <p>
                            Collision between players. Should they just be
                            ejected into opposite directions or can you kind of
                            push your team mate in a direction? To be
                            investigated.
                        </p>
                    </li>
                    <li>
                        <p>
                            Improve level visual design with more variety of
                            geometry.
                        </p>
                    </li>
                    <li>
                        <p>
                            {` Level 3, "The High Spheres", combining the mechanics
                            of the two first levels, in a more complex way.`}
                        </p>
                    </li>
                    <li>
                        <p>
                            Add black hole element, that will impact the gravity
                            of players around, creating new interactions /
                            paths.
                        </p>
                    </li>
                    <li>
                        <p>
                            Add unique ability for each player. Light could dash
                            quickly in a direction for example, while shadow
                            could go through wall for a small duration. To
                            investigate.
                        </p>
                    </li>
                    <li>
                        <p>
                            Add level maker mode, to give the possibility to the
                            community to create their own levels. This will lead
                            me to clean up a lot the level creation code and
                            make it very rigorous for any body to create super
                            easily a new level.
                        </p>
                    </li>
                    <li>
                        <p>
                            Add some kind of communication between the players
                            during the game, for example a system similar as the
                            emotes on top of your player in LOL.
                        </p>
                    </li>
                    <li>
                        <p>
                            Investigate and decide best hosting / setup option
                            for the production environment.
                        </p>
                    </li>
                </ul>
            </>
        ),
    },
    {
        date: '2024 - Quarter 2',
        description: (
            <>
                <h3>Objectives</h3>
                <ul>
                    <li>
                        <p>Many more levels</p>
                    </li>
                    <li>
                        <p>Many more languages / translations</p>
                    </li>
                    <li>
                        <p>Rethink the look and feels of levels</p>
                    </li>
                    <li>
                        <p>
                            {` Make the game "speed run" friendly, display an
                            accurate timer for each game session. Should the
                            leader board be stored in blockchain? Seems like a
                            good fits to me, in order to be as transparent as
                            possible.`}
                        </p>
                    </li>
                    <li>
                        <p>
                            Indicate total number of player playing the game on
                            the home page (
                            <a
                                href="https://curvefever.pro/"
                                target="_blank"
                                className="inline-link"
                            >
                                curve fever style
                            </a>
                            ).
                        </p>
                    </li>
                    <li>
                        <p>
                            Add incentive system to reward users for playing the
                            game. I am very interested into Dapp, and connect
                            the project to a blockchain, with smart contract
                            rewarding the users directly when they play the game
                            would be awesome for me.
                        </p>
                        <p>
                            {` We could also imagine events, where NFTs would be
                            hidden in some levels of the game, and the first
                            player to find it wins it. I have no idea yet about
                            any kind of valorization in terms of tokens or NFTs,
                            it's just the incentive and reward ideas that I love
                            very much, and blockchain seems a good fit for it.`}
                        </p>
                    </li>
                    <li>
                        <p>
                            {`We could also imagine events, where NFTs would be
                            hidden in some levels of the game, and the first
                            player to find it wins it. I have no idea yet about
                            any kind of valorization in terms of tokens or NFTs,
                            it's just the incentive and reward ideas that I love
                            very much, and blockchain seems a good fit for it.`}
                        </p>
                    </li>
                </ul>
            </>
        ),
    },
];

export default async function Roadmap() {
    return (
        <main className="roadmap-page">
            <div className="main-container">
                <h1>Composite - Timeline</h1>
                <ul className="timeline">
                    {pastEvents.map((event, index) => (
                        <li key={index} className="timeline-event">
                            <h2 className="timeline-event-date">
                                {event.date}
                            </h2>
                            <div className="timeline-event-description">
                                {event.description}
                            </div>
                        </li>
                    ))}
                </ul>
                <h2 id="roadmap">Roadmap</h2>
                <ul className="timeline">
                    {futureEvents.map((event, index) => (
                        <li key={index} className="timeline-event">
                            <div className="timeline-event-date">
                                {event.date}
                            </div>
                            <div className="timeline-event-description">
                                {event.description}
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="button-container">
                    <Link href="/" className="buttonCircle" id="buttonPlay">
                        Play
                    </Link>
                </div>
            </div>
        </main>
    );
}
