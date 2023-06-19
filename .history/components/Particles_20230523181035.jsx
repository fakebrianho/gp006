import { useMemo } from 'react'
import './RenderMaterial'

const particles = useMemo(() => {
	return null
}, [null, undefined])

export default function Particles() {
	return (
		<points>
			<sphereBufferGeometry attach='geometry' args={[3.5, 32, 32]} />
			{/* <meshStandardMaterial attach='material' color='hotpink' /> */}
			<renderMaterial />
		</points>
	)
}