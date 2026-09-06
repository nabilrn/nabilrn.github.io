export {};

const numberFromDataset = (root: HTMLElement, key: string, fallback: number) => {
    const value = Number(root.dataset[key]);
    return Number.isFinite(value) ? value : fallback;
};

const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
    const whole = Math.floor(seconds);
    const minutes = Math.floor(whole / 60);
    const remainder = whole % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
};

const initNrMark = (root: HTMLElement) => {
    if (root.dataset.nrReady === 'true') return;
    root.dataset.nrReady = 'true';

    const button = root.querySelector<HTMLButtonElement>('[data-nr-button]');
    const gradient = root.querySelector<SVGRadialGradientElement>('[data-nr-gradient]');
    const top = root.querySelector<SVGGElement>('[data-nr-top]');
    const figLabel = root.querySelector<SVGTextElement>('[data-nr-fig-label]');
    const audio = root.querySelector<HTMLAudioElement>('[data-nr-audio]');
    const timeLabel = root.querySelector<HTMLElement>('[data-nr-time]');
    const hudState = root.querySelector<HTMLElement>('[data-nr-hud-state]');
    const progress = root.querySelector<HTMLElement>('[data-nr-progress]');
    const bars = Array.from(root.querySelectorAll<HTMLElement>('[data-nr-bar]'));
    const walls = Array.from(root.querySelectorAll<SVGPathElement>('[data-nr-wall]'));
    const connectors = Array.from(root.querySelectorAll<SVGPathElement>('[data-nr-connector]'));

    if (!button || !gradient || !top || !figLabel || !audio) return;

    const depth = numberFromDataset(root, 'depth', 28);
    const latchDistance = numberFromDataset(root, 'latchDistance', 8);
    const pressDistance = numberFromDataset(root, 'pressDistance', 14);
    const viewBox = {
        x: numberFromDataset(root, 'viewboxX', 125),
        y: numberFromDataset(root, 'viewboxY', 30),
        width: numberFromDataset(root, 'viewboxWidth', 525),
        height: numberFromDataset(root, 'viewboxHeight', 315),
    };

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

    let isPlaying = false;
    let pointerHeld = false;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let frequencyData: Uint8Array<ArrayBuffer> | null = null;
    let visualizerRaf = 0;

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
                    : state === 'error'
                        ? 'FIG. 01 / NR SYSTEM · AUDIO ERROR'
                        : 'FIG. 01 / NR SYSTEM · MUSIC OFF';

        if (hudState) {
            hudState.textContent =
                state === 'playing' ? 'playing' :
                state === 'loading' ? 'loading' :
                state === 'error' ? 'unavailable' :
                'paused';
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

    const updateTimeline = () => {
        const duration = Number.isFinite(audio.duration) ? audio.duration : 196;
        const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
        if (timeLabel) timeLabel.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
        if (progress) {
            const ratio = duration > 0 ? Math.min(1, Math.max(0, current / duration)) : 0;
            progress.style.transform = `scaleX(${ratio.toFixed(4)})`;
        }
    };

    const setIdleBars = () => {
        const idleLevels = [0.18, 0.34, 0.24, 0.46, 0.3, 0.58, 0.38, 0.68, 0.44, 0.6, 0.32, 0.5, 0.28, 0.42, 0.22, 0.36, 0.2, 0.3];
        bars.forEach((bar, index) => {
            bar.style.setProperty('--level', String(idleLevels[index % idleLevels.length]));
        });
    };

    const paintVisualizer = () => {
        if (!isPlaying || !analyser || !frequencyData) {
            visualizerRaf = 0;
            return;
        }

        const data = frequencyData;
        analyser.getByteFrequencyData(data);
        bars.forEach((bar, index) => {
            const sourceIndex = Math.min(data.length - 1, Math.floor(index * data.length / bars.length));
            const raw = data[sourceIndex] / 255;
            const level = Math.max(0.16, Math.min(1, 0.12 + raw * 1.15));
            bar.style.setProperty('--level', level.toFixed(3));
        });

        visualizerRaf = requestAnimationFrame(paintVisualizer);
    };

    const ensureAudioGraph = async () => {
        if (!audioContext) {
            audioContext = new AudioContext();
            const source = audioContext.createMediaElementSource(audio);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.82;
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            frequencyData = new Uint8Array(analyser.frequencyBinCount);
        }

        if (audioContext.state === 'suspended') await audioContext.resume();
    };

    const applyPlayingState = (playing: boolean) => {
        isPlaying = playing;
        updateMusicState(playing ? 'playing' : 'idle');
        if (!pointerHeld) setShiftTarget(playing ? latchDistance : 0);

        if (playing) {
            if (!visualizerRaf) visualizerRaf = requestAnimationFrame(paintVisualizer);
        } else {
            if (visualizerRaf) cancelAnimationFrame(visualizerRaf);
            visualizerRaf = 0;
            setIdleBars();
        }
    };

    const togglePlayback = async () => {
        if (!audio.paused) {
            audio.pause();
            return;
        }

        updateMusicState('loading');
        try {
            await ensureAudioGraph();
            if (Number.isFinite(audio.duration) && audio.currentTime >= audio.duration - 0.05) {
                audio.currentTime = 0;
            }
            await audio.play();
        } catch {
            isPlaying = false;
            updateMusicState('error');
            setShiftTarget(0);
            setIdleBars();
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

    audio.addEventListener('loadedmetadata', updateTimeline);
    audio.addEventListener('durationchange', updateTimeline);
    audio.addEventListener('timeupdate', updateTimeline);
    audio.addEventListener('play', () => applyPlayingState(true));
    audio.addEventListener('pause', () => {
        if (!audio.ended) applyPlayingState(false);
    });
    audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        applyPlayingState(false);
        updateTimeline();
    });
    audio.addEventListener('error', () => {
        isPlaying = false;
        updateMusicState('error');
        if (!pointerHeld) setShiftTarget(0);
        setIdleBars();
    });

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

    setIdleBars();
    updateTimeline();
    applyShift(0);
    updateMusicState('idle');
};

document.querySelectorAll<HTMLElement>('[data-nr-stage]').forEach(initNrMark);
