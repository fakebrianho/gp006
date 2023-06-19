export default function Particles() {
	return (
		<mesh>
			<sphereBufferGeometry attach={geometry} args={[0.5 ,32,32]} />
			<meshStandardMaterial attach={material} color='hotpink/>
		</mesh>
	)
}
