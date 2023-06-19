export default function Particles() {
	return (
		<mesh>
			<sphereBufferGeometry attach='geometry' args={[3.5, 32, 32]} />
			<meshStandardMaterial attach='material' color='hotpink' />
		</mesh>
	)
}
