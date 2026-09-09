export {};

type PortfolioWindow = Window & {
	__portfolioBgmControllerBound?: boolean;
};

type BgmState = 'paused' | 'loading' | 'playing' | 'error';

const portfolioWindow = window as PortfolioWindow;
const BAR_COUNT = 48;
const FALLBACK_DURATION = 196;
const idleLevels = Array.from({ length: BAR_COUNT }, (_, index) => {
	const phase = index / Math.max(1, BAR_COUNT - 1);
	return 0.14 + Math.abs(Math.sin(phase * Math.PI * 5.2)) * 0.16 + Math.abs(Math.sin(phase * Math.PI * 2.1)) * 0.08;
});

let audio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let source: MediaElementAudioSourceNode | null = null;
let analyser: AnalyserNode | null = null;
let frequencyData: Uint8Array<ArrayBuffer> | null = null;
let visualizerRaf = 0;
let state: BgmState = 'paused';
let levels = [...idleLevels];

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const formatTime = (seconds: number) => {
	if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
	const whole = Math.floor(seconds);
	const minutes = Math.floor(whole / 60);
	const remainder = whole % 60;
	return `${minutes.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
};

const getAudio = () => document.querySelector<HTMLAudioElement>('[data-bgm-audio]');

const ensureAudioContext = () => {
	if (!audioContext) audioContext = new AudioContext();
	return audioContext;
};

const setToggleState = (playing: boolean) => {
	document.querySelectorAll<HTMLElement>('[data-bgm-toggle]').forEach((toggle) => {
		toggle.setAttribute('aria-pressed', String(playing));
		const nextLabel = playing ? toggle.dataset.pauseLabel : toggle.dataset.playLabel;
		if (nextLabel) toggle.setAttribute('aria-label', nextLabel);
	});
};

const paintBars = (nextLevels: number[]) => {
	document.querySelectorAll<HTMLElement>('[data-bgm-presenter]').forEach((presenter) => {
		const bars = presenter.querySelectorAll<HTMLElement>('[data-bgm-bar]');
		bars.forEach((bar, index) => {
			bar.style.setProperty('--level', String(nextLevels[index] ?? 0.16));
		});
	});
};

const updateTimeline = () => {
	if (!audio) return;
	const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : FALLBACK_DURATION;
	const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
	const ratio = duration > 0 ? Math.min(1, Math.max(0, current / duration)) : 0;
	const playedBars = ratio <= 0 ? 0 : Math.min(BAR_COUNT, Math.ceil(ratio * BAR_COUNT));

	document.querySelectorAll<HTMLElement>('[data-bgm-presenter]').forEach((presenter) => {
		const time = presenter.querySelector<HTMLElement>('[data-bgm-time]');
		if (time) time.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
		presenter.querySelectorAll<HTMLElement>('[data-bgm-bar]').forEach((bar, index) => {
			bar.toggleAttribute('data-bgm-played', index < playedBars);
		});
	});
};

const emitState = (nextState: BgmState) => {
	state = nextState;
	document.documentElement.dataset.bgmState = nextState;
	const playing = nextState === 'playing';
	setToggleState(playing);
	document.dispatchEvent(new CustomEvent('portfolio:bgm-state', { detail: { state: nextState, playing } }));
};

const stopVisualizer = () => {
	if (visualizerRaf) cancelAnimationFrame(visualizerRaf);
	visualizerRaf = 0;
};

const paintVisualizer = () => {
	if (state !== 'playing' || !analyser || !frequencyData || document.hidden) {
		visualizerRaf = 0;
		return;
	}

	analyser.getByteFrequencyData(frequencyData);
	const data = frequencyData;
	for (let index = 0; index < BAR_COUNT; index += 1) {
		const start = Math.floor(index * data.length / BAR_COUNT);
		const end = Math.max(start + 1, Math.floor((index + 1) * data.length / BAR_COUNT));
		let total = 0;
		for (let sample = start; sample < end && sample < data.length; sample += 1) total += data[sample];
		const raw = total / Math.max(1, end - start) / 255;
		const target = Math.max(0.1, Math.min(1, 0.08 + raw * 1.2));
		const previous = levels[index] ?? 0.16;
		const easing = target > previous ? 0.4 : 0.14;
		levels[index] = previous + (target - previous) * easing;
	}

	paintBars(levels);
	updateTimeline();
	visualizerRaf = requestAnimationFrame(paintVisualizer);
};

const startVisualizer = () => {
	stopVisualizer();
	if (state !== 'playing') return;
	if (reducedMotion.matches) {
		paintBars(Array.from({ length: BAR_COUNT }, () => 0.34));
		return;
	}
	if (!document.hidden) visualizerRaf = requestAnimationFrame(paintVisualizer);
};

const ensureAudioGraph = async () => {
	if (!audio) audio = getAudio();
	if (!audio) throw new Error('BGM audio element unavailable');

	const context = ensureAudioContext();
	if (!source) {
		source = context.createMediaElementSource(audio);
		analyser = context.createAnalyser();
		analyser.fftSize = 128;
		analyser.smoothingTimeConstant = 0.78;
		source.connect(analyser);
		analyser.connect(context.destination);
		frequencyData = new Uint8Array(analyser.frequencyBinCount);
	}
	if (context.state === 'suspended') await context.resume();
};

const playKeyboardTick = () => {
	try {
		const context = ensureAudioContext();
		if (context.state === 'suspended') void context.resume();
		const now = context.currentTime + 0.004;
		const length = Math.max(1, Math.floor(context.sampleRate * 0.018));
		const buffer = context.createBuffer(1, length, context.sampleRate);
		const channel = buffer.getChannelData(0);
		for (let index = 0; index < length; index += 1) {
			const envelope = Math.exp(-index / Math.max(1, length * 0.17));
			channel[index] = (Math.random() * 2 - 1) * envelope;
		}

		const noise = context.createBufferSource();
		noise.buffer = buffer;
		const filter = context.createBiquadFilter();
		filter.type = 'bandpass';
		filter.frequency.setValueAtTime(2050, now);
		filter.Q.setValueAtTime(0.72, now);
		const tickGain = context.createGain();
		tickGain.gain.setValueAtTime(0.0001, now);
		tickGain.gain.exponentialRampToValueAtTime(0.09, now + 0.0012);
		tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.021);
		noise.connect(filter).connect(tickGain).connect(context.destination);
		noise.start(now);
		noise.stop(now + 0.024);

		const body = context.createOscillator();
		const bodyGain = context.createGain();
		body.type = 'triangle';
		body.frequency.setValueAtTime(220, now + 0.001);
		body.frequency.exponentialRampToValueAtTime(128, now + 0.038);
		bodyGain.gain.setValueAtTime(0.0001, now + 0.001);
		bodyGain.gain.exponentialRampToValueAtTime(0.026, now + 0.004);
		bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.044);
		body.connect(bodyGain).connect(context.destination);
		body.start(now + 0.001);
		body.stop(now + 0.046);
	} catch {
		// Decorative feedback must never block NR interaction or playback.
	}
};

const bindAudio = () => {
	const nextAudio = getAudio();
	if (!nextAudio) return;
	if (audio === nextAudio && nextAudio.dataset.bgmBound === 'true') return;
	if (audio && audio !== nextAudio) {
		source = null;
		analyser = null;
		frequencyData = null;
	}
	audio = nextAudio;
	if (audio.dataset.bgmBound === 'true') return;
	audio.dataset.bgmBound = 'true';

	audio.addEventListener('loadedmetadata', updateTimeline);
	audio.addEventListener('durationchange', updateTimeline);
	audio.addEventListener('timeupdate', updateTimeline);
	audio.addEventListener('play', () => {
		emitState('playing');
		startVisualizer();
	});
	audio.addEventListener('pause', () => {
		if (!audio?.ended) {
			emitState('paused');
			stopVisualizer();
			paintBars(idleLevels);
		}
	});
	audio.addEventListener('ended', () => {
		if (!audio) return;
		audio.currentTime = 0;
		emitState('paused');
		stopVisualizer();
		paintBars(idleLevels);
		updateTimeline();
	});
	audio.addEventListener('error', () => {
		emitState('error');
		stopVisualizer();
		paintBars(idleLevels);
	});
};

const syncPresenters = () => {
	bindAudio();
	setToggleState(state === 'playing');
	paintBars(state === 'playing' && reducedMotion.matches
		? Array.from({ length: BAR_COUNT }, () => 0.34)
		: state === 'playing' ? levels : idleLevels);
	updateTimeline();
	if (state === 'playing') startVisualizer();
};

const togglePlayback = async () => {
	bindAudio();
	if (!audio) return;
	if (!audio.paused) {
		audio.pause();
		return;
	}

	emitState('loading');
	try {
		await ensureAudioGraph();
		if (Number.isFinite(audio.duration) && audio.currentTime >= audio.duration - 0.05) audio.currentTime = 0;
		await audio.play();
	} catch {
		emitState('error');
		paintBars(idleLevels);
	}
};

if (!portfolioWindow.__portfolioBgmControllerBound) {
	portfolioWindow.__portfolioBgmControllerBound = true;

	document.addEventListener('click', (event) => {
		const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-bgm-toggle]') : null;
		if (!target) return;
		void togglePlayback();
	});

	document.addEventListener('portfolio:bgm-tick', playKeyboardTick);

	document.addEventListener('astro:page-load', syncPresenters);
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) stopVisualizer();
		else if (state === 'playing') startVisualizer();
	});

	reducedMotion.addEventListener('change', () => {
		if (state === 'playing') startVisualizer();
	});

	const initialAudio = getAudio();
	audio = initialAudio;
	bindAudio();
	emitState(initialAudio?.paused === false ? 'playing' : 'paused');
	syncPresenters();
}
