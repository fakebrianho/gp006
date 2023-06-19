import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

// export default function RenderMaterial() {
// 	return <></>
// }

const RenderMaterial = shaderMaterial(
	{
		time: 0,
		uPosition: null,
	},
	`
    attribute vec2 ref;
    uniform sampler2D uPosition;
    varying vec2 vref;
    void main(){
        vref = ref;
        vec3 pos = texture2D(uPosition, ref);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 50.0;
    }
    `,
	`
    varying vec2 vref;
    void main(){
        // gl_FragColor.rgba = vec4(vuvRef, 0.0, 1.0);
        gl_FragColor.rgba = vec4(vref, 0.0, 1.0);
    }
    `
)
extend({ RenderMaterial })
