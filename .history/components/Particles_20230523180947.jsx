import { useMemo } from 'react'
import './RenderMaterial'

const particles = useMemo()

export default function Particles() {
	return (
		<points>
			<sphereBufferGeometry attach='geometry' args={[3.5, 32, 32]} />
			{/* <meshStandardMaterial attach='material' color='hotpink' /> */}
			<renderMaterial />
		</points>
	)
}
