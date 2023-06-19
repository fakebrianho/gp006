import { useMemo } from 'react'
import './RenderMaterial'
import './SimulationMaterial'
import getDataTexture from './getDatatexture'
import { createPortal, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useFBO } from '@react-three/drei'

export default function Particles() {
	const scene = new THREE.Scene()
	const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1)
	const SIZE = 32
	let target0 = useFBO(SIZE, SIZE, {
		type: THREE.FloatType,
	})
	let target1 = useFBO(SIZE, SIZE, {
		type: THREE.FloatType,
	})
	const simMat = useRef()
	const renderMat = useRef()

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
	useFrame(({ gl }) => {
		gl.setRenderTarget(target0)
		gl.render(scene, camera)
		gl.setRenderTarget(null)
		renderMat.current.uniforms.uPosition.value = target1.texture
		simMat.current.uniforms.uPosition.value = target0.texture

		let temp = target0
		target0 = target1
		target1 = temp
	})
	return (
		<>
			{createPortal(
				<mesh>
					<planeGeometry args={[2, 2]} />
					<simulationMaterial
						ref={simMat}
						uPosition={getDataTexture(SIZE)}
						uVelocity={getDataTexture(SIZE)}
					/>
				</mesh>,
				scene
			)}
			<points>
				<bufferGeometry>
					<bufferAttribute
						attach='attributes-position'
						count={particles.length / 3}
						array={particles}
						itemSize={3}
					/>
					<bufferAttribute
						attach='attributes-ref'
						count={uvRef.length / 3}
						array={uvRef}
						itemSize={2}
					/>
				</bufferGeometry>
				{/* <meshStandardMaterial attach='material' color='hotpink' /> */}
				<renderMaterial ref={renderMat} />
			</points>
		</>
	)
}
