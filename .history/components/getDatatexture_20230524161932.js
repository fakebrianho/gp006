import * as THREE from 'three'
export default function getDataTexture(size) {
	const data = new Float32Array(size * size * 4)
	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			const index = i * size + j
			//Generate points on a sphere
			let theta = Math.random() * Math.PI * 2
			let phi = Math.acos(Math.random() * 2 - 1)
            let x =  
            let y 
            let z 
		}
	}
	return null
}
