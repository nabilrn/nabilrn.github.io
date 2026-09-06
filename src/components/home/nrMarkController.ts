export {};

type SpotifyPlaybackEvent = {
    data: {
        playingURI?: string;
        isPaused?: boolean;
        isBuffering?: boolean;
        duration?: number;
        position?: number;
    };
};

type SpotifyEmbedController = {
    play: () => void;
    pause: () => void;
    resume: () => void;
    togglePlay: () => void;
    addListener: (
        event: 'ready' | 'playback_started' | 'playback_update',
        callback: (event: SpotifyPlaybackEvent) => void,
    ) => void;
};

type SpotifyIframeApi = {
    createController: (
        element: HTMLElement,
        options: {
            uri?: string;
            url?: string;
            width?: number | string;
            height?: number | string;
        },
        callback: (controller: SpotifyEmbedController) => void,
    ) => void;
};

declare global {
    interface Window {
        onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
        __nrSpotifyApiPromise?: Promise<SpotifyIframeApi>;
    }
}

const SPOTIFY_API_SRC = 'https://open.spotify.com/embed/iframe-api/v1';

const numberFromDataset = (root: HTMLElement, key: string, fallback: number) => {
    const value = Number(root.dataset[key]);
    return Number.isFinite(value) ? value : fallback;
};

const loadSpotifyApi = (): Promise<SpotifyIframeApi> => {
    if (window.__nrSpotifyApiPromise) return window.__nrSpotifyApiPromise;

    window.__nrSpotifyApiPromise = new Promise<SpotifyIframeApi>((resolve, reject) => {
        const previousReady = window.onSpotifyIframeApiReady;
        const timeout = window.setTimeout(() => reject(new Error('Spotify IFrame API timed out')), 10000);

        window.onSpotifyIframeApiReady = (api) => {
            window.clearTimeout(timeout);
            if (typeof previousReady === 'function') previousReady(api);
            resolve(api);
        };

        if (!document.querySelector(`script[src="${SPOTIFY_API_SRC}"]`)) {
            const script = document.createElement('script');
            script.src = SPOTIFY_API_SRC;
            script.async = true;
            script.onerror = () => {
                window.clearTimeout(timeout);
                reject(new Error('Failed to load Spotify IFrame API'));
            };
            document.body.appendChild(script);
        }
    });

    return window.__nrSpotifyApiPromise;
};

const initNrMark = (root: HTMLElement) => {
    if (root.dataset.nrReady === 'true') return;
    root.dataset.nrReady = 'true';

    const button = root.querySelector<HTMLButtonElement>('[data-nr-button]');
    const gradient = root.querySelector<SVGRadialGradientElement>('[data-nr-gradient]');
    const top = root.querySelector<SVGGElement>('[data-nr-top]');
    const figLabel = root.querySelector<SVGTextElement>('[data-nr-fig-label]');
    const playerMount = root.querySelector<HTMLElement>('[data-nr-player]');
    const walls = Array.from(root.querySelectorAll<SVGPathElement>('[data-nr-wall]'));
    const connectors = Array.from(root.querySelectorAll<SVGPathElement>('[data-nr-connector]'));

    if (!button || !gradient || !top || !figLabel || !playerMount) return;

    const depth = numberFromDataset(root, 'depth', 28);
    const latchDistance = numberFromDataset(root, 'latchDistance', 8);
    const pressDistance = numberFromDataset(root, 'pressDistance', 14);
    const viewBox = {
        x: numberFromDataset(root, 'viewboxX', 125),
        y: numberFromDataset(root, 'viewboxY', 30),
        width: numberFromDataset(root, 'viewboxWidth', 525),
        height: numberFromDataset(root, 'viewboxHeight', 315),
    };

    const trackUri = root.dataset.trackUri ?? '';
    const trackUrl = root.dataset.trackUrl ?? '';
    const trackTitle = root.dataset.trackTitle ?? 'favorite song';
    const trackArtist = root.dataset.trackArtist ?? '';

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let targetX = viewBox.x + viewBox.width / 2;
    let targetY = viewBox.y + viewBox.height / 2;
    let currentX = targetX;
    let currentY = targetY;
    let gradientRaf = 0;

    let shift = 0;
    let shiftTarget = 0;
    let velocity = 0;
    let shiftRaf = 0;
    let lastShiftTime = 0;

    let player: SpotifyEmbedController | null = null;
    let playerReady = false;
    let playerPromise: Promise<SpotifyEmbedController | null> | null = null;
    let wantsPlay = false;
    let isPlaying = false;
    let pointerHeld = false;

    const fixed = (value: number) => value.toFixed(3);

    const applyShift = (nextShift: number) => {
        top.style.transform = `translateY(${nextShift.toFixed(3)}px)`;

        walls.forEach((wall) => {
            const ax = Number(wall.dataset.ax);
            const ay = Number(wall.dataset.ay);
            const bx = Number(wall.dataset.bx);
            const by = Number(wall.dataset.by);
            if (![ax, ay, bx, by].every(Number.isFinite)) return;

            wall.setAttribute(
                'd',
                `M ${fixed(ax)} ${fixed(ay + nextShift)} ` +
                `L ${fixed(bx)} ${fixed(by + nextShift)} ` +
                `L ${fixed(bx)} ${fixed(by + depth)} ` +
                `L ${fixed(ax)} ${fixed(ay + depth)} Z`,
            );
        });

        connectors.forEach((connector) => {
            const x = Number(connector.dataset.x);
            const y = Number(connector.dataset.y);
            if (!Number.isFinite(x) || !Number.isFinite(y)) return;
            connector.setAttribute(
                'd',
                `M ${fixed(x)} ${fixed(y + nextShift)} L ${fixed(x)} ${fixed(y + depth)}`,
            );
        });
    };

    const settleShift = () => {
        shift = shiftTarget;
        velocity = 0;
        applyShift(shift);
        shiftRaf = 0;
        lastShiftTime = 0;
    };

    const springShift = (time: number) => {
        if (reducedMotion.matches) {
            settleShift();
            return;
        }

        if (!lastShiftTime) lastShiftTime = time;
        const dt = Math.min((time - lastShiftTime) / 1000, 0.032);
        lastShiftTime = time;

        const mass = 0.5;
        const damping = 18;
        const stiffness = 200;
        const acceleration = (-stiffness * (shift - shiftTarget) - damping * velocity) / mass;

        velocity += acceleration * dt;
        shift += velocity * dt;
        applyShift(shift);

        if (Math.abs(shiftTarget - shift) < 0.015 && Math.abs(velocity) < 0.02) {
            settleShift();
            return;
        }

        shiftRaf = requestAnimationFrame(springShift);
    };

    const setShiftTarget = (nextTarget: number) => {
        shiftTarget = nextTarget;
        if (reducedMotion.matches) {
            settleShift();
            return;
        }
        if (!shiftRaf) shiftRaf = requestAnimationFrame(springShift);
    };

    const restingShift = () => (isPlaying ? latchDistance : 0);

    const updateMusicState = (state: 'idle' | 'loading' | 'playing' | 'error') => {
        root.dataset.musicState = state;
        const playing = state === 'playing';
        button.setAttribute('aria-pressed', playing ? 'true' : 'false');
        button.setAttribute(
            'aria-label',
            playing
                ? `Pause ${trackTitle}${trackArtist ? ` by ${trackArtist}` : ''}`
                : `Play ${trackTitle}${trackArtist ? ` by ${trackArtist}` : ''}`,
        );

        figLabel.textContent =
            state === 'playing'
                ? 'FIG. 01 / NR SYSTEM · MUSIC ON'
                : state === 'loading'
                    ? 'FIG. 01 / NR SYSTEM · LOADING'
                    : 'FIG. 01 / NR SYSTEM · MUSIC OFF';
    };

    const paintGradient = () => {
        currentX += (targetX - currentX) * 0.18;
        currentY += (targetY - currentY) * 0.18;
        gradient.setAttribute('cx', currentX.toFixed(2));
        gradient.setAttribute('cy', currentY.toFixed(2));

        if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
            gradientRaf = requestAnimationFrame(paintGradient);
        } else {
            gradientRaf = 0;
        }
    };

    const onPointerMove = (event: PointerEvent) => {
        if (!finePointer.matches || reducedMotion.matches) return;

        const u = Math.min(1, Math.max(0, event.clientX / window.innerWidth));
        const v = Math.min(1, Math.max(0, event.clientY / window.innerHeight));
        targetX = viewBox.x + u * viewBox.width;
        targetY = viewBox.y + v * viewBox.height;

        if (!gradientRaf) gradientRaf = requestAnimationFrame(paintGradient);
    };

    const applyPlayingState = (playing: boolean) => {
        isPlaying = playing;
        wantsPlay = playing;
        updateMusicState(playing ? 'playing' : 'idle');
        if (!pointerHeld) setShiftTarget(playing ? latchDistance : 0);
    };

    const ensurePlayer = () => {
        if (playerPromise) return playerPromise;

        updateMusicState('loading');

        playerPromise = loadSpotifyApi()
            .then((api) => new Promise<SpotifyEmbedController>((resolve) => {
                api.createController(
                    playerMount,
                    {
                        width: 220,
                        height: 152,
                        uri: trackUri || undefined,
                        url: trackUri ? undefined : trackUrl || undefined,
                    },
                    (controller) => {
                        player = controller;
                        root.dataset.playerLoaded = 'true';

                        controller.addListener('ready', () => {
                            playerReady = true;
                            resolve(controller);
                            updateMusicState(isPlaying ? 'playing' : 'idle');
                            if (wantsPlay && !isPlaying) controller.resume();
                        });

                        controller.addListener('playback_started', () => {
                            applyPlayingState(true);
                        });

                        controller.addListener('playback_update', (event) => {
                            const paused = event.data?.isPaused;
                            if (paused === false) {
                                applyPlayingState(true);
                                return;
                            }

                            // Spotify can emit an initial paused snapshot while a requested
                            // first play is still starting. Do not cancel that user intent.
                            if (paused === true && (isPlaying || !wantsPlay)) {
                                applyPlayingState(false);
                            }
                        });
                    },
                );
            }))
            .catch(() => {
                isPlaying = false;
                wantsPlay = false;
                updateMusicState('error');
                if (!pointerHeld) setShiftTarget(0);
                return null;
            });

        return playerPromise;
    };

    const togglePlayback = async () => {
        if (isPlaying && player && playerReady) {
            wantsPlay = false;
            player.pause();
            return;
        }

        wantsPlay = true;
        const readyPlayer = await ensurePlayer();
        if (readyPlayer && playerReady && wantsPlay && !isPlaying) {
            readyPlayer.resume();
        }
    };

    const press = () => {
        pointerHeld = true;
        setShiftTarget(pressDistance);
    };

    const release = () => {
        if (!pointerHeld) return;
        pointerHeld = false;
        setShiftTarget(restingShift());
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.repeat) return;
        if (event.key === 'Enter' || event.key === ' ') press();
    };

    const onKeyUp = (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') release();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);
    button.addEventListener('blur', release);
    button.addEventListener('keydown', onKeyDown);
    button.addEventListener('keyup', onKeyUp);
    button.addEventListener('click', () => {
        void togglePlayback();
    });

    applyShift(0);
    updateMusicState('idle');
    void ensurePlayer();
};

document.querySelectorAll<HTMLElement>('[data-nr-stage]').forEach(initNrMark);
