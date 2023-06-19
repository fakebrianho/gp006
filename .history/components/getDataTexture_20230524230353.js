import * as THREE from 'three'
export default function getDataTexture(size) {
	const data = new Float32Array(size * size * 4)
	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			const index = i * size + j
			//Generate points on a sphere
			let theta = Math.random() * Math.PI * 2
			let phi = Math.acos(Math.random() * 2 - 1)
			let x = Math.sin(phi) * Math.cos(theta)
			let y = Math.sin(phi) * Math.sin(theta)
			let z = Math.cos(phi)

			data[4 * index] = 10 * (i / size - 0.5)
			data[4 * index + 1] = 10 * (j / size - 0.5)
			data[4 * index + 2] = 0
			data[4 * index + 3] = 0
		}
	}
	let dataTexture = new THREE.DataTexture(
		data,
		size,
		size,
		THREE.RGBAFormat,
		THREE.FloatType
	)
	dataTexture.needsUpdate = true
	return dataTexture
}
