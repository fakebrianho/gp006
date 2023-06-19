import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

// export default function RenderMaterial() {
// 	return <></>
// }

const RenderMaterial = shaderMaterial(
	{
		time: 0,
	},
	`
    attribute vec2 uvRef;
    varying vec2 vuvRef
    void main(){
        vuvRef = uvRef;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 5.0;
    }
    `,
	`
    varying vec2 vuvRef;
    void main(){
        gl_FragColor.rgba = vec4(vuvRef, 0.0, 1.0);
    }
    `
)
extend({ RenderMaterial })
