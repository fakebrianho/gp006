import { useMemo } from 'react'
import './RenderMaterial'

export default function Particles() {
	const SIZE = 32
	const particles = useMemo(() => {
		const p = new Float32Array(SIZE * SIZE * 3)

		return null
	}, [null, undefined])
	return (
		<points>
			<sphereBufferGeometry attach='geometry' args={[3.5, 32, 32]} />
			{/* <meshStandardMaterial attach='material' color='hotpink' /> */}
			<renderMaterial />
		</points>
	)
}
