import { useMemo } from 'react'
import './RenderMaterial'

export default function Particles() {
	const SIZE = 32
	const particles = useMemo(() => {
		const p = new Float32Array(SIZE * SIZE * 3)
		for (let i = 0; i < SIZE; i++) {
			for (let j = 0; j < SIZE; j++) {
				const k = i * SIZE + j
				p[k * 3 + 0] = (i / SIZE) * 5
				p[k * 3 + 1] = (j / SIZE) * 5
				p[k * 3 + 2] = 0
			}
		}
		return p
	}, [])

	const uvRef = useMemo(() => {
		const p = new Float32Array(SIZE * SIZE * 2)
		for (let i = 0; i < SIZE; i++) {
			for (let j = 0; j < SIZE; j++) {
				const k = i * SIZE + j
				p[k * 2 + 0] = i / (SIZE - 1)
				p[k * 2 + 1] = j / (SIZE - 1)
			}
		}
		return p
	}, [])
	return (
		<points>
			{/* <sphereBufferGeometry attach='geometry' args={[3.5, 32, 32]} /> */}
			<bufferGeometry>
				<bufferAttribute
					attach='attributes-position'
					count={particles.length / 3}
					array={particles}
					itemSize={3}
				/>
				<bufferAttribute
					attach='attributes-ref'
					count={uvRef.length / 2}
					array={uvRef}
					itemSize={2}
				/>
			</bufferGeometry>
			{/* <meshStandardMaterial attach='material' color='hotpink' /> */}
			<renderMaterial />
		</points>
	)
}
