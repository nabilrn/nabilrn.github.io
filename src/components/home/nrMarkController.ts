export {};

const numberFromDataset = (root: HTMLElement, key: string, fallback: number) => {
	const value = Number(root.dataset[key]);
	return Number.isFinite(value) ? value : fallback;
};

const initNrMark = (root: HTMLElement): (() => void) | undefined => {
	if (root.dataset.nrReady === 'true') return;
	root.dataset.nrReady = 'true';

	const button = root.querySelector<HTMLButtonElement>('[data-nr-button]');
	const gradient = root.querySelector<SVGRadialGradientElement>('[data-nr-gradient]');
	const top = root.querySelector<SVGGElement>('[data-nr-top]');
	const walls = Array.from(root.querySelectorAll<SVGPathElement>('[data-nr-wall]'));
	const connectors = Array.from(root.querySelectorAll<SVGPathElement>('[data-nr-connector]'));
	const bottomStroke = root.querySelector<SVGPathElement>('#nr-bottom-stroke');

	if (!button || !gradient || !top || !bottomStroke) {
		delete root.dataset.nrReady;
		return;
	}

	const controller = new AbortController();
	const { signal } = controller;
	const depth = numberFromDataset(root, 'depth', 28);
	const latchDistance = numberFromDataset(root, 'latchDistance', 8);
	const pressDistance = numberFromDataset(root, 'pressDistance', 14);
	const viewBox = {
		x: numberFromDataset(root, 'viewboxX', 125),
		y: numberFromDataset(root, 'viewboxY', 30),
		width: numberFromDataset(root, 'viewboxWidth', 525),
		height: numberFromDataset(root, 'viewboxHeight', 315),
	};

	const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	let targetX = viewBox.x + viewBox.width / 2;
	let targetY = viewBox.y + viewBox.height / 2;
	let currentX = targetX;
	let currentY = targetY;
	let gradientRaf = 0;
	let pointerHeld = false;
	let shift = 0;
	let shiftTarget = 0;
	let velocity = 0;
	let shiftRaf = 0;
	let lastShiftTime = 0;

	const fixed = (value: number) => value.toFixed(3);
	const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
	const bgmPlaying = () => document.documentElement.dataset.bgmState === 'playing';

	type BottomPoint = { x: number; y: number };
	type BottomLine = { a: BottomPoint; b: BottomPoint };
	const bottomNumbers = (bottomStroke.getAttribute('d') ?? '').match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
	const bottomLines: BottomLine[] = [];
	for (let index = 0; index + 3 < bottomNumbers.length; index += 4) {
		bottomLines.push({ a: { x: bottomNumbers[index], y: bottomNumbers[index + 1] }, b: { x: bottomNumbers[index + 2], y: bottomNumbers[index + 3] } });
	}

	const edge2InitialT = 0.6647897556988466;
	const edge6InitialT = 0.5549904640813739;
	const edge2TPerShift = -0.02374249127495879;
	const edge6TPerShift = 0.01589319771137951;
	const edge2Line = bottomLines[0];
	const edge6Line = bottomLines[2];
	const edge2FullStart = edge2Line ? {
		x: (edge2Line.a.x - edge2InitialT * edge2Line.b.x) / (1 - edge2InitialT),
		y: (edge2Line.a.y - edge2InitialT * edge2Line.b.y) / (1 - edge2InitialT),
	} : null;
	const edge6FullEnd = edge6Line ? {
		x: (edge6Line.b.x - (1 - edge6InitialT) * edge6Line.a.x) / edge6InitialT,
		y: (edge6Line.b.y - (1 - edge6InitialT) * edge6Line.a.y) / edge6InitialT,
	} : null;

	const mixPoint = (a: BottomPoint, b: BottomPoint, t: number): BottomPoint => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

	const updateBottomStroke = (nextShift: number) => {
		if (!edge2Line || !edge6Line || !edge2FullStart || !edge6FullEnd) return;
		const dynamicLines = bottomLines.map((line) => ({ a: { ...line.a }, b: { ...line.b } }));
		const edge2T = clamp01(edge2InitialT + edge2TPerShift * nextShift);
		const edge6T = clamp01(edge6InitialT + edge6TPerShift * nextShift);
		dynamicLines[0].a = mixPoint(edge2FullStart, edge2Line.b, edge2T);
		dynamicLines[0].b = { ...edge2Line.b };
		dynamicLines[2].a = { ...edge6Line.a };
		dynamicLines[2].b = mixPoint(edge6Line.a, edge6FullEnd, edge6T);
		bottomStroke.setAttribute('d', dynamicLines.map((line) => `M ${fixed(line.a.x)} ${fixed(line.a.y)} L ${fixed(line.b.x)} ${fixed(line.b.y)}`).join(' '));
	};

	const applyShift = (nextShift: number) => {
		top.style.transform = `translateY(${nextShift.toFixed(3)}px)`;
		walls.forEach((wall) => {
			const ax = Number(wall.dataset.ax);
			const ay = Number(wall.dataset.ay);
			const bx = Number(wall.dataset.bx);
			const by = Number(wall.dataset.by);
			if (![ax, ay, bx, by].every(Number.isFinite)) return;
			wall.setAttribute('d', `M ${fixed(ax)} ${fixed(ay + nextShift)} L ${fixed(bx)} ${fixed(by + nextShift)} L ${fixed(bx)} ${fixed(by + depth)} L ${fixed(ax)} ${fixed(ay + depth)} Z`);
		});
		connectors.forEach((connector) => {
			const x = Number(connector.dataset.x);
			const y = Number(connector.dataset.y);
			if (!Number.isFinite(x) || !Number.isFinite(y)) return;
			connector.setAttribute('d', `M ${fixed(x)} ${fixed(y + nextShift)} L ${fixed(x)} ${fixed(y + depth)}`);
		});
		updateBottomStroke(nextShift);
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

	const restingShift = () => (bgmPlaying() ? latchDistance : 0);

	const paintGradient = () => {
		currentX += (targetX - currentX) * 0.18;
		currentY += (targetY - currentY) * 0.18;
		gradient.setAttribute('cx', currentX.toFixed(2));
		gradient.setAttribute('cy', currentY.toFixed(2));
		if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) gradientRaf = requestAnimationFrame(paintGradient);
		else gradientRaf = 0;
	};

	const onPointerMove = (event: PointerEvent) => {
		if (!finePointer.matches || reducedMotion.matches) return;
		const u = Math.min(1, Math.max(0, event.clientX / window.innerWidth));
		const v = Math.min(1, Math.max(0, event.clientY / window.innerHeight));
		targetX = viewBox.x + u * viewBox.width;
		targetY = viewBox.y + v * viewBox.height;
		if (!gradientRaf) gradientRaf = requestAnimationFrame(paintGradient);
	};

	const press = () => {
		if (pointerHeld) return;
		pointerHeld = true;
		document.dispatchEvent(new CustomEvent('portfolio:bgm-tick'));
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
	const onBgmState = () => {
		if (!pointerHeld) setShiftTarget(restingShift());
	};

	window.addEventListener('pointermove', onPointerMove, { passive: true, signal });
	button.addEventListener('pointerdown', press, { signal });
	button.addEventListener('pointerup', release, { signal });
	button.addEventListener('pointercancel', release, { signal });
	button.addEventListener('pointerleave', release, { signal });
	button.addEventListener('blur', release, { signal });
	button.addEventListener('keydown', onKeyDown, { signal });
	button.addEventListener('keyup', onKeyUp, { signal });
	document.addEventListener('portfolio:bgm-state', onBgmState, { signal });

	shift = restingShift();
	shiftTarget = shift;
	applyShift(shift);

	return () => {
		controller.abort();
		if (gradientRaf) cancelAnimationFrame(gradientRaf);
		if (shiftRaf) cancelAnimationFrame(shiftRaf);
		delete root.dataset.nrReady;
	};
};

let nrMarkCleanups: Array<() => void> = [];
const cleanupNrMarks = () => {
	nrMarkCleanups.forEach((cleanup) => cleanup());
	nrMarkCleanups = [];
};
const initNrMarks = () => {
	cleanupNrMarks();
	document.querySelectorAll<HTMLElement>('[data-nr-stage]').forEach((root) => {
		const cleanup = initNrMark(root);
		if (cleanup) nrMarkCleanups.push(cleanup);
	});
};

document.addEventListener('astro:page-load', initNrMarks);
document.addEventListener('astro:before-swap', cleanupNrMarks);
