import type { Metadata } from 'next';
import Link from 'next/link';
import { TopBar } from '../../../02_molecules/TopBar';
import { Locale } from '../../../../i18n-config';
import { getDictionary } from '../../../../getDictionary';
import { Footer } from '../../../02_molecules/Footer';

export const metadata: Metadata = {
    title: 'Composite - The game - Timeline',
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
                <ul>
                    <li>
                        <p>
                            Add key bindings panel to support multiple keyboard
                            layouts.
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
                        <p>Invite a friend feature.</p>
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
                        <p>Add https support.</p>
                    </li>
                </ul>
            </>
        ),
    },
    {
        date: '2024 - February',
        description: (
            <>
                <h3>Achievements</h3>
                <ul>
                    <li>
                        <p>
                            Add graphic part of next element type: Black hole.
                        </p>
                    </li>
                    <li>
                        <p>Start implementation of level editor</p>

                        <ul>
                            <li>
                                <p>
                                    Refactor client game code to reach the
                                    modularity required.
                                </p>
                            </li>
                            <li>
                                <p>
                                    Add base features such as add element in the
                                    scene, display the list of element in the
                                    scene.
                                </p>
                            </li>
                            <li>
                                <p>
                                    Add properties panel to edit selected
                                    element.
                                </p>
                            </li>
                            <li>
                                <p>
                                    Different camera management in level editor.
                                </p>
                            </li>
                            <li>
                                <p>
                                    Add action to reset players position, to
                                    toggle between play / edit mode.
                                </p>
                            </li>
                            <li>
                                <p>
                                    Add level table in DB. Add proper API
                                    controller and service associated. Add basic
                                    save feature.
                                </p>
                            </li>
                        </ul>
                    </li>
                </ul>
            </>
        ),
    },
    {
        date: '2024 - March',
        description: (
            <>
                <h3>Achievements</h3>
                <ul>
                    <li>
                        <p>
                            Add translation support for the app.{' '}
                            {`(Even if not used everywhere atm.)`}
                        </p>
                    </li>
                    <li>
                        <p>
                            Add role based authentication front and back. Add
                            restore session. Generate swagger spec based on API
                            codebase.
                        </p>
                    </li>
                    <li>
                        <p>
                            Generate core-api-client package based on swagger spec.
                        </p>
                    </li>
                    <li>
                        <p>
                            Add pages forgot-password, sign-up-email-retry,
                            new-password, login, register, and
                            sign-up-email-activated + backend logic related.
                        </p>
                    </li>
                    <li>
                        <p>
                            Connected level created by author and stored in DB
                            with game launcher (lobby), previously using hard
                            coded level.
                        </p>
                    </li>
                    <li>
                        <p>Add more improvement to level editor editor.</p>
                    </li>
                </ul>
            </>
        ),
    },
    {
        date: '2024 - April',
        description: (
            <>
                <h3>Achievements</h3>
                <ul>
                    <li>
                        <p>Improve data structure in DB.</p>
                    </li>
                    <li>
                        <p>
                            Various improvement and bug fixes to level editor.
                        </p>
                        <ul>
                            <li>
                                <p>Add feature lock element.</p>
                            </li>
                            <li>
                                <p>Add feature undo / redo.</p>
                            </li>
                            <li>
                                <p>
                                    Add feature drag and drop element in scene
                                    list.
                                </p>
                            </li>
                            <li>
                                <p>Add keyboard shortcut</p>
                            </li>
                            <li>
                                <p>Login modal from level editor</p>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <p>Improve design of emails sent by the API.</p>
                    </li>
                    <li>
                        <p>
                            Performance improvements in game and in level
                            editor.
                        </p>
                    </li>
                    <li>
                        <p>Various UX improvements.</p>
                    </li>
                    <li>
                        <p>
                            {/* TODO: add link to Legion the OG user */}
                            Add Precision Level, first level ever made by a user
                            with the level editor. Some say he was known as
                            Legion.
                        </p>
                    </li>
                    <li>
                        <p>
                            Add new level the high sphere: part 1, first level
                            ever made by the author with the level editor.
                        </p>
                    </li>
                </ul>
            </>
        ),
    },
    {
        date: '2024 - May',
        description: (
            <>
                <h3>Achievements</h3>
                <ul>
                    <li>
                        <p>New game launcher / lobby.</p>
                    </li>
                    <li>
                        <p>Add mobile support.</p>
                    </li>
                    <li>
                        <p>Add solo game mode.</p>
                    </li>
                    <li>
                        <p>On going...</p>
                    </li>
                </ul>
            </>
        ),
    },
];

const futureEvents: TimelineEvent[] = [
    {
        date: '2024 - Quarter 2',
        description: (
            <>
                <h3>Objectives</h3>
                <ul>
                    <li>
                        <p>Add landing page explaining the project.</p>
                    </li>
                    <li>
                        <p>{`Add view "Levels created by the community".`}</p>
                    </li>
                    <li>
                        <p>{`Add like feature for level.`}</p>
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
                            Add some kind of level difficulty management with
                            ranking from user and author.
                        </p>
                    </li>
                    <li>
                        <p>
                            Add black hole element physics and connect it with
                            the already made graphic part.
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
        date: '2024 - Quarter 3',
        description: (
            <>
                <h3>Objectives</h3>
                <ul>
                    <li>
                        <p>
                            Add scale management for all elements. So you can
                            have super big door, or you can have small door like
                            Evry lucarne.
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
                            Add some kind of communication between the players
                            during the game, for example a system similar as the
                            emotes on top of your player in LOL.
                        </p>
                    </li>
                    <li>
                        <p>
                            Electron app installable on desktop, with auto
                            update, and register it on steam.
                        </p>
                    </li>
                    <li>
                        <p>Many more levels</p>
                    </li>
                    <li>
                        <p>Many more languages / translations</p>
                    </li>
                    {/* <li>
                        <p>Rethink the look and feels of levels</p>
                    </li> */}
                    <li>
                        <p>
                            Add incentive system to reward users for playing the
                            game. I am very interested into Dapp, and connect
                            the project to Solana, with smart contract rewarding
                            the users directly when they play the game would be
                            awesome for me.
                        </p>
                    </li>
                </ul>
            </>
        ),
    },
];

interface Props {
    params: {
        lng: Locale;
    };
}

export default async function Timeline({ params: { lng } }: Props) {
    const dictionary = await getDictionary(lng);
    return (
        <>
            <TopBar dictionary={dictionary.common} />
            <main className="timeline-page">
                <div className="main-container">
                    <h1 className="title-h2">Timeline</h1>
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
                                <h2 className="timeline-event-date">
                                    {event.date}
                                </h2>
                                <div className="timeline-event-description">
                                    {event.description}
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="button-container">
                        <Link
                            href="/"
                            className="button-play timeline-page__button-play"
                        >
                            Play
                        </Link>
                    </div>
                </div>
            </main>
            <Footer lng={lng} />
        </>
    );
}
