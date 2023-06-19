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
    varying vec2 vUv;
    void main(){
        vUv = uv;
        gl_Position = modelViewMatrix * projectionMatrix * vec4(position, 1.0);
        gl_PointSize = 5.0;
    }
    `,
	`
    varying vec2 vUv;
    void main(){
        // gl_FragColor = vec4(0.5 + 0.3 * sin(vUv.yxx + time) + color, 1.0);
        gl_FragColor.rgba = vec4(vUv, 0.0, 1.0);
    }
    `
)
extend({ RenderMaterial })
