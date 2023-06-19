import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

// export default function RenderMaterial() {
// 	return <></>
// }

const RenderMaterial = shaderMaterial(
	{
		time: 0.0,
	},
	`
    varying vec2 vUv;
    void main(){
        vUv = uv;
        gl_Position = modelViewMatrix * projectionMatrix
    }
    `
)
