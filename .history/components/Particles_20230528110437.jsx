import { useMemo, useEffect } from 'react'
import './RenderMaterial'
import './SimulationMaterial'
import { getSphereTexture, getVelocityTexture } from './getDataTexture'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useThree, useLoader } from '@react-three/fiber'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer'
import simFragmentPosition from './shaders/simFragmentPosition'
import simFragmentVelocity from './shaders/simFragmentVelocity'
import { patchShaders } from 'gl-noise'
import CustomShaderMaterial from 'three-custom-shader-material'

const shader = {
	vertex: /* glsl */ ` 
	  uniform float uTime;
	  uniform sampler2D uPosition;
	  uniform sampler2D uTexture;
	  uniform sampler2D uVelocity;
	  varying vec2 vRef;
	  varying vec2 vUv;
	  attribute vec2 ref;
  
	  vec3 rotate3D(vec3 v, vec3 vel) {
		vRef = ref;
		// vUv = uv;
		vUv =  position.xy + vec2(0.5);
		vec3 newpos = v;
		vec3 up = vec3(0, 1, 0);
		vec3 axis = normalize(cross(up, vel));
		float angle = acos(dot(up, normalize(vel)));
		newpos = newpos * cos(angle) + cross(axis, newpos) * sin(angle) + axis * dot(axis, newpos) * (1. - cos(angle));
		return newpos;
  }
  
	  vec3 displace(vec3 point, vec3 vel) {
		vec3 pos = texture2D(uPosition,ref).rgb;
		vec3 copypoint = rotate3D(point, vel);
		vec3 instancePosition = (instanceMatrix * vec4(copypoint, 1.)).xyz;
		// vec3 instancePosition = (instanceMatrix * vec4(1.0,1.0,1.0,1.0) ).xyz;
		return instancePosition + pos;
	  }  
  
	  void main() {
		vec3 vel = texture2D(uVelocity,ref).rgb;
		vec3 p = displace(position, vec3(1.0));
		csm_PositionRaw = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.);
		csm_Normal = rotate3D(normal, vel);
	  }
	  `,
	fragment: /* glsl */ `
	uniform sampler2D uTexture;
	varying vec2 vRef;
	varying vec2 vUv;
	  void main() {
		vec4 ttt = texture2D(uTexture, vUv);
		float opacity = mix(0.0, ttt.r, 1.0);
		csm_DiffuseColor = vec4(1.0, 1.0, 1.0, ttt.r);
		// csm_DiffuseColor = ttt;
	  }
	`,
}

export default function Particles() {
	const [map] = useLoader(THREE.TextureLoader, ['/matcap4.png'])
	const iref = useRef()
	const { viewport, gl } = useThree()
	// const SIZE = 256
	const SIZE = 10
	const gpuCompute = new GPUComputationRenderer(SIZE, SIZE, gl)

	/*------------------------------
	Geometry Shit
	------------------------------*/
	const lerp = (a, b, t) => {
		return a * (1 - t) + b * t
	}

	const mapper = useLoader(THREE.TextureLoader, '/1.png')
	const bGeometry = new THREE.BufferGeometry()
	// const bPosition = new Float32Array(SIZE * SIZE * 3)
	// const bUV = new Float32Array(SIZE * SIZE * 2)

	const bPosition = useMemo(() => {
		const positions = new Float32Array(SIZE * SIZE * 3)
		for (let i = 0; i < SIZE; i++) {
			const stride = i * SIZE * j
			positions[3 * stride] = j / SIZE - 0.5
			positions[3 * stride + 1] = i / SIZE - 0.5
			positions[3 * stride + 2] = 0
		}
		return positions
		// for (let i = 0; i < SIZE; i++) {
		// 	for (let j = 0; j < SIZE; j++) {
		// 		const stride = i * SIZE + j
		// 		positions[stride]
		// 	}
		// }
	}, [])

	const particleGeometry = new THREE.BoxGeometry(1, 1, 1)
	const count = SIZE
	const geometry = new THREE.InstancedBufferGeometry()
	geometry.instanceCount = count
	geometry.setAttribute('position', particleGeometry.getAttribute('position'))
	// minRadius={1.0}
	// maxRadius={1.5}
	geometry.index = particleGeometry.index
	const pos = new Float32Array(count * 3)
	for (let i = 0; i < count; i++) {
		let theta = Math.random() * 2 * Math.PI
		let r = lerp(1.0, 1.5, Math.random())
		let x = Math.random() * 10 - 5
		let y = Math.random() * 10 - 5
		let z = Math.random() * 10 - 5
		// let x = r * Math.sin(theta) + props.center[0]
		// let y = (Math.random() - 0.5) * 0.1 + props.center[1]
		// let x = r * Math.sin(theta)
		// let y = (Math.random() - 0.5) * 0.1
		// let z = r * Math.cos(theta)
		pos.set([x, y, z], i * 3)
	}
	geometry.setAttribute(
		'pos',
		new THREE.InstancedBufferAttribute(pos, 3, false)
	)

	//GPGPU
	const pointsOnSphere = getSphereTexture(SIZE)
	const positionVariable = gpuCompute.addVariable(
		'uCurrentPosition',
		simFragmentPosition,
		pointsOnSphere
	)
	const velocityVariable = gpuCompute.addVariable(
		'uCurrentVelocity',
		simFragmentVelocity,
		getVelocityTexture(SIZE)
	)
	gpuCompute.setVariableDependencies(positionVariable, [
		positionVariable,
		velocityVariable,
	])
	gpuCompute.setVariableDependencies(velocityVariable, [
		positionVariable,
		velocityVariable,
	])
	const positionUniforms = positionVariable.material.uniforms
	const velocityUniforms = velocityVariable.material.uniforms

	velocityUniforms.uMouse = { value: new THREE.Vector3(0, 0, 0) }
	positionUniforms.uOriginalPosition = { value: pointsOnSphere }
	velocityUniforms.uOriginalPosition = { value: pointsOnSphere }
	gpuCompute.init()

	const uniforms = useMemo(
		() => ({
			uPosition: {
				value: null,
			},
			uVelocity: {
				value: null,
			},
			uTexture: {
				value: mapper,
			},
		}),
		[]
	)
	const refBuffer = useMemo(() => {
		const ref = new Float32Array(SIZE * SIZE * 2)
		for (let i = 0; i < SIZE; i++) {
			for (let j = 0; j < SIZE; j++) {
				const k = i * SIZE + j
				ref[k * 2 + 0] = i / (SIZE - 1)
				ref[k * 2 + 1] = j / (SIZE - 1)
			}
		}
		return ref
	}, [])
	useEffect(() => {
		iref.current.geometry.setAttribute(
			'ref',
			new THREE.InstancedBufferAttribute(refBuffer, 2)
		)
	}, [refBuffer])
	useFrame(({ mouse }) => {
		gpuCompute.compute()
		velocityUniforms.uMouse.value.x = (mouse.x * viewport.width) / 2
		velocityUniforms.uMouse.value.y = (mouse.y * viewport.height) / 2
		iref.current.material.uniforms.uPosition.value =
			gpuCompute.getCurrentRenderTarget(positionVariable).texture
		iref.current.material.uniforms.uVelocity.value =
			gpuCompute.getCurrentRenderTarget(velocityVariable).texture
	})
	return (
		<>
			<instancedMesh
				ref={iref}
				args={[null, null, SIZE * SIZE]}
				geometry={geometry}
			>
				{/* <boxGeometry args={[0.01, 0.03, 0.01]} /> */}
				<CustomShaderMaterial
					baseMaterial={THREE.MeshMatcapMaterial}
					matcap={map}
					size={1}
					vertexShader={patchShaders(shader.vertex)}
					fragmentShader={patchShaders(shader.fragment)}
					alphaTest={0.00001}
					// depthWrite
					// depthTest
					blending={THREE.AdditiveBlending}
					uniforms={uniforms}
					transparent
				/>
			</instancedMesh>
		</>
	)
}
