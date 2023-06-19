import { useMemo, useEffect } from 'react'
import './RenderMaterial'
import './SimulationMaterial'
// import getDataTexture from './getDatatexture'
import {
	getSphereTexture,
	getVelocityTexture,
	getDataTexture,
} from './getDataTexture'
import { createPortal, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useFBO } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer'
import simFragmentPosition from './shaders/simFragmentPosition'
import simFragmentVelocity from './shaders/simFragmentVelocity'
import { patchShaders } from 'gl-noise'
import CustomShaderMaterial from 'three-custom-shader-material'

const shader = {
	vertex: /* glsl */ ` 
	  uniform float uTime;
	  uniform sampler2D uPosition;
	  uniform sampler2D uVelocity;
	  attribute vec2 ref;
  
	  vec3 rotate3D(vec3 v, vec3 vel) {
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
		return instancePosition + pos;
	  }  
  
	  void main() {
		vec3 vel = texture2D(uVelocity,ref).rgb;
		vec3 p = displace(position, vel);
		csm_PositionRaw = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.);
		csm_Normal = rotate3D(normal, vel);
	  }
	  `,
	fragment: /* glsl */ `
		
	  void main() {
		csm_DiffuseColor = vec4(1.);
	  }
	`,
}

export default function Particles() {
	const simMat = useRef()
	const iref = useRef()
	const renderMat = useRef()
	const mouseDebug = useRef()
	const { viewport, gl } = useThree()
	const SIZE = 14

	//GPGPU
	const gpuCompute = new GPUComputationRenderer(SIZE, SIZE, gl)
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
	//
	// const scene = new THREE.Scene()
	// const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1)
	// let target0 = useFBO(SIZE, SIZE, {
	// 	magFilter: THREE.NearestFilter,
	// 	minFilter: THREE.NearestFilter,
	// 	type: THREE.FloatType,
	// })
	// let target1 = useFBO(SIZE, SIZE, {
	// 	magFilter: THREE.NearestFilter,
	// 	minFilter: THREE.NearestFilter,
	// 	type: THREE.FloatType,
	// })

	const startingPosition = getDataTexture(SIZE)

	const particles = useMemo(() => {
		const p = new Float32Array(SIZE * SIZE * 3)
		for (let i = 0; i < SIZE; i++) {
			for (let j = 0; j < SIZE; j++) {
				const k = i * SIZE + j
				// p[k * 3 + 0] = (i / SIZE) * 5
				// p[k * 3 + 1] = (j / SIZE) * 5
				p[k * 3 + 0] = (5 * i) / SIZE
				p[k * 3 + 1] = (5 * j) / SIZE
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

	const uniforms = useMemo(
		() => ({
			uPosition: {
				value: null,
			},
			uVelocity: {
				value: null,
			},
		}),
		[]
	)
	useEffect(() => {
		const ref = new Float32Array(SIZE, SIZE, 2)
		for (let i = 0; i < SIZE; i++) {
			for (let j = 0; j < SIZE; j++) {
				const k = i * SIZE * j
				ref[k * 2 + 0] = i / (SIZE - 1)
				ref[k * 2 + 1] = j / (SIZE - 1)
			}
		}
		iref.current.geometry.setAttribute(
			'ref',
			new THREE.InstancedBufferAttribute(ref, 2)
		)
	}, [])
	useFrame(({ gl, mouse }) => {
		gpuCompute.compute()
		renderMat.current.uniforms.uPosition.value =
			gpuCompute.getCurrentRenderTarget(positionVariable).texture

		velocityUniforms.uMouse.value.x = (mouse.x * viewport.width) / 2
		velocityUniforms.uMouse.value.y = (mouse.y * viewport.height) / 2
		mouseDebug.current.position.x = (mouse.x * viewport.width) / 2
		mouseDebug.current.position.y = (mouse.y * viewport.height) / 2
		iref.current.material.uniforms.uPosition.value =
			gpuCompute.getCurrentRenderTarget(positionVariable).texture
		iref.current.material.uniforms.uVelocity.value =
			gpuCompute.getCurrentRenderTarget(velocityVariable).texture
	})
	return (
		<>
			<mesh ref={mouseDebug}>
				<sphereBufferGeometry args={[0.1, 32, 32]} />
				<meshBasicMaterial color='red' />
			</mesh>
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
				<renderMaterial
					ref={renderMat}
					transparent={true}
					blending={THREE.AdditiveBlending}
				/>
			</points>
			<instancedMesh ref={iref} args={[null, null, SIZE * SIZE]}>
				<boxGeometry args={[0.1, 0.1, 0.1]} />
				{/* <meshNormalMaterial /> */}
				<CustomShaderMaterial
					baseMaterial={THREE.MeshPhysicalMaterial}
					size={0.01}
					vertexShader={patchShaders(shader.vertex)}
					fragmentShader={patchShaders(shader.fragment)}
					uniforms={uniforms}
					transparent
				/>
			</instancedMesh>
		</>
	)
}
