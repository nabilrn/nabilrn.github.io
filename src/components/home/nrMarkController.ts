export {};

type YouTubePlayer = {
    playVideo: () => void;
    pauseVideo: () => void;
};

type YouTubePlayerEvent = {
    data: number;
};

type YouTubeApi = {
    Player: new (
        element: HTMLElement,
        options: {
            width: number;
            height: number;
            videoId: string;
            playerVars: Record<string, number>;
            events: {
                onReady: () => void;
                onStateChange: (event: YouTubePlayerEvent) => void;
                onError: () => void;
                onAutoplayBlocked?: () => void;
            };
        },
    ) => YouTubePlayer;
    PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
    };
};

declare global {
    interface Window {
        YT?: YouTubeApi;
        onYouTubeIframeAPIReady?: () => void;
        __nrYouTubeApiPromise?: Promise<YouTubeApi>;
    }
}

const numberFromDataset = (root: HTMLElement, key: string, fallback: number) => {
    const value = Number(root.dataset[key]);
    return Number.isFinite(value) ? value : fallback;
};

const loadYouTubeApi = (): Promise<YouTubeApi> => {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (window.__nrYouTubeApiPromise) return window.__nrYouTubeApiPromise;

    window.__nrYouTubeApiPromise = new Promise<YouTubeApi>((resolve, reject) => {
        const previousReady = window.onYouTubeIframeAPIReady;
        const timeout = window.setTimeout(() => reject(new Error('YouTube IFrame API timed out')), 10000);

        window.onYouTubeIframeAPIReady = () => {
            window.clearTimeout(timeout);
            if (typeof previousReady === 'function') previousReady();
            if (window.YT?.Player) resolve(window.YT);
            else reject(new Error('YouTube IFrame API unavailable'));
        };

        if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            script.async = true;
            script.onerror = () => {
                window.clearTimeout(timeout);
                reject(new Error('Failed to load YouTube IFrame API'));
            };
            document.head.appendChild(script);
        }
    });

    return window.__nrYouTubeApiPromise;
};

const initNrMark = (root: HTMLElement) => {
    if (root.dataset.nrReady === 'true') return;
    root.dataset.nrReady = 'true';

    const button = root.querySelector<HTMLButtonElement>('[data-nr-button]');
    const svg = root.querySelector<SVGSVGElement>('[data-nr-svg]');
    const gradient = root.querySelector<SVGRadialGradientElement>('[data-nr-gradient]');
    const top = root.querySelector<SVGGElement>('[data-nr-top]');
    const figLabel = root.querySelector<SVGTextElement>('[data-nr-fig-label]');
    const playerMount = root.querySelector<HTMLElement>('[data-nr-player]');
    const playerStatus = root.querySelector<HTMLElement>('[data-nr-player-status]');
    const walls = Array.from(root.querySelectorAll<SVGPathElement>('[data-nr-wall]'));
    const connectors = Array.from(root.querySelectorAll<SVGPathElement>('[data-nr-connector]'));

    if (!button || !svg || !gradient || !top || !figLabel || !playerMount) return;

    const depth = numberFromDataset(root, 'depth', 28);
    const latchDistance = numberFromDataset(root, 'latchDistance', 8);
    const pressDistance = numberFromDataset(root, 'pressDistance', 14);
    const viewBox = {
        x: numberFromDataset(root, 'viewboxX', 125),
        y: numberFromDataset(root, 'viewboxY', 30),
        width: numberFromDataset(root, 'viewboxWidth', 525),
        height: numberFromDataset(root, 'viewboxHeight', 315),
    };

    const videoId = root.dataset.videoId ?? '';
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

    let player: YouTubePlayer | null = null;
    let playerReady = false;
    let playerPromise: Promise<YouTubePlayer | null> | null = null;
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

        if (playerStatus) {
            playerStatus.textContent =
                state === 'playing' ? 'now playing' :
                state === 'loading' ? 'loading track' :
                state === 'error' ? 'playback unavailable' :
                'favorite track';
        }
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

    const ensurePlayer = () => {
        if (playerPromise) return playerPromise;

        updateMusicState('loading');
        root.dataset.playerLoaded = 'true';

        playerPromise = loadYouTubeApi()
            .then((YT) => new Promise<YouTubePlayer>((resolve, reject) => {
                player = new YT.Player(playerMount, {
                    width: 200,
                    height: 200,
                    videoId,
                    playerVars: {
                        controls: 1,
                        playsinline: 1,
                        rel: 0,
                    },
                    events: {
                        onReady: () => {
                            playerReady = true;
                            resolve(player as YouTubePlayer);
                            if (wantsPlay) player?.playVideo();
                        },
                        onStateChange: (event) => {
                            if (event.data === YT.PlayerState.PLAYING) {
                                isPlaying = true;
                                wantsPlay = true;
                                updateMusicState('playing');
                                if (!pointerHeld) setShiftTarget(latchDistance);
                                return;
                            }

                            if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                                isPlaying = false;
                                wantsPlay = false;
                                updateMusicState('idle');
                                if (!pointerHeld) setShiftTarget(0);
                            }
                        },
                        onError: () => {
                            isPlaying = false;
                            wantsPlay = false;
                            updateMusicState('error');
                            if (!pointerHeld) setShiftTarget(0);
                            reject(new Error('YouTube playback error'));
                        },
                        onAutoplayBlocked: () => {
                            isPlaying = false;
                            wantsPlay = false;
                            updateMusicState('idle');
                            if (!pointerHeld) setShiftTarget(0);
                        },
                    },
                });
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
            player.pauseVideo();
            return;
        }

        wantsPlay = true;
        const readyPlayer = await ensurePlayer();
        if (readyPlayer && playerReady && wantsPlay && !isPlaying) {
            readyPlayer.playVideo();
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
};

document.querySelectorAll<HTMLElement>('[data-nr-stage]').forEach(initNrMark);
