import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

const SimulationMaterial = shaderMaterial(
	{
		uPosition: null,
		uVelocity: null,
	},
	`
    varying vec2 vUv;
    void main(){
        vref = ref;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 50.0;
    }
    `,
	`
    varying vec2 vref;
    uniform sampler2D uPosition;
    uniform sampler2D uVelocity;
    void main(){
        vec3 position = texture2D(uPosition, vref);
        gl_FragColor.rgba = vec4(vref, 0.0, 1.0);
    }
    `
)
extend({ SimulationMaterial })
